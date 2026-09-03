# Modo Avançado — Design

## Objetivo

Adicionar um segundo modo de estudo ao Lorcana Vocab, voltado para treinar a
leitura do texto completo das cartas (regras do jogo), como complemento ao
modo Vocabulário existente (palavras/keywords isoladas). Corresponde à ideia
de "modo frase completa" já prevista como trabalho futuro no spec original do
MVP.

## Escopo

Dentro do escopo:

- Um novo modo "Avançado", acessível a partir da Home, cobrindo as cartas do
  **set mais recente** lançado (detectado automaticamente pela data de
  lançamento nos metadados do LorcanaJSON — não hardcoded, para continuar
  funcionando quando sair um set novo).
- Pipeline de dados que extrai o texto completo de cada carta desse set e gera
  a tradução completa para português.
- Sessão de flashcards no mesmo estilo do modo Vocabulário (até 20 cartas,
  priorizando as de nível mais baixo), com progresso próprio e separado.
- Uma segunda seção na tela de Progresso mostrando o progresso do modo
  Avançado.

Fora do escopo:

- Cobrir todas as ~3200 cartas do jogo (só o set mais recente).
- Qualquer forma de tradução automática via API externa — a tradução do texto
  completo das cartas é gerada por mim (Claude), assim como o dicionário de
  vocabulário do MVP.
- Unificar o progresso dos dois modos — cada um tem sua própria chave de
  armazenamento e sua própria contagem de "dominado".

## Arquitetura e dados

### Pipeline de dados (`scripts/generate-advanced-data.ts`)

Script novo e independente do `generate-data.ts` do MVP (não mistura a lógica
de frequência de vocabulário com a de tradução de texto completo). Passos:

1. Reaproveita `fetchAllCards()` (de `scripts/lib/fetchCards.ts`) para baixar
   o dataset completo do LorcanaJSON, que já inclui o dicionário `sets` com
   metadados de cada set (incluindo data de lançamento).
2. Identifica o set mais recente comparando as datas de lançamento em `sets`.
3. Filtra todas as cartas cujo `id` pertence a esse set.
4. Para cada carta filtrada, usa o campo `fullText` (texto completo já
   concatenado da carta, vindo do LorcanaJSON) como `textEn`.
5. Gera a tradução completa desse texto para português (`textPt`) — tradução
   de frases/parágrafos inteiros, não busca em dicionário. Cada carta deve ter
   uma tradução completa antes do script escrever o arquivo final; nenhuma
   carta fica com tradução vazia ou parcial.
6. Grava `data/advanced.json`:

```ts
type AdvancedCardEntry = {
  cardId: number;
  name: string;
  imageUrl: string;
  textEn: string;
  textPt: string;
};
```

O trabalho de tradução (potencialmente ~200 cartas, uma por uma) é dividido em
lotes de até 50 cartas por execução, processados em paralelo por múltiplos
subagentes durante a implementação — não é gerado por um algoritmo, é conteúdo
escrito.

### Generalizações no código existente (para reaproveitar, não duplicar)

- **`lib/session.ts`**: `buildSession` se torna genérica sobre o tipo do item,
  recebendo um novo parâmetro `getKey` para extrair a chave de progresso. Isso
  desloca `sessionSize` de 3º para 4º parâmetro (continua com o mesmo valor
  padrão), então é uma mudança de assinatura, não só uma adição — a chamada
  existente em `app/session/page.tsx` e os testes em
  `lib/__tests__/session.test.ts` precisam ser atualizados para passar
  `getKey` explicitamente:

  ```ts
  function buildSession<T>(
    items: T[],
    progress: ProgressMap,
    getKey: (item: T) => string,
    sessionSize: number = DEFAULT_SESSION_SIZE
  ): T[]
  ```

  Uso no modo Vocabulário: `buildSession(vocabulary, progress, (e) =>
  e.term)`. Uso no modo Avançado: `buildSession(advancedCards, progress, (c)
  => String(c.cardId))`. A lógica de ordenação por nível/`lastSeenAt` não
  muda, só como ela obtém a chave de cada item.
- **`lib/progress.ts`**: `loadProgress`/`saveProgress` passam a receber a
  chave de armazenamento como parâmetro, em vez de uma constante fixa interna.
  O modo Vocabulário continua usando a chave `lorcana-vocab-progress`; o modo
  Avançado usa uma nova chave `lorcana-vocab-progress-advanced`. As funções
  puras (`getLevel`, `markKnown`, `markUnknown`, `isDominated`) não mudam —
  já operam sobre um `ProgressMap` já carregado, independente de onde veio.

### Novo tipo (`lib/types.ts`)

```ts
type AdvancedCardEntry = {
  cardId: number;
  name: string;
  imageUrl: string;
  textEn: string;
  textPt: string;
};
```

## Interface

- **`components/AdvancedFlashcard.tsx`** (novo componente, separado do
  `Flashcard.tsx` do modo Vocabulário por ter um layout diferente):
  - Frente: imagem da carta e nome, sem o texto de habilidade.
  - Verso (após "Virar card"): texto completo em inglês (`textEn`) e a
    tradução completa em português (`textPt`), um abaixo do outro, mais os
    botões "Eu sabia"/"Não sabia".
  - Mesmo fallback de imagem quebrada do `Flashcard.tsx` original (troca por
    uma caixa com o nome da carta se a imagem falhar).
- **`app/advanced-session/page.tsx`** (nova rota): espelha a estrutura de
  `app/session/page.tsx` — sessão de até 20 cartas construída uma vez com
  `buildSession(advancedCards, loadProgress(ADVANCED_STORAGE_KEY), (c) =>
  String(c.cardId))`, tela de resumo ao final, estado vazio se
  `data/advanced.json` ainda não tiver sido gerado.
- **Home (`app/page.tsx`)**: ganha um segundo botão/link "Avançado" ao lado de
  "Começar sessão", levando para `/advanced-session`.
- **Progresso (`app/progress/page.tsx`)**: ganha uma segunda seção abaixo das
  barras atuais (mesmo formato Novo/Aprendendo/Dominado), calculada a partir
  de `data/advanced.json` e do progresso armazenado sob a chave avançada.

## Tratamento de erros e casos de borda

- `data/advanced.json` ainda não gerado (script não rodou): a página
  `/advanced-session` mostra o mesmo tipo de estado vazio já usado em
  `/session` quando `data/vocabulary.json` está vazio.
- Imagem de carta quebrada: mesmo fallback textual já usado no
  `Flashcard.tsx` original.
- `localStorage` indisponível: mesmo comportamento best-effort já existente em
  `lib/progress.ts` (nível tratado como 0, sem crash).
- Pipeline de tradução incompleto: o script `generate-advanced-data.ts` não
  escreve `data/advanced.json` se qualquer carta do set ficar sem tradução —
  mesmo princípio de "nunca escrever dado parcial" do `generate-data.ts`
  original.

## Testes

- `lib/session.ts`: novos casos de teste para `buildSession` cobrindo a
  extração de chave via `getKey` com itens que não são `VocabularyEntry`
  (ex: um item com `cardId` numérico).
- `lib/progress.ts`: teste garantindo que `loadProgress`/`saveProgress` com
  chaves diferentes não se misturam no `localStorage` (progresso do modo
  Vocabulário e do modo Avançado ficam isolados).
- Sem teste automatizado para o conteúdo de tradução (é conteúdo gerado, não
  lógica) nem para os componentes visuais novos — verificação manual no
  navegador, como no MVP.

## Deploy

Sem mudanças no fluxo de deploy já definido no MVP (Vercel, quando o usuário
pedir).
