import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

interface RecommendationRequest {
  budget: string;
  type: string;
  period: string;
  ambiente?: string;
  distancia?: string;
  temEstacionamento?: boolean;
  acessivel?: boolean;
  latitude: number;
  longitude: number;
}

const BUDGET_DESC: Record<string, string> = {
  '$': 'econômico e acessível (até R$50 por pessoa)',
  '$$': 'preço moderado (R$50-150 por pessoa)',
  '$$$': 'sofisticado e premium (acima de R$150 por pessoa)'
};

const TYPE_DESC: Record<string, string> = {
  'gastronomia': 'gastronomia, incluindo restaurantes, cafés, bares, pizzarias, sushi, hamburguerias',
  'cultura': 'cultura e entretenimento, como museus, teatros, cinemas, galerias de arte, exposições',
  'ao-ar-livre': 'atividades ao ar livre, como parques, praias, trilhas, jardins, mirantes',
  'aventura': 'aventura e atividades radicais, como escalada, tirolesa, paintball, kart, parques de diversão',
  'casual': 'lugares casuais e descontraídos, como cafés, bares tranquilos, lounges, sorveterias'
};

const AMBIENTE_DESC: Record<string, string> = {
  'intimo': 'íntimo e reservado, com iluminação baixa, ambiente romântico',
  'animado': 'animado e movimentado, com música e ambiente descontraído',
  'tranquilo': 'tranquilo e relaxante, ambiente calmo e aconchegante'
};

const DISTANCIA_DESC: Record<string, string> = {
  'perto': 'muito próximo, no máximo 5km de distância',
  'medio': 'distância moderada, entre 5km e 15km',
  'longe': 'mais distante, acima de 15km'
};

async function getGeminiRecommendations(filters: RecommendationRequest) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY não configurada');
  }

  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  });

  const budgetDesc = BUDGET_DESC[filters.budget] || 'variado';
  const typeDesc = TYPE_DESC[filters.type] || 'variado';
  const periodDesc = filters.period === 'dia' ? 'durante o dia' : 'à noite';

  const ambienteDesc = filters.ambiente ? AMBIENTE_DESC[filters.ambiente] : '';
  const distanciaDesc = filters.distancia ? DISTANCIA_DESC[filters.distancia] : '';
  const estacionamentoReq = filters.temEstacionamento ? 'DEVE ter estacionamento' : '';
  const acessivelReq = filters.acessivel ? 'DEVE ser acessível para cadeirantes' : '';

  const prompt = `Você é um especialista em recomendações românticas para casais em São Luís, Maranhão, Brasil.

🎯 MISSÃO: Encontre os 5 MELHORES lugares REAIS em São Luís/MA para um casal:

📍 LOCALIZAÇÃO: Latitude ${filters.latitude}, Longitude ${filters.longitude} - São Luís, MA

💰 ORÇAMENTO: ${budgetDesc}
🎭 TIPO: ${typeDesc}
⏰ PERÍODO: ${periodDesc}
${ambienteDesc ? `🎵 AMBIENTE: ${ambienteDesc}` : ''}
${distanciaDesc ? `📏 DISTÂNCIA: ${distanciaDesc}` : ''}
${estacionamentoReq ? `🅿️ ${estacionamentoReq}` : ''}
${acessivelReq ? `♿ ${acessivelReq}` : ''}

🔍 INSTRUÇÕES:
1. Pesquise lugares REAIS e ATUAIS em São Luís/MA
2. Priorize estabelecimentos com boa reputação
3. Ambiente adequado para casais (romântico)
4. Preços compatíveis com o orçamento
5. Horário de funcionamento adequado (${periodDesc})

📝 PARA CADA LUGAR:
- Nome completo
- Endereço completo (rua, número, bairro)
- Descrição (2-3 frases) - SEM referências numéricas [1], [2]
- Avaliação
- Horário de funcionamento
- Sugestão de atividade romântica
- Dica especial
- Se tem estacionamento (true/false)
- Se é acessível (true/false)

🎨 RETORNE JSON:
{
  "recommendations": [
    {
      "name": "Nome",
      "address": "Endereço",
      "description": "Por que é perfeito",
      "rating": 4.5,
      "openingHours": "Horários",
      "romanticActivity": "Sugestão",
      "specialTip": "Dica",
      "temEstacionamento": true,
      "acessivel": false
    }
  ]
}

IMPORTANTE: Retorne APENAS JSON válido. NÃO inclua [1], [2] nas descrições.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  console.log('Gemini respondeu:', responseText.substring(0, 300));

  let jsonResponse;
  try {
    jsonResponse = JSON.parse(responseText);
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/s);
    if (jsonMatch) {
      jsonResponse = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Gemini não retornou JSON válido');
    }
  }

  if (!jsonResponse.recommendations || !Array.isArray(jsonResponse.recommendations)) {
    throw new Error('Formato de resposta inválido');
  }

  return jsonResponse.recommendations.map((rec: any, idx: number) => {
    const cleanText = (text: string) => (text || '').replace(/\s*\[\d+(,\s*\d+)*\]/g, '').trim();

    return {
      id: `gemini-${Date.now()}-${idx}`,
      name: rec.name || 'Lugar sem nome',
      description: cleanText(rec.description) || 'Descrição não disponível',
      address: rec.address || 'São Luís, MA',
      mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rec.name + ' ' + rec.address + ' São Luís MA')}`,
      budget: filters.budget,
      type: filters.type,
      period: filters.period,
      tags: ['romântico', 'gemini-recomendado'],
      imageUrl: '',
      rating: rec.rating || 0,
      suggestedActivity: cleanText(rec.romanticActivity) || 'Aproveitem juntos',
      openingHours: rec.openingHours || 'Consultar horários',
      specialTip: cleanText(rec.specialTip),
      aiRecommended: true,
      temEstacionamento: rec.temEstacionamento || false,
      acessivel: rec.acessivel || false
    };
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filters: RecommendationRequest = req.body;

    if (!filters.budget || !filters.type || !filters.period || !filters.latitude || !filters.longitude) {
      return res.status(400).json({ error: 'Filtros incompletos' });
    }

    console.log('🤖 Processando recomendações:', {
      budget: filters.budget,
      type: filters.type,
      period: filters.period
    });

    const recommendations = await getGeminiRecommendations(filters);

    return res.status(200).json({
      places: recommendations,
      totalFound: recommendations.length,
      source: 'gemini-vercel'
    });

  } catch (error) {
    console.error('❌ Erro:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}
