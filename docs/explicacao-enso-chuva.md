# O que foi feito — explicação passo a passo

Documento para entender o que o notebook `Notebookes/predição.ipynb` faz, sem jargão.
Os números citados são os que estão salvos no notebook.

---

## 1. A pergunta

> "O Pacífico está esquentando. Isso faz chover mais em São Paulo?"

Para responder, são necessárias duas coisas medidas ao longo do tempo:

1. **o quanto o Pacífico esquentou** em cada mês;
2. **quanto choveu** em São Paulo em cada mês.

Com as duas colunas lado a lado, dá para ver se uma acompanha a outra.

O problema é que só tínhamos 10 meses de chuva (janeiro a outubro de 2026). Dez meses não são suficientes: o Pacífico varia de um jeito e as estações do ano variam de outro, e com tão pouco tempo não dá para separar uma coisa da outra.

---

## 2. As duas réguas

### Régua do Pacífico: o NINO3.4

Existe uma área do Oceano Pacífico, perto da linha do Equador, chamada **Niño 3.4**. Mede-se a temperatura da água ali e compara-se com a média histórica daquele mesmo mês.

- Se a água está **mais quente** que o normal: número positivo (El Niño).
- Se está **mais fria**: número negativo (La Niña).
- Perto de zero: neutro.

Esse número está na tabela `df_hist_roni`, do banco: **921 meses, de 1950 a 2026**. Um número por mês.

### Régua da chuva: os milímetros

Não tínhamos chuva de São Paulo para 66 anos. O INMET demora, o CEMADEN só tem 2013 em diante e com falhas. A saída foi usar o **ERA5-Land**, um conjunto de dados de satélite e modelo meteorológico mantido pelo serviço europeu de clima, disponível de graça pela API Open-Meteo.

Ele não é um pluviômetro: é uma estimativa em células de ~11 km × 11 km. Serve para série longa e para comparar regiões, não para saber a chuva exata de uma rua.

Peguei um ponto no centro de cada uma das cinco zonas de São Paulo (Centro, Leste, Norte, Oeste, Sul) e baixei **1961 a 2026: 790 meses por zona**.

---

## 3. Passo 1 — juntar chuva e Pacífico

Cada linha da tabela final tem:

```text
zona | mês | chuva do mês (mm) | NINO3.4 daquele mês
Sul  | 1997-01 | 310 mm | 2,4
```

Chuva de janeiro de 1997 na zona Sul, com o Pacífico daquele janeiro ao lado. Repetindo isso para todos os meses e zonas, dá **3.945 pares** (5 zonas × 789 meses).

---

## 4. Passo 2 — tirar o efeito das estações do ano

Esse passo é o mais importante e o mais fácil de errar.

Em São Paulo, janeiro é chuvoso e agosto é seco. Isso acontece **todo ano**, com El Niño ou sem. Se eu comparar a chuva de janeiro com a de agosto sem cuidado, vou "descobrir" que chove mais quando está calor — e isso não tem nada a ver com o Pacífico, é só o verão.

A solução:

1. Calcular a **média de cada mês** num período de referência (1991 a 2020). Isso se chama **climatologia**: "quanto costuma chover em janeiro", "quanto costuma chover em agosto".
2. Subtrair essa média da chuva observada. O resultado se chama **anomalia**.

```text
anomalia = chuva do mês - chuva normal daquele mês
```

- Anomalia **positiva**: choveu mais que o normal.
- Anomalia **negativa**: choveu menos.
- Anomalia **zero**: mês típico.

Agora a comparação é justa: janeiro de 1997 é comparado com janeiros, não com agosto.

---

## 5. Passo 3 — ver se andam juntos (correlação)

**Correlação** mede se duas coisas sobem e descem juntas. O resultado vai de -1 a +1:

- **+1**: quando uma sobe, a outra sobe sempre.
- **0**: não há relação.
- **-1**: quando uma sobe, a outra desce sempre.

Resultado com os 789 meses:

| Zona | Correlação |
|---|---|
| Leste | +0,112 |
| Sul | +0,103 |
| Centro | +0,079 |
| Norte | +0,072 |
| Oeste | +0,070 |

São valores **positivos**, ou seja, na direção da hipótese: Pacífico mais quente, um pouco mais de chuva. Mas são valores **baixos**.

Para dar ideia: uma correlação de 0,10 significa que o Pacífico explica cerca de **1%** da variação da chuva. Os outros 99% vêm de frentes frias, calor local, umidade do oceano Atlântico e pura casualidade.

Também testei com atraso: "e se a chuva responder ao Pacífico de 1, 2, 3 meses atrás?". A relação é mais forte **no mesmo mês** e vai enfraquecendo. Não há resposta atrasada.

---

## 6. Passo 4 — o modelo: qual foi, exatamente

Aqui está a resposta direta à sua pergunta: **não usei árvore de decisão nem machine learning no sentido moderno. Usei uma regressão linear.**

### O que é uma regressão linear

É uma conta que transforma graus do Pacífico em milímetros de chuva:

```text
chuva = número fixo + (coeficiente × NINO3.4)
```

O coeficiente diz: **"a cada 1 °C que o Pacífico esquenta, chove X mm a mais"**. É exatamente o formato da sua hipótese — "quanto mais aquece, mais chove" — escrito em forma de equação.

### Por que não usei árvore

Árvore de decisão funciona por cortes: "se NINO3.4 > 1,5, então...". Ela tem dois problemas para esta pergunta:

1. **Não extrapola.** Se ela aprendeu com valores de -2 a +2,4, não consegue dizer nada sobre +3. Ela devolve, no máximo, a média do pedaço mais quente que já viu. E a sua pergunta é justamente sobre aquecimento extremo.
2. **Não dá um número contínuo.** Ela dá faixas, não "X mm por grau".

Existe um meio-termo chamado *model tree* (árvore com regressões nas folhas), mas ele só vale quando há muito dado e a relação muda de regime. Não é o caso.

### O ajuste fino: efeitos fixos

Uma regressão simples de chuva contra NINO3.4 ainda estaria contaminada pela sazonalidade. Então acrescentei duas correções:

- **efeito fixo de mês**: cada mês do ano ganha seu próprio ajuste (janeiro chuvoso, agosto seco);
- **efeito fixo de zona**: cada zona ganha seu próprio ajuste (Sul chove mais que Norte).

Assim o coeficiente do NINO3.4 é estimado **depois** de descontar "este é janeiro" e "esta é a zona Sul". É o efeito do Pacífico limpo.

### O resultado

```text
+5,8 mm por °C
intervalo de confiança de 95%: +1,0 a +10,7
p = 0,019
```

Leitura leiga:

- **+5,8 mm por °C**: se o Pacífico esquentar 1 °C, a chuva do mês aumenta cerca de 6 mm.
- **Intervalo +1,0 a +10,7**: a estimativa não é exata; o valor real está provavelmente nessa faixa. Como a faixa não cruza o zero, o efeito é considerado real.
- **p = 0,019**: se não houvesse relação nenhuma, haveria 2% de chance de aparecer um resultado assim por acaso. Como 2% é baixo, aceita-se que não é coincidência.

Por zona:

| Zona | mm por °C |
|---|---|
| Sul | +7,8 |
| Leste | +7,3 |
| Centro | +5,0 |
| Norte | +4,6 |
| Oeste | +4,5 |

Sul e Leste têm o efeito mais forte. Norte e Oeste têm intervalo que encosta no zero — o efeito ali pode ser nulo.

### O teste de teimosia

Refiz a conta com um método que não se deixa enganar por valores extremos (Spearman). Só **Leste** e **Sul** continuaram com resultado significativo. Centro, Norte e Oeste perderam força.

Ou seja: o efeito é real, mas frágil, e só se sustenta com segurança em duas zonas.

---

## 7. Passo 5 — o teste honesto: treinar no passado, testar no futuro

Um modelo que só foi testado nos mesmos dados em que aprendeu sempre parece bom. É como estudar com o gabarito na mão.

Então dividi:

- **treino**: 1961 a 2009 — o modelo aprende só com isso;
- **teste**: 2010 a 2026 — o modelo nunca viu esses anos.

E comparei com a alternativa mais burra possível: **repetir a média histórica do mês**. Se o modelo não vence isso, ele não serve para prever nada.

```text
erro médio do modelo:        52,7 mm
erro médio da média histórica: 53,8 mm
ganho: 1,9%
```

**Erro médio** (RMSE) quer dizer: "em um mês qualquer, o palpite erra por volta de X mm". O modelo erra 52,7 mm; chutar a média erra 53,8 mm.

Diferença de 1,9%. Na prática, empate.

**Conclusão prática**: o NINO3.4 ajuda a entender a chuva, mas não serve para prever a chuva do mês que vem.

---

## 8. Passo 6 — o caso 2026

2026 é o ano mais extremo da série:

- o NINO3.4 de setembro chegou a **2,08**, o maior valor em 77 anos (1997 tinha 2,07);
- a subida de fevereiro a setembro foi de **+2,84 °C em 8 meses**, a mais rápida do registro.

E a chuva de setembro de 2026 ficou **167% a 177% acima do normal** nas cinco zonas.

Isso é o cenário mais favorável possível à hipótese. Mas é **um** caso. E o mesmo 2026 tem contraexemplos: em abril, com o Pacífico praticamente neutro (NINO3.4 = -0,04), o Centro teve chuva 102% acima do normal.

Um caso isolado não prova relação. Ele ilustra.

---

## 9. O que dá para afirmar

1. Existe uma associação positiva entre aquecimento do Pacífico e chuva em São Paulo, medida em 66 anos.
2. O tamanho do efeito é pequeno: cerca de 6 mm por grau, algo como 6% da chuva de um mês típico.
3. A associação é mais confiável no Leste e no Sul.
4. A resposta é imediata, no mesmo mês — não vem com atraso.

## 10. O que não dá para afirmar

1. **Causalidade.** Correlação não é causa. Pode haver um terceiro fator mexendo nos dois.
2. **Previsão.** O modelo empata com a média histórica. Não há base para dizer "vai chover X mm em dezembro".
3. **Alagamento.** Alagamento depende de drenagem, relevo e asfalto. A chuva é só um ingrediente.
4. **Rua específica.** O dado é de célula de 11 km, não de pluviômetro.

---

## 11. Sobre o cenário com a projeção até NDJ

O `df_2026` tem três linhas projetadas (`SON`, `OND`, `NDJ`). Elas **não entraram no cálculo** por três motivos:

1. **Projeção não é medição.** Treinar um modelo com números que já são previsão é fazer o modelo concordar consigo mesmo.
2. **Não há com o que comparar.** A chuva observada termina em outubro de 2026; a projeção vai até janeiro de 2027.
3. **Não muda nada.** Mesmo o valor mais quente projetado (2,43) adiciona só **+1,5 a +2,7 mm/mês** sobre o último valor observado — contra um erro de 53 mm.

O uso correto dessa tabela é como **cenário**: "se a projeção se confirmar, a expectativa é 12 a 19 mm acima do normal por mês, com margem de erro de ±100 mm". Ou seja, indistinguível do normal.

---

## 12. Glossário rápido

| Termo | O que significa |
|---|---|
| **El Niño / La Niña** | Aquecimento / resfriamento anormal das águas do Pacífico equatorial |
| **NINO3.4** | Número que mede esse aquecimento, em °C acima ou abaixo do normal |
| **Climatologia** | Média histórica de um mês específico |
| **Anomalia** | Quanto um mês fugiu da climatologia |
| **Correlação** | Medida de -1 a +1 de quanto duas coisas andam juntas |
| **Regressão linear** | Conta que converte uma variável em outra por uma reta |
| **Efeito fixo** | Ajuste próprio de cada grupo (mês, zona) para não contaminar a conta |
| **p-valor** | Chance de o resultado ser coincidência |
| **RMSE** | Erro médio do palpite, na mesma unidade do dado (mm) |
| **Treino / teste** | Aprender com uma parte dos dados e conferir em outra que o modelo não viu |
| **Defasagem (lag)** | Usar o valor de meses atrás para explicar o mês atual |

---

## 13. Onde conferir no notebook

| Assunto | Célula |
|---|---|
| Baixa e cache da chuva | 3 |
| Chuva mensal por zona | 4 |
| NINO3.4 do banco | 6 |
| Junção e anomalia | 8 e 9 |
| Correlação e defasagem | 11 |
| Teste de teimosia (Spearman) | 13 |
| Regressão | 15 |
| Treino e teste | 17 |
| Caso 2026 | 19 |
| Gráficos | 21 |
| Conclusão escrita | 25 |

---

## 14. Resumo em três frases

1. Com 66 anos de chuva e de Pacífico, existe sim uma relação: quanto mais quente o Pacífico, mais chuva em São Paulo — mas o efeito é pequeno, cerca de 6 mm por grau.
2. Essa relação não serve para prever: um modelo baseado nela erra praticamente igual a simplesmente repetir a média histórica.
3. O ano de 2026 é o retrato disso: setembro, com o Pacífico no recorde de 77 anos, teve chuva 170% acima do normal; mas abril, com o Pacífico neutro, também teve chuva muito acima do normal.
