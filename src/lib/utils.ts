import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(valueCents: number, currency: string = 'BRL', locale: string = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(valueCents / 100);
}

export function getValueFill(value: number) {
  if (value < -50000) { // Values are in cents, so -500.00 is -50000
    return { backgroundColor: '#ff0000', textClassName: 'text-white', a11yLabel: 'Critical negative total' }
  }
  if (value < 0) {
    return { backgroundColor: '#f4cccc', textClassName: 'text-foreground', a11yLabel: 'Negative total' }
  }
  if (value > 200000) {
    return { backgroundColor: '#6aa84f', textClassName: 'text-white', a11yLabel: 'Strong positive total' }
  }
  if (value >= 100000) {
    return { backgroundColor: '#b7e1cd', textClassName: 'text-foreground', a11yLabel: 'Positive total' }
  }
  return { backgroundColor: '#fce8b2', textClassName: 'text-foreground', a11yLabel: 'Low positive total' }
}
