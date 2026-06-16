#  Calculadora de Juros — TCD

Sistema de cálculo de juros (Simples, Composto e Tabela Price) com testes automatizados e pipeline CI/CD via **GitHub Actions**.

---

## Estrutura do Projeto

```
juros-system/
├── .github/
│   └── workflows/
│       └── ci.yml              ← Pipeline GitHub Actions
├── public/
│   ├── index.html              ← Interface web
│   └── app.js                  ← Lógica no browser
├── src/
│   ├── services/
│   │   └── JurosService.js     ← Cálculos: Simples, Composto, Price
│   ├── pages/
│   │   ├── FormularioPage.js   ← Page Object: validação de entrada
│   │   └── ResultadoPage.js    ← Page Object: formatação de saída
│   └── SistemaJuros.js         ← Controller principal
├── test/
│   ├── services/
│   │   └── JurosService.test.js   ← Mocha: testes de lógica (28 casos)
│   ├── pages/
│   │   └── Pages.test.js          ← Mocha: testes dos Page Objects (19 casos)
│   └── e2e/
│       ├── pages/
│       │   └── CalculadoraPage.js ← Page Object do Playwright
│       └── calculadora.spec.js    ← Playwright: testes E2E (17 casos)
├── playwright.config.js
└── package.json
```

---

## Como Rodar Localmente

### Pré-requisitos
- Node.js 18+
- npm

### Instalação
```bash
npm install
npx playwright install chromium
```

### Comandos disponíveis

| Comando | O que faz |
|---|---|
| `npm run test:unit` | Roda os testes Mocha (unitários) |
| `npm run test:e2e` | Roda os testes Playwright (E2E) |
| `npm run test:all` | Roda todos os testes em sequência |
| `npm run serve` | Sobe a interface em http://localhost:4321 |

---

##  Pipeline — GitHub Actions

### Arquivo: `.github/workflows/ci.yml`

A pipeline está dividida em **3 jobs** que executam em sequência:

```
push / schedule / manual
        │
        ▼
┌─────────────────────┐
│  Job 1: Mocha       │  ← testes unitários
│  (47 testes)        │
└────────┬────────────┘
         │ sucesso
         ▼
┌─────────────────────┐
│  Job 2: Playwright  │  ← testes E2E no browser
│  (17 testes)        │
└────────┬────────────┘
         │ sempre
         ▼
┌─────────────────────┐
│  Job 3: Resumo      │  ← tabela de resultado no Summary
└─────────────────────┘
```

### Formas de disparo

| Forma | Como funciona |
|---|---|
| **Push** | Roda automaticamente ao fazer `git push` em qualquer branch |
| **Pull Request** | Roda ao abrir/atualizar um PR para `main` ou `master` |
| **Agendado** | Roda todo dia às 06:00 UTC (03:00 BRT) via `cron` |
| **Manual** | Acionado pela aba **Actions → Run workflow** no GitHub |

### Como disparar manualmente
1. Acesse seu repositório no GitHub
2. Clique na aba **Actions**
3. Selecione **CI - Calculadora de Juros**
4. Clique em **Run workflow**
5. Escolha o ambiente e confirme

---

##  Relatórios

Após cada execução, os relatórios ficam disponíveis na aba **Actions → (execução) → Artifacts**:

| Artefato | Conteúdo | Retenção |
|---|---|---|
| `relatorio-mocha` | JSON com resultado dos 47 testes unitários | 30 dias |
| `relatorio-playwright-html` | Relatório visual HTML com screenshots | 30 dias |
| `relatorio-playwright-json` | JSON com resultado dos 17 testes E2E | 30 dias |

O **Summary** de cada execução exibe uma tabela com o status de cada job diretamente na interface do GitHub, sem precisar baixar artefatos.

---

## Testes

### Testes Unitários — Mocha + Chai

Framework: **Mocha** com assertions via **Chai** (`expect`).

Testam a lógica pura JavaScript, sem browser:

- `JurosService` — cálculos de Juros Simples, Composto, Price e conversão de taxas
- `FormularioPage` — validação de campos, normalização de dados
- `ResultadoPage` — formatação de valores, exibição de parcelas

```bash
npm run test:unit
# 47 passing
```

### Testes E2E — Playwright

Framework: **Playwright** com Page Object Pattern.

Testam a interface real no browser (Chromium):

- Carregamento da página
- Cálculo de Juros Simples, Compostos e Tabela Price
- Validação de erros no formulário
- Fluxo de limpeza

```bash
npm run test:e2e
# 17 passed
```

---

## Conceitos Aplicados

### Page Object Pattern
Cada tela/componente tem sua própria classe que encapsula seletores e ações. Isso evita repetição e facilita manutenção:

```
FormularioPage  →  abstrai os campos de entrada e validação
ResultadoPage   →  abstrai a exibição e formatação dos resultados
CalculadoraPage →  abstrai os seletores do browser para o Playwright
```

### Separação de responsabilidades
```
Service  →  lógica de negócio (cálculos)
Page     →  camada de interface (entrada/saída)
Test     →  verificação de comportamento
```

### Pipeline CI/CD
- **CI (Integração Contínua):** a cada push, os testes rodam automaticamente, garantindo que nenhuma alteração quebre o sistema
- **Artefatos:** relatórios são salvos na pipeline para auditoria
- **Jobs encadeados:** o job de E2E só roda se os testes unitários passarem

---

## Fórmulas Utilizadas

| Tipo | Fórmula |
|---|---|
| Juros Simples | `M = P × (1 + i × t)` |
| Juros Compostos | `M = P × (1 + i)^t` |
| Tabela Price (parcela) | `PMT = PV × [i×(1+i)^n] / [(1+i)^n - 1]` |

Onde: `P/PV` = principal, `i` = taxa decimal, `t/n` = períodos, `M` = montante
