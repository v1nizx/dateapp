import { Place } from '../data/mockPlaces'

export interface PlaceFilters {
  budget: string
  type: string
  period: string
  ambiente?: string
  distancia?: string
  temEstacionamento?: boolean
  acessivel?: boolean
  latitude: number
  longitude: number
}

export class PlacesService {
  // Função principal - usando API Route local (Vercel)
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro na resposta:', errorData)
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`)
      }

      const data = await response.json()

      return data.places || []
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações:', error)
      throw error
    }
  }

  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error = new Error('Geolocalização não é suportada neste navegador');
        Object.assign(error, { type: 'NOT_SUPPORTED' });
        reject(error);
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: false,
        timeout: 30000, // 30 segundos
        maximumAge: 300000 // 5 minutos
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (positionError) => {
          let errorMessage = 'Erro ao obter localização';
          let errorType = 'UNKNOWN';

          switch (positionError.code) {
            case positionError.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              errorType = 'PERMISSION_DENIED';
              break;
            case positionError.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível. Verifique suas configurações.';
              errorType = 'POSITION_UNAVAILABLE';
              break;
            case positionError.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              errorType = 'TIMEOUT';
              break;
          }

          const error = new Error(errorMessage);
          Object.assign(error, { type: errorType });
          reject(error);
        },
        options
      );
    });
  }

  static getRandomPlace(places: Place[]): Place | null {
    if (places.length === 0) return null
    const randomIndex = Math.floor(Math.random() * places.length)
    return places[randomIndex]
  }
}
