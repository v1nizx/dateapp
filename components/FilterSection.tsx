import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Switch } from "./ui/switch";
import { DollarSign, Clock, MapPin, Sparkles, Heart, Car, Accessibility, Music, TreePine, PartyPopper } from "lucide-react";

interface FilterSectionProps {
  filters: {
    budget: string;
    type: string;
    period: string;
    ambiente: string;
    distancia: string;
    temEstacionamento: boolean;
    acessivel: boolean;
  };
  onFilterChange: (key: string, value: string | boolean) => void;
  onSurprise: () => void;
  isLoading: boolean;
}

const budgetOptions = [
  { value: '$', label: 'Econômico', icon: '💰', description: 'Até R$ 50' },
  { value: '$$', label: 'Moderado', icon: '💎', description: 'R$ 50 - R$ 150' },
  { value: '$$$', label: 'Premium', icon: '👑', description: 'Acima de R$ 150' }
];

const typeOptions = [
  { value: 'gastronomia', label: 'Gastronomia', icon: '🍽️', color: 'from-orange-400 to-red-500' },
  { value: 'cultura', label: 'Cultura', icon: '🎭', color: 'from-purple-400 to-indigo-500' },
  { value: 'ao-ar-livre', label: 'Natureza', icon: '🌳', color: 'from-green-400 to-emerald-500' },
  { value: 'aventura', label: 'Aventura', icon: '⚡', color: 'from-yellow-400 to-orange-500' },
  { value: 'casual', label: 'Casual', icon: '☕', color: 'from-pink-400 to-rose-500' }
];

const periodOptions = [
  { value: 'dia', label: 'Durante o Dia', icon: '☀️', emoji: '🌤️' },
  { value: 'noite', label: 'À Noite', icon: '🌙', emoji: '✨' }
];

const ambienteOptions = [
  { value: 'intimo', label: 'Íntimo', icon: <Heart className="h-4 w-4" />, description: 'Mais reservado' },
  { value: 'animado', label: 'Animado', icon: <PartyPopper className="h-4 w-4" />, description: 'Com movimento' },
  { value: 'tranquilo', label: 'Tranquilo', icon: <TreePine className="h-4 w-4" />, description: 'Relaxante' }
];

const distanciaOptions = [
  { value: 'perto', label: 'Pertinho', description: 'Até 5km', icon: '📍' },
  { value: 'medio', label: 'Médio', description: '5 a 15km', icon: '🚗' },
  { value: 'longe', label: 'Explorar', description: '+15km', icon: '🗺️' }
];

export function FilterSection({ filters, onFilterChange, onSurprise, isLoading }: FilterSectionProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const allFiltersSelected = filters.budget && filters.type && filters.period;

  return (
    <Card className="w-full max-w-2xl mx-auto card-romantic overflow-hidden">
      {/* Header com gradiente */}
      <CardHeader className="text-center relative overflow-hidden pb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-gradient" />
        <CardTitle className="flex items-center justify-center gap-3 relative z-10">
          <Sparkles className="h-6 w-6 text-purple-500 animate-pulse" />
          <span className="bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-xl font-bold">
            Monte seu rolê perfeito
          </span>
          <Sparkles className="h-6 w-6 text-pink-500 animate-pulse" />
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2 relative z-10">
          Personalize cada detalhe da experiência
        </p>
      </CardHeader>

      <CardContent className="space-y-8 p-6">
        {/* Orçamento */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-pink-500" />
            <label className="text-sm font-semibold text-gray-700">Quanto desejam gastar?</label>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {budgetOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange('budget', option.value)}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-300 overflow-hidden
                  ${filters.budget === option.value
                    ? 'border-pink-400 bg-gradient-to-br from-pink-50 to-purple-50 shadow-lg shadow-pink-200/50 scale-[1.02]'
                    : 'border-gray-200 bg-white hover:border-pink-200 hover:shadow-md'
                  }
                `}
              >
                <div className="text-2xl mb-2">{option.icon}</div>
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-muted-foreground">{option.description}</div>
                {filters.budget === option.value && (
                  <div className="absolute top-2 right-2">
                    <Heart className="h-4 w-4 text-pink-500 fill-pink-500 animate-heart-beat" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tipo de Rolê */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-purple-500" />
            <label className="text-sm font-semibold text-gray-700">Que tipo de experiência?</label>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {typeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange('type', option.value)}
                className={`
                  relative p-4 rounded-2xl border-2 transition-all duration-300
                  ${filters.type === option.value
                    ? `border-transparent bg-gradient-to-br ${option.color} text-white shadow-lg scale-[1.02]`
                    : 'border-gray-200 bg-white hover:border-purple-200 hover:shadow-md'
                  }
                `}
              >
                <div className="text-3xl mb-2">{option.icon}</div>
                <div className="font-medium text-sm">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Período */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            <label className="text-sm font-semibold text-gray-700">Quando querem ir?</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onFilterChange('period', option.value)}
                className={`
                  relative p-5 rounded-2xl border-2 transition-all duration-300
                  ${filters.period === option.value
                    ? option.value === 'dia'
                      ? 'border-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50 shadow-lg shadow-yellow-200/50'
                      : 'border-indigo-400 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg shadow-indigo-200/50'
                    : 'border-gray-200 bg-white hover:shadow-md'
                  }
                `}
              >
                <div className="text-4xl mb-2 transition-transform duration-300 hover:scale-110">
                  {option.icon}
                </div>
                <div className="font-medium">{option.label}</div>
                {filters.period === option.value && (
                  <div className="absolute -top-1 -right-1 text-lg animate-bounce">
                    {option.emoji}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Filtros Avançados */}
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full py-3 text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center justify-center gap-2 transition-colors"
        >
          <Sparkles className="h-4 w-4" />
          {showAdvanced ? 'Esconder filtros avançados' : 'Mais opções de filtro'}
          <Sparkles className="h-4 w-4" />
        </button>

        {/* Filtros Avançados */}
        {showAdvanced && (
          <div className="space-y-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-pink-50/50 border border-purple-100 animate-slide-up">
            {/* Ambiente */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Music className="h-4 w-4 text-purple-500" />
                Qual clima vocês preferem?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {ambienteOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange('ambiente', option.value)}
                    className={`
                      p-3 rounded-xl border transition-all duration-200 text-center
                      ${filters.ambiente === option.value
                        ? 'border-purple-400 bg-purple-100 text-purple-700'
                        : 'border-gray-200 bg-white hover:border-purple-200'
                      }
                    `}
                  >
                    <div className="flex justify-center mb-1 text-purple-500">{option.icon}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Distância */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">📍 Distância máxima</label>
              <div className="grid grid-cols-3 gap-2">
                {distanciaOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange('distancia', option.value)}
                    className={`
                      p-3 rounded-xl border transition-all duration-200 text-center
                      ${filters.distancia === option.value
                        ? 'border-blue-400 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white hover:border-blue-200'
                      }
                    `}
                  >
                    <div className="text-lg mb-1">{option.icon}</div>
                    <div className="text-xs font-medium">{option.label}</div>
                    <div className="text-[10px] text-muted-foreground">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Acessibilidade */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700">♿ Facilidades</label>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-green-300 transition-colors">
                  <Switch
                    checked={filters.temEstacionamento}
                    onCheckedChange={(checked) => onFilterChange('temEstacionamento', checked)}
                  />
                  <Car className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Estacionamento</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white cursor-pointer hover:border-green-300 transition-colors">
                  <Switch
                    checked={filters.acessivel}
                    onCheckedChange={(checked) => onFilterChange('acessivel', checked)}
                  />
                  <Accessibility className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">Acessível</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Filtros Ativos */}
        {(filters.budget || filters.type || filters.period) && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">Seus filtros:</label>
            <div className="flex flex-wrap gap-2">
              {filters.budget && (
                <Badge className="bg-pink-100 text-pink-700 hover:bg-pink-200 border-0">
                  {budgetOptions.find(o => o.value === filters.budget)?.label}
                </Badge>
              )}
              {filters.type && (
                <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-0">
                  {typeOptions.find(o => o.value === filters.type)?.icon} {typeOptions.find(o => o.value === filters.type)?.label}
                </Badge>
              )}
              {filters.period && (
                <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-0">
                  {periodOptions.find(o => o.value === filters.period)?.icon} {periodOptions.find(o => o.value === filters.period)?.label}
                </Badge>
              )}
              {filters.ambiente && (
                <Badge className="bg-indigo-100 text-indigo-700 hover:bg-indigo-200 border-0">
                  {ambienteOptions.find(o => o.value === filters.ambiente)?.label}
                </Badge>
              )}
              {filters.distancia && (
                <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-0">
                  {distanciaOptions.find(o => o.value === filters.distancia)?.icon} {distanciaOptions.find(o => o.value === filters.distancia)?.label}
                </Badge>
              )}
              {filters.temEstacionamento && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                  🅿️ Estacionamento
                </Badge>
              )}
              {filters.acessivel && (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-0">
                  ♿ Acessível
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Botão Surpresa */}
        <Button
          onClick={onSurprise}
          disabled={isLoading || !allFiltersSelected}
          className={`
            w-full h-14 text-lg font-semibold rounded-2xl transition-all duration-300
            ${allFiltersSelected
              ? 'btn-romantic text-white'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Preparando surpresa...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 animate-heart-beat" />
              <span>Me Surpreenda!</span>
              <Heart className="h-5 w-5 animate-heart-beat" />
            </div>
          )}
        </Button>

        {!allFiltersSelected && (
          <p className="text-center text-xs text-muted-foreground">
            Selecione orçamento, tipo e período para continuar
          </p>
        )}
      </CardContent>
    </Card>
  );
}