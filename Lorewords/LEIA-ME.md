# Lorewords — Identidade Visual v1.0

Kit completo da identidade do site de aprender inglês com cartas de TCG.
Conceito: **Seis Tintas** — as seis cores de tinta do jogo viram seis papéis
funcionais na interface. Nenhuma cor é decoração; cada uma significa uma coisa.

## Comece por aqui

0. Leia **`IDENTIDADE-VISUAL.md`** — o documento completo: o nome, o conceito, o
   sistema visual e as sugestões de mudança para o produto.
1. Abra **`guia/style-guide.html`** no navegador — é o guia completo (logo, cores,
   tipografia, componentes, voz, cuidados com marca de terceiros).
2. Abra **`guia/mockups.html`** — as três telas do seu app já com a identidade aplicada.
   O CSS delas é a referência direta para implementar.
3. Copie **`cores/tokens.css`** para o projeto e importe no CSS global.

Os dois HTMLs leem o `tokens.css` e os SVGs por caminho relativo — mantenha a estrutura
de pastas ou ajuste os caminhos.

## O que tem aqui

```
Lorewords/
├─ LEIA-ME.md
├─ IDENTIDADE-VISUAL.md   documento completo (nome, sistema, sugestões)
├─ logo/            SVGs (fonte) + png/ (exportações)
├─ cores/           tokens.css · tokens.json · tailwind.config.snippet.js
├─ tipografia/      tipografia.md (par de fontes, escala, regras)
├─ imagens/         hero de vitral, mascote Glim, textura hexagonal
└─ guia/            style-guide.html · mockups.html
```

## A marca

**Nome:** Lorewords. Independente e neutro — cabe Lorcana hoje e outro TCG amanhã.

**Símbolo:** rosácea hexagonal de vitral. Seis facetas (uma por tinta) em volta de um
vazio central — a página em branco que o estudo preenche.

**Wordmark:** Lora Bold, já convertido em curvas nos SVGs (não depende da fonte instalada).

**Fontes do site:** Lora (display) + Inter (interface) + JetBrains Mono (fonética).
Todas gratuitas no Google Fonts.

## Cores em uma linha

| Tinta | Hex (escuro) | Papel |
|---|---|---|
| Sapphire | `#5B9CFF` | primária da marca · novo · links · CTA |
| Amber | `#F2A93B` | aprendendo · destaque · acento |
| Emerald | `#3DD8A0` | acertei · dominado |
| Ruby | `#FF6478` | errei · difícil |
| Amethyst | `#A47BFF` | modo avançado |
| Steel | `#9BB0CC` | neutro · metadados |

Fundo `#0A0D14`, card `#121724`, texto `#E9EEF9`. Todos os pares foram medidos e passam
WCAG AA — a tabela de contraste está no style guide.

## Como aplicar no seu Next.js

1. `cores/tokens.css` → `app/globals.css` (`@import` no topo ou cole o conteúdo).
2. Fontes: use `next/font/google` conforme `tipografia/tipografia.md`.
3. Se usar Tailwind, cole `cores/tailwind.config.snippet.js` no seu config.
4. Favicon: `logo/lorewords-favicon.svg` + `logo/png/lorewords-favicon-180px-apple-touch-icon.png`
   (apple-touch-icon) na pasta `app/` ou `public/`.
5. Substitua as cores fixas do CSS atual pelas variáveis — comece pelos botões
   "Não sabia" / "Eu sabia" e pelas barras de progresso, que é onde o ganho é maior.

## Próximos passos sugeridos

A lista completa e priorizada está na seção 7 do `IDENTIDADE-VISUAL.md`. Os quatro
primeiros:

- Aplicar os tokens no app e apagar as cores soltas do CSS.
- Trocar o vermelho de "Novo" no progresso por safira (vermelho hoje sugere erro).
- Favicon + título da aba (hoje ainda é "Lorcana Vocab", sem ícone).
- Atalhos de teclado no flashcard (espaço / 1 / 2) — já desenhados no mockup.

## Aviso sobre marcas de terceiros

Lorewords é uma marca independente: símbolo, wordmark, paleta e tipografia foram
desenhados do zero. Ao publicar, não use "Lorcana" nem "Disney" no nome do site, no
domínio, no logo ou no favicon; mencionar o jogo em texto descritivo é uso nominativo e
tudo bem. Inclua um rodapé de isenção. Detalhes na seção 07 do style guide.
Isso é orientação de bom senso, não parecer jurídico.

---
Gerado em 08/09/2026 · imagens criadas no Gemini (Nano Banana).
