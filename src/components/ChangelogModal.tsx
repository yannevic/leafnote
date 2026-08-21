import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

const CHANGELOG: Record<string, string[]> = {
  '3.0.71': [
    "🐛 trocas corrigidas e aprimoradas",
  ],

  '3.0.70': [
    "🐛 Corrigido bug em que marcos de streak de 4 semanas (28, 56, 84...) sumiam assim que eram checados, antes do dia certo — agora ficam marcados até o ciclo seguinte chegar de verdade",
    "📖 Guia das cartinhas agora explica moeda pessoal, atividades e a venda de carta repetida pra Folhinha",
    "✨ Selo de nova/repetida na mochila + scrollbar customizada no extrato, mochila e tela de cartinhas",
    "✨ Trocas disponiveis!",
  ],

  '3.0.69': [
    "🐛 Corrigido bug em que marcos de streak de 4 semanas (28, 56, 84...) sumiam assim que eram checados, antes do dia certo — agora ficam marcados até o ciclo seguinte chegar de verdade",
    "📖 Guia das cartinhas agora explica moeda pessoal, atividades e a venda de carta repetida pra Folhinha",
    "✨ selo de nova/repetida na mochila + scrollbar customizada no extrato, mochila e tela de cartinhas",
  ],

  '3.0.68': [
    "🐛 Corrigido bug em que marcos de streak de 4 semanas (28, 56, 84...) sumiam assim que eram checados, antes do dia certo — agora ficam marcados até o ciclo seguinte chegar de verdade",
    "📖 Guia das cartinhas agora explica moeda pessoal, atividades e a venda de carta repetida pra Folhinha",
  ],

  '3.0.67': [
    "🐛 nome dos pacotes de lucifer e lol corrigidos .",
  ],

  '3.0.66': [
    "✨ mostrador de pity de contador de pacotes abaixo do mesmo na loja",
    "✨ corrigido horario de brasilia no tempo de rega",
  ],

  '3.0.65': [
    "✨ mostrador de pity de contador de pacotes abaixo do mesmo na loja",
  ],

  '3.0.64': [
    "✨ nova coleção de cartinhas adicionada:  Lúcifer: Fallen Angel e League of Legends.",
    "✨ Extrato de moeda pessoal (histórico de movimentações + saldo após cada uma); moeda individual dos dois exibida lado a lado na barra superior",
    "✨ extrato de ganhos e perdas de moedas individuais",
  ],

  '3.0.63': [
    "✨ nova coleção de cartinhas adicionada:  Lúcifer: Fallen Angel e League of Legends.",
    "✨ Extrato de moeda pessoal (histórico de movimentações + saldo após cada uma); moeda individual dos dois exibida lado a lado na barra superior",
  ],

  '3.0.62': [
    "✨ nova coleção de cartinhas adicionada:  Lúcifer: Fallen Angel e League of Legends.",
  ],

  '3.0.61': [
    "✨ nova coleção de cartinhas adicionada:  Lúcifer: Fallen Angel",
  ],

  '3.0.60': [
    "✨ nova coleção de cartinhas adicionada:  Lúcifer: Fallen Angel",
  ],

  '3.0.59': [
    "🔧 Pacote: cartas repetidas dentro do mesmo pacote (ou que você já tinha) agora aparecem com selo \"🔁 repetida\" em vez de \"✨ nova\" errado",
    "🐛 reset de rega/plantio usava UTC em vez de Brasília — murchava/plantava com até 3h de antecedência",
  ],

  '3.0.58': [
    "🔧 Pacote: cartas repetidas dentro do mesmo pacote (ou que você já tinha) agora aparecem com selo \"🔁 repetida\" em vez de \"✨ nova\" errado",
    "🐛 reset de rega/plantio usava UTC em vez de Brasília — murchava/plantava com até 3h de antecedência",
  ],

  '3.0.57': [
    "🎴 adiciona segunda coleção de cartinhas (Dexter: Dark Passenger)",
    "🎴 coleção agora mostra as duas empilhadas, cada uma expansível",
    "🎴 pacote promocional troca de coleção sozinho todo domingo à meia-noite",
    "🎴 loja rotativa agora sorteia cartas de todas as coleções juntas",
    "🐛 corrige bug em que moedas de venda de flor/semente podiam creditar só quem vendeu, sem dividir com o parceiro — causado por uma falha na identificação do parceiro quando a presença dele não estava sincronizada no momento da venda",
    "🎨 confirmação de compra da loja de cartinhas mais bonita (animação, cor por item, imagem do produto); pacotes e loja rotativa com novos efeitos visuais",
    "✨ Pacote: as 5 cartas agora abrem sempre em uma única linha (antes quebrava 4+1)",
    "✨ Pacote: cartas viradas que você não tinha antes ganham selo \"✨ nova\"",
    "✨ Mochila: cartas soltas repetidas (mesma carta) empilham num card só, com bolinha numerada mostrando a quantidade",
  ],

  '3.0.56': [
    "🎴 adiciona segunda coleção de cartinhas (Dexter: Dark Passenger)",
    "🎴 coleção agora mostra as duas empilhadas, cada uma expansível",
    "🎴 pacote promocional troca de coleção sozinho todo domingo à meia-noite",
    "🎴 loja rotativa agora sorteia cartas de todas as coleções juntas",
    "🐛 corrige bug em que moedas de venda de flor/semente podiam creditar só quem vendeu, sem dividir com o parceiro — causado por uma falha na identificação do parceiro quando a presença dele não estava sincronizada no momento da venda",
    "🎨 confirmação de compra da loja de cartinhas mais bonita (animação, cor por item, imagem do produto); pacotes e loja rotativa com novos efeitos visuais",
  ],

  '3.0.55': [
    "🎴 adiciona segunda coleção de cartinhas (Dexter: Dark Passenger)",
    "🎴 coleção agora mostra as duas empilhadas, cada uma expansível",
    "🎴 pacote promocional troca de coleção sozinho todo domingo à meia-noite",
    "🎴 loja rotativa agora sorteia cartas de todas as coleções juntas",
    "🐛 corrige bug em que moedas de venda de flor/semente podiam creditar só quem vendeu, sem dividir com o parceiro — causado por uma falha na identificação do parceiro quando a presença dele não estava sincronizada no momento da venda",
  ],

  '3.0.54': [
    "🎴 adiciona segunda coleção de cartinhas (Dexter: Dark Passenger)",
    "🎴 coleção agora mostra as duas empilhadas, cada uma expansível",
    "🎴 pacote promocional troca de coleção sozinho todo domingo à meia-noite",
    "🎴 loja rotativa agora sorteia cartas de todas as coleções juntas",
    "🐛 corrige bug em que moedas de venda de flor/semente podiam creditar só quem vendeu, sem dividir com o parceiro — causado por uma falha na identificação do parceiro quando a presença dele não estava sincronizada no momento da venda",
  ],

  '3.0.53': [
    "🎴 adiciona segunda coleção de cartinhas (Dexter: Dark Passenger)",
    "🎴 coleção agora mostra as duas empilhadas, cada uma expansível",
    "🎴 pacote promocional troca de coleção sozinho todo domingo à meia-noite",
    "🎴 loja rotativa agora sorteia cartas de todas as coleções juntas",
  ],

  '3.0.52': [
    "🚨 corrige calendário de seleção de data que aparecia cortado ou escondido ao editar a streak ou a data de um filme assistido",
    "🚨 corrige cor de texto da flor épica",
    "🚨 limita pan do mural e melhora cursor de arrasto",
    "🎴 adiciona sistema de cartinhas colecionaveis (colecao Jardim Secreto, inventario individual, moeda pessoal com setup de nome/icone/cor, reward de rega)",
    "🎴 ajusta arte final dos pacotes (comum/promocional) e reorganiza layout da loja de cartinhas (pacotes e loja rotativa lado a lado, mesma altura, sem scroll)",
    "🎡 divide a roda de widgets em duas rodas empilhadas (essenciais e pessoais) usando componente reutilizavel WheelMenu, corrige bug de fechamento prematuro do menu",
    "🏆 move conquistas da roda antiga pra dentro da roda pessoal",
    "🎴 todos pacotes e cartas vao pra o inventario e podem ser movidos pra coleçao",
  ],

  '3.0.51': [
    "🚨 corrige calendário de seleção de data que aparecia cortado ou escondido ao editar a streak ou a data de um filme assistido",
    "🚨 corrige cor de texto da flor épica",
    "🚨 limita pan do mural e melhora cursor de arrasto",
    "🎴 adiciona sistema de cartinhas colecionaveis (colecao Jardim Secreto, inventario individual, moeda pessoal com setup de nome/icone/cor, reward de rega)",
    "🎴 ajusta arte final dos pacotes (comum/promocional) e reorganiza layout da loja de cartinhas (pacotes e loja rotativa lado a lado, mesma altura, sem scroll)",
    "🎡 divide a roda de widgets em duas rodas empilhadas (essenciais e pessoais) usando componente reutilizavel WheelMenu, corrige bug de fechamento prematuro do menu",
    "🏆 move conquistas da roda antiga pra dentro da roda pessoal",
  ],

  '3.0.50': [
    "🚨 corrige calendário de seleção de data que aparecia cortado ou escondido ao editar a streak ou a data de um filme assistido",
    "🚨 corrige cor de texto da flor épica",
    "🚨 limita pan do mural e melhora cursor de arrasto",
    "🎴 adiciona sistema de cartinhas colecionaveis (colecao Jardim Secreto, inventario individual, moeda pessoal com setup de nome/icone/cor, reward de rega)",
    "🎡 divide a roda de widgets em duas rodas empilhadas (essenciais e pessoais) usando componente reutilizavel WheelMenu, corrige bug de fechamento prematuro do menu",
    "🏆 move conquistas da roda antiga pra dentro da roda pessoal",
  ],

  '3.0.49': [
    "🚨 corrige calendário de seleção de data que aparecia cortado ou escondido ao editar a streak ou a data de um filme assistido",
    "🚨 corrige cor de texto da flor épica",
    "🚨 limita pan do mural e melhora cursor de arrasto",
  ],

  '3.0.48': [
    "🚨 corrige calendário de seleção de data que aparecia cortado ou escondido ao editar a streak ou a data de um filme assistido",
    "🚨 corrige cor de texto da flor épica",
  ],

  '3.0.47': [
    "🚨 corrige bug de rega falsa e adiciona bloqueio persistente do botão",
  ],

  '3.0.46': [
    "🚨 corrige bug de rega falsa e adiciona bloqueio persistente do botão",
  ],

  '3.0.45': [
    "🚨 corrige bug de rega falsa e adiciona bloqueio persistente do botão",
  ],

  '3.0.44': [
    "🚨 corrige recompensa de semente épica a cada 4 semanas",
  ],

  '3.0.43': [
    "🚨 adiciona botão de reset do bootstrap para reprocessar conquistas",
  ],

  '3.0.42': [
    "🚨 feat(streak): ocultar botão \"sortear sozinho\" sem modo pânico ativo",
  ],

  '3.0.41': [
    "🌸 modo pânico libera abertura de carta própria e alinha largura da carta final com preview",
  ],

  '3.0.40': [
    "🌸 modo pânico libera abertura de carta própria e alinha largura da carta final com preview",
  ],

  '3.0.39': [
    "📅 calendário da carta livre abre corretamente sem ser cortado",
    "🖼️ fotos e stickers ficam fixos no lugar certo ao rolar a carta",
    "🎲 notificação quando tiver dado pra girar no jardim",
    "🌸 notificação quando uma flor estiver pronta pra vender",
  ],

  '3.0.38': [
    "📅 calendário da carta livre abre corretamente sem ser cortado",
    "🖼️ fotos e stickers ficam fixos no lugar certo ao rolar a carta",
    "🎲 notificação quando tiver dado pra girar no jardim",
    "🌸 notificação quando uma flor estiver pronta pra vender",
  ],

  '3.0.37': [
    "📅 calendário da carta livre abre corretamente sem ser cortado",
    "🖼️ fotos e stickers ficam fixos no lugar certo ao rolar a carta",
    "🎲 notificação quando tiver dado pra girar no jardim",
    "🌸 notificação quando uma flor estiver pronta pra vender",
  ],

  '3.0.36': [
    "🚨 botão de modo pânico na barra superior",
    "📬 data de abertura na carta livre",
    "🔧 panicMode assinado no AppInner e passado pro TitleBar",
    "🔧 prêmio de 30 dias respeita modo pânico e repete a cada ciclo",
  ],

  '3.0.35': [
    "🚨 botão de modo pânico na barra superior",
    "📬 data de abertura na carta livre",
    "🔧 panicMode assinado no AppInner e passado pro TitleBar",
  ],

  '3.0.34': [
    "🚨 botão de modo pânico na barra superior",
    "📬 data de abertura na carta livre",
    "🔧 panicMode assinado no AppInner e passado pro TitleBar",
  ],

  '3.0.33': [
    "🐛 corrige horario para o de Brasilia",
    "✨ notificações agora aparecem na roda de pages",
  ],

  '3.0.32': [
    "🐛 corrige verificação de flores comuns no bootstrap",
  ],

  '3.0.31': [
    "🐛 corrige rega solo no modo pânico quando uid já regou antes de ativar",
  ],

  '3.0.30': [
    "🐛 corrige conquista ao quitar dívida",
  ],

  '3.0.29': [
    "🐛 corrige venda de flor e key do cycle-pin",
  ],

  '3.0.28': [
    "🎉 sistema de casais self-service: crie um mural ou entre em um com código de convite",
    "🔑 código de convite de 6 caracteres exibido na tela de espera com botão de copiar",
    "👥 mural abre automaticamente quando o parceiro entrar com o código",
    "🏠 app agora funciona para qualquer casal, sem UIDs fixos",
  ],

  '3.0.27': [
    "🐛 corrige validação de cartas e fechamento do GameModal no UNO",
    "🐛 corrige dupla instância de useGarden que causava sumiço de planta",
    "🐛 corrige calendário cortado no card de filme assistido",
  ],

  '3.0.26': [
    "🐛 corrige validação de cartas e fechamento do GameModal no UNO",
    "🐛 corrige dupla instância de useGarden que causava sumiço de planta",
  ],

  '3.0.25': [
    "🐛 corrige validação de cartas e fechamento do GameModal no UNO",
  ],

  '3.0.24': [
    "🐛 corrige validação de cartas e fechamento do GameModal no UNO",
  ],

  '3.0.23': [
    "✨ adiciona botão de reiniciar partida com confirmação no UNO",
  ],

  '3.0.22': [
    "🐛 corrige cartas wild e draw4 sempre abrem color picker no UNO",
  ],

  '3.0.21': [
    "🐛 corrige lobby de jogos e scroll no modal de sementes",
  ],

  '3.0.20': [
    "🎮 implementa 21 e UNO em tempo real",
  ],

  '3.0.19': [
    "🎮 implementa 21 e UNO em tempo real",
  ],

  '3.0.18': [
    "✨ substitui imagens do mood widget por Poros",
    "🐛 arrastar o botão do mood não abre o painel acidentalmente",
  ],

  '3.0.17': [
    "✨ substitui imagens do mood widget por Poros",
    "🐛 arrastar o botão do mood não abre o painel acidentalmente",
  ],

  '3.0.16': [
    "🐛 controles do sticker sumindo antes de alcançar o botão de rotação",
    "🐛 corrige unlock indevido de flores e tooltip cortado no modal de conquistas e novas conquistas de sticker",
    "✨ novo pack de stickers de lol",
    "🐛 corrige lógica de liberação e sorteio da meta semanal na streak",
    "✨ desconto progressivo no pack de stickers conforme itens já comprados",
  ],

  '3.0.15': [
    "🐛 controles do sticker sumindo antes de alcançar o botão de rotação",
    "🐛 corrige unlock indevido de flores e tooltip cortado no modal de conquistas e novas conquistas de sticker",
    "✨ novo pack de stickers de lol",
    "🐛 corrige lógica de liberação e sorteio da meta semanal na streak",
  ],

  '3.0.14': [
    "🐛 controles do sticker sumindo antes de alcançar o botão de rotação",
    "🐛 corrige unlock indevido de flores e tooltip cortado no modal de conquistas e novas conquistas de sticker",
    "✨ novo pack de stickers de lol",
  ],

  '3.0.13': [
    "🐛 controles do sticker sumindo antes de alcançar o botão de rotação",
    "🐛 corrige unlock indevido de flores e tooltip cortado no modal de conquistas e novas conquistas de sticker",
  ],

  '3.0.12': [
    "🐛 jardim — corrige tela branca ao confirmar troca de sementes",
    "🐛 conquistas — dica de flores faltantes usa histórico de plantadas em vez do inventário",
    "🎨 stickers no mural — painel flutuante glass com packs, cadeado e atalho pra loja",
    "💰 stickers — preços dos packs rebalanceados (35–65 moedas)",
  ],

  '3.0.11': [
    "🐛 jardim — corrige tela branca ao confirmar troca de sementes\r\n🐛 conquistas — dica de flores faltantes usa histórico de plantadas em vez do inventário",
  ],

  '3.0.10': [
    "✉️ carta livre — novo tipo de carta com editor completo de texto, papel, fonte e cores",
    "✉️ carta livre — upload de fotos com arrastar, girar e redimensionar no preview",
    "✉️ carta livre — stickers compráveis na loja, com arrastar, girar e redimensionar",
    "✉️ carta livre — envelope animado roxo no mural, com bloqueio por data especial",
    "✉️ carta livre — visualizador com envelope dourado animado ao abrir",
    "✉️ carta livre — rascunho salvo automaticamente, botão limpar com confirmação",
    "🏆 conquistas — toast não aparece mais ao reabrir o app",
    "🔔 notificações — eventos dos próximos 3 dias e datas especiais unificados no sino",
    "🔔 notificações — agrupados por dia, persiste \"visto\" no Firebase",
    "🔔 notificações — som ao notificar evento de hoje ou amanhã",
  ],

  '3.0.9': [
    "📌 deletar pin do calendário agora remove pra ambos em tempo real",
  ],

  '3.0.8': [
    "✨ sistema completo de conquistas — 54 conquistas em 7 categorias (jardim, streak, cartas, finanças, filmes, namoro, secretas)",
    "✨ recompensas individuais em moedas com resgate manual por conquista",
    "✨ bônus de categoria ao completar todas as conquistas de um grupo",
    "✨ bootstrap retroativo detecta conquistas já merecidas ao abrir o app",
    "✨ modal de conquistas com grade por categoria, barra de progresso e dicas de como desbloquear",
    "✨ toast animado ao desbloquear conquista nova",
    "✨ sistema de expansão de slots do jardim (até 8 vasos)",
    "✨ lançamentos financeiros vinculados a metas — depósito gera lançamento automático",
    "🐛 cor escolhida no picker agora é aplicada corretamente ao pin do mural",
    "✨ navegação entre plantas direto no modal da flor",
    "💄 scroll e DatePicker padronizados no módulo de ciclo e demais modais",
    "✨ probabilidade do dado rebalanceada — rara mais acessível (soma 11–12), incomum soma 9–10",
    "✨ preços dos slots de expansão rebalanceados",
    "🐛 guia do jardim atualizado com as novas probabilidades",
  ],

  '3.0.7': [
    "✨ sistema completo de conquistas — 54 conquistas em 7 categorias (jardim, streak, cartas, finanças, filmes, namoro, secretas)",
    "✨ recompensas individuais em moedas com resgate manual por conquista",
    "✨ bônus de categoria ao completar todas as conquistas de um grupo",
    "✨ bootstrap retroativo detecta conquistas já merecidas ao abrir o app",
    "✨ modal de conquistas com grade por categoria, barra de progresso e dicas de como desbloquear",
    "✨ toast animado ao desbloquear conquista nova",
    "✨ sistema de expansão de slots do jardim (até 8 vasos)",
    "✨ lançamentos financeiros vinculados a metas — depósito gera lançamento automático",
    "🐛 cor escolhida no picker agora é aplicada corretamente ao pin do mural",
    "✨ navegação entre plantas direto no modal da flor",
    "💄 scroll e DatePicker padronizados no módulo de ciclo e demais modais",
    "✨ probabilidade do dado rebalanceada — rara mais acessível (soma 11–12), incomum soma 9–10",
    "✨ preços dos slots de expansão rebalanceados",
  ],

  '3.0.6': [
    "✨ sistema completo de conquistas — 54 conquistas em 7 categorias (jardim, streak, cartas, finanças, filmes, namoro, secretas)",
    "✨ recompensas individuais em moedas com resgate manual por conquista",
    "✨ bônus de categoria ao completar todas as conquistas de um grupo",
    "✨ bootstrap retroativo detecta conquistas já merecidas ao abrir o app",
    "✨ modal de conquistas com grade por categoria, barra de progresso e dicas de como desbloquear",
    "✨ toast animado ao desbloquear conquista nova",
    "✨ sistema de expansão de slots do jardim (até 8 vasos)",
    "✨ lançamentos financeiros vinculados a metas — depósito gera lançamento automático",
    "🐛 cor escolhida no picker agora é aplicada corretamente ao pin do mural",
    "✨ navegação entre plantas direto no modal da flor",
    "💄 scroll e DatePicker padronizados no módulo de ciclo e demais modais",
    "✨ probabilidade do dado rebalanceada — rara mais acessível (soma 11–12), incomum soma 9–10",
    "✨ preços dos slots de expansão rebalanceados",
  ],

  '3.0.5': [
    "✨ sistema completo de conquistas — 54 conquistas em 7 categorias (jardim, streak, cartas, finanças, filmes, namoro, secretas)",
    "✨ recompensas individuais em moedas com resgate manual por conquista",
    "✨ bônus de categoria ao completar todas as conquistas de um grupo",
    "✨ bootstrap retroativo detecta conquistas já merecidas ao abrir o app",
    "✨ modal de conquistas com grade por categoria, barra de progresso e dicas de como desbloquear",
    "✨ toast animado ao desbloquear conquista nova",
    "✨ sistema de expansão de slots do jardim (até 8 vasos)",
    "✨ lançamentos financeiros vinculados a metas — depósito gera lançamento automático",
    "🐛 cor escolhida no picker agora é aplicada corretamente ao pin do mural",
    "✨ navegação entre plantas direto no modal da flor",
    "💄 scroll e DatePicker padronizados no módulo de ciclo e demais modais",
    "✨ probabilidade do dado rebalanceada — rara mais acessível (soma 11–12), incomum soma 9–10",
    "✨ preços dos slots de expansão rebalanceados",
  ],

  '3.0.4': [
    '✨ botão de finanças adicionado à roda de atalhos do mural',
    '💄 roda de 9 itens reorganizada em círculo perfeito (40° entre cada botão, raio 75px, ordem horária a partir do topo)',
    '✨ contador de dias sem brigar agora vira exatamente à meia-noite no horário de Brasília',
    '✨ marcos do streak com botão de check compartilhado (cinza → verdinho) — ambos veem em tempo real',
    '✨ marcos avançam em ciclos de 30 dias ao completar todos os checks',
    '💄 labels dos marcos dinâmicos: "7 dias", "1 mês e 7 dias", "2 meses", etc.',
    '🐛 data de assistido no calendário agora segue a data editada no card do filme',
  ],

  '3.0.3': [
    '✨ botão de finanças adicionado à roda de atalhos do mural',
    '💄 roda de 9 itens reorganizada em círculo perfeito (40° entre cada botão, raio 75px, ordem horária a partir do topo)',
    '✨ contador de dias sem brigar agora vira exatamente à meia-noite no horário de Brasília',
    '✨ marcos do streak com botão de check compartilhado (cinza → verdinho) — ambos veem em tempo real',
    '✨ marcos avançam em ciclos de 30 dias ao completar todos os checks',
    '💄 labels dos marcos dinâmicos: "7 dias", "1 mês e 7 dias", "2 meses", etc.',
    '🐛 data de assistido no calendário agora segue a data editada no card do filme',
  ],

  '3.0.2': [
    '✨ botão de finanças adicionado à roda de atalhos do mural',
    '💄 roda de 9 itens reorganizada em círculo perfeito (40° entre cada botão, raio 75px, ordem horária a partir do topo)',
  ],

  '3.0.1': [
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
          {CHANGELOG[version].map((item) => (
            <li
              key={item}
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: '#3d2408',
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
          entendi!
        </button>
      </div>
    </div>
  )
}
