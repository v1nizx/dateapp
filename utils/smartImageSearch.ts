// utils/smartImageSearch.ts

interface LocationData {
  name: string;
  type: string;
  tags?: string[];
}

// Dicionário de palavras-chave por contexto
const KEYWORD_MAPPING: Record<string, string[]> = {
  // Palavras que indicam gastronomia
  'feira': ['market', 'food stall', 'street market', 'vendor'],
  'restaurante': ['restaurant', 'dining', 'food'],
  'bar': ['bar', 'pub', 'drinks', 'nightlife'],
  'café': ['cafe', 'coffee', 'coffee shop'],
  'lanchonete': ['snack bar', 'fast food', 'diner'],
  'pizzaria': ['pizza', 'pizzeria', 'italian'],
  'churrascaria': ['barbecue', 'grill', 'steakhouse'],
  'padaria': ['bakery', 'bread', 'pastry'],
  'comida': ['food', 'meal', 'cuisine'],
  'sushi': ['sushi', 'japanese', 'seafood'],
  'hamburguer': ['burger', 'hamburger', 'american food'],
  'espeto': ['barbecue', 'grill', 'skewers'],
  'rodizio': ['all you can eat', 'buffet', 'brazilian food'],
  'sorvete': ['ice cream', 'gelato', 'dessert'],
  
  // Palavras que indicam aventura
  'parque': ['park', 'recreation', 'outdoor'],
  'adventure': ['adventure', 'activities', 'fun'],
  'acqua': ['water', 'pool', 'aquatic'],
  'water': ['water park', 'slides', 'splash'],
  'radical': ['extreme', 'adventure', 'thrill'],
  'esporte': ['sports', 'activity', 'recreation'],
  'kart': ['go kart', 'racing', 'speed'],
  'diversao': ['amusement park', 'fun', 'rides'],
  'tirolesa': ['zipline', 'adventure', 'aerial'],
  'escalada': ['climbing', 'rock climbing', 'adventure'],
  
  // Palavras que indicam cultura
  'museu': ['museum', 'exhibition', 'collection'],
  'teatro': ['theater', 'stage', 'performance'],
  'cinema': ['cinema', 'movie', 'theater'],
  'galeria': ['gallery', 'art', 'artwork'],
  'cultural': ['culture', 'cultural', 'heritage'],
  'arte': ['art', 'artistic', 'creative'],
  'artesanato': ['handicraft', 'artisan', 'handmade'],
  
  // Palavras que indicam ao ar livre
  'praia': ['beach', 'ocean', 'seaside'],
  'lagoa': ['lagoon', 'lake', 'water'],
  'trilha': ['trail', 'hiking', 'nature'],
  'natureza': ['nature', 'natural', 'outdoor'],
  'jardim': ['garden', 'botanical', 'plants'],
  'bosque': ['forest', 'woods', 'trees'],
  'ciclovia': ['bike path', 'cycling', 'bicycle'],
  'bike': ['bicycle', 'cycling', 'bike ride'],
  'cachoeira': ['waterfall', 'cascade', 'nature'],
  'mirante': ['viewpoint', 'panorama', 'scenic view'],
  'litoranea': ['coastal', 'waterfront', 'seaside'],
  
  // Palavras que indicam casual
  'karaoke': ['karaoke', 'singing', 'entertainment'],
  'boteco': ['bar', 'pub', 'casual drinks'],
  'casa': ['home', 'cozy', 'indoor'],
  'feirinha': ['craft fair', 'market', 'local market'],
};

// Extrai keywords relevantes do nome do local
const extractRelevantKeywords = (locationName: string): string[] => {
  const nameLower = locationName.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, ''); // Remove acentos
  
  const foundKeywords: string[] = [];
  
  // Procura por palavras-chave conhecidas no nome
  for (const [key, terms] of Object.entries(KEYWORD_MAPPING)) {
    if (nameLower.includes(key)) {
      foundKeywords.push(...terms);
    }
  }
  
  return foundKeywords;
};

// Constrói a query otimizada para o Pexels
export const buildOptimizedQuery = (location: LocationData): string => {
  // 1. Extrai keywords do nome
  const nameKeywords = extractRelevantKeywords(location.name);
  
  // 2. Se não encontrou keywords específicas, usa o tipo genérico
  const typeKeywords: Record<string, string[]> = {
    'gastronomia': ['restaurant', 'food', 'dining'],
    'aventura': ['adventure', 'outdoor activities', 'fun'],
    'cultura': ['museum', 'art', 'culture'],
    'ao-ar-livre': ['nature', 'outdoor', 'landscape'],
    'casual': ['cafe', 'cozy place', 'relaxing'],
  };
  
  // 3. Combina as keywords (prioriza as do nome)
  const keywords = nameKeywords.length > 0 
    ? nameKeywords.slice(0, 3) // Limita a 3 keywords principais
    : typeKeywords[location.type] || ['travel'];
  
  // 4. Adiciona contexto brasileiro se relevante
  const query = `${keywords.join(' ')} brazil`;
  
  console.log(`🔍 Query gerada para "${location.name}": ${query}`);
  
  return query;
};

// Imagens padrão locais para cada tipo
const DEFAULT_IMAGES: Record<string, string> = {
  'gastronomia': '/images/defaults/gastronomia.svg',
  'aventura': '/images/defaults/aventura.svg',
  'cultura': '/images/defaults/cultura.svg',
  'ao-ar-livre': '/images/defaults/ao-ar-livre.svg',
  'casual': '/images/defaults/casual.svg',
};

// Importa a função de busca do Pexels
import { searchPexelsPhotos } from './pexels';

// Cache de imagens para evitar buscas duplicadas
const imageCache = new Map<string, string>();

// Função com fallback automático para imagens locais
export const getImageWithFallback = async (location: LocationData): Promise<string> => {
  const query = buildOptimizedQuery(location);
  
  try {
    const photo = await searchPexelsPhotos(query);
    return photo?.src.large || DEFAULT_IMAGES[location.type] || '/images/defaults/placeholder.svg';
  } catch (error) {
    console.error(`Erro ao buscar imagem:`, error);
    return DEFAULT_IMAGES[location.type] || '/images/defaults/placeholder.svg';
  }
};

// Função principal para obter imagem de um local (com logs detalhados)
export const getLocationImage = async (location: LocationData): Promise<string> => {
  try {
    // Constrói a query otimizada
    const query = buildOptimizedQuery(location);
    
    console.log(`🔍 Buscando imagem para "${location.name}"`);
    console.log(`📝 Query Pexels: "${query}"`);
    
    // Busca no Pexels
    const photo = await searchPexelsPhotos(query);
    
    if (photo) {
      console.log(`✅ Imagem encontrada: ${photo.alt || 'sem descrição'}`);
      return photo.src.large;
    }
    
    // Fallback para imagem padrão da categoria
    console.log(`⚠️ Usando imagem padrão para ${location.type}`);
    return DEFAULT_IMAGES[location.type] || '/images/defaults/placeholder.svg';
  } catch (error) {
    console.error(`❌ Erro ao buscar imagem para "${location.name}":`, error);
    return DEFAULT_IMAGES[location.type] || '/images/defaults/placeholder.svg';
  }
};

// Função com cache para evitar buscas duplicadas
export const getCachedImage = async (location: LocationData): Promise<string> => {
  const cacheKey = `${location.name}-${location.type}`;
  
  // Verifica se já existe no cache
  if (imageCache.has(cacheKey)) {
    console.log(`💾 Usando cache para "${location.name}"`);
    return imageCache.get(cacheKey)!;
  }
  
  // Busca a imagem
  const imageUrl = await getLocationImage(location);
  
  // Salva no cache
  imageCache.set(cacheKey, imageUrl);
  
  return imageUrl;
};

// Funções utilitárias de gerenciamento de cache

// Limpa todo o cache
export const clearImageCache = (): void => {
  imageCache.clear();
  console.log('🗑️ Cache de imagens limpo');
};

// Remove uma imagem específica do cache
export const removeFromCache = (location: LocationData): boolean => {
  const cacheKey = `${location.name}-${location.type}`;
  const removed = imageCache.delete(cacheKey);
  if (removed) {
    console.log(`🗑️ Removido do cache: "${location.name}"`);
  }
  return removed;
};

// Retorna o tamanho atual do cache
export const getCacheSize = (): number => {
  return imageCache.size;
};

// Verifica se uma imagem está no cache
export const isInCache = (location: LocationData): boolean => {
  const cacheKey = `${location.name}-${location.type}`;
  return imageCache.has(cacheKey);
};
