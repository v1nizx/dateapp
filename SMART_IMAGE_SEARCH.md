# Sistema de Busca Inteligente de Imagens

## 📋 Resumo da Implementação

Este sistema foi criado para resolver o problema de imagens duplicadas, gerando imagens únicas e relevantes para cada lugar usando a API do Pexels com busca inteligente baseada em palavras-chave.

## 🎯 Funcionalidades

### 1. **Busca Inteligente de Imagens** (`smartImageSearch.ts`)
- Analisa o nome do lugar e extrai palavras-chave relevantes
- Mapeia palavras em português para termos em inglês otimizados para busca
- Gera queries otimizadas para o Pexels
- Fornece fallbacks com imagens SVG locais

### 2. **Mapeamento de Palavras-Chave**
O sistema reconhece mais de 40 palavras-chave em português:

**Gastronomia:**
- feira, restaurante, bar, café, pizzaria, sushi, hamburguer, sorvete, etc.

**Aventura:**
- parque, kart, diversão, tirolesa, escalada, radical, etc.

**Cultura:**
- museu, teatro, cinema, galeria, arte, artesanato, etc.

**Ao Ar Livre:**
- praia, lagoa, trilha, natureza, jardim, ciclovia, cachoeira, etc.

**Casual:**
- karaoke, boteco, casa, feirinha, etc.

### 3. **Imagens Fallback**
Imagens SVG bonitas e gradientes para cada categoria:
- 🍽️ Gastronomia (vermelho/rosa)
- ⚡ Aventura (rosa/roxo)
- 🎭 Cultura (roxo/rosa claro)
- 🌳 Ao Ar Livre (verde)
- ☕ Casual (laranja/amarelo)
- 📍 Placeholder genérico (roxo/violeta)

## 🔧 Como Funciona

### Exemplo 1: "Feira da Praia Grande"
```
Nome: "Feira da Praia Grande"
Tipo: "aventura"

1. Detecta palavra "feira" no nome
2. Extrai keywords: ["market", "food stall", "street market"]
3. Query final: "market food stall street market brazil"
4. Busca no Pexels retorna imagem de feira
```

### Exemplo 2: "Valparaíso Adventure Park"
```
Nome: "Valparaíso Adventure Park"
Tipo: "aventura"

1. Detecta palavra "adventure" no nome
2. Extrai keywords: ["adventure", "activities", "fun"]
3. Query final: "adventure activities fun brazil"
4. Busca no Pexels retorna imagem de parque de aventura
```

### Exemplo 3: "Kart Indoor SLZ"
```
Nome: "Kart Indoor SLZ"
Tipo: "aventura"

1. Detecta palavra "kart" no nome
2. Extrai keywords: ["go kart", "racing", "speed"]
3. Query final: "go kart racing speed brazil"
4. Busca no Pexels retorna imagem de kart
```

## 📝 Funções Disponíveis

### `buildOptimizedQuery(location)`
Constrói uma query otimizada para busca no Pexels.

```typescript
const query = buildOptimizedQuery({
  name: "Pizzaria Bella Napoli",
  type: "gastronomia"
});
// Resultado: "pizza pizzeria italian brazil"
```

### `getLocationImage(location)`
Busca imagem com logs detalhados (para desenvolvimento).

```typescript
const imageUrl = await getLocationImage({
  name: "Museu de Arte Moderna",
  type: "cultura",
  tags: ["arte", "exposição"]
});
// Console: 🔍 Buscando imagem para "Museu de Arte Moderna"
// Console: 📝 Query Pexels: "museum exhibition collection brazil"
// Console: ✅ Imagem encontrada: Modern art museum
```

### `getCachedImage(location)` ⭐ **RECOMENDADO**
Busca imagem com sistema de cache (evita buscas duplicadas).

```typescript
const imageUrl = await getCachedImage({
  name: "Pizzaria Bella Napoli",
  type: "gastronomia"
});
// Primeira chamada: busca no Pexels
// Console: 🔍 Buscando imagem...
// Console: ✅ Imagem encontrada

// Segunda chamada: usa cache
// Console: 💾 Usando cache para "Pizzaria Bella Napoli"
```

### `getImageWithFallback(location)`
Busca imagem de forma silenciosa (para produção).

```typescript
const imageUrl = await getImageWithFallback({
  name: "Praia do Calhau",
  type: "ao-ar-livre"
});
// Retorna URL da imagem ou fallback SVG local
```

### Funções de Gerenciamento de Cache

#### `clearImageCache()`
Limpa todo o cache de imagens.

```typescript
clearImageCache();
// Console: 🗑️ Cache de imagens limpo
```

#### `removeFromCache(location)`
Remove uma imagem específica do cache.

```typescript
const removed = removeFromCache({
  name: "Pizzaria Bella Napoli",
  type: "gastronomia"
});
// Retorna: true se removeu, false se não estava no cache
```

#### `getCacheSize()`
Retorna o número de imagens no cache.

```typescript
const size = getCacheSize();
console.log(`Cache tem ${size} imagens`);
```

#### `isInCache(location)`
Verifica se uma imagem está no cache.

```typescript
const cached = isInCache({
  name: "Pizzaria Bella Napoli",
  type: "gastronomia"
});
// Retorna: true ou false
```

## 🚀 Integração no Projeto

O sistema está integrado em `pages/index.tsx`:

```typescript
// Busca imagens únicas para cada lugar
const placesWithImages = await Promise.all(
  places.map(async (place) => {
    const imageUrl = await getImageForPlace(
      place.name, 
      place.type, 
      place.tags
    );
    return { ...place, imageUrl };
  })
);
```

## ✨ Benefícios

1. **Imagens Únicas**: Cada lugar recebe uma imagem específica baseada no seu nome
2. **Busca Inteligente**: Reconhece contexto em português e traduz para inglês
3. **Performance**: Busca paralela de imagens usando Promise.all
4. **Sistema de Cache** 💾: Evita buscas duplicadas na API do Pexels
5. **Economia de API**: Reduz chamadas desnecessárias ao Pexels
6. **Fallbacks**: Sempre tem uma imagem bonita, mesmo se a API falhar
7. **Logs Detalhados**: Console logs informativos para debugging
8. **Offline-Ready**: Imagens SVG locais como backup

## 🔍 Debugging

Os logs no console mostram:
- 🔍 Início da busca
- 📝 Query enviada ao Pexels
- ✅ Imagem encontrada (com descrição)
- ⚠️ Usando imagem padrão
- ❌ Erros (se houver)

## 📦 Arquivos Criados

- `/utils/smartImageSearch.ts` - Lógica de busca inteligente
- `/public/images/defaults/*.svg` - Imagens fallback (6 arquivos)
- Integração em `/pages/index.tsx`
