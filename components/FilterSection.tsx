import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { DollarSign, Clock, MapPin } from "lucide-react";

interface FilterSectionProps {
  filters: {
    budget: string;
    type: string;
    period: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onSurprise: () => void;
  isLoading: boolean;
}

const budgetOptions = [
  { value: '$', label: 'Econômico ($)', description: 'Até R$ 50 por pessoa' },
  { value: '$$', label: 'Moderado ($$)', description: 'R$ 50 - R$ 150 por pessoa' },
  { value: '$$$', label: 'Sofisticado ($$$)', description: 'Acima de R$ 150 por pessoa' }
];

const typeOptions = [
  { value: 'gastronomia', label: 'Gastronomia', icon: '🍽️' },
  { value: 'cultura', label: 'Cultura', icon: '🎭' },
  { value: 'ao-ar-livre', label: 'Ao Ar Livre', icon: '🌳' },
  { value: 'aventura', label: 'Aventura', icon: '⚡' },
  { value: 'casual', label: 'Casual', icon: '☕' }
];

const periodOptions = [
  { value: 'dia', label: 'Dia', icon: '☀️' },
  { value: 'noite', label: 'Noite', icon: '🌙' }
];

export function FilterSection({ filters, onFilterChange, onSurprise, isLoading }: FilterSectionProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <MapPin className="h-6 w-6 text-primary" />
          Configure suas preferências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Orçamento</label>
          </div>
          <Select value={filters.budget} onValueChange={(value) => onFilterChange('budget', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o orçamento" />
            </SelectTrigger>
            <SelectContent>
              {budgetOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span>{option.label}</span>
                    <span className="text-xs text-muted-foreground">{option.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Type Filter */}
        <div className="space-y-3">
          <label className="text-sm font-medium">Tipo de Rolê</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {typeOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.type === option.value ? "default" : "outline"}
                onClick={() => onFilterChange('type', option.value)}
                className="h-auto p-3 flex flex-col gap-1"
              >
                <span className="text-lg">{option.icon}</span>
                <span className="text-xs">{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Period Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <label className="text-sm font-medium">Período</label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {periodOptions.map((option) => (
              <Button
                key={option.value}
                variant={filters.period === option.value ? "default" : "outline"}
                onClick={() => onFilterChange('period', option.value)}
                className="h-auto p-3 flex items-center gap-2"
              >
                <span className="text-lg">{option.icon}</span>
                <span>{option.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Active Filters */}
        {(filters.budget || filters.type || filters.period) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filtros ativos:</label>
            <div className="flex flex-wrap gap-2">
              {filters.budget && (
                <Badge variant="secondary">
                  {budgetOptions.find(o => o.value === filters.budget)?.label}
                </Badge>
              )}
              {filters.type && (
                <Badge variant="secondary">
                  {typeOptions.find(o => o.value === filters.type)?.label}
                </Badge>
              )}
              {filters.period && (
                <Badge variant="secondary">
                  {periodOptions.find(o => o.value === filters.period)?.label}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Surprise Button */}
        <Button 
          onClick={onSurprise}
          disabled={isLoading || !filters.budget || !filters.type || !filters.period}
          className="w-full h-12 text-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {isLoading ? "Preparando surpresa..." : "✨ Me Surpreenda! ✨"}
        </Button>
      </CardContent>
    </Card>
  );
}