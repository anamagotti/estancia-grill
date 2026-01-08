// Dados dos checklists baseados nas planilhas fornecidas

export type ChecklistItem = {
  category: string
  item: string
  points: number
}

export type ChecklistSection = {
  title: string
  items: ChecklistItem[]
}

export const CHECKLIST_ATENDIMENTO: ChecklistSection[] = [
  {
    title: "TAREFA / DIA",
    items: [
      { category: "Mesas Limpas", item: "Mesas Limpas", points: 5 },
      { category: "Mesas Limpas", item: "Paliteiro, saleiro e papeleiro nas mesas", points: 5 },
      { category: "Mesas Limpas", item: "Organização das mesas e cadeiras", points: 5 },
      { category: "Mesas Limpas", item: "Chão Limpo", points: 2 },
      { category: "Mesas Limpas", item: "Paredes Limpas", points: 3 },
      { category: "Mesas Limpas", item: "Arrumação do balcão", points: 2 },
      { category: "Mesas Limpas", item: "Copo chopp Black deve ser 100% timbrado", points: 5 },
      {
        category: "Mesas Limpas",
        item: "Limpeza e organização dos banheiros masculino e feminino",
        points: 5,
      },
      { category: "Mesas Limpas", item: "Papeleiro e suporte de sabão dos banheiros abastecidos", points: 5 },
      { category: "Mesas Limpas", item: "15 caixas de caldereta no estoque", points: 15 },
      {
        category: "Mesas Limpas",
        item: "Música padrão Bar do Português (pagode e sertanejo são proibidos)",
        points: 5,
      },
      { category: "Mesas Limpas", item: "Som ambiente adequado", points: 5 },
    ],
  },
  {
    title: "Aparência dos Colaboradores",
    items: [
      {
        category: "Aparência dos Colaboradores",
        item: "Uniforme Completo (camiseta, avental, calça jeans) e limpo",
        points: 15,
      },
      { category: "Aparência dos Colaboradores", item: "Sapato Fechado", points: 5 },
      { category: "Aparência dos Colaboradores", item: "Cabelo limpo e preso", points: 15 },
      { category: "Aparência dos Colaboradores", item: "Unhas limpas", points: 5 },
    ],
  },
  {
    title: "Atendimento",
    items: [
      {
        category: "Atendimento",
        item: "Garçom realizou o primeiro contato conforme manual e ofereceu o chopp",
        points: 10,
      },
      { category: "Atendimento", item: "Bolachas do chopp carregadas no bolso", points: 10 },
      {
        category: "Atendimento",
        item: "Todos os produtos são AmBev na geladeira, excessão da água",
        points: 10,
      },
      { category: "Atendimento", item: "Pimentas servidas nos recipientes e limpos", points: 5 },
      { category: "Atendimento", item: "O lavout e identidade visual do bar respeitados", points: 10 },
      { category: "Atendimento", item: "Há todas as bebidas conidas no cardápio", points: 10 },
      {
        category: "Atendimento",
        item: "Todos utensílios (tit) entregues ao cliente junto com o pedido",
        points: 15,
      },
      { category: "Atendimento", item: "Não serviu mais bebidas após o taque da sineta", points: 20 },
      { category: "Atendimento", item: "Fechou o esbelecimento no horário estipulado", points: 10 },
    ],
  },
]

export const CHECKLIST_CHOPP: ChecklistSection[] = [
  {
    title: "Tiragem do chopp Brahma",
    items: [
      { category: "Tiragem do chopp Brahma", item: "Copo realizado com água e gelo", points: 5 },
      {
        category: "Tiragem do chopp Brahma",
        item: "As mãos não encostaram no líquido de resfriar",
        points: 5,
      },
      { category: "Tiragem do chopp Brahma", item: "Primeiro Jato foi dispensado", points: 5 },
      { category: "Tiragem do chopp Brahma", item: "Cremou corretamente", points: 10 },
      {
        category: "Tiragem do chopp Brahma",
        item: "Transbordou parte do colarinho para eliminar a espuma",
        points: 5,
      },
      {
        category: "Tiragem do chopp Brahma",
        item: "Chopp com temperatura menor que 3°C",
        points: 15,
      },
      { category: "Tiragem do chopp Brahma", item: "Colarinho igual ou maior que 2,5cm", points: 10 },
    ],
  },
  {
    title: "Bolachas",
    items: [{ category: "Bolachas", item: "Uso de bolacha para o chopp", points: 2 }],
  },
  {
    title: "Cilindro de CO2",
    items: [
      {
        category: "Cilindro de CO2",
        item: "Cilindro CO2 fixado à parede com corrente com pressão entre 1,8 e 2,7",
        points: 5,
      },
    ],
  },
  {
    title: "Maquina de lavar copos",
    items: [
      {
        category: "Maquina de lavar copos",
        item: "Uso de sabão alemão (Sabão bactericida, desengordurante e inodoro)",
        points: 5,
      },
      {
        category: "Maquina de lavar copos",
        item: "Assepsia dentro do prazo (manutenção diária)",
        points: 15,
      },
      { category: "Maquina de lavar copos", item: "Uso exclusivo copos de Chopp e cerveja", points: 5 },
    ],
  },
  {
    title: "Copo padrão",
    items: [
      { category: "Copo padrão", item: "Copo padrão Brahma de 350 ml", points: 10 },
      { category: "Copo padrão", item: "Limpos adequadamente (livre de resíduos e gordura)", points: 10 },
    ],
  },
  {
    title: "Pré-resfriador",
    items: [
      { category: "Pré-resfriador", item: "Higiene", points: 2 },
      {
        category: "Pré-resfriador",
        item: "O choppeiro sabe a diferença do termostato para o real",
        points: 10,
      },
      { category: "Pré-resfriador", item: "O álcool do pré-resfriador estava gelado", points: 5 },
      { category: "Pré-resfriador", item: "Livre de apoio de objetos", points: 2 },
    ],
  },
  {
    title: "Barril",
    items: [
      { category: "Barril", item: "Barril de chopp claro fechado dentro da validade", points: 15 },
      { category: "Barril", item: "Barril de chopp BLACK fechado dentro da validade", points: 15 },
      { category: "Barril", item: "Barril chopp claro engatado e usado no prazo de 48 horas", points: 15 },
      { category: "Barril", item: "Barril chopp BLACK engatado e usado no prazo de 48 horas", points: 15 },
      {
        category: "Barril",
        item: "No estoque a temperatura deve estar entre 2° e 7°C",
        points: 5,
      },
      { category: "Barril", item: "Em USO deve estar em local refrigerado", points: 5 },
      { category: "Barril", item: "Controle adequado dos barris de Brahma", points: 5 },
      { category: "Barril", item: "Livre de apoios sobre o barril", points: 5 },
      { category: "Barril", item: "Sala de lager pixelada", points: 10 },
    ],
  },
  {
    title: "Choppeira",
    items: [
      { category: "Choppeira", item: "Assepsia da choppeira dentro do prazo 1x no mês", points: 10 },
      { category: "Choppeira", item: "Bico das choppeiras limpos", points: 10 },
      { category: "Choppeira", item: "Limpeza adequada das tornqueiras (descarte)", points: 8 },
    ],
  },
]

export const CHECKLIST_COZINHA: ChecklistSection[] = [
  {
    title: "APARÊNCIA DOS FUNCIONÁRIOS",
    items: [
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Unhas curtas, limpas, sem esmalte", points: 10 },
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Não usar acessórios (jóias, pulseiras, relógios)", points: 5 },
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Limpeza do Uniforme", points: 5 },
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Camiseta Branca", points: 5 },
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Touca Branca", points: 10 },
      { category: "APARÊNCIA DOS FUNCIONÁRIOS", item: "Uso de avental", points: 10 },
    ],
  },
  {
    title: "HIGIENE OPERACIONAL",
    items: [{ category: "HIGIENE OPERACIONAL", item: "Mãos higienizadas adequadamente", points: 10 }],
  },
  {
    title: "HIGIENE DOS EQUIPAMENTOS E MÓVEIS",
    items: [
      {
        category: "HIGIENE DOS EQUIPAMENTOS E MÓVEIS",
        item: "Limpeza do fogão, forno, chapa, freezer, câmera fria, balança, microondas, liquidificador, fritadeira, estoque, paredes, esairado e pallet",
        points: 10,
      },
      {
        category: "HIGIENE DOS EQUIPAMENTOS E MÓVEIS",
        item: "Limpeza e mantençõ das lixeiras de exclusão",
        points: 10,
      },
    ],
  },
  {
    title: "HIGIENIZAÇÃO DE UTENSÍLIOS",
    items: [
      {
        category: "HIGIENIZAÇÃO DE UTENSÍLIOS",
        item: "Higiene das panelas, frigideiras, assadeiras, baixelas, travessas, facas, ponchas, espátulas, pexotas, pratos, talheres, placas de corte",
        points: 10,
      },
    ],
  },
  {
    title: "RECEBIMENTO DE MERCADORIAS",
    items: [
      {
        category: "RECEBIMENTO DE MERCADORIAS",
        item: "Todos os fornecedores e marcas são aqueles estipulados pela franqueadora",
        points: 10,
      },
      {
        category: "RECEBIMENTO DE MERCADORIAS",
        item: "Linha de produtos da marca Bar do Português respeitados",
        points: 10,
      },
      {
        category: "RECEBIMENTO DE MERCADORIAS",
        item: "Verificou se todas as compras dos produtos estão adequadas",
        points: 10,
      },
    ],
  },
  {
    title: "APRESENTAÇÃO DOS ALIMENTOS",
    items: [
      {
        category: "APRESENTAÇÃO DOS ALIMENTOS",
        item: "Armazenamento adequado de todos os produtos conforme o manual",
        points: 15,
      },
      {
        category: "APRESENTAÇÃO DOS ALIMENTOS",
        item: "Preparo de porcinamentos conforme manual",
        points: 10,
      },
      {
        category: "APRESENTAÇÃO DOS ALIMENTOS",
        item: "Produtos em bom estado de conservação dentro da validade",
        points: 15,
      },
      {
        category: "APRESENTAÇÃO DOS ALIMENTOS",
        item: "Utilização correta do óleo e gordura para frituras",
        points: 10,
      },
      { category: "APRESENTAÇÃO DOS ALIMENTOS", item: "Balcão de preparo organizado de acordo ao setor", points: 5 },
    ],
  },
  {
    title: "PREPARAÇÃO DOS PRATOS",
    items: [
      {
        category: "PREPARAÇÃO DOS PRATOS",
        item: "Há todos os insumos para o preparo dos lanches e porções conidos no cardápio",
        points: 20,
      },
      { category: "PREPARAÇÃO DOS PRATOS", item: "Preparado e servido conforme padrão", points: 15 },
    ],
  },
]

export const CHECKLIST_MEDIAS: ChecklistSection[] = [
  {
    title: "Médias dos Preparos",
    items: [
      { category: "Produtos", item: "BOLINHO BACALHAU - Tempo: 10 min", points: 10 },
      { category: "Produtos", item: "ISCA TILAPIA - Tempo: 13 min", points: 10 },
      { category: "Produtos", item: "AZEITONA - Tempo: 3 min", points: 10 },
      { category: "Produtos", item: "PANCETA COM MANDIOCA - Tempo: 37 min", points: 10 },
      { category: "Produtos", item: "AMENDOIM - Tempo: 1 min", points: 10 },
      { category: "Produtos", item: "FILE MIGNON - Tempo: 44 min", points: 10 },
      { category: "Produtos", item: "X FRANGO - Tempo: 19 min", points: 10 },
    ],
  },
]

export const SECTORS = [
  { id: "atendimento", name: "Atendimento", checklist: CHECKLIST_ATENDIMENTO },
  { id: "chopp", name: "Chopp", checklist: CHECKLIST_CHOPP },
  { id: "cozinha", name: "Cozinha", checklist: CHECKLIST_COZINHA },
  { id: "medias", name: "Médias dos Preparos", checklist: CHECKLIST_MEDIAS },
] as const

export function calculateRating(percentage: number): string {
  if (percentage >= 92.6) return "EXCELENTE"
  if (percentage >= 72.8) return "BOM"
  if (percentage >= 22) return "MUITO RUIM"
  return "PONTUAÇÃO ALCANÇADA"
}

export function getRatingColor(rating: string): string {
  switch (rating) {
    case "EXCELENTE":
      return "bg-green-500"
    case "BOM":
      return "bg-blue-500"
    case "MUITO RUIM":
      return "bg-red-500"
    default:
      return "bg-yellow-500"
  }
}
