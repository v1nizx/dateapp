import axios from 'axios';
import { Place } from '../data/mockPlaces';

// Configurações das APIs
const API_CONFIGS = {
  openai: {
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-3.5-turbo'
  },
  gemini: {
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    model: 'gemini-pro'
  }
};

// Tipos para as configurações
export interface AIConfig {
  provider: 'openai' | 'gemini' | 'local';
  city: string;
}

export interface DateFilters {
  budget: string;
  type: string;
  period: string;
  city: string;
}

// Função para obter API Keys das variáveis de ambiente
function getAPIKey(provider: 'openai' | 'gemini'): string | null {
  switch (provider) {
    case 'openai':
      return import.meta.env.VITE_OPENAI_API_KEY || null;
    case 'gemini':
      return import.meta.env.VITE_GEMINI_API_KEY || null;
    default:
      return null;
  }
}

// Função para verificar se a IA está disponível
export function isAIAvailable(provider: 'openai' | 'gemini'): boolean {
  const apiKey = getAPIKey(provider);
  return apiKey != null && apiKey.trim() !== '';
}

// Função para criar prompt personalizado
function createPrompt(filters: DateFilters): string {
  const budgetMap = {
    '$': 'econômico (até R$ 50 por pessoa)',
    '$$': 'moderado (R$ 50 - R$ 150 por pessoa)',
    '$$$': 'sofisticado (acima de R$ 150 por pessoa)'
  };

  const typeMap = {
    'gastronomia': 'gastronômicos (restaurantes, cafés, bares, lanchonetes)',
    'cultura': 'culturais (museus, teatros, centros culturais, galerias, cinemas)',
    'ao-ar-livre': 'ao ar livre (parques, praças, trilhas, lagos, jardins)',
    'aventura': 'de aventura (esportes, atividades radicais, escalada, ciclismo)',
    'casual': 'casuais (bares, cafés, lugares descontraídos, happy hours, botecos)'
  };

  const periodMap = {
    'dia': 'durante o dia (manhã e tarde)',
    'noite': 'durante a noite (final da tarde e noite)'
  };

  return `
Você é um especialista local em ${filters.city} especializado em encontros românticos. Preciso de EXATAMENTE 5 sugestões DIFERENTES e REAIS de lugares em ${filters.city} para um casal, seguindo estes critérios:

- Orçamento: ${budgetMap[filters.budget as keyof typeof budgetMap]}
- Tipo: ${typeMap[filters.type as keyof typeof typeMap]}
- Período: ${periodMap[filters.period as keyof typeof periodMap]}

IMPORTANTE:
1. Use APENAS lugares que REALMENTE existem em ${filters.city}
2. Varie os tipos de estabelecimentos dentro da categoria
3. Inclua desde opções mais conhecidas até joias escondidas
4. Respeite rigorosamente o orçamento especificado
5. Considere o horário de funcionamento para o período escolhido

Para cada lugar, forneça:
- Nome real e completo do estabelecimento
- Endereço específico (rua, número, bairro)
- Descrição atrativa (2-3 frases)
- Atividade romântica específica sugerida
- Horário de funcionamento real
- Avaliação realista (3.0 a 5.0)
- Tags descritivas relevantes

Responda APENAS em formato JSON válido, seguindo exatamente esta estrutura:

{
  "places": [
    {
      "id": "1",
      "name": "Nome Real Completo",
      "description": "Descrição atrativa e específica do local, destacando o que o torna especial para casais.",
      "address": "Rua Específica, 123 - Bairro, ${filters.city}",
      "mapUrl": "https://maps.google.com/maps?q=Nome+Real+${filters.city.replace(' ', '+')}",
      "budget": "${filters.budget}",
      "type": "${filters.type}",
      "period": "${filters.period}",
      "tags": ["tag1", "tag2", "tag3"],
      "imageUrl": "",
      "rating": 4.2,
      "suggestedActivity": "Atividade romântica específica e detalhada para o casal fazer neste local",
      "openingHours": "Horário real de funcionamento"
    },
    {
      "id": "2",
      "name": "Segundo Local Real",
      "description": "Descrição diferente e atrativa.",
      "address": "Outra Rua Real, 456 - Outro Bairro, ${filters.city}",
      "mapUrl": "https://maps.google.com/maps?q=Segundo+Local+${filters.city.replace(' ', '+')}",
      "budget": "${filters.budget}",
      "type": "${filters.type}",
      "period": "${filters.period}",
      "tags": ["outra1", "outra2", "outra3"],
      "imageUrl": "",
      "rating": 4.5,
      "suggestedActivity": "Outra atividade romântica específica",
      "openingHours": "Horário de funcionamento"
    }
  ]
}

Exemplo para ${filters.type} ${filters.period} em ${filters.city}:
- Se for gastronomia + noite + econômico: inclua pizzarias, lanchonetes gourmet, bares com petiscos
- Se for casual + dia + moderado: inclua cafés especiais, bistrôs, rooftops com almoço
- Se for cultura + qualquer período: inclua museus, teatros, centros culturais, livrarias-café

LEMBRE-SE: Preciso de 5 lugares DIFERENTES, todos dentro do orçamento ${budgetMap[filters.budget as keyof typeof budgetMap]} e que funcionem ${periodMap[filters.period as keyof typeof periodMap]}.
  `.trim();
}

// Serviço para OpenAI
async function getOpenAISuggestions(filters: DateFilters, apiKey: string): Promise<Place[]> {
  try {
    const response = await axios.post(
      `${API_CONFIGS.openai.baseURL}/chat/completions`,
      {
        model: API_CONFIGS.openai.model,
        messages: [
          {
            role: 'system',
            content: `Você é um especialista local em ${filters.city} que conhece todos os estabelecimentos da cidade. Sempre forneça exatamente 5 sugestões diferentes e reais.`
          },
          {
            role: 'user',
            content: createPrompt(filters)
          }
        ],
        max_tokens: 3000,
        temperature: 0.9
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    console.log('Resposta OpenAI:', content);
    
    // Tentar extrair JSON da resposta
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Tentar encontrar apenas o array de places
      jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const places = JSON.parse(jsonMatch[0]);
        return places.map((place: any, index: number) => ({
          ...place,
          id: place.id || (index + 1).toString(),
          budget: filters.budget,
          type: filters.type,
          period: filters.period
        }));
      }
      throw new Error('Resposta da IA não contém JSON válido');
    }

    const result = JSON.parse(jsonMatch[0]);
    const places = result.places || result;
    
    // Garantir que temos pelo menos algumas sugestões
    if (!Array.isArray(places) || places.length === 0) {
      throw new Error('Nenhuma sugestão encontrada na resposta');
    }

    return places.map((place: any, index: number) => ({
      ...place,
      id: place.id || (index + 1).toString(),
      budget: filters.budget,
      type: filters.type,
      period: filters.period,
      imageUrl: place.imageUrl || ''
    }));
    
  } catch (error) {
    console.error('Erro ao buscar sugestões da OpenAI:', error);
    throw new Error(`Erro ao conectar com a OpenAI: ${error}`);
  }
}

// Serviço para Gemini
async function getGeminiSuggestions(filters: DateFilters, apiKey: string): Promise<Place[]> {
  try {
    const response = await axios.post(
      `${API_CONFIGS.gemini.baseURL}/models/${API_CONFIGS.gemini.model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: createPrompt(filters)
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 3000,
          topP: 0.95,
          topK: 40
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.candidates[0].content.parts[0].text;
    console.log('Resposta Gemini:', content);
    
    // Tentar extrair JSON da resposta
    let jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      // Tentar encontrar apenas o array de places
      jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const places = JSON.parse(jsonMatch[0]);
        return places.map((place: any, index: number) => ({
          ...place,
          id: place.id || (index + 1).toString(),
          budget: filters.budget,
          type: filters.type,
          period: filters.period
        }));
      }
      throw new Error('Resposta da IA não contém JSON válido');
    }

    const result = JSON.parse(jsonMatch[0]);
    const places = result.places || result;
    
    // Garantir que temos pelo menos algumas sugestões
    if (!Array.isArray(places) || places.length === 0) {
      throw new Error('Nenhuma sugestão encontrada na resposta');
    }

    return places.map((place: any, index: number) => ({
      ...place,
      id: place.id || (index + 1).toString(),
      budget: filters.budget,
      type: filters.type,
      period: filters.period,
      imageUrl: place.imageUrl || ''
    }));
    
  } catch (error) {
    console.error('Erro ao buscar sugestões do Gemini:', error);
    throw new Error(`Erro ao conectar com o Gemini: ${error}`);
  }
}

// Função principal para buscar sugestões
export async function getAISuggestions(
  filters: DateFilters,
  config: AIConfig
): Promise<Place[]> {
  try {
    switch (config.provider) {
      case 'openai':
        const openaiKey = getAPIKey('openai');
        if (!openaiKey) {
          throw new Error('API Key da OpenAI não configurada');
        }
        return await getOpenAISuggestions(filters, openaiKey);

      case 'gemini':
        const geminiKey = getAPIKey('gemini');
        if (!geminiKey) {
          throw new Error('API Key do Gemini não configurada');
        }
        return await getGeminiSuggestions(filters, geminiKey);

      case 'local':
        // Fallback para dados locais existentes
        const { getFilteredPlaces } = await import('../data/mockPlaces');
        return getFilteredPlaces(filters);

      default:
        throw new Error('Provedor de IA não suportado');
    }
  } catch (error) {
    console.error('Erro no serviço de IA:', error);
    // Em caso de erro, retorna dados locais como fallback
    const { getFilteredPlaces } = await import('../data/mockPlaces');
    return getFilteredPlaces(filters);
  }
}

// Função para obter provedores disponíveis
export function getAvailableProviders(): Array<{provider: 'openai' | 'gemini' | 'local', name: string, available: boolean}> {
  return [
    {
      provider: 'local',
      name: 'Dados Locais',
      available: true
    },
    {
      provider: 'gemini',
      name: 'Google Gemini',
      available: isAIAvailable('gemini')
    },
    {
      provider: 'openai',
      name: 'OpenAI GPT-3.5',
      available: isAIAvailable('openai')
    }
  ];
}
