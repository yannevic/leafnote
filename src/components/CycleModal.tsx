import { useState, useEffect } from 'react'
import { X, Save, CheckCircle, StopCircle, CalendarDays } from 'lucide-react'
import {
  CycleData,
  saveCycle,
  confirmCycleStarted,
  endCycle,
  predictNextCycle,
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
              style={{ ...btnStyle('rgba(176,212,160,0.6)', '#2a4a2a'), opacity: saving ? 0.5 : 1 }}
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
      </div>
    </div>
  )
}
