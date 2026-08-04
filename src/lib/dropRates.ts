// src/lib/dropRates.ts
//
// FONTE ÚNICA de todas as probabilidades/chances do app — cartas e
// sementes. Não são valores de moeda — ver economyConfig.ts pra isso.

// ─── Pacotes de carta ───────────────────────────
export const PACK_ODDS: Record<'comum' | 'incomum' | 'rara' | 'epica', number> = {
  comum: 0.55,
  incomum: 0.3,
  rara: 0.12,
  epica: 0.03,
}

export const PITY_THRESHOLD = 10 // a cada N pacotes, garante Rara+

// ─── Loja rotativa de cartas ────────────────────
export const ROTATING_SHOP_WEIGHTS: Record<'incomum' | 'rara' | 'epica', number> = {
  incomum: 0.6,
  rara: 0.3,
  epica: 0.1,
}

export const ROTATING_SHOP_ROTATION_DAYS = 4

// ─── Sorteio de sementes (jardim) ───────────────
// soma dos dois dados (ou dobro no pânico) → raridade da flor sorteada
export const SEED_ROLL_THRESHOLDS = {
  comumMax: 8, // sum <= 8  → comum
  incomumMax: 10, // sum <= 10 → incomum
  // acima de 10 → rara
}
