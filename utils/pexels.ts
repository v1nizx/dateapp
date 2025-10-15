const PEXELS_API_KEY = process.env.NEXT_PUBLIC_PEXELS_API_KEY;

interface PexelsPhoto {
  id: number;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
  };
  photographer: string;
  photographer_url: string;
  alt: string;
}

interface PexelsResponse {
  photos: PexelsPhoto[];
  page: number;
  per_page: number;
  total_results: number;
}

export const searchPexelsPhotos = async (
  query: string,
  perPage: number = 1
): Promise<PexelsPhoto | null> => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perPage}&locale=pt-BR`,
      {
        headers: {
          Authorization: PEXELS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data: PexelsResponse = await response.json();
    
    return data.photos && data.photos.length > 0 ? data.photos[0] : null;
  } catch (error) {
    console.error('Erro ao buscar imagem do Pexels:', error);
    return null;
  }
};

// Para pegar fotos curadas (sem busca específica)
export const getCuratedPhotos = async (perPage: number = 1): Promise<PexelsPhoto | null> => {
  try {
    const response = await fetch(
      `https://api.pexels.com/v1/curated?per_page=${perPage}`,
      {
        headers: {
          Authorization: PEXELS_API_KEY!,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data: PexelsResponse = await response.json();
    
    return data.photos && data.photos.length > 0 ? data.photos[0] : null;
  } catch (error) {
    console.error('Erro ao buscar imagem curada do Pexels:', error);
    return null;
  }
};
