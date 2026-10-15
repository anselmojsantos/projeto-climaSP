================================================================================
       PROJETO NOAA ENSO - ANÁLISE EXPLORATÓRIA DE DADOS DE EL NIÑO
================================================================================

1. OBJETIVO DO PROJETO
--------------------------------------------------------------------------------
Este projeto realiza a coleta, armazenamento e análise exploratória de dados
de temperatura da superfície do mar (SST - Sea Surface Temperature) nas
regiões de monitoramento do fenômeno El Niño/Oscilação Sul (ENSO), conforme
observado pela National Oceanic and Atmospheric Administration (NOAA).


2. FONTE DOS DADOS
--------------------------------------------------------------------------------
Os dados são obtidos da plataforma NOAA (National Oceanic and Atmospheric
Administration), especificamente do Climate Prediction Center (CPC).

Os dados são coletados semanalmente a partir de múltiplas fontes:
  - Boias oceânicas ancoradas (Torres no Pacífico Tropical)
  - Flutuadores autônomos (projeto Argo)
  - Observações de navios
  - Satélites (medições de radiação eletromagnética na superfície oceânica)

O produto SST utilizado é o ERSST (Extended Reconstructed Sea Surface
Temperature), atualmente na versão 6 (ERSST.v6).


3. METODOLOGIA SST (Sea Surface Temperature)
--------------------------------------------------------------------------------
As anomalias de SST são calculadas subtraindo a média climatológica de
30 anos (período base atual: 1991-2020) da temperatura observada:

  Anomalia SST = SST observada - SST climatológica (média 1991-2020)

Para o cálculo das médias regionais:
  - As medições de satélite cobrem áreas de grade de aproximadamente 5x5 km
  - As medições diárias são agregadas em médias mensais por ponto de grade
  - Os dados de diferentes fontes são combinados usando interpolação ótima
    (Optimum Interpolation - OI), preenchendo lacunas com filtros matemáticos
  - A média regional é calculada como a média aritmética de todos os pontos
    de grade dentro dos limites geográficos de cada região Niño

O Índice Oceânico de Niño (ONI - Oceanic Niño Index) é o indicador oficial
do NOAA e usa uma média móvel de 3 meses da anomalia SST na região Niño 3.4.


4. REGIÕES DE MONITORAMENTO
--------------------------------------------------------------------------------
O Pacífico Tropical é dividido em 4 regiões de监测:

  Região        | Latitude       | Longitude          | Descrição
  ------------- | -------------- | ------------------ | -----------------
  Niño 1+2      | 0°–10° Sul     | 90°W–80°W          | Costa do Peru
  Niño 3        | 5°N–5°S        | 150°W–90°W         | Pacífico Leste
  Niño 3.4      | 5°N–5°S        | 170°W–120°W        | Pacífico Centro-Leste (ONI)
  Niño 4        | 5°N–5°S        | 160°Leste–150°W    | Pacífico Centro-Oeste


5. CLASSIFICAÇÃO DO ENSO
--------------------------------------------------------------------------------
  Condição       | Valor ONI (Niño 3.4)
  -------------- | ----------------------
  El Niño        | ≥ +0.5°C (por 5+ meses consecutivos)
  Neutro         | Entre -0.5°C e +0.5°C
  La Niña        | ≤ -0.5°C (por 5+ meses consecutivos)


6. ESTRUTURA DO BANCO DE DADOS
--------------------------------------------------------------------------------
Tabela: noaa_enso_weekly
Banco: PostgreSQL (Render.com)

Colunas:
  - id                : Identificador único do registro
  - observation_date  : Data da observação (semanal)
  - nino12            : Anomalia SST na região Niño 1+2 (°C)
  - nino3             : Anomalia SST na região Niño 3 (°C)
  - nino34            : Anomalia SST na região Niño 3.4 (°C)
  - nino4             : Anomalia SST na região Niño 4 (°C)
  - collected_at      : Data/hora da coleta dos dados


7. ANÁLISE EXPLORATÓRIA REALIZADA
--------------------------------------------------------------------------------

7.1. Visualização Geográfica (Mapa)
  - Regiões Niño 1+2, 3, 3.4 e 4 plotadas em mapa mundial
  - Cada região representada como retângulo colorido com sua anomalia atual
  - Permite visualizar a distribuição espacial das anomalias

7.2. Série Temporal Atemporal (Gráfico de Linha)
  - Dados agrupados por mês (média mensal)
  - Quatro linhas representando cada região Niño
  - Eixo X: tempo | Eixo Y: anomalia SST (°C)
  - Permite identificar tendências de aquecimento/resfriamento ao longo do tempo

7.3. Análise Estatística com Sombreamento (Fill)
  - Média mensal + desvio padrão (σ) como faixa sombreada
  - Média, desvio padrão e variância exibidos na legenda
  - Indica a dispersão/variabilidade dos dados em cada região
  - Interpretação: faixa mais larga = maior variabilidade

7.4. Análise de Porcentagem (Aquecimento vs Resfriamento)
  - Calcula proporção de semanas com anomalia positiva (aquecimento)
  - Calcula proporção de semanas com anomalia negativa (resfriamento)
  - As porcentagens representam a FREQUÊNCIA de ocorrências, não os valores
    de temperatura. Por isso ambas são expressas como números positivos.
  - Valores faltantes (não somam 100%) correspondem a observações neutras
    (anomalia == 0), ou seja, temperatura exatamente na média climatológica

  NOTA SOBRE AS PORCENTAGENS:
  As porcentagens de aquecimento e resfriamento são ambas positivas porque
  representam CONTAGENS/PROPORÇÕES de ocorrências. Exemplo:

    Niño 3.4: 57.6% aquecimento | 42.4% resfriamento

  Isso significa que 57.6% das semanas tiveram anomalia > 0 (acima da média)
  e 42.4% tiveram anomalia < 0 (abaixo da média). São duas categorias
  distintas, ambas expressas como proporção positiva do total.

  Quando as porcentagens NÃO somam 100%:
    - A diferença corresponde a semanas com anomalia EXATAMENTE igual a 0
    - Isso ocorre quando a temperatura observada é idêntica à média
      climatológica de 30 anos
    - Exemplo: Niño 3 com 57.6% + 39.4% = 97% → 3% eram neutros (== 0)


8. TECNOLOGIAS UTILIZADAS
--------------------------------------------------------------------------------
  - Python 3.14
  - Pandas (manipulação de dados)
  - SQLAlchemy (conexão com banco PostgreSQL)
  - Plotly (visualizações interativas)
  - psycopg2 (driver PostgreSQL)
  - Jupyter Notebook / VS Code


9. PRÓXIMOS PASSOS SUGERIDOS
--------------------------------------------------------------------------------

  a) Cálculo do ONI (Oceanic Niño Index):
     - Implementar média móvel de 3 meses na região Niño 3.4
     - Classificar automaticamente períodos El Niño / La Niña / Neutro

  b) Análise de Correlação:
     - Verificar correlação entre regiões Niño (ex: Niño 3 vs Niño 3.4)
     - Identificar se anomalias se propagam de leste para oeste

  c) Forecasting / Previsão:
     - Modelos de séries temporais (ARIMA, SARIMA)
     - Machine Learning (LSTM, Random Forest) para prever anomalias futuras
     - Usar dados históricos para treinar modelo preditivo

  d) Dashboard Interativo:
     - Painel web com filtros por período, região e métricas
     - Atualização automática com dados em tempo real da NOAA

  e) Análise de Impactos:
     - Cruzar dados ENSO com variáveis climáticas (precipitação, temperatura
       terrestre, produtividade agrícola no Brasil)

  f) Alertas Automáticos:
     - Sistema de notificação quando ONI ultrapassar limiares de El Niño/La Niña

================================================================================
opencode -s ses_fc4ffa85effeMA0bSf2ZmL2dss