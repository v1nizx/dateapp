// import { GoogleGenAI } from '@google/genai';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // const { budget, category, period, location } = req.body;
  
  // Usar Gemini para gerar prompt inteligente
  // const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // const model = client.models.generateContent({ model: "gemini-2.5-pro" });
  
  // Buscar lugares com Places API (New) + Gemini summaries
  // Filtrar e ranquear com base nos critérios
  // Retornar recomendações personalizadas

  res.status(200).json({ message: 'Not implemented yet' });
}
