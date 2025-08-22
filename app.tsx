import { useState } from 'react';
import { FilterSection } from './components/FilterSection';
import { PlaceCard } from './components/PlaceCard';
import { getFilteredPlaces, getRandomPlace, Place } from './data/mockPlaces';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Heart, MapPin } from 'lucide-react';

export default function App() {
  const [filters, setFilters] = useState({
    budget: '',
    type: '',
    period: ''
  });
  
  const [currentPlace, setCurrentPlace] = useState<Place | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSurprise = async () => {
    setIsLoading(true);
    
    try {
      // Usar apenas dados locais
      const filteredPlaces = getFilteredPlaces(filters);
      
      if (filteredPlaces.length === 0) {
        toast.error('Ops! Não encontramos lugares com esses filtros. Tente outras opções.');
        setIsLoading(false);
        return;
      }

      // Get random place
      const randomPlace = getRandomPlace(filteredPlaces);
      
      if (!randomPlace) {
        toast.error('Erro ao sortear um lugar. Tente novamente!');
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
      
      toast.success('✨ Surpresa preparada! Que tal essa sugestão?');
      
    } catch (error) {
      console.error('Error in handleSurprise:', error);
      toast.error('Ops! Algo deu errado. Tente novamente.');
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
          <Heart className="h-8 w-8 text-purple-500" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
          Descubra lugares incríveis na sua cidade! Sem indecisão, sem rotina - apenas experiências especiais esperando por vocês.
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

          {/* Instructions */}
          {!currentPlace && (
            <div className="max-w-2xl mx-auto text-center space-y-4 mt-12">
              <h3 className="text-xl font-semibold text-muted-foreground">Como funciona?</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                <div className="space-y-2">
                  <div className="text-2xl">🎯</div>
                  <p><strong>1. Filtre</strong><br />Escolha orçamento, tipo e período</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">✨</div>
                  <p><strong>2. Surpreenda-se</strong><br />Receba uma sugestão aleatória</p>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl">❤️</div>
                  <p><strong>3. Aproveitem</strong><br />Criem memórias especiais</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 px-4 mt-16">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground mb-2">
            ✨ Roteiro Surpresa
          </p>
          <p className="text-xs text-muted-foreground">
            Criado para casais que querem descobrir novos lugares e criar memórias especiais juntos.
          </p>
        </div>
      </footer>
    </div>
  );
}