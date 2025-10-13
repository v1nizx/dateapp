import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'

// Initialize Hono app
const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowHeaders: ['*'],
  allowMethods: ['*'],
}))
app.use('*', logger(console.log))

// Types
interface PlaceFilters {
  budget: string
  type: string
  period: string
  latitude: number
  longitude: number
}

interface GooglePlace {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  price_level?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: Array<{
    photo_reference: string
    height: number
    width: number
  }>
  opening_hours?: {
    open_now: boolean
    weekday_text?: string[]
  }
  business_status?: string
}

interface Place {
  id: string
  name: string
  description: string
  address: string
  mapUrl: string
  budget: string
  type: string
  period: string
  tags: string[]
  imageUrl: string
  rating: number
  suggestedActivity: string
  openingHours: string
}

// Helper function to map Google place types to our categories
function mapGoogleTypeToCategory(googleTypes: string[]): string {
  const typeMapping = {
    'restaurant': 'gastronomia',
    'food': 'gastronomia',
    'meal_takeaway': 'gastronomia',
    'bakery': 'gastronomia',
    'cafe': 'gastronomia',
    'museum': 'cultura',
    'art_gallery': 'cultura',
    'movie_theater': 'cultura',
    'library': 'cultura',
    'theater': 'cultura',
    'park': 'ao-ar-livre',
    'campground': 'aventura',
    'tourist_attraction': 'aventura',
    'zoo': 'aventura',
    'amusement_park': 'aventura',
    'bar': 'casual',
    'night_club': 'casual',
    'bowling_alley': 'casual',
    'shopping_mall': 'casual'
  }

  for (const googleType of googleTypes) {
    if (typeMapping[googleType as keyof typeof typeMapping]) {
      return typeMapping[googleType as keyof typeof typeMapping]
    }
  }

  return 'casual' // default
}

// Helper function to map price level to budget
function mapPriceLevelToBudget(priceLevel?: number): string {
  if (!priceLevel) return '$'
  
  switch (priceLevel) {
    case 0:
    case 1:
      return '$'
    case 2:
      return '$$'
    case 3:
    case 4:
      return '$$$'
    default:
      return '$'
  }
}

// Helper function to get search keywords for Google Places
function getSearchKeywords(type: string): string {
  const keywords = {
    'gastronomia': 'restaurant|food|cafe|bakery',
    'cultura': 'museum|art_gallery|movie_theater|library|theater',
    'ao-ar-livre': 'park|tourist_attraction',
    'aventura': 'tourist_attraction|amusement_park|zoo|campground',
    'casual': 'bar|night_club|bowling_alley|shopping_mall'
  }
  return keywords[type as keyof typeof keywords] || 'restaurant'
}

// Helper function to generate suggested activity
function generateSuggestedActivity(place: GooglePlace, category: string): string {
  const activities = {
    'gastronomia': [
      'Experimentem o prato especial da casa e aproveitem o ambiente aconchegante.',
      'Provem as especialidades locais e desfrutem de uma refeição romântica.',
      'Peçam a sobremesa para compartilhar e conversem sobre os sabores únicos.'
    ],
    'cultura': [
      'Façam uma visita contemplativa e discutam as obras que mais chamaram atenção.',
      'Aproveitem para aprender algo novo juntos e trocar impressões.',
      'Participem de alguma atividade interativa se disponível.'
    ],
    'ao-ar-livre': [
      'Caminhem pelos jardins e aproveitem para relaxar ao ar livre.',
      'Levem uma canga e façam um pequeno piquenique no local.',
      'Tirem fotos bonitas e apreciem a natureza juntos.'
    ],
    'aventura': [
      'Vivam essa experiência aventureira e criem memórias especiais.',
      'Desafiem-se juntos e celebrem as conquistas.',
      'Aproveitem a adrenalina e divirtam-se!'
    ],
    'casual': [
      'Relaxem e conversem sobre a vida em um ambiente descontraído.',
      'Experimentem algo diferente e aproveitem o momento juntos.',
      'Divirtam-se sem pressa e criem momentos especiais.'
    ]
  }

  const categoryActivities = activities[category as keyof typeof activities] || activities.casual
  const randomIndex = Math.floor(Math.random() * categoryActivities.length)
  return categoryActivities[randomIndex]
}

// Get Google Place photo URL
function getPlacePhotoUrl(photoReference: string, maxWidth: number = 800): string {
  const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`
}

// Convert Google Place to our Place format
function convertGooglePlaceToPlace(googlePlace: GooglePlace, category: string, budget: string, period: string): Place {
  const imageUrl = googlePlace.photos && googlePlace.photos.length > 0 
    ? getPlacePhotoUrl(googlePlace.photos[0].photo_reference)
    : ''

  const openingHours = googlePlace.opening_hours?.weekday_text 
    ? googlePlace.opening_hours.weekday_text.slice(0, 2).join(' | ')
    : 'Consulte horários no local'

  return {
    id: googlePlace.place_id,
    name: googlePlace.name,
    description: `Descubra este lugar especial na sua cidade. ${googlePlace.rating ? `Avaliado com ${googlePlace.rating} estrelas` : 'Um local único'} que promete uma experiência memorável para vocês dois.`,
    address: googlePlace.vicinity,
    mapUrl: `https://www.google.com/maps/place/?q=place_id:${googlePlace.place_id}`,
    budget,
    type: category,
    period,
    tags: googlePlace.types.slice(0, 3),
    imageUrl,
    rating: googlePlace.rating || 4.0,
    suggestedActivity: generateSuggestedActivity(googlePlace, category),
    openingHours
  }
}

// Search places endpoint
app.post('/make-server-1edd1283/search-places', async (c) => {
  try {
    const { budget, type, period, latitude, longitude } = await c.req.json() as PlaceFilters
    
    const apiKey = Deno.env.get('GOOGLE_PLACES_API_KEY')
    if (!apiKey) {
      console.log('Google Places API key not found')
      return c.json({ error: 'API key não configurada' }, 500)
    }

    if (!latitude || !longitude) {
      console.log('Location coordinates missing')
      return c.json({ error: 'Localização não fornecida' }, 400)
    }

    // Get search keywords based on type
    const keywords = getSearchKeywords(type)
    
    // Determine radius based on location type
    const radius = type === 'aventura' ? 25000 : 10000 // 25km for adventure, 10km for others
    
    console.log(`Searching for places: type=${type}, budget=${budget}, period=${period}, lat=${latitude}, lng=${longitude}`)

    // Search for places using Google Places Nearby Search
    const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
      `location=${latitude},${longitude}&` +
      `radius=${radius}&` +
      `keyword=${encodeURIComponent(keywords)}&` +
      `language=pt-BR&` +
      `key=${apiKey}`

    console.log('Calling Google Places API:', searchUrl.replace(apiKey, '[API_KEY]'))

    const response = await fetch(searchUrl)
    const data = await response.json()

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      console.log('Google Places API error:', data.status, data.error_message)
      return c.json({ error: 'Erro ao buscar lugares', details: data.error_message }, 500)
    }

    if (!data.results || data.results.length === 0) {
      console.log('No places found for the search criteria')
      return c.json({ places: [] })
    }

    console.log(`Found ${data.results.length} places from Google Places API`)

    // Filter and convert places
    const filteredPlaces = data.results
      .filter((place: GooglePlace) => {
        // Filter by business status
        if (place.business_status === 'CLOSED_PERMANENTLY') return false
        
        // Filter by our category mapping
        const placeCategory = mapGoogleTypeToCategory(place.types)
        if (placeCategory !== type) return false
        
        // Filter by budget if price level is available
        if (place.price_level !== undefined) {
          const placeBudget = mapPriceLevelToBudget(place.price_level)
          if (placeBudget !== budget) return false
        }
        
        return true
      })
      .slice(0, 20) // Limit to 20 places
      .map((place: GooglePlace) => convertGooglePlaceToPlace(place, type, budget, period))

    console.log(`Filtered down to ${filteredPlaces.length} places matching criteria`)

    return c.json({ places: filteredPlaces })

  } catch (error) {
    console.log('Error in search-places endpoint:', error)
    return c.json({ error: 'Erro interno do servidor', details: error.message }, 500)
  }
})

// Health check endpoint
app.get('/make-server-1edd1283/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Start server
Deno.serve(app.fetch)