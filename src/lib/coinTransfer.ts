import { addCoins as addPersonalCoins, spendCoins as spendPersonalCoins } from './personalCoin'
import { addCoins as addCoupleCoins, getCoins as getCoupleCoins } from './garden'

/**
 * Pessoal → conjunta. Sem aprovação do parceiro — só debita da própria moeda
 * pessoal de quem está enviando e credita na moeda do casal. Falha (retorna
 * false) se não tiver saldo pessoal suficiente.
 */
export async function transferPersonalToCouple(
  coupleId: string,
  uid: string,
  amount: number
): Promise<boolean> {
  if (amount <= 0) return false
  const spent = await spendPersonalCoins(uid, amount, 'transferência pra moeda conjunta')
  if (!spent) return false
  await addCoupleCoins(coupleId, amount)
  return true
}

/**
 * Conjunta → pessoal. Puxa `amount` do fundo do casal e divide entre os dois:
 * quem iniciou fica com a parte maior em caso de valor ímpar (Math.ceil),
 * o parceiro fica com o resto (Math.floor) — mesmo padrão de
 * splitCoinsBetweenPartners usado na venda de semente/flor do jardim.
 * Falha (retorna false) se a moeda conjunta não tiver saldo suficiente.
 */
export async function transferCoupleToPersonal(
  coupleId: string,
  uid: string,
  partnerUid: string,
  amount: number
): Promise<boolean> {
  if (amount <= 0) return false
  const current = await getCoupleCoins(coupleId)
  if (current < amount) return false

  const myShare = Math.ceil(amount / 2)
  const partnerShare = amount - myShare

  await addCoupleCoins(coupleId, -amount)
  await addPersonalCoins(uid, myShare, 'transferência da moeda conjunta')
  if (partnerUid) {
    await addPersonalCoins(partnerUid, partnerShare, 'transferência da moeda conjunta')
  }
  return true
}
