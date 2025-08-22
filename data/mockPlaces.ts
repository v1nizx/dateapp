export interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  mapUrl: string;
  budget: string;
  type: string;
  period: string;
  tags: string[];
  imageUrl: string;
  rating: number;
  suggestedActivity: string;
  openingHours: string;
}

export const mockPlaces: Place[] = [
  // Gastronomia - Econômico
  {
    id: '1',
    name: 'Pizzaria',
    description: 'Pizzaria tradicional com massa artesanal e ingredientes frescos. Ambiente aconchegante perfeito para casais.',
    address: 'São Luis',
    mapUrl: 'https://maps.google.com/maps?q=Pizzaria',
    budget: '$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['romântico', 'tradicional', 'pizza artesanal'],
    imageUrl: '',
    rating: 4.3,
    suggestedActivity: 'Experimente a pizza margherita com borda recheada e depois caminhem pela praça que fica a 2 quarteirões.',
    openingHours: 'Ter a Dom: 18h às 23h'
  },
  {
    id: '2',
    name: 'Sushi House',
    description: 'Restaurante japonês com sushis frescos e ambiente acolhedor. Ideal para um encontro romântico.',
    address: 'São Luis',
    mapUrl: 'https://maps.google.com/maps?q=Sushi',
    budget: '$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['temaki', 'sushi', 'romântico'],
    imageUrl: '',
    rating: 4.5,
    suggestedActivity: 'Provem o sushi especial da casa e aproveitem para relaxar na área externa.',
    openingHours: 'Seg a Dom: 7h às 23h'
  },

  // // Gastronomia - Moderado
  {
    id: '3',
    name: 'Locomobrasa',
    description: 'Restaurante contemporâneo com pratos autorais e carta de vinhos selecionada.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Locomobrasa',
    budget: '$$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['pratos autorais', 'vinhos', 'sofisticado', 'romântico'],
    imageUrl: '',
    rating: 4.7,
    suggestedActivity: 'Peçam o menu degustação do chef e harmonizem com a sugestão de vinho da casa.',
    openingHours: 'Seg a Dom: 12h às 23h'
  },

  // Gastronomia - Sofisticado
  {
    id: '4',
    name: 'Península',
    description: 'Restaurantes sofisticados com pratos requintados.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Península',
    budget: '$$$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['francesa', 'chef premiado', 'elegante', 'casa histórica'],
    imageUrl: '',
    rating: 4.9,
    suggestedActivity: 'Desfrutem de um jantar romântico com pratos sofisticados.',
    openingHours: 'Ter a Sáb: 19h30 às 22h30'
  },

  // Cultura - Econômico
  {
    id: '5',
    name: 'Cinema',
    description: 'Os filmes que a gente quer ver.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Cinema',
    budget: '$',
    type: 'cultura',
    period: 'noite',
    tags: ['cinema alternativo', 'filmes independentes', 'intimista'],
    imageUrl: '',
    rating: 4.4,
    suggestedActivity: 'Escolham um filme que ambos gostem, comprem pipoca e aproveitem a sessão juntos.',
    openingHours: 'Ter a Dom: 14h às 22h'
  },
  {
    id: '6',
    name: 'Museu da História Local',
    description: 'Pequeno museu com exposições interativas sobre a história da cidade.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Centro+Histórico',
    budget: '$',
    type: 'cultura',
    period: 'dia',
    tags: ['história local', 'interativo', 'educativo'],
    imageUrl: '',
    rating: 4.2,
    suggestedActivity: 'Façam a visita guiada e depois relaxem no jardim do museu com um lanche.',
    openingHours: 'Qua a Dom: 9h às 17h'
  },

  // Ao Ar Livre - Econômico
  {
    id: '7',
    name: 'Passeio de Bike',
    description: 'Passeio de bike por áreas verdes e ciclovias da cidade. Aluguel de bicicletas disponível no local.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Bicicletario',
    budget: '$',
    type: 'ao-ar-livre',
    period: 'dia',
    tags: ['lago', 'trilhas', 'piquenique', 'natureza'],
    imageUrl: '',
    rating: 4.6,
    suggestedActivity: 'Aluguem bicicletas e explorem as trilhas do parque, terminando com um piquenique à beira do lago.',
    openingHours: 'Todos os dias: 6h às 18h'
  },
  {
    id: '8',
    name: 'Litoranea',
    description: 'Litoral da cidade com praias tranquilas e quiosques à beira-mar. Ideal para um passeio ao entardecer.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Litoranea',
    budget: '$',
    type: 'ao-ar-livre',
    period: 'dia',
    tags: ['vista panorâmica', 'pôr do sol', 'romântico', 'fotografia'],
    imageUrl: '',
    rating: 4.8,
    suggestedActivity: 'Cheguem no final da tarde para ver o pôr do sol e tirem fotos lindas juntos.',
    openingHours: 'Todos os dias: 6h às 19h'
  },

  // Aventura - Moderado
  {
    id: '9',
    name: 'Parque de Diversões',
    description: 'Parque temático com diversas atrações e brinquedos radicais.',
    address: 'Entrada pela Estrada Rural, km 12',
    mapUrl: 'https://maps.google.com/maps?q=Parque+de+Diversoes',
    budget: '$$',
    type: 'aventura',
    period: 'dia',
    tags: ['trilha', 'cachoeira', 'natureza', 'refrescante'],
    imageUrl: '',
    rating: 4.7,
    suggestedActivity: 'Brinquem nos brinquedos radicais e aproveitem para um lanche na área de piquenique.',
    openingHours: 'Todos os dias: 7h às 16h'
  },

  // Casual - Econômico
  {
    id: '10',
    name: 'Date em casa',
    description: 'Uma noite romântica sem sair de casa.',
    address: 'Na sua casa ou na minha',
    mapUrl: 'https://maps.google.com/maps?q=Cohatrac',
    budget: '$',
    type: 'casual',
    period: 'noite',
    tags: ['boteco', 'petiscos', 'chopp', 'descontraído'],
    imageUrl: '',
    rating: 4.3,
    suggestedActivity: 'Preparem juntos petiscos caseiros, escolham uma série ou filme para assistir e aproveitem a noite com um bom vinho ou cerveja artesanal.',
    openingHours: 'Ter a Dom: 17h às 24h'
  },

  // Mais opções variadas...
  {
    id: '11',
    name: 'Café Miau',
    description: 'Café charmoso com ambiente acolhedor, perfeito para um encontro casual com drinks especiais e sobremesas deliciosas.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Café+Miau',
    budget: '$$$',
    type: 'casual',
    period: 'dia',
    tags: ['rooftop', 'vista cidade', 'drinks autorais', 'sofisticado'],
    imageUrl: '',
    rating: 4.8,
    suggestedActivity: 'Desfrutem de um café especial enquanto apreciam a vista da cidade.',
    openingHours: 'Qua a Sáb: 18h às 2h'
  },
  {
    id: '12',
    name: 'Teatro Municipal',
    description: 'Teatro histórico que apresenta peças locais, música e espetáculos de dança.',
    address: 'Praça da Cultura, 1 - Centro',
    mapUrl: 'https://maps.google.com/maps?q=Teatro+Municipal',
    budget: '$$',
    type: 'cultura',
    period: 'noite',
    tags: ['teatro', 'histórico', 'espetáculos', 'cultura local'],
    imageUrl: '',
    rating: 4.5,
    suggestedActivity: 'Vejam a programação mensal e reservem um espetáculo. Jantem antes no restaurante do teatro.',
    openingHours: 'Conforme programação'
  },

  // Mais gastronomia
  {
    id: '13',
    name: 'Rodizio de bebidas',
    description: 'Variedade de drinks e petiscos em um ambiente descontraído.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Espeto+Grill',
    budget: '$$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['hamburguer gourmet', 'artesanal', 'casual'],
    imageUrl: '',
    rating: 4.4,
    suggestedActivity: 'Drinks e petiscos variados para compartilhar.',
    openingHours: 'Ter a Dom: 18h às 23h'
  },
  {
    id: '14',
    name: 'Diverno',
    description: 'Sorveteria artesanal com sabores únicos e opções veganas.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Diverno',
    budget: '$',
    type: 'gastronomia',
    period: 'dia',
    tags: ['sorvete artesanal', 'sabores únicos', 'vegano'],
    imageUrl: '',
    rating: 4.6,
    suggestedActivity: 'Provem sabores diferentes e caminhem pela praça saboreando juntos.',
    openingHours: 'Todos os dias: 12h às 22h'
  },

  // Mais cultura
  // {
  //   id: '15',
  //   name: 'Galeria de Arte Contemporânea',
  //   description: 'Espaço cultural com exposições de artistas locais e oficinas criativas.',
  //   address: 'Rua das Artes, 88 - Centro Cultural',
  //   mapUrl: 'https://maps.google.com/maps?q=Galeria+Arte+Contemporanea',
  //   budget: '$',
  //   type: 'cultura',
  //   period: 'dia',
  //   tags: ['arte contemporânea', 'artistas locais', 'oficinas'],
  //   imageUrl: '',
  //   rating: 4.3,
  //   suggestedActivity: 'Visitem a exposição atual e participem de uma oficina criativa juntos.',
  //   openingHours: 'Ter a Dom: 10h às 18h'
  // },
  // {
  //   id: '16',
  //   name: 'Centro de Artesanato',
  //   description: 'Local com produtos artesanais locais, café e apresentações culturais aos fins de semana.',
  //   address: 'Mercado Cultural, Box 12-15',
  //   mapUrl: 'https://maps.google.com/maps?q=Centro+Artesanato',
  //   budget: '$',
  //   type: 'cultura',
  //   period: 'dia',
  //   tags: ['artesanato local', 'cultural', 'apresentações'],
  //   imageUrl: '',
  //   rating: 4.1,
  //   suggestedActivity: 'Explorem os produtos locais e tomem um café enquanto assistem uma apresentação.',
  //   openingHours: 'Qua a Dom: 9h às 17h'
  // },

  // Mais ao ar livre
  // {
  //   id: '17',
  //   name: 'Ciclovia da Lagoa',
  //   description: 'Percurso de 5km ao redor da lagoa com aluguel de bikes e paradas para lanche.',
  //   address: 'Lagoa Municipal - Entrada Sul',
  //   mapUrl: 'https://maps.google.com/maps?q=Ciclovia+Lagoa',
  //   budget: '$',
  //   type: 'ao-ar-livre',
  //   period: 'dia',
  //   tags: ['ciclismo', 'lagoa', 'exercício', 'natureza'],
  //   imageUrl: '',
  //   rating: 4.7,
  //   suggestedActivity: 'Aluguem bikes e façam o percurso completo, parando para um lanche no meio do caminho.',
  //   openingHours: 'Todos os dias: 6h às 18h'
  // },
  // {
  //   id: '18',
  //   name: 'Jardim Botânico',
  //   description: 'Espaço com plantas nativas, estufa de orquídeas e trilha educativa.',
  //   address: 'Av. Verde, 1500 - Zona Norte',
  //   mapUrl: 'https://maps.google.com/maps?q=Jardim+Botanico',
  //   budget: '$$',
  //   type: 'ao-ar-livre',
  //   period: 'dia',
  //   tags: ['plantas nativas', 'orquídeas', 'educativo', 'natureza'],
  //   imageUrl: '',
  //   rating: 4.5,
  //   suggestedActivity: 'Façam a trilha educativa e visitem a estufa de orquídeas. Levem água e protetor solar.',
  //   openingHours: 'Ter a Dom: 8h às 16h'
  // },

  // // Mais aventura
  // {
  //   id: '19',
  //   name: 'Escalada Indoor',
  //   description: 'Centro de escalada com rotas para iniciantes e equipamentos inclusos.',
  //   address: 'Complexo Esportivo, Bloco C',
  //   mapUrl: 'https://maps.google.com/maps?q=Escalada+Indoor',
  //   budget: '$$',
  //   type: 'aventura',
  //   period: 'dia',
  //   tags: ['escalada', 'iniciantes', 'equipamentos inclusos', 'esporte'],
  //   imageUrl: '',
  //   rating: 4.6,
  //   suggestedActivity: 'Façam uma aula experimental de escalada e se desafiem nas rotas iniciantes.',
  //   openingHours: 'Seg a Sáb: 9h às 21h'
  // },
  // {
  //   id: '20',
  //   name: 'Canoagem no Rio',
  //   description: 'Descida de 3km no rio com guia, equipamentos e lanche inclusos.',
  //   address: 'Base Náutica - Ponte Velha',
  //   mapUrl: 'https://maps.google.com/maps?q=Canoagem+Rio',
  //   budget: '$$$',
  //   type: 'aventura',
  //   period: 'dia',
  //   tags: ['canoagem', 'rio', 'guia', 'equipamentos inclusos'],
  //   imageUrl: '',
  //   rating: 4.8,
  //   suggestedActivity: 'Façam a descida completa remando juntos. A experiência dura cerca de 2 horas.',
  //   openingHours: 'Sáb e Dom: 8h às 15h'
  // },

  // Mais casual
  {
    id: '21',
    name: 'Barzinho a noite',
    description: 'Um bar descontraído com música ao vivo e drinks especiais.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Barzinho+Noite',
    budget: '$$',
    type: 'casual',
    period: 'noite',
    tags: ['karaokê', 'cabines privativas', 'drinks', 'diversão'],
    imageUrl: '',
    rating: 4.4,
    suggestedActivity: 'Desfrutem de um drink enquanto ouvem música ao vivo.',
    openingHours: 'Qua a Sáb: 19h às 2h'
  },
  {
    id: '22',
    name: 'Feirinha',
    description: 'Ferinha de artesanato local com música ao vivo e comidas típicas.',
    address: 'Sao Luis',
    mapUrl: 'https://maps.google.com/maps?q=Feirinha',
    budget: '$$',
    type: 'casual',
    period: 'dia',
    tags: ['artesanato', 'música ao vivo', 'comidas típicas', 'diversão'],
    imageUrl: '',
    rating: 4.7,
    suggestedActivity: 'Feirinha de artesanato local com música ao vivo e comidas típicas.',
    openingHours: 'Ter a Sáb: 15h às 23h'
  }
];

export function getFilteredPlaces(filters: { budget: string; type: string; period: string }): Place[] {
  return mockPlaces.filter(place => {
    return place.budget === filters.budget && 
           place.type === filters.type && 
           place.period === filters.period;
  });
}

export function getRandomPlace(places: Place[]): Place | null {
  if (places.length === 0) return null;
  const randomIndex = Math.floor(Math.random() * places.length);
  return places[randomIndex];
}