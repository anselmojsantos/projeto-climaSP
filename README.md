# Projeto NOAA ENSO - Análise e Correlação com Dados Pluviométricos

## 1. Objetivo do Projeto

O projeto tem como objetivo principal coletar, armazenar e analisar dados climáticos do fenômeno El Niño/Oscilação Sul (ENSO) e correlacioná-los com os dados de precipitação (chuva) na cidade de São Paulo.

A hipótese central é investigar a relevância do índice oceânico (com foco especial na região Niño 3.4) sobre o regime de chuvas local, utilizando técnicas de Machine Learning (ML) para identificar se há — e qual é — o grau de relação entre esses eventos globais e as chuvas captadas pelas 66 estações do CEMADEN na capital paulista.

## 2. Fonte dos Dados (NOAA)

Os dados de temperatura da superfície do mar (SST - Sea Surface Temperature) são obtidos da National Oceanic and Atmospheric Administration (NOAA), especificamente do Climate Prediction Center (CPC).

Os dados são coletados semanalmente a partir de múltiplas fontes:
- Boias oceânicas ancoradas (Torres no Pacífico Tropical)
- Flutuadores autônomos (projeto Argo)
- Observações de navios
- Satélites (medições de radiação eletromagnética na superfície oceânica)

O produto SST utilizado é o ERSST (Extended Reconstructed Sea Surface Temperature), atualmente na versão 6 (ERSST.v6).

## 3. Metodologia SST (Sea Surface Temperature)

As anomalias de SST são calculadas subtraindo a média climatológica de 30 anos (período base atual: 1991-2020) da temperatura observada:

```text
Anomalia SST = SST observada - SST climatológica (média 1991-2020)