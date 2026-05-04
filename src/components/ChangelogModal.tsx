import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CHANGELOG: Record<string, string[]> = {
  '2.1.18': [
    '🌸 leafnote',
    '✨ módulo de ciclo menstrual: pin no mural com estados tpm/menstruada/chegando',
    '✨ calendário colore e marca os dias do ciclo com ícones',
    '✨ modal de gestão do ciclo (só nana): previsão, confirmação, duração e encerramento',
    '✨ previsão automática do próximo ciclo baseada no histórico',
    '✨ botão ciclo no calendário e no modal de dia para fixar pin no mural',
  ],

  '2.1.17': [
    '🌸 leafnote',
    '🐛 jardim: status de rega agora mostra os dois como regados após completar o dia',
  ],

  '2.1.16': [
    '🌸 leafnote',
    '🐛 jardim: rega agora reseta à meia-noite no horário local, não em UTC',
  ],

  '2.1.15': [
    '🌸 leafnote',
    '🐛 jardim: botão de regar agora bloqueia corretamente após os dois regarem no mesmo dia',
  ],

  '2.1.14': [
    '🌸 leafnote',
    '✨ novo widget no mural: fixe eventos do calendário e veja a contagem regressiva em tempo real',
  ],

  '2.1.13': [
    '🌸 leafnote',
    '🐛 jardim: corrigido bug que permitia regar mais de uma vez por dia',
    '🐛 jardim: planta agora murcha apenas após 2 dias sem rega',
  ],

  '2.1.12': [
    '🌸 leafnote',
    '✨ cartas especiais agora abrem para quem enviou, depois que o receptor abrir',
    '🐛 corrigido bloqueio de carta especial — agora usa apenas o campo "disponível a partir de" para liberar abertura',
  ],

  '2.1.11': [
    '🌸 leafnote',
    '🐛 jardim: rega do parceiro não é mais apagada ao regar',
  ],

  '2.1.10': [
    '🌸 leafnote',
    '🐛 jardim: rega não some mais ao reabrir o app',
  ],

  '2.1.9': [
    '🌸 leafnote',
    '🐛 jardim: rega diária agora reseta corretamente entre os dias',
    '🐛 jardim: removido texto de estágio duplicado ao murchar',
    '🐛 jardim: water reseta automaticamente ao abrir o jardim em dia novo',
  ],

  '2.1.8': [
    '🌸 leafnote',
    '✨ cartas especiais agora abrem para quem enviou, depois que o receptor abrir',
    '🐛 corrigido bloqueio de carta especial — agora usa apenas o campo "disponível a partir de" para liberar abertura',
  ],

  '2.1.7': [
    '🌸 leafnote',
    '🐛 corrige Firebase no build do workflow',
  ],

  '2.1.6': [
    '🌸 leafnote',
    '🐛 ajustes internos',
  ],

  '2.1.5': [
    '🌸 leafnote',
    '✨ botão de atualização com progresso e status claros na barra de título',
  ],

  '2.1.4': [
    '🌸 leafnote',
    '✨ nome do instalador corrigido',
    '🐛 banner de atualização agora aparece corretamente',
  ],

  '2.1.3': [
    '🌸 leafnote',
    '✨ teste updater',
  ],

  '2.1.2': [
    '🌸 leafnote',
    '✨ sistema de atualização automática',
    '✨ changelog com novidades',
  ],

  '2.1.1': [
    '🌸 leafnote',
    '✨ sistema de atualização automática',
    '✨ changelog de novidades',
  ],

  '2.1.0': [
    '🌸 leafnote v2.1.0',
    '✨ Campo "disponível a partir de" nas cartas especiais',
    '✨ Itens migram pro mural principal ao deletar um board',
    '🐛 Correção na rega simultânea do jardim',
    '🐛 Correção na movimentação de itens entre murais',
  ],
}

export default function ChangelogModal() {
  const [open, setOpen] = useState(false)
  const [version, setVersion] = useState('')

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any).api.getVersion().then((v: string) => {
      setVersion(v)
      const key = `leafnote-changelog-${v}`
      if (!localStorage.getItem(key) && CHANGELOG[v]) {
        setOpen(true)
        localStorage.setItem(key, '1')
      }
    })
  }, [])

  if (!open || !CHANGELOG[version]) return null

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(26,42,26,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'linear-gradient(160deg, #fdf6f0 0%, #f5ecd7 100%)',
          border: '2px solid #c4956a',
          borderRadius: 20,
          padding: '28px 32px',
          minWidth: 340,
          maxWidth: 480,
          boxShadow: '0 8px 40px rgba(44,24,16,0.35)',
          fontFamily: "'Baloo 2', cursive",
          position: 'relative',
        }}
      >
        <button
          onClick={() => setOpen(false)}
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#8b6914',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ fontSize: 22, fontWeight: 800, color: '#2d4a2d', marginBottom: 16 }}>
          novidades 🌸
        </div>

        <ul
          style={{
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
          }}
        >
          {CHANGELOG[version].map((item, i) => (
            <li
              key={item}
              style={{
                fontSize: i === 0 ? 15 : 13,
                fontWeight: i === 0 ? 800 : 500,
                color: i === 0 ? '#5a3010' : '#3d2408',
                borderBottom: i === 0 ? '1px solid #d4aa8066' : 'none',
                paddingBottom: i === 0 ? 10 : 0,
              }}
            >
              {item}
            </li>
          ))}
        </ul>

        <button
          onClick={() => setOpen(false)}
          style={{
            marginTop: 20,
            width: '100%',
            padding: '10px 0',
            background: 'linear-gradient(135deg, #d4956a, #c4845a)',
            border: 'none',
            borderRadius: 12,
            color: '#fff',
            fontFamily: "'Baloo 2', cursive",
            fontSize: 14,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          que fofo! 🌿
        </button>
      </div>
    </div>
  )
}
