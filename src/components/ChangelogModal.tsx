import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CHANGELOG: Record<string, string[]> = {
  '3.0.0': [
    '✨ presets de personagem — até 6 slots, nome customizado, grade 2x2, aplicar/excluir com um clique',
    '✨ nossa casinha — cena isométrica com chão, paredes e fundo personalizáveis',
    '✨ loja — comprar pisos, paredes, fundos e roupas com moedas',
    '✨ inventário — itens comprados salvos e sincronizados entre os dois',
    '✨ wishlist — favoritar itens e ver a lista de desejos do casal lado a lado',
    '✨ presentes — montar um presente com vários itens e enviar para o parceiro abrir na casinha',
    '✨ personagem aparece na casinha e pode ser posicionado livremente',
    '💄 provador de roupas na loja com manequim em tempo real',
    '💄 grupo de atalhos no mural (guarda-roupa / casinha / loja)',
    '🐛 várias correções de build, caminhos de imagem e layout',
  ],

  '2.2.2': [
    '✨ sistema de troca de sementes entre flores do jardim',
    '✨ modal guia do jardim com regras e dicas',
    '🐛 correção na probabilidade dos dados (soma 2d6 por tier)',
    '💄 ajustes visuais nos modais do jardim',
    '✨ custo de troca dinâmico por tier (EXCHANGE_COST)',
    '🌸 novas flores: Peônia, Papoula, Lavanda, Jasmim, Violeta e Lírio',
    '🔓 Orquídea desbloqueada para o sistema de trocas',
    '💰 sistema de economia com moedas',
    '✨ venda de sementes com confirmação',
    '✨ venda de flores florescidas',
    '🌱 limite de slots no jardim (dinâmico)',
    '🌿 arrancar planta com confirmação',
    '⏱️ tempo de crescimento por tier (comum/incomum/rara)',
    '🐛 fix assets: renomeia jasmim para jasmin',
    '💄 ícone de moedas (porquinho)',
    '👤 sistema de personagem com preview em tempo real (CharacterModal)',
    '🎨 seletor de variante de cor por categoria (sufixos b–h)',
    '🧱 sistema de camadas (LAYER_ORDER) com 21 níveis de profundidade',
    '👗 exclusão mútua vestido ↔ top/bottom',
    '🚫 body obrigatório com erro visual animado',
    '📑 abas: Corpo → Rosto → Cabelo → Roupas → Extras',
    '👕 sub-abas de roupas: Padrão',
    'Masculino',
    'Casal',
    'Praia',
    '🎒 sub-abas de extras: Padrão',
    'Casal',
    'Praia',
    '❌ botão "nenhum" por seção (exceto corpo)',
    '📦 catálogo completo de assets em index.ts por pack e gender',
    '🩱 suporte a saia casal (3 camadas: costas / normal / topo)',
    '💾 save/load do personagem no Firebase (users/{uid}/character)',
    '🔓 sistema de itens desbloqueados por padrão (firstTimeConfig)',
    '↩️ undo/redo funcional no guarda-roupa',
    '🧹 limpar tudo preserva o corpo selecionado',
    '🎨 scroll customizado no painel de peças',
    '📐 preview maior e header centralizado no modal',
  ],

  '2.2.1': [
    '✨ sistema de troca de sementes entre flores do jardim',
    '✨ modal guia do jardim com regras e dicas',
    '🐛 correção na probabilidade dos dados (soma 2d6 por tier)',
    '💄 ajustes visuais nos modais do jardim',
    '✨ custo de troca dinâmico por tier (EXCHANGE_COST)',
    '🌸 novas flores: Peônia, Papoula, Lavanda, Jasmim, Violeta e Lírio',
    '🔓 Orquídea desbloqueada para o sistema de trocas',
    '💰 sistema de economia com moedas',
    '✨ venda de sementes com confirmação',
    '✨ venda de flores florescidas',
    '🌱 limite de slots no jardim (dinâmico)',
    '🌿 arrancar planta com confirmação',
    '⏱️ tempo de crescimento por tier (comum/incomum/rara)',
    '🐛 fix assets: renomeia jasmim para jasmin',
    '💄 ícone de moedas (porquinho)',
    '👤 sistema de personagem com preview em tempo real (CharacterModal)',
    '🎨 seletor de variante de cor por categoria (sufixos b–h)',
    '🧱 sistema de camadas (LAYER_ORDER) com 21 níveis de profundidade',
    '👗 exclusão mútua vestido ↔ top/bottom',
    '🚫 body obrigatório com erro visual animado',
    '📑 abas: Corpo → Rosto → Cabelo → Roupas → Extras',
    '👕 sub-abas de roupas: Padrão',
    'Masculino',
    'Casal',
    'Praia',
    '🎒 sub-abas de extras: Padrão',
    'Casal',
    'Praia',
    '❌ botão "nenhum" por seção (exceto corpo)',
    '📦 catálogo completo de assets em index.ts por pack e gender',
    '🩱 suporte a saia casal (3 camadas: costas / normal / topo)',
    '💾 save/load do personagem no Firebase (users/{uid}/character)',
    '🔓 sistema de itens desbloqueados por padrão (firstTimeConfig)',
    '↩️ undo/redo funcional no guarda-roupa',
    '🧹 limpar tudo preserva o corpo selecionado',
    '🎨 scroll customizado no painel de peças',
    '📐 preview maior e header centralizado no modal',
  ],

  '2.1.24': [
    '✨ sistema de troca de sementes entre flores do jardim',
    '✨ modal guia do jardim com regras e dicas',
    '🐛 correção na probabilidade dos dados (soma 2d6 por tier)',
    '💄 ajustes visuais nos modais do jardim',
    '✨ custo de troca dinâmico por tier (EXCHANGE_COST)',
    '🌸 novas flores: Peônia, Papoula, Lavanda, Jasmim, Violeta e Lírio',
    '🔓 Orquídea desbloqueada para o sistema de trocas',
    '💰 sistema de economia com moedas',
    '✨ venda de sementes com confirmação',
    '✨ venda de flores florescidas',
    '🌱 limite de slots no jardim (dinâmico)',
    '🌿 arrancar planta com confirmação',
    '⏱️ tempo de crescimento por tier (comum/incomum/rara)',
    '🐛 fix assets: renomeia jasmim para jasmin',
    '💄 ícone de moedas (porquinho)',
    '👤 sistema de personagem com preview em tempo real (CharacterModal)',
    '🎨 seletor de variante de cor por categoria (sufixos b–h)',
    '🧱 sistema de camadas (LAYER_ORDER) com 21 níveis de profundidade',
    '👗 exclusão mútua vestido ↔ top/bottom',
    '🚫 body obrigatório com erro visual animado',
    '📑 abas: Corpo → Rosto → Cabelo → Roupas → Extras',
    '👕 sub-abas de roupas: Padrão',
    'Masculino',
    'Casal',
    'Praia',
    '🎒 sub-abas de extras: Padrão',
    'Casal',
    'Praia',
    '❌ botão "nenhum" por seção (exceto corpo)',
    '📦 catálogo completo de assets em index.ts por pack e gender',
    '🩱 suporte a saia casal (3 camadas: costas / normal / topo)',
    '💾 save/load do personagem no Firebase (users/{uid}/character)',
    '🔓 sistema de itens desbloqueados por padrão (firstTimeConfig)',
    '↩️ undo/redo funcional no guarda-roupa',
    '🧹 limpar tudo preserva o corpo selecionado',
    '🎨 scroll customizado no painel de peças',
    '📐 preview maior e header centralizado no modal',
  ],

  '2.1.23': [
    '✨ sistema de troca de sementes entre flores do jardim',
    '✨ modal guia do jardim com regras e dicas',
    '🐛 correção na probabilidade dos dados (soma 2d6 por tier)',
    '💄 ajustes visuais nos modais do jardim',
    '✨ custo de troca dinâmico por tier (EXCHANGE_COST)',
    '🌸 novas flores: Peônia, Papoula, Lavanda, Jasmim, Violeta e Lírio',
    '🔓 Orquídea desbloqueada para o sistema de trocas',
    '💰 sistema de economia com moedas',
    '✨ venda de sementes com confirmação',
    '✨ venda de flores florescidas',
    '🌱 limite de slots no jardim (dinâmico)',
    '🌿 arrancar planta com confirmação',
    '⏱️ tempo de crescimento por tier (comum/incomum/rara)',
    '🐛 fix assets: renomeia jasmim para jasmin',
    '💄 ícone de moedas (porquinho)',
    '👤 sistema de personagem com preview em tempo real (CharacterModal)',
    '🎨 seletor de variante de cor por categoria (sufixos b–h)',
    '🧱 sistema de camadas (LAYER_ORDER) com 21 níveis de profundidade',
    '👗 exclusão mútua vestido ↔ top/bottom',
    '🚫 body obrigatório com erro visual animado',
    '📑 abas: Corpo → Rosto → Cabelo → Roupas → Extras',
    '👕 sub-abas de roupas: Padrão',
    'Masculino',
    'Casal',
    'Praia',
    '🎒 sub-abas de extras: Padrão',
    'Casal',
    'Praia',
    '❌ botão "nenhum" por seção (exceto corpo)',
    '📦 catálogo completo de assets em index.ts por pack e gender',
    '🩱 suporte a saia casal (3 camadas: costas / normal / topo)',
  ],

  '2.1.22': [
    '✨ sistema de troca de sementes entre flores do jardim',
    '✨ modal guia do jardim com regras e dicas',
    '🐛 correção na probabilidade dos dados (soma 2d6 por tier)',
    '💄 ajustes visuais nos modais do jardim',
    '✨ custo de troca dinâmico por tier (EXCHANGE_COST)',
    '🌸 novas flores: Peônia, Papoula, Lavanda, Jasmim, Violeta e Lírio',
    '🔓 Orquídea desbloqueada para o sistema de trocas',
    '💰 sistema de economia com moedas',
    '✨ venda de sementes com confirmação',
    '✨ venda de flores florescidas',
    '🌱 limite de slots no jardim (dinâmico)',
    '🌿 arrancar planta com confirmação',
    '⏱️ tempo de crescimento por tier (comum/incomum/rara)',
    '🐛 fix assets: renomeia jasmim para jasmin',
    '💄 ícone de moedas (porquinho)',
  ],

  '2.1.21': ['🐛 humor n sobrescreve os itens'],

  '2.1.20': ['🐛 corrige módulo de ciclo menstrual'],

  '2.1.19': ['🌸 leafnote', '🐛 corrige módulo de ciclo menstrual'],

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

  '2.1.11': ['🌸 leafnote', '🐛 jardim: rega do parceiro não é mais apagada ao regar'],

  '2.1.10': ['🌸 leafnote', '🐛 jardim: rega não some mais ao reabrir o app'],

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

  '2.1.7': ['🌸 leafnote', '🐛 corrige Firebase no build do workflow'],

  '2.1.6': ['🌸 leafnote', '🐛 ajustes internos'],

  '2.1.5': [
    '🌸 leafnote',
    '✨ botão de atualização com progresso e status claros na barra de título',
  ],

  '2.1.4': [
    '🌸 leafnote',
    '✨ nome do instalador corrigido',
    '🐛 banner de atualização agora aparece corretamente',
  ],

  '2.1.3': ['🌸 leafnote', '✨ teste updater'],

  '2.1.2': ['🌸 leafnote', '✨ sistema de atualização automática', '✨ changelog com novidades'],

  '2.1.1': ['🌸 leafnote', '✨ sistema de atualização automática', '✨ changelog de novidades'],

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
          o que há de novo
        </div>

        <style>{`
          .changelog-scroll::-webkit-scrollbar { width: 5px; }
          .changelog-scroll::-webkit-scrollbar-track { background: transparent; }
          .changelog-scroll::-webkit-scrollbar-thumb { background: #d4aa80; border-radius: 99px; }
          .changelog-scroll { scrollbar-width: thin; scrollbar-color: #d4aa80 transparent; }
        `}</style>

        <ul
          className="changelog-scroll"
          style={{
            listStyle: 'none',
            padding: 0,
            paddingRight: 6,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            maxHeight: 320,
            overflowY: 'auto',
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
