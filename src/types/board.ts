export type BoardItemType =
  | 'postit'
  | 'checklist'
  | 'drawing'
  | 'tag'
  | 'letter'
  | 'special-letter'
  | 'custom-letter'
  | 'countdown-pin'
  | 'cycle-pin'
  | 'board-sticker'

export type PostItColor = 'yellow' | 'green' | 'pink' | 'blue' | 'lavender' | 'peach'
export type LetterColor = 'rosa' | 'verde' | 'azul' | 'amarelo' | 'lilas'

export interface BoardItem {
  id: string
  type: BoardItemType
  x: number
  y: number
  width: number
  height: number
  zOrder?: number
  createdBy: string
  createdAt: string
  updatedAt: string
  updatedBy: string
}

export interface PostItItem extends BoardItem {
  type: 'postit'
  title?: string
  content: string
  color: PostItColor
  compacted?: boolean
  fontSize?: number
}

export interface ChecklistEntry {
  id: string
  text: string
  done: boolean
}

export interface ChecklistItem extends BoardItem {
  type: 'checklist'
  title?: string
  entries: ChecklistEntry[]
  color: PostItColor
  fontSize?: number
}

export interface DrawingItem extends BoardItem {
  type: 'drawing'
  drawingData: string
  rotation?: number
}

export interface TagItem extends BoardItem {
  type: 'tag'
  label: string
  color: string
}

export interface LetterItem extends BoardItem {
  type: 'letter'
  from: string
  to: string
  content: string
  color?: LetterColor
  opened: boolean
  openedAt?: string
}

export type AnyBoardItem =
  | PostItItem
  | ChecklistItem
  | DrawingItem
  | TagItem
  | LetterItem
  | SpecialLetterItem
  | CustomLetterBoardItem
  | CountdownPinItem
  | CyclePinItem
  | BoardStickerItem

export type SpecialLetterLayout = 'A' | 'B' | 'C'

export interface CountdownPinItem extends BoardItem {
  type: 'countdown-pin'
  label: string
  targetDate: string
  color: string
}

export interface CyclePinItem extends BoardItem {
  type: 'cycle-pin'
  cycleKey?: string
}

export interface SpecialLetterItem extends BoardItem {
  type: 'special-letter'
  z: number
  from: string
  to: string
  fromUid: string
  toUid: string
  message: string
  cardModel: string
  layout: SpecialLetterLayout
  opened: boolean
  specialDate: string
  specialDateMmdd: string
  specialDateLabel: string
  dayOnly?: boolean
  availableFrom?: string // 'AAAA-MM-DD' — data a partir de quando pode abrir
}

export interface CustomLetterBoardItem extends BoardItem {
  type: 'custom-letter'
  z: number
  fromUid: string
  toUid: string
  fromName: string
  toName: string
  opened: boolean
  availableFrom?: string
  specialDateLabel?: string
  letterId: string // referência para customLetters/{id} no Firebase
}

// ─── Carta Livre ──────────────────────────────────────────────────

export interface CustomLetterPhoto {
  id: string
  url: string // base64
  x: number
  y: number
  width: number
  height: number
  rotation?: number
}

export interface CustomLetterSticker {
  id: string
  stickerKey: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
}

export interface CustomLetterData {
  id: string
  fromUid: string
  fromName: string
  toUid: string
  toName: string
  createdAt: number
  opened: boolean
  availableFrom?: string
  // papel
  paperColor: string
  lined: boolean
  // texto
  content: string
  fontSize: number
  fontFamily: string
  textColor: string
  textAlign: 'left' | 'center' | 'right'
  // extras
  // extras
  signature: string
  showDate: boolean
  specialDate?: string
  specialDateMmdd?: string
  specialDateLabel?: string
  // itens
  photos: CustomLetterPhoto[]
  stickers: CustomLetterSticker[]
}
export interface BoardStickerItem extends BoardItem {
  type: 'board-sticker'
  stickerKey: string
  rotation: number
}
