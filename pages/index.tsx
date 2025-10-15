import { useState, useEffect } from 'react';
import { FilterSection } from '../components/FilterSection';
import { PlaceCard } from '../components/PlaceCard';
import { Place, getFilteredPlaces, getRandomPlace } from '../data/mockPlaces';
import { PlacesService } from '../services/placeService';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Heart, Sparkles, MapPin, AlertTriangle } from 'lucide-react';
import { searchPexelsPhotos } from '../utils/pexels';
import { getCachedImage } from '../utils/smartImageSearch';

export default function App() {
  const [filters, setFilters] = useState({
    budget: '',
    type: '',
    period: ''
  });
  
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationRequested, setLocationRequested] = useState(false);
  const [locationDenied, setLocationDenied] = useState(false);
  const [useFallbackMode, setUseFallbackMode] = useState(false);
  const [allPlaces, setAllPlaces] = useState<Place[]>([]);
  const [currentPlaceIndex, setCurrentPlaceIndex] = useState(0);
  const [imagesByType, setImagesByType] = useState<Record<string, string>>({
    'gastronomia': '',
    'cultura': '',
    'ao-ar-livre': '',
    'aventura': '',
    'casual': '',
  });

  // Pré-carregar as imagens do Pexels quando o componente montar
  useEffect(() => {
    const loadImages = async () => {
      const searchQueries: Record<string, string> = {
        'gastronomia': 'restaurant food elegant dinner',
        'cultura': 'museum art gallery culture',
        'ao-ar-livre': 'nature outdoor landscape forest',
        'aventura': 'adventure water park fun activities',
        'casual': 'coffee cafe cozy place',
      };

      const loadedImages: Record<string, string> = {};

      for (const [type, query] of Object.entries(searchQueries)) {
        try {
          const photo = await searchPexelsPhotos(query);
          loadedImages[type] = photo?.src.large || '/images/fallback-placeholder.jpg';
        } catch (error) {
          console.error(`Erro ao carregar imagem para ${type}:`, error);
          loadedImages[type] = '/images/fallback-placeholder.jpg';
        }
      }

      setImagesByType(loadedImages);
    };

    loadImages();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getImageForType = (type: string): string => {
    // Retorna a imagem pré-carregada do Pexels ou fallback
    return imagesByType[type] || imagesByType['gastronomia'] || '/images/fallback-placeholder.jpg';
  };

  const getImageForPlace = async (placeName: string, type: string, tags?: string[]): Promise<string> => {
    try {
      // Usa a função de busca inteligente com cache
      const imageUrl = await getCachedImage({
        name: placeName,
        type: type,
        tags: tags
      });
      
      return imageUrl;
    } catch (error) {
      console.error(`Erro ao buscar imagem para ${placeName}:`, error);
      return getImageForType(type);
    }
  };

  const requestLocation = async () => {
    if (userLocation) return userLocation;
    
    setLocationRequested(true);
    setLocationDenied(false);
    
    try {
      const location = await PlacesService.getCurrentLocation();
      setUserLocation(location);
      setLocationDenied(false);
      toast.success('Localização obtida com sucesso!', {
        description: 'Agora podemos buscar os melhores lugares próximos a você.',
        icon: '📍'
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationRequested(false); // Reset so user can try again
      
      if (error instanceof Error && 'type' in error && (error as {type: string}).type === 'PERMISSION_DENIED') {
        setLocationDenied(true);
        toast.error('Permissão negada', {
          description: 'Você pode usar o modo demonstração para explorar lugares exemplo.',
          icon: '🚫'
        });
      } else {
        toast.error('Erro ao obter localização', {
          description: error instanceof Error ? error.message : 'Tente novamente mais tarde.',
          icon: '⚠️'
        });
      }
      return null;
    }
  };

  const handleUseFallbackMode = () => {
    setUseFallbackMode(true);
    toast.info('Modo demonstração ativado', {
      description: 'Usando lugares exemplo para você explorar o sistema.',
      icon: '🎭'
    });
  };

  const handleSurprise = async () => {
  setIsLoading(true);
  
  try {
    // Check if all filters are selected
    if (!filters.budget || !filters.type || !filters.period) {
      toast.error('Selecione todos os filtros', {
        description: 'Configure orçamento, tipo de rolê e período antes de buscar.',
        icon: '⚙️'
      });
      setIsLoading(false);
      return;
    }

    // If using fallback mode, use mock data
    if (useFallbackMode) {
      toast.info('Modo demonstração', {
        description: 'Buscando entre lugares exemplo...',
        icon: '🎲'
      });
      
      const filteredPlaces = getFilteredPlaces(filters);
      
      if (filteredPlaces.length === 0) {
        toast.error('Nenhum lugar encontrado', {
          description: 'Tente outras combinações de filtros.',
          icon: '🔍'
        });
        setIsLoading(false);
        return;
      }

      const randomPlace = getRandomPlace(filteredPlaces);
      
      if (!randomPlace) {
        toast.error('Erro ao sortear', {
          description: 'Não foi possível selecionar um lugar. Tente novamente.',
          icon: '🎲'
        });
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Buscar imagem específica para o lugar usando busca inteligente
      const imageUrl = await getImageForPlace(randomPlace.name, randomPlace.type, randomPlace.tags);
      const placeWithImage = {
        ...randomPlace,
        imageUrl
      };
      
      setCurrentPlace(placeWithImage);
      toast.success('Surpresa preparada!', {
        description: 'Encontramos um lugar especial para vocês (modo demonstração).',
        icon: '✨'
      });
      setIsLoading(false);
      return;
    }

    // Get user location if not available
    let location = userLocation;
    if (!location) {
      const locationToast = toast.loading('Solicitando localização...', {
        description: 'Precisamos saber onde você está para encontrar lugares próximos.',
        icon: '📍'
      });
      
      location = await requestLocation();
      
      toast.dismiss(locationToast);
      
      if (!location) {
        setIsLoading(false);
        return;
      }
    }

    // Show searching message
    const searchToast = toast.loading('Buscando recomendações...', {
      description: 'A IA está analisando os melhores lugares para vocês...',
      icon: '🤖'
    });

    // Search for places using Gemini AI
    const places = await PlacesService.searchPlaces({
      ...filters,
      latitude: location.latitude,
      longitude: location.longitude
    });
    
    // Dismiss search toast
    toast.dismiss(searchToast);
    
    if (!places || places.length === 0) {
      toast.error('Nenhum lugar encontrado', {
        description: 'Não encontramos lugares com esses filtros na sua região. Tente outras opções.',
        icon: '🔍'
      });
      setIsLoading(false);
      return;
    }

    // Simulate some loading time for better UX
    await new Promise(resolve => setTimeout(resolve, 800));

    // Buscar imagens únicas para cada lugar usando busca inteligente
    const placesWithImages = await Promise.all(
      places.map(async (place) => {
        // Se o lugar já tem imagem, usa ela
        if (place.imageUrl && place.imageUrl.trim() !== '') {
          return place;
        }
        
        // Caso contrário, busca uma imagem específica no Pexels com busca inteligente
        const imageUrl = await getImageForPlace(place.name, place.type, place.tags);
        return {
          ...place,
          imageUrl
        };
      })
    );

    // Salvar todos os lugares
    setAllPlaces(placesWithImages);
    setCurrentPlaceIndex(0);
    setCurrentPlace(placesWithImages[0]);

    toast.success('Surpresa preparada!', {
      description: `Gemini encontrou ${placesWithImages.length} lugares especiais para vocês!`,
      icon: '✨',
      duration: 3000
    });
    
  } catch (error) {
    console.error('Error in handleSurprise:', error);
    toast.error('Algo deu errado', {
      description: error instanceof Error ? error.message : 'Tente novamente em alguns instantes.',
      icon: '⚠️'
    });
  } finally {
    setIsLoading(false);
  }
};

  const handleNewSuggestion = () => {
    setCurrentPlace(null);
    setAllPlaces([]);
    setCurrentPlaceIndex(0);
    // Optionally scroll back to filters
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextPlace = () => {
    if (currentPlaceIndex < allPlaces.length - 1) {
      const nextIndex = currentPlaceIndex + 1;
      setCurrentPlaceIndex(nextIndex);
      setCurrentPlace(allPlaces[nextIndex]);
      toast.info(`Lugar ${nextIndex + 1} de ${allPlaces.length}`, {
        icon: '➡️'
      });
    }
  };

  const handlePreviousPlace = () => {
    if (currentPlaceIndex > 0) {
      const prevIndex = currentPlaceIndex - 1;
      setCurrentPlaceIndex(prevIndex);
      setCurrentPlace(allPlaces[prevIndex]);
      toast.info(`Lugar ${prevIndex + 1} de ${allPlaces.length}`, {
        icon: '⬅️'
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="text-center py-8 px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="h-8 w-8 text-pink-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Roteiro Surpresa
          </h1>
          <Sparkles className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Cansou de ir nos mesmos lugares? Nossa IA encontra experiências únicas e autênticas perto de você!
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <div className="space-y-8">
          {/* Filters Section */}
          <FilterSection
            filters={filters}
            onFilterChange={handleFilterChange}
            onSurprise={handleSurprise}
            isLoading={isLoading}
          />

          {/* Result Section */}
          {currentPlace && (
            <div className="animate-in slide-in-from-bottom duration-500 space-y-4">
              {/* Contador de lugares */}
              {allPlaces.length > 1 && (
                <div className="text-center">
                  <span className="inline-block bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium">
                    Lugar {currentPlaceIndex + 1} de {allPlaces.length}
                  </span>
                </div>
              )}

              <PlaceCard
                place={currentPlace}
                onNewSuggestion={handleNewSuggestion}
              />

              {/* Botões de navegação */}
              {allPlaces.length > 1 && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePreviousPlace}
                    disabled={currentPlaceIndex === 0}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    ⬅️ Anterior
                  </button>
                  <button
                    onClick={handleNextPlace}
                    disabled={currentPlaceIndex === allPlaces.length - 1}
                    className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    Próximo ➡️
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Location Status and Instructions */}
          {!currentPlace && (
            <div className="max-w-2xl mx-auto text-center space-y-6 mt-12">
              {/* Location Status */}
              {!userLocation && !useFallbackMode && (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <MapPin className="h-6 w-6 text-blue-500" />
                    <h3 className="text-lg font-semibold text-gray-800">Permita o acesso à localização</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Para encontrar lugares reais próximos a você, precisamos da sua localização. 
                    Seus dados são seguros e não são armazenados.
                  </p>
                  <div className="space-y-3">
                    <button
                      onClick={requestLocation}
                      disabled={locationRequested}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {locationRequested ? 'Aguardando permissão...' : '📍 Permitir Localização'}
                    </button>
                    
                    {locationDenied && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
                        <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="text-sm font-medium">Localização negada</span>
                        </div>
                        <p className="text-sm text-amber-600 mb-3">
                          Sem problemas! Você pode testar o sistema usando nosso modo demonstração com lugares exemplo.
                        </p>
                        <button
                          onClick={handleUseFallbackMode}
                          className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                        >
                          🎲 Usar Modo Demonstração
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {userLocation && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-green-700">
                    <MapPin className="h-5 w-5" />
                    <span className="text-sm font-medium">Localização ativa! Pronto para encontrar lugares próximos.</span>
                  </div>
                </div>
              )}

              {useFallbackMode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-700 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="text-sm font-medium">Modo Demonstração Ativo</span>
                  </div>
                  <p className="text-xs text-blue-600 mb-3">
                    Usando lugares exemplo para demonstrar o funcionamento do sistema.
                  </p>
                  <button
                    onClick={() => {
                      setUseFallbackMode(false);
                      setLocationDenied(false);
                      setLocationRequested(false);
                      toast.info('Modo demonstração desativado', {
                        description: 'Você pode permitir a localização para usar lugares reais.',
                        icon: '📍'
                      });
                    }}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition-colors"
                  >
                    📍 Tentar Localização Real
                  </button>
                </div>
              )}

              {/* Instructions */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-muted-foreground">Como funciona?</h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                  <div className="space-y-2">
                    <div className="text-2xl">📍</div>
                    <p><strong>1. Localização</strong><br />
                      {useFallbackMode 
                        ? 'Usando modo demonstração com exemplos' 
                        : 'Permita acesso para buscarmos lugares próximos a você'
                      }
                    </p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">🎯</div>
                    <p><strong>2. Configure</strong><br />Escolha seu orçamento, tipo de rolê e período</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-2xl">✨</div>
                    <p><strong>3. Descubra</strong><br />
                      {useFallbackMode 
                        ? 'Veja como o sistema funciona com lugares exemplo!'
                        : 'Encontramos lugares reais na sua cidade!'
                      }
                    </p>
                  </div>
                </div>
                
                {useFallbackMode && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-600">
                      💡 <strong>Dica:</strong> No modo demonstração, usamos lugares fictícios para mostrar como o sistema funciona. 
                      Para encontrar lugares reais na sua cidade, permita o acesso à localização.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 mt-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            ✨ Roteiro Surpresa - Agora com I.A
          </p>
          <p className="text-xs text-muted-foreground">
            Sugestões reais da sua cidade. Criado para casais que querem descobrir novos lugares e criar memórias especiais juntos.
          </p>
        </div>
      </footer>
    </div>
  );
}