/**
 * Testes E2E — Playwright
 * Testa a interface da calculadora de juros via browser.
 *
 * Estrutura:
 *  - Carregamento da página
 *  - Juros Simples
 *  - Juros Compostos
 *  - Tabela Price
 *  - Validação de erros
 *  - Fluxo de limpeza
 */

const { test, expect } = require("@playwright/test");
const { CalculadoraPage } = require("./pages/CalculadoraPage");

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Converte string de moeda pt-BR para número.
 * Ex: "R$ 1.120,00" → 1120
 */
function parseMoeda(str) {
  return parseFloat(
    str.replace(/R\$\s?/, "").replace(/\./g, "").replace(",", ".")
  );
}

// ─── Testes ──────────────────────────────────────────────────────────────────

test.describe("Calculadora de Juros — E2E", () => {
  let calc;

  test.beforeEach(async ({ page }) => {
    calc = new CalculadoraPage(page);
    await calc.abrir();
  });

  // ── Carregamento ────────────────────────────────────────────────────────────

  test.describe("Carregamento da página", () => {
    test("deve exibir o título principal", async ({ page }) => {
      await expect(page.locator("h1")).toContainText("Calculadora de Juros");
    });

    test("deve iniciar com a aba Simples ativa", async () => {
      await expect(calc.tabSimples).toHaveClass(/ativo/);
    });

    test("resultado deve estar oculto no carregamento", async () => {
      await expect(calc.resultado).toBeHidden();
    });

    test("erros devem estar ocultos no carregamento", async () => {
      await expect(calc.erros).toBeHidden();
    });
  });

  // ── Juros Simples ───────────────────────────────────────────────────────────

  test.describe("Juros Simples", () => {
    test.beforeEach(async () => {
      await calc.selecionarTipo("simples");
      await calc.preencherFormulario({ principal: 1000, taxa: 2, periodo: 6 });
      await calc.calcular();
    });

    test("deve exibir o resultado após cálculo", async () => {
      await expect(calc.resultado).toBeVisible();
    });

    test("badge deve indicar tipo 'Simples'", async () => {
      expect(await calc.obterBadgeTipo()).toBe("Simples");
    });

    test("deve calcular juros de R$ 120,00", async () => {
      const juros = parseMoeda(await calc.obterTextoMetrica("Juros"));
      expect(juros).toBeCloseTo(120, 0);
    });

    test("deve calcular montante de R$ 1.120,00", async () => {
      const montante = parseMoeda(await calc.obterTextoMetrica("Montante final"));
      expect(montante).toBeCloseTo(1120, 0);
    });

    test("não deve exibir tabela de parcelas", async () => {
      await expect(calc.tabelaPriceWrap).toBeHidden();
    });
  });

  // ── Juros Compostos ─────────────────────────────────────────────────────────

  test.describe("Juros Compostos", () => {
    test.beforeEach(async () => {
      await calc.selecionarTipo("composto");
      await calc.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12 });
      await calc.calcular();
    });

    test("deve exibir badge 'Composto'", async () => {
      expect(await calc.obterBadgeTipo()).toBe("Composto");
    });

    test("deve calcular montante aproximado de R$ 1.126,83", async () => {
      const montante = parseMoeda(await calc.obterTextoMetrica("Montante final"));
      expect(montante).toBeCloseTo(1126.83, 1);
    });

    test("montante composto deve ser maior que o simples para mesmo cenário", async ({ page }) => {
      // Calcula simples no mesmo cenário
      const calcSimples = new CalculadoraPage(page);
      await calcSimples.abrir();
      await calcSimples.selecionarTipo("simples");
      await calcSimples.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12 });
      await calcSimples.calcular();
      const montanteSimples = parseMoeda(await calcSimples.obterTextoMetrica("Montante final"));

      // Compara com o composto já calculado
      const montanteComposto = parseMoeda(await calc.obterTextoMetrica("Montante final"));
      expect(montanteComposto).toBeGreaterThan(montanteSimples);
    });
  });

  // ── Tabela Price ────────────────────────────────────────────────────────────

  test.describe("Tabela Price", () => {
    test.beforeEach(async () => {
      await calc.selecionarTipo("price");
      await calc.preencherFormulario({ principal: 10000, taxa: 1, periodo: 12 });
      await calc.calcular();
    });

    test("deve exibir badge 'Price'", async () => {
      expect(await calc.obterBadgeTipo()).toBe("Price");
    });

    test("deve exibir a tabela de parcelas", async () => {
      await expect(calc.tabelaPriceWrap).toBeVisible();
    });

    test("deve exibir exatamente 12 linhas na tabela", async () => {
      expect(await calc.obterQuantidadeLinhasTabela()).toBe(12);
    });

    test("parcela deve ser aproximadamente R$ 888,49", async () => {
      const parcela = parseMoeda(await calc.obterTextoMetrica("Parcela mensal"));
      expect(parcela).toBeCloseTo(888.49, 0);
    });

    test("total pago deve ser maior que o principal", async () => {
      const totalPago = parseMoeda(await calc.obterTextoMetrica("Total pago"));
      expect(totalPago).toBeGreaterThan(10000);
    });

    test("juros totais devem ser positivos", async () => {
      const juros = parseMoeda(await calc.obterTextoMetrica("Total juros"));
      expect(juros).toBeGreaterThan(0);
    });
  });

  // ── Validação de erros ──────────────────────────────────────────────────────

  test.describe("Validação de erros", () => {
    test("deve exibir erros ao calcular sem preencher campos", async () => {
      await calc.calcular();
      await expect(calc.erros).toBeVisible();
    });

    test("deve exibir erro para principal zero", async () => {
      await calc.preencherFormulario({ principal: 0, taxa: 1, periodo: 12 });
      await calc.calcular();
      const erros = await calc.obterTextoErros();
      expect(erros).toContain("Principal");
    });

    test("deve exibir erro para período não inteiro", async () => {
      await calc.preencherFormulario({ principal: 1000, taxa: 1, periodo: 1.5 });
      await calc.calcular();
      const erros = await calc.obterTextoErros();
      expect(erros).toContain("Período");
    });

    test("deve ocultar erros após cálculo válido", async () => {
      // Primeiro dispara erro
      await calc.calcular();
      await expect(calc.erros).toBeVisible();

      // Depois preenche corretamente
      await calc.preencherFormulario({ principal: 1000, taxa: 1, periodo: 6 });
      await calc.calcular();
      await expect(calc.erros).toBeHidden();
    });
  });

  // ── Limpeza ─────────────────────────────────────────────────────────────────

  test.describe("Fluxo de limpeza", () => {
    test("deve ocultar resultado ao clicar em Limpar", async () => {
      await calc.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12 });
      await calc.calcular();
      await expect(calc.resultado).toBeVisible();

      await calc.limpar();
      await expect(calc.resultado).toBeHidden();
    });

    test("deve limpar os campos do formulário", async ({ page }) => {
      await calc.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12 });
      await calc.calcular();
      await calc.limpar();

      expect(await page.locator("#principal").inputValue()).toBe("");
      expect(await page.locator("#taxa").inputValue()).toBe("");
      expect(await page.locator("#periodo").inputValue()).toBe("");
    });
  });
});
