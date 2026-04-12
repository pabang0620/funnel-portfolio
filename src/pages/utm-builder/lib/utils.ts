import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const PRODUCT_COLOR_PALETTE = [
  { bg: 'bg-red-100', text: 'text-red-800' },
  { bg: 'bg-orange-100', text: 'text-orange-800' },
  { bg: 'bg-amber-100', text: 'text-amber-800' },
  { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  { bg: 'bg-lime-100', text: 'text-lime-800' },
  { bg: 'bg-green-100', text: 'text-green-800' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800' },
  { bg: 'bg-teal-100', text: 'text-teal-800' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800' },
  { bg: 'bg-sky-100', text: 'text-sky-800' },
  { bg: 'bg-blue-100', text: 'text-blue-800' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800' },
  { bg: 'bg-violet-100', text: 'text-violet-800' },
  { bg: 'bg-purple-100', text: 'text-purple-800' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800' },
  { bg: 'bg-pink-100', text: 'text-pink-800' },
  { bg: 'bg-rose-100', text: 'text-rose-800' },
  { bg: 'bg-red-200', text: 'text-red-900' },
  { bg: 'bg-orange-200', text: 'text-orange-900' },
  { bg: 'bg-amber-200', text: 'text-amber-900' },
  { bg: 'bg-yellow-200', text: 'text-yellow-900' },
  { bg: 'bg-lime-200', text: 'text-lime-900' },
  { bg: 'bg-green-200', text: 'text-green-900' },
  { bg: 'bg-emerald-200', text: 'text-emerald-900' },
  { bg: 'bg-teal-200', text: 'text-teal-900' },
  { bg: 'bg-cyan-200', text: 'text-cyan-900' },
  { bg: 'bg-sky-200', text: 'text-sky-900' },
  { bg: 'bg-blue-200', text: 'text-blue-900' },
  { bg: 'bg-indigo-200', text: 'text-indigo-900' },
  { bg: 'bg-violet-200', text: 'text-violet-900' },
  { bg: 'bg-purple-200', text: 'text-purple-900' },
  { bg: 'bg-fuchsia-200', text: 'text-fuchsia-900' },
  { bg: 'bg-pink-200', text: 'text-pink-900' },
  { bg: 'bg-rose-200', text: 'text-rose-900' },
  { bg: 'bg-red-50', text: 'text-red-700' },
  { bg: 'bg-orange-50', text: 'text-orange-700' },
  { bg: 'bg-amber-50', text: 'text-amber-700' },
  { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  { bg: 'bg-lime-50', text: 'text-lime-700' },
  { bg: 'bg-green-50', text: 'text-green-700' },
  { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  { bg: 'bg-teal-50', text: 'text-teal-700' },
  { bg: 'bg-cyan-50', text: 'text-cyan-700' },
  { bg: 'bg-sky-50', text: 'text-sky-700' },
  { bg: 'bg-blue-50', text: 'text-blue-700' },
  { bg: 'bg-indigo-50', text: 'text-indigo-700' },
  { bg: 'bg-violet-50', text: 'text-violet-700' },
  { bg: 'bg-purple-50', text: 'text-purple-700' },
  { bg: 'bg-fuchsia-50', text: 'text-fuchsia-700' },
  { bg: 'bg-pink-50', text: 'text-pink-700' },
]

export function getProductColor(productId: string): { bg: string; text: string } {
  let hash = 0
  for (let i = 0; i < productId.length; i++) {
    hash = (hash * 31 + productId.charCodeAt(i)) >>> 0
  }
  return PRODUCT_COLOR_PALETTE[hash % PRODUCT_COLOR_PALETTE.length]
}
