import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { DICTIONARY } from "@/src/lib/i18n"

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  user: any
  onSave: (settings: any) => void
}

export function SettingsModal({ isOpen, onClose, user, onSave }: SettingsModalProps) {
  const [theme, setTheme] = React.useState(user?.theme || 'light')
  const [currency, setCurrency] = React.useState(user?.currency || 'BRL')
  const [language, setLanguage] = React.useState(user?.language || 'en')

  const t = DICTIONARY[language as keyof typeof DICTIONARY || 'en']

  const handleSave = () => {
    onSave({ theme, currency, language })
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.settings}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">{t.theme}</label>
            <div className="col-span-3">
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">{t.light}</SelectItem>
                  <SelectItem value="dark">{t.dark}</SelectItem>
                  <SelectItem value="system">{t.system}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">{t.currency}</label>
            <div className="col-span-3">
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BRL">BRL (R$)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <label className="text-right text-sm font-medium">{t.language}</label>
            <div className="col-span-3">
              <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">{t.english}</SelectItem>
                  <SelectItem value="pt">{t.portuguese}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
          <Button onClick={handleSave}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
