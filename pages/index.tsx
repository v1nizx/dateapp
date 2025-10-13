import { useState } from 'react';
import { FilterSection } from '../components/FilterSection';
import { PlaceCard } from '../components/PlaceCard';
import { Place, getFilteredPlaces, getRandomPlace } from '../data/mockPlaces';
import { PlacesService } from '../services/placeService';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Heart, Sparkles, MapPin, AlertTriangle } from 'lucide-react';

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getImageForType = (type: string): string => {
    switch (type) {
      case 'gastronomia':
        return 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTU3ODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
      case 'cultura':
        return 'https://images.unsplash.com/photo-1720614601463-eb37e9e2faa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNldW0lMjB0aGVhdGVyJTIwY3VsdHVyZXxlbnwxfHx8fDE3NTU3ODk4Mjl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
      case 'ao-ar-livre':
        return 'https://images.unsplash.com/photo-1663947735960-a753dc0ac98c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrJTIwbmF0dXJlJTIwb3V0ZG9vcnxlbnwxfHx8fDE3NTU3NTE1MTd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
      case 'aventura':
        return 'https://images.unsplash.com/photo-1753605859456-1096e0f15d26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhZHZlbnR1cmUlMjBoaWtpbmclMjBuYXR1cmV8ZW58MXx8fHwxNzU1Nzg5ODM2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
      case 'casual':
        return 'https://images.unsplash.com/photo-1752440475364-25462d1fe938?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXIlMjBjYWZlJTIwY2FzdWFsfGVufDF8fHx8MTc1NTc4OTgzOXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
      default:
        return 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTU3ODU5NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral';
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
      toast.success('📍 Localização obtida! Agora podemos buscar lugares próximos a você.');
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationRequested(false); // Reset so user can try again
      
      if (error instanceof Error && (error as any).type === 'PERMISSION_DENIED') {
        setLocationDenied(true);
        toast.error('Permissão de localização negada. Você pode usar o modo de demonstração com lugares exemplo.');
      } else {
        toast.error(error instanceof Error ? error.message : 'Erro ao obter localização');
      }
      return null;
    }
  };

  const handleUseFallbackMode = () => {
    setUseFallbackMode(true);
    toast.info('Modo demonstração ativado! Usando lugares exemplo para testar o sistema.');
  };

  const handleSurprise = async () => {
    setIsLoading(true);
    
    try {
      // Check if all filters are selected
      if (!filters.budget || !filters.type || !filters.period) {
        toast.error('Por favor, selecione todas as opções de filtro antes de buscar uma surpresa!');
        setIsLoading(false);
        return;
      }

      // If using fallback mode, use mock data
      if (useFallbackMode) {
        toast.info('🎲 Usando modo demonstração com lugares exemplo...');
        
        // Use mock data
        const filteredPlaces = getFilteredPlaces(filters);
        
        if (filteredPlaces.length === 0) {
          toast.info('🤖 Usando IA para encontrar os melhores lugares para vocês...');
          setIsLoading(false);
          return;
        }

        // Get random place
        const randomPlace = getRandomPlace(filteredPlaces);
        
        if (!randomPlace) {
          toast.error('Erro ao sortear um lugar exemplo. Tente novamente!');
          setIsLoading(false);
          return;
        }

        // Simulate some loading time for better UX
        await new Promise(resolve => setTimeout(resolve, 1200));
        
        // Get appropriate image for the place type
        const imageUrl = getImageForType(randomPlace.type);
        
        // Update place with image
        const placeWithImage = {
          ...randomPlace,
          imageUrl
        };
        
        setCurrentPlace(placeWithImage);
        toast.success('✨ Surpresa preparada! (Modo demonstração com lugar exemplo)');
        setIsLoading(false);
        return;
      }

      // Get user location if not available
      let location = userLocation;
      if (!location) {
        toast.info('📍 Precisamos da sua localização para encontrar lugares próximos...');
        location = await requestLocation();
        
        if (!location) {
          setIsLoading(false);
          return;
        }
      }

      // Show searching message
      toast.info('🔍 Buscando lugares incríveis na sua região...');

     const places = await PlacesService.searchPlaces({
  ...filters,
  latitude: location.latitude,
  longitude: location.longitude
      });

      // Simulate some loading time for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // If no image from Google Places, use fallback
      let finalPlace = randomPlace;
      if (!randomPlace.imageUrl) {
        const fallbackImageUrl = getImageForType(randomPlace.type);
        finalPlace = {
          ...randomPlace,
          imageUrl: fallbackImageUrl
        };
      }
      
      setCurrentPlace(finalPlace);
      toast.success('✨ Surpresa preparada! Que tal essa sugestão real da sua cidade?');
      
    } catch (error) {
      console.error('Error in handleSurprise:', error);
      toast.error('Ops! Algo deu errado ao buscar lugares. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewSuggestion = () => {
    setCurrentPlace(null);
    // Optionally scroll back to filters
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          Descubra lugares reais próximos a você! Conectamos com o Google Maps para sugerir experiências autênticas na sua região.
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
            <div className="animate-in slide-in-from-bottom duration-500">
              <PlaceCard
                place={currentPlace}
                onNewSuggestion={handleNewSuggestion}
              />
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
                      toast.info('Saindo do modo demonstração. Tente permitir a localização novamente.');
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
            ✨ Roteiro Surpresa - Agora com Google Maps
          </p>
          <p className="text-xs text-muted-foreground">
            Sugestões reais da sua cidade. Criado para casais que querem descobrir novos lugares e criar memórias especiais juntos.
          </p>
        </div>
      </footer>
    </div>
  );
}