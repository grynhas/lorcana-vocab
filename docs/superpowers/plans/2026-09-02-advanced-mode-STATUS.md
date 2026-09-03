# Advanced Mode — Status e próximos passos

Pausado a pedido do usuário logo após o Task 6. Este documento registra o que
já foi feito, o que falta, e onde retomar.

Branch: `advanced-mode` (não mergeada em `main`). Último commit:
`67fff19` — "Add merge script and generate the real data/advanced.json".

Plano completo: `docs/superpowers/plans/2026-09-02-advanced-mode.md`
(11 tarefas no total).

## Feito (Tasks 1-6) — implementado, testado e revisado

- **Task 1** — `buildSession` generalizado com extrator de chave (`getKey`).
  Revisado e aprovado.
- **Task 2** — `lib/progress.ts` com chave de armazenamento parametrizada
  (`VOCAB_STORAGE_KEY` / `ADVANCED_STORAGE_KEY`). Revisado e aprovado.
- **Task 3** — Tipo `AdvancedCardEntry` + placeholder `data/advanced.json`.
  Revisado e aprovado.
- **Task 4** — `scripts/generate-advanced-source.ts`: detecta automaticamente
  o set mais recente já lançado (hoje: "Attack of the Vine!", set 13,
  24/07/2026) e extrai 244 cartas com texto de habilidade para
  `data/advanced-source.json`. Revisado (spec + qualidade) e aprovado.
- **Task 5** — Tradução completa das 244 cartas para português, feita em 5
  lotes paralelos (`data/advanced-batch-1.json` a `-5.json`). Revisada:
  completude 100%, e as seguintes correções já foram aplicadas após a
  revisão:
  - Erro de conjugação "bana" → "bane" (cardId 3098, 3230)
  - Nomes de habilidade inconsistentes entre reimpressões padronizados:
    ADVANCED MIMICRY (3028/3217), STEALING IN (3017/3228), HANG ON!
    (2972/3236)
  - "Cantora" → "Cantor(a)" (cardId 3218), para bater com o termo do
    keyword Singer
  - Pendências cosméticas **não corrigidas** (o próprio revisor marcou como
    opcional, não bloqueante): mais 5 variações de nome entre reimpressões
    com o mesmo sentido, e diferença de granularidade de quebra de linha
    entre lotes 2/5 vs 1/3/4 (sem perda de conteúdo).
- **Task 6** — `scripts/merge-advanced-data.ts`: gerou o `data/advanced.json`
  final com 244 entradas (`cardId`, `name`, `imageUrl`, `textEn`, `textPt`).
  `tsc`, `npm run test` (22/22) e `npm run build` passando.
  **Ainda não passou pela revisão de spec/qualidade** (parado antes disso a
  pedido do usuário) — recomendo rodar essa revisão antes de seguir para o
  Task 7, já que os Tasks 1-4 sempre tiveram esse passo.

## Falta fazer

1. **Revisar o Task 6** (spec compliance + qualidade) — pulado neste ponto
   de parada, mas seguindo o padrão usado em todas as tarefas anteriores.
2. **Task 7** — `components/AdvancedFlashcard.tsx` (frente: imagem+nome;
   verso: texto completo em inglês + tradução completa).
3. **Task 8** — `app/advanced-session/page.tsx` (sessão de 20 cartas,
   espelhando `app/session/page.tsx`).
4. **Task 9** — Home (`app/page.tsx`) ganha o botão "Avançado".
5. **Task 10** — Progresso (`app/progress/page.tsx`) ganha uma segunda seção
   para o modo Avançado.
6. **Task 11** — Verificação manual no navegador (mobile + desktop), fluxo
   completo do modo Avançado, incluindo fallback de imagem quebrada.
7. **Merge da branch `advanced-mode` para `main`** — só depois de tudo acima
   e de o usuário revisar/aprovar. Não fazer sem pedido explícito.
8. **Push para o GitHub** (`git push` da branch e/ou do `main` atualizado) —
   só quando o usuário pedir.
9. **Deploy na Vercel** — segue pendente desde o MVP; o usuário adiou
   explicitamente ("deixa o deploy pra depois"). Precisa de `vercel login`
   (interativo) ou um token de acesso.

## Como retomar

Continuar a partir do Task 7 do plano
(`docs/superpowers/plans/2026-09-02-advanced-mode.md`), usando o mesmo fluxo
de subagent-driven-development já usado nos Tasks 1-6 (implementador →
revisão de spec → revisão de qualidade, um subagente por vez). Está tudo na
branch `advanced-mode`, sem nada pendente de commit.
