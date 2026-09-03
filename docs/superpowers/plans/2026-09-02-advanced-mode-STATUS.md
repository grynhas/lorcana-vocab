# Advanced Mode — Status e próximos passos

Este documento registra o que já foi feito, o que falta, e onde retomar.

Branch: `advanced-mode` (não mergeada em `main`).

Plano completo: `docs/superpowers/plans/2026-09-02-advanced-mode.md`
(11 tarefas no total).

## Feito (Tasks 1-11) — implementado, testado e revisado

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
  Revisado (spec + qualidade) e aprovado. Observações menores não bloqueantes
  do revisor de qualidade: sem detecção de `cardId` duplicado entre arquivos
  de lote (last-write-wins silencioso) e o fallback `textPt ?? ""` é código
  morto dado o fluxo de erro atual — nenhuma ação necessária.
- **Task 7** — `components/AdvancedFlashcard.tsx`: componente de flashcard
  com frente (imagem + nome, fallback em caso de erro de imagem) e verso
  (texto completo em inglês e português). Revisado (spec + qualidade) e
  aprovado.
- **Task 8** — `app/advanced-session/page.tsx`: página de sessão de 20
  cartas, espelhando `app/session/page.tsx`, usando `ADVANCED_STORAGE_KEY`.
  Revisado (spec + qualidade) e aprovado.
- **Task 9** — `app/page.tsx`: botão "Avançado" adicionado à Home, ao lado
  de "Começar sessão". Revisado (spec + qualidade) e aprovado.
- **Task 10** — `app/progress/page.tsx`: segunda seção "Avançado" com barras
  Novo/Aprendendo/Dominado, generalizando os helpers `bar`/`countBuckets`.
  Revisado (spec + qualidade) e aprovado.
- **Task 11** — Verificação manual completa (via Playwright headless,
  desktop 1280×900 e mobile 390×844, screenshots conferidos visualmente):
  - `npm run test`: 22/22 passando.
  - Home mostra os 3 botões ("Começar sessão", "Avançado", "Ver progresso").
  - Sessão avançada: frente mostra arte + nome da carta (imagem carrega do
    CDN da Ravensburger); verso mostra texto completo em inglês e
    português, com quebras de linha e bullets (•) preservados.
  - "Eu sabia"/"Não sabia" avançam pelas 20 cartas até a tela de resumo
    ("Sessão concluída! Acertos: X · Erros: Y").
  - Progresso mostra as duas seções independentes; confirmado que responder
    cartas do modo Avançado não altera os números da seção Vocabulário
    (permaneceu 273 Novo/0/0 antes e depois; Avançado foi de 244/0/0 para
    234/10/0 após 10 acertos).
  - Fallback de imagem quebrada: **funciona corretamente para cenários
    reais** (testado com um 404 de verdade no host da Ravensburger — o
    fallback com o nome da carta aparece). **Observação sobre a receita de
    teste do plano:** a URL exata sugerida no plano
    (`https://example.com/broken.png`) não dispara o `onError` no Chromium
    headless, porque o Chrome bloqueia essa resposta via ORB (Opaque
    Response Blocking, já que `example.com` devolve HTML, não uma imagem) —
    isso é uma particularidade dessa URL de teste específica, não um bug no
    componente. Vale testar manualmente num navegador de verdade se quiser
    confirmar 100%, mas o comportamento do componente em si (usar 404s ou
    falhas de rede reais) está correto.
  - Nenhum erro de console/página em nenhum dos dois viewports.
  - `data/advanced.json` foi restaurado ao original (`git checkout --`)
    após o teste de fallback; `git status` limpo.

## Falta fazer

1. **Revisão final de código** de toda a implementação (Tasks 1-11 juntas)
   — próximo passo, ainda não feito.
2. **Merge da branch `advanced-mode` para `main`** — só depois da revisão
   final e de o usuário revisar/aprovar. Não fazer sem pedido explícito.
3. **Push para o GitHub** (`git push` da branch e/ou do `main` atualizado) —
   só quando o usuário pedir.
4. **Deploy na Vercel** — segue pendente desde o MVP; o usuário adiou
   explicitamente ("deixa o deploy pra depois"). Precisa de `vercel login`
   (interativo) ou um token de acesso.

## Como retomar

Só falta a revisão final de código (superpowers:requesting-code-review,
comparando `advanced-mode` inteiro contra `main`) e depois
superpowers:finishing-a-development-branch — mas o merge/push em si
dependem de aprovação explícita do usuário.
