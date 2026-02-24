import express from "express";
import { createServer as createViteServer } from "vite";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import db from "./src/db/index.ts";
import { v4 as uuidv4 } from "uuid";

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_for_dev_only";

app.use(express.json());
app.use(cookieParser());

// Auth Middleware
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.session;
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid session" });
  }
};

// Auth Routes
app.get("/api/auth/url", (req, res) => {
  const redirectUri = `${process.env.APP_URL}/auth/callback`;
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
    prompt: "consent",
  });
  res.json({ url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
});

app.get("/auth/callback", async (req, res) => {
  const { code } = req.query;
  if (!code) return res.status(400).send("No code provided");

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.APP_URL}/auth/callback`,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();
    const userResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const googleUser = await userResponse.json();

    // Upsert user
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(googleUser.email) as any;
    if (!user) {
      const id = uuidv4();
      db.prepare("INSERT INTO users (id, email, name, image) VALUES (?, ?, ?, ?)").run(
        id,
        googleUser.email,
        googleUser.name,
        googleUser.picture
      );
      db.prepare("INSERT INTO user_settings (userId) VALUES (?)").run(id);
      user = { id, email: googleUser.email, onboardingCompleted: 0 };
    }

    const sessionToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.cookie("session", sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.send(`
      <html>
        <body>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
          <p>Authentication successful. Redirecting...</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("Authentication failed");
  }
});

app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("session", { secure: true, sameSite: "none" });
  res.json({ success: true });
});

app.get("/api/me", authenticate, (req: any, res) => {
  const user = db.prepare(`
    SELECT u.*, s.theme, s.currency, s.language 
    FROM users u 
    JOIN user_settings s ON u.id = s.userId 
    WHERE u.id = ?
  `).get(req.user.id);
  res.json(user);
});

// Settings
app.post("/api/settings", authenticate, (req: any, res) => {
  const { theme, currency, language } = req.body;
  db.prepare(`
    UPDATE user_settings 
    SET theme = COALESCE(?, theme), 
        currency = COALESCE(?, currency), 
        language = COALESCE(?, language),
        updatedAt = CURRENT_TIMESTAMP
    WHERE userId = ?
  `).run(theme, currency, language, req.user.id);
  res.json({ success: true });
});

// Onboarding
app.post("/api/onboarding", authenticate, (req: any, res) => {
  const { cashBalanceCents, investedBalanceCents } = req.body;
  db.transaction(() => {
    db.prepare("INSERT OR REPLACE INTO onboarding (userId, cashBalanceCents, investedBalanceCents) VALUES (?, ?, ?)").run(
      req.user.id,
      cashBalanceCents,
      investedBalanceCents
    );
    db.prepare("UPDATE users SET onboardingCompleted = 1 WHERE id = ?").run(req.user.id);
  })();
  res.json({ success: true });
});

// Entries
app.get("/api/entries", authenticate, (req: any, res) => {
  const { monthKey } = req.query;
  const entries = db.prepare("SELECT * FROM entries WHERE userId = ? AND monthKey = ?").all(req.user.id, monthKey);
  
  // Get onboarding for initial balance if it's the first month
  const onboarding = db.prepare("SELECT * FROM onboarding WHERE userId = ?").get(req.user.id) as any;
  
  res.json({ entries, onboarding });
});

app.post("/api/entries", authenticate, (req: any, res) => {
  const { date, monthKey, incomeCents, expenseCents, investmentCents } = req.body;
  const id = uuidv4();
  db.prepare(`
    INSERT INTO entries (id, userId, date, monthKey, incomeCents, expenseCents, investmentCents, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(userId, date) DO UPDATE SET
      incomeCents = excluded.incomeCents,
      expenseCents = excluded.expenseCents,
      investmentCents = excluded.investmentCents,
      updatedAt = CURRENT_TIMESTAMP
  `).run(id, req.user.id, date, monthKey, incomeCents, expenseCents, investmentCents);
  res.json({ success: true });
});

// Report Data
app.get("/api/reports/summary", authenticate, (req: any, res) => {
  const history = db.prepare(`
    SELECT monthKey, SUM(incomeCents) as totalIncome, SUM(expenseCents) as totalExpense, SUM(investmentCents) as totalInvestment
    FROM entries 
    WHERE userId = ? 
    GROUP BY monthKey 
    ORDER BY monthKey DESC 
    LIMIT 12
  `).all(req.user.id);
  res.json(history);
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
