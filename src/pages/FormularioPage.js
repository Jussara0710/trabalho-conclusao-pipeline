/**
 * FormularioPage — Page Object
 * Representa a camada de interface/formulário para entrada de dados.
 * Abstrai a interação com os campos e a validação de entrada.
 */

class FormularioPage {
  constructor() {
    this._campos = {
      principal: null,
      taxa: null,
      periodo: null,
      tipo: null,
    };
    this._erros = [];
  }

  /**
   * Preenche todos os campos do formulário
   */
  preencherFormulario({ principal, taxa, periodo, tipo }) {
    this._erros = [];
    this._campos.principal = principal;
    this._campos.taxa = taxa;
    this._campos.periodo = periodo;
    this._campos.tipo = tipo || "simples";
    return this;
  }

  /**
   * Preenche campo individual
   */
  preencherCampo(nome, valor) {
    if (!(nome in this._campos)) {
      throw new Error(`Campo desconhecido: "${nome}"`);
    }
    this._campos[nome] = valor;
    return this;
  }

  /**
   * Valida os dados do formulário
   */
  validar() {
    this._erros = [];

    const { principal, taxa, periodo, tipo } = this._campos;

    if (principal === null || principal === undefined || principal === "")
      this._erros.push("O campo 'Principal' é obrigatório.");
    else if (isNaN(Number(principal)) || Number(principal) <= 0)
      this._erros.push("O 'Principal' deve ser um número maior que zero.");

    if (taxa === null || taxa === undefined || taxa === "")
      this._erros.push("O campo 'Taxa' é obrigatório.");
    else if (isNaN(Number(taxa)) || Number(taxa) < 0)
      this._erros.push("A 'Taxa' deve ser um número não negativo.");

    if (periodo === null || periodo === undefined || periodo === "")
      this._erros.push("O campo 'Período' é obrigatório.");
    else if (!Number.isInteger(Number(periodo)) || Number(periodo) <= 0)
      this._erros.push("O 'Período' deve ser um inteiro positivo.");

    const tiposValidos = ["simples", "composto", "price"];
    if (!tiposValidos.includes(tipo))
      this._erros.push(`Tipo inválido. Use: ${tiposValidos.join(", ")}.`);

    return this._erros.length === 0;
  }

  /**
   * Retorna os dados normalizados para cálculo
   */
  obterDados() {
    return {
      principal: Number(this._campos.principal),
      taxa: Number(this._campos.taxa),
      periodo: Number(this._campos.periodo),
      tipo: this._campos.tipo,
    };
  }

  /**
   * Retorna erros de validação
   */
  obterErros() {
    return [...this._erros];
  }

  /**
   * Verifica se o formulário tem erros
   */
  temErros() {
    return this._erros.length > 0;
  }

  /**
   * Limpa o formulário
   */
  limpar() {
    this._campos = { principal: null, taxa: null, periodo: null, tipo: null };
    this._erros = [];
    return this;
  }
}

module.exports = FormularioPage;
