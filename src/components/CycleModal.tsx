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

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Baloo 2', cursive",
    fontSize: 13,
    color: '#a06060',
    display: 'block',
    marginBottom: 4,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 10,
    border: '1.5px solid #e8d5b0',
    background: '#fffaf4',
    padding: '8px 14px',
    fontFamily: "'Baloo 2', cursive",
    fontSize: 14,
    color: '#5a2a2a',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const sectionStyle: React.CSSProperties = {
    background: '#fdf0f4',
    borderRadius: 12,
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(26,42,26,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: '#fdf6ec',
          borderRadius: 20,
          padding: '28px 32px',
          width: 440,
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
          border: '2px solid #e8d5b0',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2
            style={{ fontFamily: "'Baloo 2', cursive", fontSize: 20, color: '#5a2a2a', margin: 0 }}
          >
            Ciclo menstrual
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#a06060' }}
          >
            <X size={20} />
          </button>
        </div>

        {!hasCurrent && (
          <div style={sectionStyle}>
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#a06060',
                margin: 0,
              }}
            >
              Novo ciclo
            </p>

            <div>
              <label style={labelStyle}>Data prevista para descer</label>
              <input
                type="date"
                value={predictedDate}
                onChange={(e) => setPredictedDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Dias de TPM antes (padrão 7)</label>
              <input
                type="number"
                min={1}
                max={14}
                value={tpmDays}
                onChange={(e) => setTpmDays(Number(e.target.value))}
                style={{ ...inputStyle, width: 80 }}
              />
            </div>

            <div>
              <label style={labelStyle}>Duração média do ciclo (dias)</label>
              <input
                type="number"
                min={1}
                max={14}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                style={{ ...inputStyle, width: 80 }}
              />
            </div>

            {predictedDate && (
              <p
                style={{
                  fontFamily: "'Baloo 2', cursive",
                  fontSize: 12,
                  color: '#c4956a',
                  margin: 0,
                }}
              >
                TPM prevista a partir de{' '}
                <strong>{formatDate(addDays(predictedDate, -tpmDays))}</strong>
              </p>
            )}

            <button
              onClick={handleSaveNew}
              disabled={!predictedDate || saving}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#e8a0b0',
                color: '#5a2a2a',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                fontWeight: 700,
                cursor: predictedDate && !saving ? 'pointer' : 'not-allowed',
                opacity: !predictedDate || saving ? 0.6 : 1,
              }}
            >
              <Save size={15} /> Salvar previsão
            </button>
          </div>
        )}

        {hasCurrent && !isActive && (
          <div style={sectionStyle}>
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#a06060',
                margin: 0,
              }}
            >
              Previsão atual — {formatDate(currentCycle.data.predictedDate)}
            </p>

            <div>
              <label style={labelStyle}>Ajustar data prevista</label>
              <input
                type="date"
                value={predictedDate}
                onChange={(e) => setPredictedDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Dias de TPM antes</label>
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
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#dcc4f0',
                color: '#5a2a2a',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Save size={15} /> Atualizar previsão
            </button>

            <hr style={{ border: 'none', borderTop: '1px solid #e8d5b0', margin: '4px 0' }} />

            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#a06060',
                margin: 0,
              }}
            >
              Confirmar que desceu
            </p>

            <div>
              <label style={labelStyle}>Data real que desceu</label>
              <input
                type="date"
                value={confirmedDate}
                onChange={(e) => setConfirmedDate(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Duração prevista (dias)</label>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#f5a0a0',
                color: '#5a2a2a',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                fontWeight: 700,
                cursor: confirmedDate && !saving ? 'pointer' : 'not-allowed',
                opacity: !confirmedDate || saving ? 0.6 : 1,
              }}
            >
              <CheckCircle size={15} /> Desceu hoje
            </button>
          </div>
        )}

        {isActive && (
          <div style={sectionStyle}>
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#a06060',
                margin: 0,
              }}
            >
              Ciclo ativo desde {formatDate(currentCycle.data.confirmedDate ?? '')}
            </p>
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 12,
                color: '#c4956a',
                margin: 0,
              }}
            >
              Previsão de fim:{' '}
              {formatDate(currentCycle.data.actualEndDate ?? currentCycle.data.endDate)}
            </p>

            <div>
              <label style={labelStyle}>Corrigir data de fim (opcional)</label>
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#b0d4a0',
                color: '#2a4a2a',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                fontWeight: 700,
                cursor: saving ? 'not-allowed' : 'pointer',
                opacity: saving ? 0.6 : 1,
              }}
            >
              <StopCircle size={15} /> Ciclo encerrado
            </button>
          </div>
        )}

        {nextPrediction && (
          <div
            style={{
              background: '#f5f0e8',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <CalendarDays size={16} color="#c4956a" />
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#8b6914',
                margin: 0,
              }}
            >
              Próximo ciclo previsto: <strong>{formatDate(nextPrediction ?? '')}</strong>
            </p>
          </div>
        )}

        {isEnded && (
          <div style={sectionStyle}>
            <p
              style={{
                fontFamily: "'Baloo 2', cursive",
                fontSize: 13,
                color: '#a06060',
                margin: 0,
              }}
            >
              Ciclo deste mês encerrado. Registre o próximo quando quiser.
            </p>
            <button
              onClick={() => {
                setPredictedDate('')
                setConfirmedDate('')
                setActualEndDate('')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                background: '#e8a0b0',
                color: '#5a2a2a',
                border: 'none',
                borderRadius: 12,
                padding: '10px',
                fontFamily: "'Baloo 2', cursive",
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <CalendarDays size={15} /> Registrar próximo ciclo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
