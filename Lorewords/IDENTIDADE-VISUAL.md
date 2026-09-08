# Lorewords — Identidade Visual e Direção do Produto

Documento único da nova identidade do site de aprender inglês com cartas de TCG,
mais as sugestões de mudança que surgiram olhando a versão atual.
Versão 1.0 — 08/09/2026.

---

## 1. O nome

**Lorewords.**

*Lore* (a história, o mundo, o conhecimento de um jogo) + *words* (as palavras).
Lê-se igual em português e em inglês, tem cinco sílabas curtas e cabe num favicon.

Por que trocar "Lorcana Vocab":

- **Segurança de marca.** "Lorcana" é marca registrada da Disney/Ravensburger. Usar no
  nome do site, no domínio ou no logo é o tipo de risco que não compensa correr num
  projeto que você quer manter no ar por anos. Citar o jogo no texto ("vocabulário das
  cartas de Disney Lorcana") é uso nominativo e é tranquilo.
- **Espaço pra crescer.** Você já falou em outros TCGs. "Lorewords" abriga Lorcana hoje
  e Pokémon, MTG ou One Piece amanhã sem virar mentira. "Lorcana Vocab" te prende.
- **Sonoridade.** "Vocab" é uma abreviação de app de estudo. "Lorewords" soa como um
  lugar, não como uma ferramenta — e é isso que faz alguém voltar.

**Como usar o nome no site:** Lorewords é a marca; Lorcana é um *módulo* dentro dela.
Na home: "Lorewords · Lorcana" ou "Coleção: Disney Lorcana".

**Tagline sugerida:** *Aprenda inglês pelas cartas que você já ama jogar.*

---

## 2. O conceito: Seis Tintas

O jogo tem seis cores de tinta — Amber, Ruby, Amethyst, Sapphire, Emerald, Steel.
São **nomes de cores numa regra de jogo**, não arte protegida, então dá pra construir
em cima com segurança. E resolve um problema real: um app de estudo precisa de umas
seis cores funcionais, e é exatamente esse o número.

A regra do sistema é uma só: **cada tinta tem um papel e só um.** Nenhuma cor entra
por decoração. Se você precisar de cor pra algo novo, pergunte de qual papel aquilo
se aproxima em vez de inventar a sétima tinta.

| Tinta | Hex (tema escuro) | Hex (tema claro) | Papel na interface |
|---|---|---|---|
| **Sapphire** | `#5B9CFF` | `#1F56C7` | Primária da marca · card novo · links · CTA |
| **Amber** | `#F2A93B` | `#9A6200` | Aprendendo · destaque · ofensiva de dias |
| **Emerald** | `#3DD8A0` | `#0A7551` | Acertei · dominado · sucesso |
| **Ruby** | `#FF6478` | `#C22B45` | Errei · card difícil · alerta |
| **Amethyst** | `#A47BFF` | `#6B37D0` | Modo avançado · conteúdo "mágico" |
| **Steel** | `#9BB0CC` | `#47576F` | Neutro · metadados · estrutura |

Superfícies: fundo `#0A0D14`, card `#121724`, elevado `#1A2130`, borda `#262F42`.
Texto `#E9EEF9`, secundário `#9AA7BE`, terciário `#6B7890`.

**Contraste:** medi todos os pares. Texto principal 16,7:1, secundário 8,0:1, e todas as
tintas ficam entre 6,3:1 e 10,7:1 sobre o fundo. Passam WCAG AA, a maioria AAA.
A tabela completa está na seção 02 do `guia/style-guide.html`.

**Regra de acessibilidade que vale mais que a paleta:** nunca use cor sozinha pra dizer
acerto ou erro. Sempre cor + ícone ou cor + palavra. Cerca de 8% dos homens têm alguma
deficiência de visão de cores, e vermelho/verde é justamente o par que mais some.

---

## 3. O símbolo

Uma **rosácea hexagonal de vitral**: seis facetas, uma por tinta, em volta de um vazio
central. O vazio é o ponto — é a página em branco que o estudo preenche.

Por que funciona:

- Hexágono é a forma da tinta no jogo sem copiar nada de ninguém.
- Vitral casa com "manuscrito iluminado" e com "seis cores" ao mesmo tempo.
- Vira anel, ponto, badge e loader sem perder a identidade.
- Aguenta 16px: a versão favicon fecha os vãos e continua legível.

**Wordmark** em Lora Bold, já convertido em curvas nos SVGs — o logo não depende da
fonte estar instalada em lugar nenhum.

### Arquivos

```
logo/
├─ lorewords-logo-horizontal-tema-escuro.svg     ← uso padrão
├─ lorewords-logo-horizontal-tema-claro.svg
├─ lorewords-logo-horizontal-mono-branco.svg     ← sobre foto/cor sólida
├─ lorewords-logo-horizontal-mono-preto.svg
├─ lorewords-logo-vertical-tema-escuro.svg       ← perfil, splash, share
├─ lorewords-logo-vertical-tema-claro.svg
├─ lorewords-simbolo-colorido.svg                ← avatar, app icon
├─ lorewords-simbolo-colorido-fundo-claro.svg
├─ lorewords-simbolo-mono-branco.svg
├─ lorewords-simbolo-mono-preto.svg
├─ lorewords-favicon.svg                         ← sem vãos, pra tamanhos pequenos
└─ png/  (mesmas peças exportadas em 16 a 1200px)
```

### Regras de uso

**Faça:** margem livre de uma faceta em volta · mínimo 24px de altura pro símbolo e
120px de largura pro horizontal · mono sobre fundo colorido ou foto · favicon abaixo
de 32px.

**Não faça:** recolorir as facetas · sombra, contorno, bisel ou gradiente no símbolo ·
esticar, inclinar ou girar · redigitar "Lorewords" numa fonte qualquer (use o SVG).

---

## 4. Tipografia

| Papel | Fonte | Onde |
|---|---|---|
| Display | **Lora** 600/700 | Wordmark, títulos, **a palavra em inglês** |
| Interface | **Inter** 400/500/600 | Botões, rótulos, textos, números |
| Mono | **JetBrains Mono** 400 | Fonética /ˈvæm.paɪɚ/, código da carta, atalhos |

Todas gratuitas no Google Fonts. Detalhes de carregamento, escala com `clamp()` e regras
em `tipografia/tipografia.md`.

**A decisão que mais importa aqui:** a palavra em inglês vai em Lora (serifa), a tradução
em português vai em Inter (sem serifa). Não é enfeite — a diferença de forma dá ao cérebro
um sinal a mais pra separar os dois idiomas, que é exatamente o trabalho que um flashcard
bilíngue precisa facilitar.

---

## 5. Imagens

```
imagens/
├─ lorewords-fundo-vitral-2560x1429.jpg      ← fundo do topo (hero)
├─ lorewords-fundo-vitral-1280x714.jpg       ← versão leve, 88 KB
├─ lorewords-textura-hexagonal-1024x1024.jpg ← fundo discreto de seção
├─ lorewords-mascote-glim-1024px-transparente.png
├─ lorewords-mascote-glim-512px-transparente.png
└─ lorewords-mascote-glim-1024px-fundo-escuro.jpg
```

Geradas no Gemini (Nano Banana). Todas originais.

**Glim, o mascote.** Uma gota de tinta com asas de vitral e dois olhos de luz. Foi
desenhado pra ser útil, não fofo à toa: ele aparece nos momentos em que a interface
normalmente fica vazia e sem graça — estado vazio, fim de sessão, erro 404, primeira
visita. PNG com fundo recortado; o recorte foi feito pra superfícies escuras (sobre
branco fica um leve halo).

**Uso do hero:** `opacity: .5` e um gradiente escuro por cima do lado esquerdo, senão
briga com o texto. **Uso da textura:** nunca acima de `opacity: .6`.

---

## 6. Como aplicar no código

1. Copie `cores/tokens.css` pra `app/globals.css` (ou importe no topo dele).
2. Fontes com `next/font/google` — o trecho pronto está em `tipografia/tipografia.md`.
3. Se usa Tailwind, cole `cores/tailwind.config.snippet.js` no seu config.
4. Favicon: `lorewords-favicon.svg` + `lorewords-favicon-180px-apple-touch-icon.png`
   em `app/` ou `public/`.
5. Troque as cores fixas pelas variáveis. **Comece pelos botões "Não sabia"/"Eu sabia"
   e pelas barras de progresso** — é onde o ganho visual por linha de código é maior.
6. Use `guia/mockups.html` como referência: o CSS das três telas é literalmente o que
   você precisa, e não tem nenhuma cor solta lá dentro.

---

## 7. Sugestões de mudança no produto

Ordenadas por esforço × ganho. As primeiras são de uma tarde.

### 7.1 Correções diretas

- **"Novo" está vermelho na tela de progresso.** Vermelho lê como erro. Um card que
  você nunca viu não é um problema — é o estoque. Troque por safira. (Já está assim
  nos mockups.)
- **O título da aba é "Lorcana Vocab" e não tem favicon.** Duas linhas de código e o
  site para de parecer um deploy de teste.
- **A página não tem topo nem rodapé.** Sem logo, sem "voltar", sem nada. Uma barra
  simples com o logo à esquerda já muda a percepção de "protótipo" pra "produto".
- **Conteúdo grudado no topo em telas grandes.** Centralize verticalmente ou dê um
  respiro de topo; hoje sobra meia tela vazia embaixo.
- **Não existe foco visível de teclado.** Adicione `--focus-ring` (já está nos tokens)
  em todo botão e link. É acessibilidade e é barato.

### 7.2 Ganhos rápidos de uso

- **Atalhos de teclado.** `espaço` vira o card, `1` = não sabia, `2` = eu sabia. Quem
  estuda 20 cards por dia vai usar em duas sessões e nunca mais volta pro mouse.
  A dica visual já está desenhada no mockup.
- **Áudio da pronúncia.** `speechSynthesis.speak(new SpeechSynthesisUtterance(word))`
  com `lang = 'en-US'`. É nativo do navegador, de graça, e resolve o maior buraco de
  um app de vocabulário: você aprende a palavra escrita e não sabe falar.
- **Tela de fim de sessão.** Hoje a sessão simplesmente acaba. Mostre: quantas acertou,
  quais errou (com a tradução do lado, pra revisar na hora) e quando elas voltam.
  É o momento de maior atenção do usuário e está sendo jogado fora.
- **Estado vazio de verdade.** "Você zerou a fila de hoje. Volte amanhã." com o Glim,
  em vez de uma tela em branco.

### 7.3 Pedagógico — a mudança que mais vale

**Separe jargão de jogo de inglês de verdade.**

"Potato Shift", "Bodyguard", "Challenger", "Bounce" são termos de regra. Saber o que
significam ajuda a jogar, mas não é inglês que a pessoa vai usar em lugar nenhum.
Já "shift" (mudar, turno), "bodyguard" (guarda-costas) e "challenge" (desafiar) são
palavras reais e úteis.

Sugestão: dois trilhos explícitos.

- **Trilho Regras** — o vocabulário mecânico do jogo. Curto, fechado, dá pra "zerar".
- **Trilho Inglês** — palavras do texto de sabor, das frases das cartas e dos nomes,
  com frase de exemplo e uso fora do jogo.

Isso também resolve a confusão atual entre "Vocabulário" e "Avançado" no progresso —
hoje não dá pra saber o que "Avançado" quer dizer sem entrar e descobrir.

### 7.4 Qualidade do estudo

- **Quatro níveis de resposta em vez de dois.** "De novo / Difícil / Bom / Fácil".
  Com dois botões, o algoritmo não consegue distinguir "acertei raspando" de "sei de
  cor", e o intervalo fica sempre errado pra alguém. Vale olhar o **FSRS** (sucessor
  do SM-2, tem implementação em JS pronta e é bem melhor calibrado).
- **Frase de exemplo com a palavra destacada.** Você já tem o texto da carta na API —
  mostrar a palavra-alvo em contexto, grifada, vale mais que a tradução isolada.
- **Modo inverso e modo digitação.** PT → EN, e uma variante onde a pessoa digita.
  Produção é o que consolida; reconhecimento passivo dá a falsa sensação de saber.
- **Filtro por tinta e por coleção.** Combina com o sistema visual e dá controle:
  "quero só as cartas de Amber que eu jogo".

### 7.5 Retenção, sem crueldade

- **Ofensiva (streak)** que conta dias, não pune. Nada de "você perdeu tudo". Um
  "descanso" por semana já evita que a pessoa abandone o app depois de um dia ruim.
- **Elogio específico.** "12 palavras novas hoje" funciona melhor que "Mandou bem!".
- **PWA.** `manifest.json` + service worker: instala no celular, funciona offline,
  e um app de flashcard sem offline perde metade dos momentos de uso (fila, ônibus).

### 7.6 Distribuição

- **Imagem de compartilhamento (OG image, 1200×630).** Dá pra montar com o hero de
  vitral + o wordmark. Sem ela, todo link que você mandar vai aparecer sem nada.
- **Uma landing de verdade** explicando o que é, pra quem serve e mostrando um card
  de exemplo — antes do "Começar sessão". Hoje quem cai no link não entende a
  proposta em três segundos.

---

## 8. Voz

**Sim:** direto e curto ("Vire o card", "Você errou 3 vezes essa") · vocabulário de
jogo quando ajuda (*baralho*, *sessão*, *tinta*) · elogio específico · erro sem drama
("Ainda não. Ela volta daqui a pouco.").

**Não:** caixa alta gritada e pilha de emoji · gamificação culpada · jargão de SRS na
cara do usuário ("intervalo E-Factor 2.5") · fingir ser produto oficial de algum TCG.

---

## 9. Marcas de terceiros

Lorewords é uma marca independente. Símbolo, wordmark, paleta e tipografia foram
desenhados do zero e não derivam de nenhum logo ou arte de terceiros. As seis tintas
partem de nomes de cores de uma regra de jogo, não de arte protegida.

Ao publicar:

- Não use "Lorcana" nem "Disney" no nome do site, no domínio, no logo ou no favicon.
- Pode mencionar o jogo em texto descritivo — isso é uso nominativo.
- Ponha um rodapé de isenção. Sugestão:
  > *Lorewords é um projeto de fãs, sem vínculo com a Disney ou a Ravensburger.
  > Todas as marcas e artes das cartas pertencem aos seus donos.*
- Imagens de carta: use a API pública, mostre como referência dentro do estudo, não
  redistribua em download nem venda nada em cima.
- Se um dia monetizar, converse com um advogado antes. Projeto de fã sem fins
  lucrativos e produto pago são situações jurídicas bem diferentes.

Isso é orientação de bom senso, não parecer jurídico.

---

## 10. Onde está cada coisa

```
Lorewords/
├─ LEIA-ME.md                 início rápido
├─ IDENTIDADE-VISUAL.md       este documento
├─ logo/                      SVGs + png/
├─ cores/                     tokens.css · tokens.json · tailwind.config.snippet.js
├─ tipografia/                tipografia.md
├─ imagens/                   hero, textura, mascote Glim
└─ guia/
   ├─ style-guide.html        guia visual completo (abra no navegador)
   └─ mockups.html            as três telas com a identidade aplicada
```
