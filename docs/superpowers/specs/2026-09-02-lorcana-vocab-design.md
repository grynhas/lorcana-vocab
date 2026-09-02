# Lorcana Vocab — Design

## Objetivo

Ferramenta pessoal de flashcards para aprender o vocabulário de inglês usado nas
cartas de Disney Lorcana, priorizando as palavras e keywords de habilidade que
mais se repetem nos textos das cartas.

## Escopo do MVP

Dentro do escopo:

- Pipeline de dados que baixa as cartas do LorcanaJSON, gera um ranking de
  frequência de vocabulário geral e uma lista curada das keywords oficiais de
  habilidade, com tradução para português.
- Site de flashcards (Next.js) com sessões de estudo, reveal com carta de
  origem (imagem real) e tradução, e progresso por nível salvo no navegador.
- Tela de progresso agregado.

Fora do escopo (ideias para depois, não fazem parte deste spec):

- Separar vocabulário por tipo de carta ou cor de tinta.
- Modo "frase completa" para treinar leitura do texto inteiro da carta.
- Áudio com pronúncia das palavras.
- Exportar progresso de estudo.
- Sincronização de progresso entre dispositivos / conta de usuário / backend.
- Atualização automática periódica dos dados (o fluxo é rodar o script de
  geração manualmente quando sair um set novo).

## Arquitetura geral

Repositório único Next.js (App Router) + TypeScript + Tailwind, hospedado na
Vercel. Sem backend nem API routes: os dados de cartas/vocabulário são JSON
estáticos gerados uma vez por um script e commitados no repo; o progresso do
usuário é 100% client-side (`localStorage`), sem servidor nem conta.

```
lorcana-vocab/
├── scripts/
│   └── generate-data.ts       # pipeline de geração de dados (rodado manualmente)
├── data/
│   ├── cards.json             # dados mínimos de cartas usadas como exemplos
│   └── vocabulary.json        # ranking de termos + traduções + exemplos
├── app/                       # rotas Next.js (Home, Sessão, Progresso)
├── lib/
│   ├── progress.ts            # leitura/escrita de progresso em localStorage
│   └── session.ts             # seleção dos termos de uma sessão de estudo
└── docs/superpowers/specs/    # este documento
```

### Pipeline de dados (`scripts/generate-data.ts`)

Rodado manualmente via `npm run generate-data` sempre que for necessário
atualizar os dados (ex: novo set lançado). Passos:

1. Baixa o JSON completo do LorcanaJSON (`lorcanajson.org`).
2. Extrai de cada carta: nome, tipo, custo, texto de habilidade/efeito, cor de
   tinta, URL da imagem oficial.
3. Tokeniza o texto de habilidade de todas as cartas, remove pontuação e uma
   lista padrão de stopwords do inglês (the, a, an, of, to, this, that, and,
   ...), e conta a frequência de cada palavra restante — gerando o ranking de
   **vocabulário geral**.
4. Trata separadamente uma lista fixa das **keywords oficiais de habilidade**
   do jogo (Bodyguard, Ward, Rush, Singer, Shift, Challenger, Support,
   Evasive, Resist, Reckless, Vanish, etc.), contando quantas cartas usam cada
   uma. Essas não entram na contagem de vocabulário geral — têm significado
   fixo definido pelas regras do jogo, não fazem sentido "traduzidas ao pé da
   letra".
5. Para cada termo selecionado (geral + keyword), guarda de 1 a 3 exemplos de
   cartas reais onde ele aparece: nome da carta, um trecho do texto contendo o
   termo, e a URL da imagem da carta.
6. Gera a tradução em português de cada termo selecionado (as ~200-300
   palavras mais frequentes do vocabulário geral + todas as keywords). Essa
   tradução é composta diretamente no momento de rodar o script — sem chamada
   a API externa de tradução — considerando o contexto de jogo de cartas (ex:
   "banish" não é "banir" genérico, "quest" é a ação específica do jogo, etc.).
7. Grava `data/cards.json` e `data/vocabulary.json`. O script nunca sobrescreve
   os arquivos existentes com dado parcial: se qualquer etapa falhar (ex:
   LorcanaJSON fora do ar, schema mudou), aborta com mensagem de erro clara e
   mantém os arquivos anteriores intactos.

### Modelo de dados

`data/vocabulary.json` — lista de termos:

```ts
type VocabularyEntry = {
  term: string;                // ex: "Bodyguard", "banish"
  category: "keyword" | "geral";
  translation: string;         // português
  frequency: number;           // quantas cartas usam o termo
  examples: Array<{
    cardName: string;
    cardImageUrl: string;
    textSnippet: string;       // trecho do texto da carta contendo o termo
  }>;
};
```

`data/cards.json` — dados mínimos das cartas referenciadas em `examples`
(nome, tipo, custo, cor de tinta, URL da imagem), para evitar duplicar dados
de carta completos dentro de `vocabulary.json`.

### Progresso do usuário (`localStorage`)

Mapa indexado por termo:

```ts
type ProgressEntry = {
  level: number;       // 0 a 3 (acertos seguidos desde o último erro)
  lastSeenAt: string;  // ISO timestamp
};
```

Regras:

- "Eu sabia" → incrementa o nível em 1 (até o máximo de 3). Nível 3 significa
  **dominado** (3 acertos seguidos sem errar).
- "Não sabia" → zera o nível de volta a 0, fazendo o termo voltar a aparecer
  com prioridade nas próximas sessões.
- Sem cálculo de data/intervalo (não é SM-2): a priorização é só por nível —
  termos de nível mais baixo (ou nunca vistos, nível 0) entram primeiro na
  próxima sessão.
- Os três buckets da tela de Progresso mapeiam direto para o nível: **Novo**
  = nível 0, **Aprendendo** = nível 1-2, **Dominado** = nível 3.
- Leitura e escrita em `localStorage` são best-effort: se o navegador bloquear
  ou o storage estiver indisponível, a sessão funciona normalmente (todos os
  termos tratados como nível 0), só não persiste entre visitas.

## Telas

1. **Home** — atalho para "Começar sessão" e um resumo rápido do progresso
   geral.
2. **Sessão de flashcards** — até 20 termos por sessão, priorizando nível mais
   baixo / nunca vistos. Se houver menos de 20 termos elegíveis, usa quantos
   houver.
   - **Frente do card**: keywords de habilidade aparecem isoladas (ex:
     "Bodyguard"); termos de vocabulário geral aparecem destacados dentro do
     trecho de texto da carta de origem, para já treinar reconhecimento em
     contexto.
   - **Verso do card** (ao clicar "Virar"): tradução, categoria (keyword ou
     geral), e a carta de origem com a imagem real (via URL do LorcanaJSON).
     Se a imagem falhar ao carregar, cai num placeholder de texto com o nome
     da carta — nunca quebra a tela. Se o termo não tiver exemplo associado
     (não deveria acontecer), mostra só a tradução.
   - Botões **"Eu sabia" / "Não sabia"** atualizam o nível em `localStorage`
     e avançam para o próximo card.
   - Ao final da sessão: tela de resumo com total de acertos/erros.
3. **Progresso** — barras por nível (Novo / Aprendendo / Dominado) com a
   contagem de termos em cada uma, mais o total geral.

## Testes

Núcleo de risco está na lógica, não na infraestrutura. Testes unitários
(Vitest) cobrindo:

- Tokenização, remoção de pontuação/stopwords e contagem de frequência.
- Separação entre keywords oficiais e vocabulário geral.
- Cálculo de nível de progresso (subir, zerar, atingir "dominado").
- Seleção dos termos de uma sessão (priorização por nível, comportamento com
  menos de 20 termos elegíveis).

Sem testes E2E automatizados no MVP — verificação manual no navegador
(desktop e celular) antes do deploy.

## Deploy

Projeto Next.js deployado na Vercel ao final da implementação (conta pessoal
do usuário).
