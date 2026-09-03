# Lorcana Vocab

Ferramenta pessoal de flashcards para aprender o vocabulário de inglês usado
nas cartas de Disney Lorcana, priorizando as palavras e habilidades que mais
se repetem no jogo.

## O que o app faz

- **Modo Vocabulário**: sessões de até 20 flashcards com as palavras e
  keywords de habilidade mais frequentes do jogo (ex: `banish`, `quest`,
  `Bodyguard`, `Shift`), tiradas de cartas reais. Cada termo tem tradução em
  português e exemplos de cartas onde aparece.
- **Modo Avançado**: sessões de flashcards com o texto completo de
  habilidade das cartas do set mais recente lançado, em inglês e português
  lado a lado, para treinar a leitura de regras do jogo além do vocabulário
  isolado.
- **Progresso**: cada termo/carta tem um nível de 0 a 3 (acertos seguidos
  desde o último erro), salvo em `localStorage` — sem conta, sem backend.
  As sessões priorizam sempre o que você ainda não sabe.

## Rodando localmente

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

| Script | O que faz |
| --- | --- |
| `npm run dev` | Sobe o servidor de desenvolvimento Next.js |
| `npm run build` | Build de produção |
| `npm run test` | Roda os testes (Vitest) |
| `npm run lint` | Lint (ESLint) |
| `npm run generate-data` | Baixa o dataset do LorcanaJSON e regera `data/vocabulary.json`/`data/cards.json` (modo Vocabulário) |
| `npm run generate-advanced-source` | Detecta o set mais recente lançado e extrai o texto das cartas para `data/advanced-source.json` (modo Avançado) |
| `npm run merge-advanced-data` | Junta `data/advanced-source.json` + as traduções em `data/advanced-batch-*.json` e gera `data/advanced.json` |

## Como os dados são gerados

Os dados de cartas/vocabulário são arquivos JSON estáticos, commitados no
repositório, gerados uma vez a partir da [LorcanaJSON](https://lorcanajson.org)
— não há chamada de API em tempo de execução do app.

**Modo Vocabulário** (`scripts/generate-data.ts`): baixa todas as cartas,
separa as keywords oficiais de habilidade do vocabulário geral do texto de
habilidade, conta frequência, e traduz os termos mais comuns para português
(tradução curada em `scripts/lib/translations.ts`, sem API externa).

**Modo Avançado** (`scripts/generate-advanced-source.ts` +
`scripts/merge-advanced-data.ts`): identifica automaticamente o set mais
recente já lançado (pela data de lançamento nos metadados da LorcanaJSON) e
extrai o texto completo das cartas desse set. A tradução do texto completo é
feita manualmente/por agente e commitada em `data/advanced-batch-*.json`
antes de rodar o merge.

Quando sair um set novo do jogo, rode os scripts de novo e commite os dados
atualizados — não precisa mudar nenhum código.

## Stack

Next.js (App Router) + TypeScript + Tailwind CSS + Vitest. Progresso do
usuário em `localStorage`, sem banco de dados. Deploy na Vercel.
