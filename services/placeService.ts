import { projectId, publicAnonKey } from '../utils/info'
import { Place } from '../data/mockPlaces'

export interface PlaceFilters {
  budget: string
  type: string
  period: string
  latitude: number
  longitude: number
}

export class PlacesService {
  private static readonly API_BASE_URL = `https://${projectId}.supabase.co/functions/v1`

  // Função principal - APENAS GEMINI
  static async searchPlaces(filters: PlaceFilters): Promise<Place[]> {
    try {
      console.log('🤖 Buscando recomendações com Gemini AI...', filters)

      const response = await fetch(`${this.API_BASE_URL}/gemini-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(filters)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Erro na resposta:', errorData)
        throw new Error(`HTTP ${response.status}: ${errorData.error || 'Erro desconhecido'}`)
      }

      const data = await response.json()
      console.log(`✨ Gemini encontrou ${data.places?.length || 0} lugares`)

      return data.places || []
    } catch (error) {
      console.error('❌ Erro ao buscar recomendações:', error)
      throw error
    }
  }

  static async getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada neste navegador'))
        return
      }

      const options = {
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          })
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização'
          let errorType = 'UNKNOWN'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'PERMISSION_DENIED'
              errorType = 'PERMISSION_DENIED'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível. Verifique se o GPS está ativado.'
              errorType = 'POSITION_UNAVAILABLE'
              break
            case error.TIMEOUT:
              errorMessage = 'Tempo limite excedido ao obter localização.'
              errorType = 'TIMEOUT'
              break
          }
          
          const customError = new Error(errorMessage) as Error & { type: string }
          customError.type = errorType
          reject(customError)
        },
        options
      )
    })
  }

  static getRandomPlace(places: Place[]): Place | null {
    if (places.length === 0) return null
    const randomIndex = Math.floor(Math.random() * places.length)
    return places[randomIndex]
  }
}
