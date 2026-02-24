import * as React from "react"
import { Settings, LogOut, User } from "lucide-react"
import { Button } from "./ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { cn } from "@/src/lib/utils"
import { DICTIONARY } from "@/src/lib/i18n"

interface AppHeaderProps {
  user: any
  activeRoute: string
  onNavigate: (route: string) => void
  onOpenSettings: () => void
  onSignOut: () => void
}

export function AppHeader({ user, activeRoute, onNavigate, onOpenSettings, onSignOut }: AppHeaderProps) {
  const t = DICTIONARY[user?.language as keyof typeof DICTIONARY || 'en']

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between mx-auto px-4">
        <div className="flex items-center gap-8">
          <div 
            className="font-bold text-xl cursor-pointer" 
            onClick={() => onNavigate('entries')}
          >
            FinTrack
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium">
            <button
              onClick={() => onNavigate('entries')}
              className={cn(
                "transition-colors hover:text-foreground/80",
                activeRoute === 'entries' ? "text-foreground" : "text-foreground/60"
              )}
            >
              {t.entries}
            </button>
            <button
              onClick={() => onNavigate('report')}
              className={cn(
                "transition-colors hover:text-foreground/80",
                activeRoute === 'report' ? "text-foreground" : "text-foreground/60"
              )}
            >
              {t.report}
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onOpenSettings}>
            <Settings className="h-4 w-4" />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.image} alt={user?.name} />
                  <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onOpenSettings}>
                <Settings className="mr-2 h-4 w-4" />
                <span>{t.settings}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t.signOut}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
