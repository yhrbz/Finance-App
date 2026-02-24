import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { DICTIONARY } from "@/src/lib/i18n"
import { formatCurrency } from "@/src/lib/utils"

interface EditEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  user: any
  entry: any // { date, type: 'income' | 'expense' | 'investment', valueCents }
  onSave: (valueCents: number) => void
}

export function EditEntryDialog({ isOpen, onClose, user, entry, onSave }: EditEntryDialogProps) {
  const [inputValue, setInputValue] = React.useState("")
  const t = DICTIONARY[user?.language as keyof typeof DICTIONARY || 'en']

  React.useEffect(() => {
    if (isOpen && entry) {
      setInputValue(entry.valueCents.toString())
    }
  }, [isOpen, entry])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key >= '0' && e.key <= '9') {
      setInputValue(prev => prev + e.key)
    } else if (e.key === 'Backspace') {
      setInputValue(prev => prev.slice(0, -1))
    }
  }

  const valueCents = parseInt(inputValue || "0", 10)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t.editEntry} - {entry?.date}</DialogTitle>
        </DialogHeader>
        <div className="py-8 flex flex-col items-center justify-center gap-4">
          <div className="text-4xl font-mono tabular-nums">
            {formatCurrency(valueCents, user?.currency, user?.language === 'pt' ? 'pt-BR' : 'en-US')}
          </div>
          <Input
            className="sr-only"
            autoFocus
            onKeyDown={handleKeyDown}
            readOnly
          />
          <p className="text-xs text-muted-foreground">Type digits to change value</p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t.cancel}</Button>
          <Button onClick={() => onSave(valueCents)}>{t.save}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
