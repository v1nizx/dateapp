# Configuração da Google Places API

Para usar o sistema **Roteiro Surpresa** com dados reais do Google Maps, você precisa configurar uma chave da Google Places API.

## Passos para configurar:

### 1. Criar projeto no Google Cloud Console
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou selecione um existente
3. No painel de navegação, vá em "APIs & Services" > "Library"

### 2. Ativar a Places API
1. Pesquise por "Places API"
2. Clique em "Places API" e depois em "Enable"

### 3. Criar credenciais
1. Vá em "APIs & Services" > "Credentials"
2. Clique em "Create Credentials" > "API Key"
3. Copie a chave gerada

### 4. Configurar restrições (Recomendado)
1. Clique na chave criada para editá-la
2. Em "API restrictions", selecione "Restrict key"
3. Escolha "Places API" na lista
4. Salve as alterações

### 5. Adicionar a chave no sistema
1. No Figma Make, a chave da API foi solicitada automaticamente
2. Cole sua chave da Google Places API quando solicitado
3. A chave será armazenada de forma segura no ambiente

## APIs utilizadas:
- **Places Nearby Search**: Para buscar lugares próximos à localização do usuário
- **Places Photos**: Para obter imagens dos lugares encontrados

## Custos:
- A Google Places API tem uma cota gratuita mensal
- Consulte a [página de preços](https://developers.google.com/maps/billing-and-pricing/pricing) para mais detalhes

## Notas importantes:
- A localização do usuário é obtida apenas no navegador e não é armazenada
- Todas as chamadas à API são feitas de forma segura através do backend
- O sistema funciona em qualquer cidade com estabelecimentos cadastrados no Google Maps