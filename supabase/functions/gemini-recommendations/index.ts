import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai@0.24.1'

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')

interface RecommendationRequest {
  budget: string
  type: string
  period: string
  latitude: number
  longitude: number
}

const BUDGET_DESC: Record<string, string> = {
  '$': 'econômico e acessível (até R$50 por pessoa)',
  '$$': 'preço moderado (R$50-150 por pessoa)',
  '$$$': 'sofisticado e premium (acima de R$150 por pessoa)'
}

const TYPE_DESC: Record<string, string> = {
  'gastronomia': 'gastronomia, incluindo restaurantes, cafés, bares, pizzarias, sushi, hamburguerias',
  'cultura': 'cultura e entretenimento, como museus, teatros, cinemas, galerias de arte, exposições',
  'ao-ar-livre': 'atividades ao ar livre, como parques, praias, trilhas, jardins, mirantes',
  'aventura': 'aventura e atividades radicais, como escalada, tirolesa, paintball, kart, parques de diversão',
  'casual': 'lugares casuais e descontraídos, como cafés, bares tranquilos, lounges, sorveterias'
}

async function getGeminiRecommendations(filters: RecommendationRequest): Promise<any[]> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY!)
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    generationConfig: {
      temperature: 0.8,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 8192,
    }
  })
  
  const budgetDesc = BUDGET_DESC[filters.budget] || 'variado'
  const typeDesc = TYPE_DESC[filters.type] || 'variado'
  const periodDesc = filters.period === 'dia' ? 'durante o dia' : 'à noite'
  
  const prompt = `Você é um especialista em recomendações românticas para casais em São Luís, Maranhão, Brasil.

🎯 MISSÃO: Encontre os 5 MELHORES lugares REAIS em São Luís/MA para um casal com as seguintes preferências:

📍 LOCALIZAÇÃO:
- Latitude: ${filters.latitude}
- Longitude: ${filters.longitude}
- Cidade: São Luís, Maranhão, Brasil

💰 ORÇAMENTO: ${budgetDesc}
🎭 TIPO DE EXPERIÊNCIA: ${typeDesc}
⏰ PERÍODO: ${periodDesc}

🔍 INSTRUÇÕES:
1. Pesquise na web lugares REAIS e ATUAIS em São Luís/MA
2. Priorize estabelecimentos com boa reputação e avaliações positivas
3. Ambiente adequado para casais (romântico)
4. Preços compatíveis com o orçamento
5. Horário de funcionamento adequado (${periodDesc})

📝 PARA CADA LUGAR:
- Nome completo do estabelecimento
- Endereço completo (rua, número, bairro)
- Descrição de por que é perfeito (2-3 frases)
- Avaliação (se disponível)
- Horário de funcionamento
- Sugestão de atividade romântica
- Dica especial

🎨 RETORNE JSON NESTE FORMATO:
{
  "recommendations": [
    {
      "name": "Nome do Lugar",
      "address": "Endereço completo",
      "description": "Por que é perfeito",
      "rating": 4.5,
      "openingHours": "Horários",
      "romanticActivity": "Sugestão romântica",
      "specialTip": "Dica especial"
    }
  ]
}

IMPORTANTE: BUSQUE informações REAIS na web. NÃO invente. Retorne APENAS JSON.`

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: [{ googleSearch: {} }]
    })

    const response = result.response
    const responseText = response.text()
    
    console.log('Gemini respondeu:', responseText.substring(0, 300))
    
    let jsonResponse
    try {
      jsonResponse = JSON.parse(responseText)
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/s)
      if (jsonMatch) {
        jsonResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Gemini não retornou JSON válido')
      }
    }
    
    if (!jsonResponse.recommendations || !Array.isArray(jsonResponse.recommendations)) {
      throw new Error('Formato de resposta inválido')
    }
    
    const recommendations = jsonResponse.recommendations.map((rec: any, idx: number) => ({
      id: `gemini-${Date.now()}-${idx}`,
      name: rec.name || 'Lugar sem nome',
      description: rec.description || 'Descrição não disponível',
      address: rec.address || 'São Luís, MA',
      mapUrl: `https://maps.google.com/maps?q=${encodeURIComponent(rec.name + ' ' + rec.address + ' São Luís MA')}`,
      budget: filters.budget,
      type: filters.type,
      period: filters.period,
      tags: ['romântico', 'gemini-recomendado'],
      imageUrl: '',
      rating: rec.rating || 0,
      suggestedActivity: rec.romanticActivity || 'Aproveitem juntos',
      openingHours: rec.openingHours || 'Consultar horários',
      specialTip: rec.specialTip || '',
      aiRecommended: true
    }))
    
    return recommendations
    
  } catch (error) {
    console.error('Erro ao gerar recomendações:', error)
    throw error
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization'
      }
    })
  }
  
  try {
    const filters: RecommendationRequest = await req.json()
    
    if (!filters.budget || !filters.type || !filters.period || !filters.latitude || !filters.longitude) {
      return new Response(
        JSON.stringify({ error: 'Filtros incompletos' }),
        { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      )
    }
    
    console.log('🤖 Processando recomendações...')
    const recommendations = await getGeminiRecommendations(filters)
    
    return new Response(
      JSON.stringify({ 
        places: recommendations,
        totalFound: recommendations.length,
        source: 'gemini-google-search'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
    
  } catch (error) {
    console.error('❌ Erro:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    )
  }
})
