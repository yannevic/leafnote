import { useState, useEffect } from 'react'
import { X, Save, CheckCircle, StopCircle, CalendarDays, Pencil } from 'lucide-react'
import {
  CycleData,
  saveCycle,
  confirmCycleStarted,
  endCycle,
  predictNextCycle,
  deleteCycle,
  addDays,
} from '../lib/cycle'
import { useCycle } from '../hooks/useCycle'

interface Props {
  myUid: string
  onClose: () => void
}

export default function CycleModal({ myUid, onClose }: Props) {
  const { currentCycle, allCycles } = useCycle()

  const [predictedDate, setPredictedDate] = useState('')
  const [tpmDays, setTpmDays] = useState(7)
  const [duration, setDuration] = useState(7)
  const [confirmedDate, setConfirmedDate] = useState('')
  const [actualEndDate, setActualEndDate] = useState('')
  const [nextPrediction, setNextPrediction] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [tab, setTab] = useState<'atual' | 'historico'>('atual')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<CycleData>>({})

  useEffect(() => {
    if (currentCycle && !initialized) {
      setPredictedDate(currentCycle.data.predictedDate)
      setTpmDays(currentCycle.data.tpmDays)
      setDuration(currentCycle.data.duration)
      setConfirmedDate(currentCycle.data.confirmedDate ?? '')
      setActualEndDate(currentCycle.data.actualEndDate ?? '')
      setInitialized(true)
    }
  }, [currentCycle, initialized])

  useEffect(() => {
    predictNextCycle(myUid).then(setNextPrediction)
  }, [allCycles, myUid])

  const isActive = currentCycle?.data.status === 'active'
  const isEnded = currentCycle?.data.status === 'ended'
  const hasCurrent = !!currentCycle && !isEnded

  async function handleSaveNew() {
    if (!predictedDate) return
    setSaving(true)
    const data: CycleData = {
      predictedDate,
      duration,
      endDate: addDays(predictedDate, duration - 1),
      tpmStart: addDays(predictedDate, -(tpmDays - 1)),
      tpmDays,
      status: 'predicted',
    }
    await saveCycle(data)
    setSaving(false)
  }

  async function handleConfirmStarted() {
    if (!currentCycle || !confirmedDate) return
    setSaving(true)
    await confirmCycleStarted(currentCycle.key, confirmedDate, duration)
    setSaving(false)
  }

  async function handleEndCycle() {
    if (!currentCycle) return
    setSaving(true)
    await endCycle(currentCycle.key, actualEndDate || undefined)
    setSaving(false)
  }

  async function handleSaveEdit(key: string) {
    const existing = allCycles[key]
    if (!existing) return
    setSaving(true)
    const updated: CycleData = {
      ...existing,
      ...(editData.predictedDate && {
        predictedDate: editData.predictedDate,
        tpmStart: addDays(editData.predictedDate, -(existing.tpmDays - 1)),
        endDate: addDays(editData.predictedDate, existing.duration - 1),
      }),
      ...(editData.confirmedDate !== undefined && {
        confirmedDate: editData.confirmedDate || undefined,
      }),
      ...(editData.actualEndDate !== undefined && {
        actualEndDate: editData.actualEndDate || undefined,
      }),
      ...(editData.status && { status: editData.status }),
    }
    await saveCycle(updated)
    setEditingKey(null)
    setEditData({})
    setSaving(false)
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  const labelStyle: React.CSSProperties = {
    fontFamily: 'Baloo 2, sans-serif',
    fontSize: 11,
    fontWeight: 800,
    color: 'rgba(122,48,64,0.6)',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    display: 'block',
    marginBottom: 5,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 10,
    border: '1.5px solid rgba(232,160,176,0.4)',
    background: 'rgba(253,242,246,0.6)',
    padding: '8px 12px',
    fontFamily: 'Baloo 2, sans-serif',
    fontSize: 13,
    fontWeight: 600,
    color: '#3d1a10',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const sectionStyle: React.CSSProperties = {
    background: 'rgba(253,242,246,0.55)',
    border: '1.5px solid rgba(232,160,176,0.3)',
    borderRadius: 14,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  const sectionTitle: React.CSSProperties = {
    fontFamily: 'Baloo 2, sans-serif',
    fontSize: 11,
    fontWeight: 800,
    color: 'rgba(122,48,64,0.55)',
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: 0,
  }

  const btnStyle = (bg: string, color = '#3d1a10'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    background: bg,
    color,
    border: 'none',
    borderRadius: 12,
    padding: '10px',
    fontFamily: 'Baloo 2, sans-serif',
    fontSize: 13,
    fontWeight: 800,
    cursor: 'pointer',
    width: '100%',
  })

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(44,20,8,0.35)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background:
            'linear-gradient(160deg, rgba(253,246,240,0.97) 0%, rgba(252,232,238,0.97) 100%)',
          borderRadius: 20,
          padding: '24px 28px',
          width: 420,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(200,120,140,0.2), inset 0 1px 0 rgba(255,255,255,0.6)',
          border: '1.5px solid rgba(232,160,176,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          fontFamily: 'Baloo 2, sans-serif',
        }}
      >
        {/* header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#3d1a10' }}>ciclo menstrual</span>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(200,120,140,0.15)',
              border: 'none',
              borderRadius: '50%',
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={13} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
          </button>
        </div>

        {/* abas */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            background: 'rgba(253,242,246,0.6)',
            borderRadius: 12,
            padding: 4,
            border: '1.5px solid rgba(232,160,176,0.25)',
          }}
        >
          {(['atual', 'historico'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: '7px 0',
                borderRadius: 9,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'Baloo 2, sans-serif',
                fontSize: 12,
                fontWeight: 800,
                background: tab === t ? 'rgba(232,160,176,0.55)' : 'transparent',
                color: tab === t ? '#3d1a10' : 'rgba(61,26,16,0.4)',
                transition: 'all 0.15s',
              }}
            >
              {t === 'atual' ? 'atual' : 'histórico'}
            </button>
          ))}
        </div>

        {tab === 'historico' &&
          (() => {
            const sorted = Object.entries(allCycles).sort(([a], [b]) => (a > b ? -1 : 1))
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sorted.length === 0 && (
                  <span
                    style={{
                      fontSize: 12,
                      color: 'rgba(61,26,16,0.4)',
                      textAlign: 'center',
                      padding: '20px 0',
                      fontFamily: 'Baloo 2, sans-serif',
                    }}
                  >
                    nenhum ciclo registrado ainda
                  </span>
                )}
                {sorted.map(([key, data]) => {
                  const [y, m] = key.split('-')
                  const monthName = [
                    'janeiro',
                    'fevereiro',
                    'março',
                    'abril',
                    'maio',
                    'junho',
                    'julho',
                    'agosto',
                    'setembro',
                    'outubro',
                    'novembro',
                    'dezembro',
                  ][parseInt(m) - 1]
                  const statusColor: Record<string, string> = {
                    predicted: 'rgba(155,127,212,0.8)',
                    active: '#D94F4F',
                    ended: 'rgba(61,26,16,0.3)',
                  }
                  const statusLabel: Record<string, string> = {
                    predicted: 'previsto',
                    active: 'ativo',
                    ended: 'encerrado',
                  }
                  const isEditing = editingKey === key
                  const isConfirming = confirmDelete === key
                  return (
                    <div
                      key={key}
                      style={{
                        background: 'rgba(253,242,246,0.7)',
                        border: '1.5px solid rgba(232,160,176,0.3)',
                        borderRadius: 12,
                        padding: '12px 14px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                      }}
                    >
                      {/* linha superior */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: '#3d1a10',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            {monthName} {y}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'rgba(61,26,16,0.5)',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            previsto: {formatDate(data.predictedDate)}
                            {data.confirmedDate
                              ? ` · confirmado: ${formatDate(data.confirmedDate)}`
                              : ''}
                            {data.actualEndDate
                              ? ` · fim: ${formatDate(data.actualEndDate)}`
                              : data.endDate
                                ? ` · fim prev: ${formatDate(data.endDate)}`
                                : ''}
                          </span>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 800,
                              color: statusColor[data.status] ?? 'rgba(61,26,16,0.4)',
                              fontFamily: 'Baloo 2, sans-serif',
                              textTransform: 'uppercase',
                              letterSpacing: '0.6px',
                            }}
                          >
                            {statusLabel[data.status] ?? data.status}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                          <button
                            onClick={() => {
                              if (isEditing) {
                                setEditingKey(null)
                                setEditData({})
                              } else {
                                setEditingKey(key)
                                setEditData({
                                  predictedDate: data.predictedDate,
                                  confirmedDate: data.confirmedDate ?? '',
                                  actualEndDate: data.actualEndDate ?? '',
                                  status: data.status,
                                })
                              }
                            }}
                            style={{
                              background: isEditing
                                ? 'rgba(232,160,176,0.4)'
                                : 'rgba(232,160,176,0.15)',
                              border: 'none',
                              borderRadius: 8,
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            title="editar"
                          >
                            <Pencil size={11} color="rgba(122,48,64,0.7)" strokeWidth={2.5} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(isConfirming ? null : key)}
                            style={{
                              background: 'rgba(232,96,122,0.12)',
                              border: 'none',
                              borderRadius: 8,
                              width: 28,
                              height: 28,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              padding: 0,
                            }}
                            title="apagar ciclo"
                          >
                            <X size={11} color="#e8607a" strokeWidth={2.5} />
                          </button>
                        </div>
                      </div>

                      {/* confirm delete inline */}
                      {isConfirming && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            background: 'rgba(232,96,122,0.08)',
                            borderRadius: 8,
                            padding: '8px 10px',
                          }}
                        >
                          <span
                            style={{
                              flex: 1,
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#e8607a',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            apagar {monthName} {y}?
                          </span>
                          <button
                            onClick={async () => {
                              await deleteCycle(key)
                              setConfirmDelete(null)
                            }}
                            style={{
                              background: 'rgba(232,96,122,0.2)',
                              border: 'none',
                              borderRadius: 7,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 800,
                              color: '#e8607a',
                              cursor: 'pointer',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            sim
                          </button>
                          <button
                            onClick={() => setConfirmDelete(null)}
                            style={{
                              background: 'rgba(253,242,246,0.8)',
                              border: '1.5px solid rgba(232,160,176,0.3)',
                              borderRadius: 7,
                              padding: '4px 10px',
                              fontSize: 11,
                              fontWeight: 800,
                              color: 'rgba(61,26,16,0.5)',
                              cursor: 'pointer',
                              fontFamily: 'Baloo 2, sans-serif',
                            }}
                          >
                            não
                          </button>
                        </div>
                      )}

                      {/* edição inline */}
                      {isEditing && (
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 8,
                            borderTop: '1.5px dashed rgba(232,160,176,0.4)',
                            paddingTop: 10,
                          }}
                        >
                          <div>
                            <label style={labelStyle}>data prevista</label>
                            <input
                              type="date"
                              value={editData.predictedDate ?? ''}
                              onChange={(e) =>
                                setEditData((d) => ({ ...d, predictedDate: e.target.value }))
                              }
                              style={{ ...inputStyle, fontSize: 12 }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>data confirmada</label>
                            <input
                              type="date"
                              value={editData.confirmedDate ?? ''}
                              onChange={(e) =>
                                setEditData((d) => ({ ...d, confirmedDate: e.target.value }))
                              }
                              style={{ ...inputStyle, fontSize: 12 }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>data de fim real</label>
                            <input
                              type="date"
                              value={editData.actualEndDate ?? ''}
                              onChange={(e) =>
                                setEditData((d) => ({ ...d, actualEndDate: e.target.value }))
                              }
                              style={{ ...inputStyle, fontSize: 12 }}
                            />
                          </div>
                          <div>
                            <label style={labelStyle}>status</label>
                            <div style={{ display: 'flex', gap: 6 }}>
                              {(['predicted', 'active', 'ended'] as const).map((s) => {
                                const labels = {
                                  predicted: 'previsto',
                                  active: 'ativo',
                                  ended: 'encerrado',
                                }
                                const colors = {
                                  predicted: 'rgba(155,127,212,0.55)',
                                  active: 'rgba(217,79,79,0.45)',
                                  ended: 'rgba(61,26,16,0.15)',
                                }
                                const selected = (editData.status ?? data.status) === s
                                return (
                                  <button
                                    key={s}
                                    onClick={() => setEditData((d) => ({ ...d, status: s }))}
                                    style={{
                                      flex: 1,
                                      padding: '6px 0',
                                      borderRadius: 8,
                                      border: selected
                                        ? 'none'
                                        : '1.5px solid rgba(232,160,176,0.3)',
                                      background: selected ? colors[s] : 'transparent',
                                      fontFamily: 'Baloo 2, sans-serif',
                                      fontSize: 11,
                                      fontWeight: 800,
                                      color: selected ? '#3d1a10' : 'rgba(61,26,16,0.4)',
                                      cursor: 'pointer',
                                      transition: 'all 0.15s',
                                    }}
                                  >
                                    {labels[s]}
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          <button
                            onClick={() => handleSaveEdit(key)}
                            disabled={saving}
                            style={{
                              ...btnStyle('rgba(232,160,176,0.6)'),
                              opacity: saving ? 0.5 : 1,
                              fontSize: 12,
                            }}
                          >
                            <Save size={13} strokeWidth={2.5} /> salvar alterações
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })()}

        {tab === 'atual' && (
          <>
            {/* novo ciclo */}
            {!hasCurrent && (
              <div style={sectionStyle}>
                <p style={sectionTitle}>novo ciclo</p>
                <div>
                  <label style={labelStyle}>data prevista para descer</label>
                  <input
                    type="date"
                    value={predictedDate}
                    onChange={(e) => setPredictedDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>dias de tpm antes</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={tpmDays}
                      onChange={(e) => setTpmDays(Number(e.target.value))}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>duração (dias)</label>
                    <input
                      type="number"
                      min={1}
                      max={14}
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      style={{ ...inputStyle, width: '100%' }}
                    />
                  </div>
                </div>
                {predictedDate && (
                  <p
                    style={{
                      fontFamily: 'Baloo 2, sans-serif',
                      fontSize: 12,
                      color: 'rgba(122,48,64,0.6)',
                      margin: 0,
                    }}
                  >
                    tpm a partir de <strong>{formatDate(addDays(predictedDate, -tpmDays))}</strong>
                  </p>
                )}
                <button
                  onClick={handleSaveNew}
                  disabled={!predictedDate || saving}
                  style={{
                    ...btnStyle('rgba(232,160,176,0.6)'),
                    opacity: !predictedDate || saving ? 0.5 : 1,
                  }}
                >
                  <Save size={14} strokeWidth={2.5} /> salvar previsão
                </button>
              </div>
            )}

            {/* previsão atual + confirmar */}
            {hasCurrent && !isActive && (
              <div style={sectionStyle}>
                <p style={sectionTitle}>
                  previsão atual — {formatDate(currentCycle.data.predictedDate)}
                </p>
                <div>
                  <label style={labelStyle}>ajustar data prevista</label>
                  <input
                    type="date"
                    value={predictedDate}
                    onChange={(e) => setPredictedDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>dias de tpm antes</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={tpmDays}
                    onChange={(e) => setTpmDays(Number(e.target.value))}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </div>
                <button
                  onClick={handleSaveNew}
                  disabled={!predictedDate || saving}
                  style={btnStyle('rgba(210,185,245,0.6)')}
                >
                  <Save size={14} strokeWidth={2.5} /> atualizar previsão
                </button>

                <div style={{ height: 1, background: 'rgba(232,160,176,0.3)', margin: '2px 0' }} />

                <p style={sectionTitle}>confirmar que desceu</p>
                <div>
                  <label style={labelStyle}>data real que desceu</label>
                  <input
                    type="date"
                    value={confirmedDate}
                    onChange={(e) => setConfirmedDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>duração prevista (dias)</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    style={{ ...inputStyle, width: 80 }}
                  />
                </div>
                <button
                  onClick={handleConfirmStarted}
                  disabled={!confirmedDate || saving}
                  style={{
                    ...btnStyle('rgba(245,160,160,0.6)'),
                    opacity: !confirmedDate || saving ? 0.5 : 1,
                  }}
                >
                  <CheckCircle size={14} strokeWidth={2.5} /> desceu hoje
                </button>
              </div>
            )}

            {/* ciclo ativo */}
            {isActive && (
              <div style={sectionStyle}>
                <p style={sectionTitle}>
                  ciclo ativo desde {formatDate(currentCycle.data.confirmedDate ?? '')}
                </p>
                <p
                  style={{
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: 12,
                    color: 'rgba(122,48,64,0.6)',
                    margin: 0,
                  }}
                >
                  previsão de fim:{' '}
                  <strong>
                    {formatDate(currentCycle.data.actualEndDate ?? currentCycle.data.endDate)}
                  </strong>
                </p>
                <div>
                  <label style={labelStyle}>corrigir data de fim (opcional)</label>
                  <input
                    type="date"
                    value={actualEndDate}
                    onChange={(e) => setActualEndDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <button
                  onClick={handleEndCycle}
                  disabled={saving}
                  style={{
                    ...btnStyle('rgba(176,212,160,0.6)', '#2a4a2a'),
                    opacity: saving ? 0.5 : 1,
                  }}
                >
                  <StopCircle size={14} strokeWidth={2.5} /> ciclo encerrado
                </button>
              </div>
            )}

            {/* próximo previsto */}
            {nextPrediction && (
              <div
                style={{
                  background: 'rgba(245,240,232,0.7)',
                  border: '1.5px solid rgba(196,149,106,0.3)',
                  borderRadius: 12,
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <CalendarDays size={14} color="rgba(196,149,106,0.9)" strokeWidth={2} />
                <p
                  style={{
                    fontFamily: 'Baloo 2, sans-serif',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'rgba(122,80,20,0.8)',
                    margin: 0,
                  }}
                >
                  próximo ciclo previsto: <strong>{formatDate(nextPrediction)}</strong>
                </p>
              </div>
            )}

            {/* encerrado */}
            {/* encerrado */}
            {isEnded && (
              <div style={sectionStyle}>
                <p style={{ ...sectionTitle, textTransform: 'none', fontSize: 13 }}>
                  ciclo encerrado 🌸 registre o próximo quando quiser.
                </p>
                <button
                  onClick={() => {
                    setPredictedDate('')
                    setConfirmedDate('')
                    setActualEndDate('')
                  }}
                  style={btnStyle('rgba(232,160,176,0.6)')}
                >
                  <CalendarDays size={14} strokeWidth={2.5} /> registrar próximo ciclo
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
