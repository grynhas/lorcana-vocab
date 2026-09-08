# Tipografia — Lorewords

## O par

| Papel | Fonte | Pesos | Onde usar |
|---|---|---|---|
| **Display** | **Lora** | 600, 700 | Wordmark, títulos de página, a palavra-alvo em inglês no flashcard |
| **Interface** | **Inter** | 400, 500, 600 | Botões, rótulos, textos corridos, números, navegação |
| **Mono** | **JetBrains Mono** | 400 | Transcrição fonética /ˈvæm.paɪɚ/, código da carta, atalhos de teclado |

**Por que Lora:** serifa contemporânea de origem caligráfica — dá o clima de manuscrito
iluminado / carta de TCG sem cair no clichê de "fonte medieval", e continua legível em
tamanho pequeno. É ela que desenha o wordmark (já convertido em vetor nos SVGs, então o
logo não depende da fonte estar instalada).

**Por que Inter:** a interface tem muito rótulo curto, número e barra de progresso. Inter
tem altura-x grande, algarismos tabulares (`font-variant-numeric: tabular-nums`) e ótima
legibilidade em telas pequenas.

## Carregando

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap">
```

Em Next.js (recomendado, evita flash e layout shift):

```js
// app/fonts.js
import { Lora, Inter, JetBrains_Mono } from 'next/font/google'
export const lora   = Lora({ subsets:['latin'], weight:['600','700'], variable:'--f-display' })
export const inter  = Inter({ subsets:['latin'], weight:['400','500','600'], variable:'--f-ui' })
export const mono   = JetBrains_Mono({ subsets:['latin'], weight:['400'], variable:'--f-mono' })
```

E no `tokens.css` troque por `--font-display: var(--f-display), Georgia, serif;` etc.

## Escala

Definida em `cores/tokens.css` com `clamp()` — cresce sozinha entre celular e desktop.

| Token | Tamanho | Uso |
|---|---|---|
| `--step-4` | 36 → 56 px | Palavra-alvo no flashcard, título da home |
| `--step-3` | 28 → 40 px | Título de página |
| `--step-2` | 22 → 28 px | Título de seção |
| `--step-1` | 18 → 20 px | Subtítulo, tradução |
| `--step-0` | 15 → 16 px | Texto corrido, botões |
| `--step--1` | 13 → 14 px | Rótulos, legendas, metadados |

## Regras

- **Títulos** em Lora 700, `line-height: 1.15`, `letter-spacing: -0.015em`.
- **Rótulos de seção** ("PALAVRA-CHAVE", "VOCABULÁRIO") em Inter 600, `11px`,
  `letter-spacing: .14em`, caixa alta, cor `--text-faint`.
- **Nunca** caixa alta em texto corrido — só em rótulos de até 3 palavras.
- **Números** sempre com `font-variant-numeric: tabular-nums` para as barras de
  progresso e o contador `1 / 20` não "dançarem".
- **Inglês vs. português:** a palavra em inglês usa Lora (display); a tradução em
  português usa Inter. Essa diferença de forma ajuda o cérebro a separar os dois idiomas.
