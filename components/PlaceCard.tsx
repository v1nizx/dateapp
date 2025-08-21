import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { MapPin, ExternalLink, Star, Clock, DollarSign } from "lucide-react";

interface Place {
  id: string;
  name: string;
  description: string;
  address: string;
  mapUrl: string;
  budget: string;
  type: string;
  period: string;
  tags: string[];
  imageUrl: string;
  rating: number;
  suggestedActivity: string;
  openingHours: string;
}

interface PlaceCardProps {
  place: Place;
  onNewSuggestion: () => void;
}

const budgetLabels = {
  '$': 'Econômico',
  '$$': 'Moderado', 
  '$$$': 'Sofisticado'
};

const typeLabels = {
  'gastronomia': 'Gastronomia',
  'cultura': 'Cultura',
  'ao-ar-livre': 'Ao Ar Livre',
  'aventura': 'Aventura',
  'casual': 'Casual'
};

export function PlaceCard({ place, onNewSuggestion }: PlaceCardProps) {
  const handleMapClick = () => {
    window.open(place.mapUrl, '_blank');
  };

  return (
    <Card className="w-full max-w-2xl mx-auto overflow-hidden">
      <div className="relative">
        <ImageWithFallback
          src={place.imageUrl}
          alt={place.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <Badge className="bg-black/70 text-white">
            {budgetLabels[place.budget as keyof typeof budgetLabels]}
          </Badge>
          <Badge variant="secondary" className="bg-black/70 text-white">
            {typeLabels[place.type as keyof typeof typeLabels]}
          </Badge>
        </div>
        <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/70 text-white px-2 py-1 rounded">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm">{place.rating}</span>
        </div>
      </div>
      
      <CardContent className="p-6 space-y-4">
        <div>
          <h2 className="text-2xl font-bold mb-2">{place.name}</h2>
          <p className="text-muted-foreground">{place.description}</p>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{place.address}</span>
        </div>

        {place.openingHours && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{place.openingHours}</span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <span>Faixa de preço: {budgetLabels[place.budget as keyof typeof budgetLabels]}</span>
        </div>

        {place.tags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags:</label>
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {place.suggestedActivity && (
          <div className="bg-accent/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">💡 Sugestão especial:</h4>
            <p className="text-sm">{place.suggestedActivity}</p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button onClick={handleMapClick} variant="outline" className="flex-1">
            <MapPin className="h-4 w-4 mr-2" />
            Ver no Mapa
          </Button>
          <Button onClick={onNewSuggestion} className="flex-1">
            <ExternalLink className="h-4 w-4 mr-2" />
            Nova Sugestão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}