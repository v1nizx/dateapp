import { useState, useEffect } from 'react';
import { FilterSection } from '../components/FilterSection';
import { PlaceCard } from '../components/PlaceCard';
import { Place, getFilteredPlaces, getRandomPlace } from '../data/mockPlaces';
import { PlacesService } from '../services/placeService';
import { Toaster } from '../components/ui/sonner';
import { toast } from 'sonner';
import { Heart, Sparkles, MapPin, AlertTriangle, Stars } from 'lucide-react';
import { searchPexelsPhotos } from '../utils/pexels';
import { getCachedImage } from '../utils/smartImageSearch';

export default function App() {
  const [filters, setFilters] = useState({
    budget: '',
    type: '',
    period: '',
    ambiente: '',
    distancia: '',
    temEstacionamento: false,
    acessivel: false
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

  const handleFilterChange = (key: string, value: string | boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const getImageForType = (type: string): string => {
    return imagesByType[type] || imagesByType['gastronomia'] || '/images/fallback-placeholder.jpg';
  };

  const getImageForPlace = async (placeName: string, type: string, tags?: string[]): Promise<string> => {
    try {
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
      toast.success('Localização obtida!', {
        description: 'Agora podemos encontrar os melhores lugares próximos.',
        icon: '📍'
      });
      return location;
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationRequested(false);

      if (error instanceof Error && 'type' in error && (error as { type: string }).type === 'PERMISSION_DENIED') {
        setLocationDenied(true);
        toast.error('Permissão negada', {
          description: 'Você pode usar o modo demonstração.',
          icon: '🚫'
        });
      } else {
        toast.error('Erro ao obter localização', {
          description: error instanceof Error ? error.message : 'Tente novamente.',
          icon: '⚠️'
        });
      }
      return null;
    }
  };

  const handleUseFallbackMode = () => {
    setUseFallbackMode(true);
    toast.info('Modo demonstração ativado', {
      description: 'Usando lugares exemplo.',
      icon: '🎭'
    });
  };

  const handleSurprise = async () => {
    setIsLoading(true);

    try {
      if (!filters.budget || !filters.type || !filters.period) {
        toast.error('Selecione todos os filtros', {
          description: 'Configure orçamento, tipo e período.',
          icon: '⚙️'
        });
        setIsLoading(false);
        return;
      }

      if (useFallbackMode) {
        toast.info('Modo demonstração', {
          description: 'Buscando lugares exemplo...',
          icon: '🎲'
        });

        const filteredPlaces = getFilteredPlaces(filters);

        if (filteredPlaces.length === 0) {
          toast.error('Nenhum lugar encontrado', {
            description: 'Tente outras combinações.',
            icon: '🔍'
          });
          setIsLoading(false);
          return;
        }

        const randomPlace = getRandomPlace(filteredPlaces);

        if (!randomPlace) {
          toast.error('Erro ao sortear', {
            description: 'Tente novamente.',
            icon: '🎲'
          });
          setIsLoading(false);
          return;
        }

        await new Promise(resolve => setTimeout(resolve, 1200));

        const imageUrl = await getImageForPlace(randomPlace.name, randomPlace.type, randomPlace.tags);
        const placeWithImage = {
          ...randomPlace,
          imageUrl
        };

        setCurrentPlace(placeWithImage);
        toast.success('Surpresa preparada!', {
          description: 'Um lugar especial (modo demonstração).',
          icon: '✨'
        });
        setIsLoading(false);
        return;
      }

      let location = userLocation;
      if (!location) {
        const locationToast = toast.loading('Solicitando localização...', {
          description: 'Precisamos saber onde você está.',
          icon: '📍'
        });

        location = await requestLocation();

        toast.dismiss(locationToast);

        if (!location) {
          setIsLoading(false);
          return;
        }
      }

      const searchToast = toast.loading('Buscando recomendações...', {
        description: 'A IA está analisando os melhores lugares...',
        icon: '🤖'
      });

      const places = await PlacesService.searchPlaces({
        ...filters,
        latitude: location.latitude,
        longitude: location.longitude
      });

      toast.dismiss(searchToast);

      if (!places || places.length === 0) {
        toast.error('Nenhum lugar encontrado', {
          description: 'Tente outras opções.',
          icon: '🔍'
        });
        setIsLoading(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 800));

      const placesWithImages = await Promise.all(
        places.map(async (place) => {
          if (place.imageUrl && place.imageUrl.trim() !== '') {
            return place;
          }

          const imageUrl = await getImageForPlace(place.name, place.type, place.tags);
          return {
            ...place,
            imageUrl
          };
        })
      );

      setAllPlaces(placesWithImages);
      setCurrentPlaceIndex(0);
      setCurrentPlace(placesWithImages[0]);

      toast.success('Surpresa preparada!', {
        description: `Encontramos ${placesWithImages.length} lugares especiais!`,
        icon: '✨',
        duration: 3000
      });

    } catch (error) {
      console.error('Error in handleSurprise:', error);
      toast.error('Algo deu errado', {
        description: error instanceof Error ? error.message : 'Tente novamente.',
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
    <div className="min-h-screen romantic-gradient-animated">
      <Toaster position="top-center" />

      {/* Floating Hearts Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>💕</div>
        <div className="absolute top-40 right-20 text-3xl opacity-15 animate-float" style={{ animationDelay: '1s' }}>✨</div>
        <div className="absolute bottom-40 left-20 text-2xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>💖</div>
        <div className="absolute top-60 right-40 text-3xl opacity-10 animate-float" style={{ animationDelay: '0.5s' }}>🌟</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>💝</div>
      </div>

      {/* Header */}
      <header className="text-center py-10 px-4 relative z-10">
        <div className="flex items-center justify-center gap-4 mb-4">
          <Heart className="h-10 w-10 text-pink-500 animate-heart-beat" />
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
              Roteiro Surpresa
            </span>
          </h1>
          <Sparkles className="h-10 w-10 text-purple-500 animate-pulse" />
        </div>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          ✨ Descubra experiências <span className="font-semibold text-pink-600">únicas e inesquecíveis</span> perto de você
        </p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8 relative z-10">
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
            <div className="animate-slide-up space-y-4">
              {/* Place counter badge */}
              {allPlaces.length > 1 && (
                <div className="text-center">
                  <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-purple-700 px-5 py-2.5 rounded-full text-sm font-medium shadow-lg border border-purple-100">
                    <Sparkles className="h-4 w-4" />
                    Lugar {currentPlaceIndex + 1} de {allPlaces.length}
                    <Sparkles className="h-4 w-4" />
                  </span>
                </div>
              )}

              <PlaceCard
                place={currentPlace}
                onNewSuggestion={handleNewSuggestion}
              />

              {/* Navigation buttons */}
              {allPlaces.length > 1 && (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={handlePreviousPlace}
                    disabled={currentPlaceIndex === 0}
                    className="px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl font-medium transition-all shadow-lg border border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                  >
                    ⬅️ Anterior
                  </button>
                  <button
                    onClick={handleNextPlace}
                    disabled={currentPlaceIndex === allPlaces.length - 1}
                    className="px-6 py-3 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 rounded-2xl font-medium transition-all shadow-lg border border-purple-100 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
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
                <div className="glass rounded-3xl p-8 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 bg-blue-100 rounded-2xl">
                      <MapPin className="h-7 w-7 text-blue-600" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">Permita o acesso à localização</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Para encontrar lugares incríveis próximos a você
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={requestLocation}
                      disabled={locationRequested}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-2xl transition-all font-medium disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                    >
                      {locationRequested ? 'Aguardando...' : '📍 Permitir Localização'}
                    </button>

                    {locationDenied && (
                      <div className="bg-amber-50/80 backdrop-blur-sm border border-amber-200 rounded-2xl p-5 mt-4">
                        <div className="flex items-center justify-center gap-2 text-amber-700 mb-3">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-medium">Localização negada</span>
                        </div>
                        <p className="text-sm text-amber-600 mb-4">
                          Sem problemas! Teste o sistema com lugares exemplo.
                        </p>
                        <button
                          onClick={handleUseFallbackMode}
                          className="w-full bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 text-white px-4 py-2.5 rounded-xl text-sm transition-all font-medium shadow-md hover:shadow-lg"
                        >
                          🎲 Usar Modo Demonstração
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {userLocation && (
                <div className="glass rounded-2xl p-5 border border-green-200 animate-fade-in">
                  <div className="flex items-center justify-center gap-3 text-green-700">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-medium">Localização ativa!</span>
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              )}

              {useFallbackMode && (
                <div className="glass rounded-2xl p-5 border border-purple-200 animate-fade-in">
                  <div className="flex items-center justify-center gap-2 text-purple-700 mb-2">
                    <Sparkles className="h-5 w-5" />
                    <span className="font-medium">Modo Demonstração</span>
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-xs text-purple-600 mb-3">
                    Explorando lugares exemplo
                  </p>
                  <button
                    onClick={() => {
                      setUseFallbackMode(false);
                      setLocationDenied(false);
                      setLocationRequested(false);
                      toast.info('Modo demonstração desativado');
                    }}
                    className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-colors"
                  >
                    📍 Tentar Localização Real
                  </button>
                </div>
              )}

              {/* How it works */}
              <div className="space-y-6 mt-8">
                <h3 className="text-xl font-bold text-gray-700">Como funciona?</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      icon: '📍',
                      title: 'Localização',
                      desc: useFallbackMode ? 'Modo demo ativo' : 'Permita acesso'
                    },
                    {
                      icon: '🎯',
                      title: 'Configure',
                      desc: 'Escolha suas preferências'
                    },
                    {
                      icon: '✨',
                      title: 'Descubra',
                      desc: 'Lugares incríveis!'
                    }
                  ].map((step, i) => (
                    <div key={i} className="glass rounded-2xl p-5 transition-all hover:scale-105">
                      <div className="text-3xl mb-3">{step.icon}</div>
                      <h4 className="font-bold text-gray-800 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-10 px-4 mt-16 relative z-10">
        <div className="max-w-2xl mx-auto glass rounded-3xl p-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Heart className="h-5 w-5 text-pink-500" />
            <span className="font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Roteiro Surpresa
            </span>
            <Heart className="h-5 w-5 text-pink-500" />
          </div>
          <p className="text-sm text-gray-600">
            Criando memórias inesquecíveis para casais ✨
          </p>
        </div>
      </footer>
    </div>
  );
}