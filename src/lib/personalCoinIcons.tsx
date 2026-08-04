import { Gem, Sparkles, Star, Heart, Leaf, Sun, Moon, Flower2, Feather, Coins } from 'lucide-react'

export const COIN_ICONS = {
  gem: Gem,
  sparkles: Sparkles,
  star: Star,
  heart: Heart,
  leaf: Leaf,
  sun: Sun,
  moon: Moon,
  flower: Flower2,
  feather: Feather,
  coins: Coins,
} as const

export type CoinIconKey = keyof typeof COIN_ICONS

export const COIN_COLORS = [
  '#E8A0B0', // petal
  '#C4956A', // wood
  '#7a9ed4', // azul
  '#9B7FD4', // lavanda
  '#c87090', // rosa
  '#8b6914', // dourado
  '#3d7a3d', // verde escuro
]
