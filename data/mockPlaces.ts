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
    name: 'Pizzaria do Bairro',
    description: 'Pizzaria tradicional com massa artesanal e ingredientes frescos. Ambiente aconchegante perfeito para casais.',
    address: 'Rua das Flores, 123 - Centro',
    mapUrl: 'https://maps.google.com/maps?q=Pizzaria+do+Bairro',
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
    name: 'Café Central',
    description: 'Cafeteria charmosa com grãos especiais e doces caseiros. Ideal para um encontro durante o dia.',
    address: 'Av. Principal, 456 - Centro',
    mapUrl: 'https://maps.google.com/maps?q=Cafe+Central',
    budget: '$',
    type: 'gastronomia',
    period: 'dia',
    tags: ['café especial', 'doces caseiros', 'aconchegante'],
    imageUrl: '',
    rating: 4.5,
    suggestedActivity: 'Provem o café coado na hora com o bolo de chocolate da casa. Aproveitem para ler juntos na área externa.',
    openingHours: 'Seg a Sáb: 7h às 18h'
  },

  // Gastronomia - Moderado
  {
    id: '3',
    name: 'Bistrô da Vila',
    description: 'Restaurante contemporâneo com pratos autorais e carta de vinhos selecionada.',
    address: 'Rua dos Artistas, 789 - Vila Criativa',
    mapUrl: 'https://maps.google.com/maps?q=Bistro+da+Vila',
    budget: '$$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['pratos autorais', 'vinhos', 'sofisticado', 'romântico'],
    imageUrl: '',
    rating: 4.7,
    suggestedActivity: 'Peçam o menu degustação do chef e harmonizem com a sugestão de vinho da casa.',
    openingHours: 'Qua a Dom: 19h às 23h'
  },

  // Gastronomia - Sofisticado
  {
    id: '4',
    name: 'Le Jardin',
    description: 'Restaurante francês com chef premiado e ambiente elegante em casa histórica.',
    address: 'Alameda dos Franceses, 100 - Jardins',
    mapUrl: 'https://maps.google.com/maps?q=Le+Jardin+Restaurant',
    budget: '$$$',
    type: 'gastronomia',
    period: 'noite',
    tags: ['francesa', 'chef premiado', 'elegante', 'casa histórica'],
    imageUrl: '',
    rating: 4.9,
    suggestedActivity: 'Reservem a mesa no jardim e experimentem o menu de 7 pratos com harmonização de vinhos franceses.',
    openingHours: 'Ter a Sáb: 19h30 às 22h30'
  },

  // Cultura - Econômico
  {
    id: '5',
    name: 'Cinema do Centro Cultural',
    description: 'Cinema alternativo que exibe filmes independentes e clássicos em ambiente intimista.',
    address: 'Rua Cultural, 321 - Centro Histórico',
    mapUrl: 'https://maps.google.com/maps?q=Cinema+Centro+Cultural',
    budget: '$',
    type: 'cultura',
    period: 'noite',
    tags: ['cinema alternativo', 'filmes independentes', 'intimista'],
    imageUrl: '',
    rating: 4.4,
    suggestedActivity: 'Assistam um filme indie e depois conversem sobre ele no café do centro cultural.',
    openingHours: 'Ter a Dom: 14h às 22h'
  },
  {
    id: '6',
    name: 'Museu da História Local',
    description: 'Pequeno museu com exposições interativas sobre a história da cidade.',
    address: 'Praça da Memória, s/n - Centro Histórico',
    mapUrl: 'https://maps.google.com/maps?q=Museu+Historia+Local',
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
    name: 'Parque das Águas',
    description: 'Parque urbano com lago, trilhas leves e área para piquenique.',
    address: 'Av. das Águas, 1000 - Zona Norte',
    mapUrl: 'https://maps.google.com/maps?q=Parque+das+Aguas',
    budget: '$',
    type: 'ao-ar-livre',
    period: 'dia',
    tags: ['lago', 'trilhas', 'piquenique', 'natureza'],
    imageUrl: '',
    rating: 4.6,
    suggestedActivity: 'Façam a trilha do lago e aproveitem para um piquenique na área sombreada. Levem um lanche gostoso!',
    openingHours: 'Todos os dias: 6h às 18h'
  },
  {
    id: '8',
    name: 'Mirante do Pôr do Sol',
    description: 'Ponto alto da cidade com vista panorâmica, perfeito para o final da tarde.',
    address: 'Estrada do Mirante, km 5 - Serra',
    mapUrl: 'https://maps.google.com/maps?q=Mirante+Por+do+Sol',
    budget: '$',
    type: 'ao-ar-livre',
    period: 'dia',
    tags: ['vista panorâmica', 'pôr do sol', 'romântico', 'fotografia'],
    imageUrl: '',
    rating: 4.8,
    suggestedActivity: 'Cheguem 30 minutos antes do pôr do sol, levem uma canga e apreciem a vista com alguns snacks.',
    openingHours: 'Todos os dias: 6h às 19h'
  },

  // Aventura - Moderado
  {
    id: '9',
    name: 'Trilha da Cachoeira',
    description: 'Trilha moderada de 2km que leva a uma bela cachoeira com poço para banho.',
    address: 'Entrada pela Estrada Rural, km 12',
    mapUrl: 'https://maps.google.com/maps?q=Trilha+Cachoeira',
    budget: '$$',
    type: 'aventura',
    period: 'dia',
    tags: ['trilha', 'cachoeira', 'natureza', 'refrescante'],
    imageUrl: '',
    rating: 4.7,
    suggestedActivity: 'Levem água, lanche e roupa de banho. A trilha dura 40 minutos e vocês podem se refrescar na cachoeira.',
    openingHours: 'Todos os dias: 7h às 16h'
  },

  // Casual - Econômico
  {
    id: '10',
    name: 'Bar do Zé',
    description: 'Boteco tradicional com petiscos caseiros e chopp gelado. Ambiente descontraído.',
    address: 'Rua da Alegria, 678 - Bairro Boêmio',
    mapUrl: 'https://maps.google.com/maps?q=Bar+do+Ze',
    budget: '$',
    type: 'casual',
    period: 'noite',
    tags: ['boteco', 'petiscos', 'chopp', 'descontraído'],
    imageUrl: '',
    rating: 4.3,
    suggestedActivity: 'Experimentem o bolinho de bacalhau com chopp gelado e conversem sobre a vida na mesa da calçada.',
    openingHours: 'Ter a Dom: 17h às 24h'
  },

  // Mais opções variadas...
  {
    id: '11',
    name: 'Rooftop Sky Bar',
    description: 'Bar na cobertura com vista da cidade, drinks autorais e música ambiente.',
    address: 'Ed. Central Tower, último andar - Centro',
    mapUrl: 'https://maps.google.com/maps?q=Rooftop+Sky+Bar',
    budget: '$$$',
    type: 'casual',
    period: 'noite',
    tags: ['rooftop', 'vista cidade', 'drinks autorais', 'sofisticado'],
    imageUrl: '',
    rating: 4.8,
    suggestedActivity: 'Cheguem no horário do happy hour e peçam o drink da casa enquanto apreciam a vista.',
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