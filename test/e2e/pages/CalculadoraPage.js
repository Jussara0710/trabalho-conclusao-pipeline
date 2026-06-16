/**
 * CalculadoraPage — Page Object para Playwright
 * Encapsula todos os seletores e ações da interface da calculadora.
 */

class CalculadoraPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;

    // Campos
    this.inputPrincipal = page.locator("#principal");
    this.inputTaxa      = page.locator("#taxa");
    this.inputPeriodo   = page.locator("#periodo");

    // Botões
    this.btnCalcular = page.locator("#btn-calcular");
    this.btnLimpar   = page.locator("#btn-limpar");

    // Abas
    this.tabSimples  = page.locator("#tab-simples");
    this.tabComposto = page.locator("#tab-composto");
    this.tabPrice    = page.locator("#tab-price");

    // Resultado
    this.resultado         = page.locator("#resultado");
    this.erros             = page.locator("#erros");
    this.badgeTipo         = page.locator("#badge-tipo");
    this.gridResultado     = page.locator("#grid-resultado");
    this.tabelaPriceWrap   = page.locator("#tabela-price-wrap");
    this.tabelaPriceBody   = page.locator("#tabela-price-body tr");
  }

  async abrir() {
    await this.page.goto("/");
  }

  async selecionarTipo(tipo) {
    const abas = { simples: this.tabSimples, composto: this.tabComposto, price: this.tabPrice };
    await abas[tipo].click();
  }

  async preencherFormulario({ principal, taxa, periodo }) {
    await this.inputPrincipal.fill(String(principal));
    await this.inputTaxa.fill(String(taxa));
    await this.inputPeriodo.fill(String(periodo));
  }

  async calcular() {
    await this.btnCalcular.click();
  }

  async limpar() {
    await this.btnLimpar.click();
  }

  async obterTextoMetrica(label) {
    // Busca o elemento pelo label e retorna o valor da métrica irmã
    const metrica = this.page.locator(".metrica", { hasText: label });
    return metrica.locator(".metrica-valor").textContent();
  }

  async resultadoEstaVisivel() {
    return this.resultado.isVisible();
  }

  async errosEstaoVisiveis() {
    return this.erros.isVisible();
  }

  async obterTextoErros() {
    return this.page.locator("#erros-texto").textContent();
  }

  async obterBadgeTipo() {
    return this.badgeTipo.textContent();
  }

  async obterQuantidadeLinhasTabela() {
    return this.tabelaPriceBody.count();
  }
}

module.exports = { CalculadoraPage };
