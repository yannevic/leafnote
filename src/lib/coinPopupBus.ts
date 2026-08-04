export interface CoinPopupPayload {
  amount: number
  coinName: string
  color?: string
  x: number
  y: number
}

export function triggerCoinPopup(payload: CoinPopupPayload) {
  window.dispatchEvent(new CustomEvent('coin-popup', { detail: payload }))
}

// Atalho: dispara a partir de um MouseEvent direto
export function triggerCoinPopupFromEvent(
  e: React.MouseEvent,
  amount: number,
  coinName: string,
  color?: string
) {
  triggerCoinPopup({ amount, coinName, color, x: e.clientX, y: e.clientY })
}
