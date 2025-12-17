import { useState } from 'react';
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { MapPin, ExternalLink, Star, Clock, DollarSign, Heart, Sparkles, Navigation, Car, Accessibility } from "lucide-react";

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
  specialTip?: string;
  aiRecommended?: boolean;
  temEstacionamento?: boolean;
  acessivel?: boolean;
}

interface PlaceCardProps {
  place: Place;
  onNewSuggestion: () => void;
}

const budgetLabels = {
  '$': 'Econômico',
  '$$': 'Moderado',
  '$$$': 'Premium'
};

const budgetColors = {
  '$': 'from-green-400 to-emerald-500',
  '$$': 'from-blue-400 to-indigo-500',
  '$$$': 'from-purple-400 to-pink-500'
};

const typeLabels = {
  'gastronomia': 'Gastronomia',
  'cultura': 'Cultura',
  'ao-ar-livre': 'Natureza',
  'aventura': 'Aventura',
  'casual': 'Casual'
};

const typeColors: Record<string, string> = {
  'gastronomia': 'from-orange-400 to-red-500',
  'cultura': 'from-purple-400 to-indigo-500',
  'ao-ar-livre': 'from-green-400 to-teal-500',
  'aventura': 'from-yellow-400 to-orange-500',
  'casual': 'from-pink-400 to-rose-500',
};

const typeEmojis: Record<string, string> = {
  'gastronomia': '🍽️',
  'cultura': '🎭',
  'ao-ar-livre': '🌳',
  'aventura': '⚡',
  'casual': '☕',
};

export function PlaceCard({ place, onNewSuggestion }: PlaceCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleMapClick = () => {
    window.open(place.mapUrl, '_blank');
  };

  const getGradient = (type: string) => {
    return typeColors[type] || typeColors['gastronomia'];
  };

  const getEmoji = (type: string) => {
    return typeEmojis[type] || '🍽️';
  };

  return (
    <Card
      className="w-full max-w-2xl mx-auto overflow-hidden card-romantic transition-all duration-500"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      {place.imageUrl && !imageError ? (
        <div className="relative h-72 w-full overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.imageUrl}
            alt={place.name}
            className={`w-full h-full object-cover transition-transform duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            onError={() => setImageError(true)}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          {/* AI Recommended Badge */}
          {place.aiRecommended && (
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg animate-pulse-glow">
              <Sparkles className="h-3 w-3" />
              Recomendado pela IA
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className={`bg-gradient-to-r ${budgetColors[place.budget as keyof typeof budgetColors] || 'from-gray-400 to-gray-500'} text-white border-0 shadow-lg`}>
              {budgetLabels[place.budget as keyof typeof budgetLabels]}
            </Badge>
            <Badge className={`bg-gradient-to-r ${getGradient(place.type)} text-white border-0 shadow-lg`}>
              {getEmoji(place.type)} {typeLabels[place.type as keyof typeof typeLabels]}
            </Badge>
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-3 py-2 rounded-xl">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{place.rating.toFixed(1)}</span>
          </div>

          {/* Accessibility badges */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {place.temEstacionamento && (
              <div className="bg-green-500/80 backdrop-blur-sm text-white p-2 rounded-xl" title="Tem estacionamento">
                <Car className="h-4 w-4" />
              </div>
            )}
            {place.acessivel && (
              <div className="bg-blue-500/80 backdrop-blur-sm text-white p-2 rounded-xl" title="Acessível">
                <Accessibility className="h-4 w-4" />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className={`relative h-72 w-full bg-gradient-to-br ${getGradient(place.type)} flex items-center justify-center overflow-hidden`}>
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div>

          <div className="text-center text-white relative z-10">
            <div className="text-7xl mb-4 animate-float">
              {getEmoji(place.type)}
            </div>
            <p className="text-xl font-bold opacity-95 px-4">{place.name}</p>
          </div>

          {/* Badges */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 shadow-lg">
              {budgetLabels[place.budget as keyof typeof budgetLabels]}
            </Badge>
            <Badge className="bg-white/20 backdrop-blur-md text-white border-white/30 shadow-lg">
              {typeLabels[place.type as keyof typeof typeLabels]}
            </Badge>
          </div>

          {/* Rating */}
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-white/20 backdrop-blur-md text-white px-3 py-2 rounded-xl">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="font-bold">{place.rating.toFixed(1)}</span>
          </div>
        </div>
      )}

      {/* Content Section */}
      <CardContent className="p-6 space-y-5">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2 flex items-center gap-2">
            {place.name}
            <Heart className="h-5 w-5 text-pink-500 animate-heart-beat" />
          </h2>
          <p className="text-gray-600 leading-relaxed">{place.description}</p>
        </div>

        {/* Info rows */}
        <div className="space-y-3">
          <div className="flex items-start gap-3 text-sm">
            <div className="p-2 bg-pink-100 rounded-lg">
              <MapPin className="h-4 w-4 text-pink-600" />
            </div>
            <span className="text-gray-700 pt-1">{place.address}</span>
          </div>

          {place.openingHours && (
            <div className="flex items-start gap-3 text-sm">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-4 w-4 text-orange-600" />
              </div>
              <span className="text-gray-700 pt-1">{place.openingHours}</span>
            </div>
          )}

          <div className="flex items-start gap-3 text-sm">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <span className="text-gray-700 pt-1">
              {budgetLabels[place.budget as keyof typeof budgetLabels]}
            </span>
          </div>
        </div>

        {/* Tags */}
        {place.tags.length > 0 && (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {place.tags.map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Suggested Activity */}
        {place.suggestedActivity && (
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-5 rounded-2xl border border-pink-100">
            <h4 className="font-bold text-pink-700 mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Dica Romântica
            </h4>
            <p className="text-sm text-gray-700 leading-relaxed">{place.suggestedActivity}</p>
          </div>
        )}

        {/* Special Tip */}
        {place.specialTip && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-2xl border border-yellow-200">
            <h4 className="font-bold text-orange-700 mb-1 flex items-center gap-2">
              💡 Dica Especial
            </h4>
            <p className="text-sm text-gray-700">{place.specialTip}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleMapClick}
            variant="outline"
            className="flex-1 h-12 rounded-2xl border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-all"
          >
            <Navigation className="h-4 w-4 mr-2 text-purple-600" />
            <span className="text-purple-700 font-medium">Ver no Mapa</span>
          </Button>
          <Button
            onClick={onNewSuggestion}
            className="flex-1 h-12 rounded-2xl btn-romantic text-white font-medium"
          >
            <Heart className="h-4 w-4 mr-2" />
            Nova Sugestão
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}