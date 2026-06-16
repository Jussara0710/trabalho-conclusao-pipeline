/**
 * ResultadoPage — Page Object
 * Representa a camada de exibição dos resultados do cálculo.
 * Formata e organiza as informações para apresentação.
 */

class ResultadoPage {
  constructor() {
    this._resultado = null;
    this._visivel = false;
  }

  /**
   * Carrega e exibe um resultado de cálculo
   */
  exibir(resultado) {
    if (!resultado || typeof resultado !== "object") {
      throw new Error("Resultado inválido para exibição.");
    }
    this._resultado = resultado;
    this._visivel = true;
    return this;
  }

  /**
   * Verifica se há resultado sendo exibido
   */
  estaVisivel() {
    return this._visivel;
  }

  /**
   * Retorna o tipo de cálculo exibido
   */
  obterTipo() {
    this._assertVisivel();
    return this._resultado.tipo;
  }

  /**
   * Retorna o resumo formatado para exibição
   */
  obterResumo() {
    this._assertVisivel();
    const r = this._resultado;

    const base = {
      tipo: r.tipo,
      principal: this._formatar(r.principal),
      taxa: `${r.taxa}% a.m.`,
      periodo: `${r.periodo} ${r.periodo === 1 ? "mês" : "meses"}`,
    };

    if (r.tipo === "Price") {
      return {
        ...base,
        parcela: this._formatar(r.parcela),
        totalPago: this._formatar(r.totalPago),
        totalJuros: this._formatar(r.totalJuros),
      };
    }

    return {
      ...base,
      juros: this._formatar(r.juros),
      montante: this._formatar(r.montante),
    };
  }

  /**
   * Retorna as parcelas (apenas para Tabela Price)
   */
  obterParcelas() {
    this._assertVisivel();
    if (this._resultado.tipo !== "Price") {
      throw new Error("Parcelas disponíveis apenas para Tabela Price.");
    }
    return this._resultado.parcelas.map((p) => ({
      numero: p.numero,
      parcela: this._formatar(p.parcela),
      juros: this._formatar(p.juros),
      amortizacao: this._formatar(p.amortizacao),
      saldo: this._formatar(p.saldo),
    }));
  }

  /**
   * Retorna o resultado bruto (sem formatação)
   */
  obterResultadoBruto() {
    this._assertVisivel();
    return { ...this._resultado };
  }

  /**
   * Limpa o resultado exibido
   */
  limpar() {
    this._resultado = null;
    this._visivel = false;
    return this;
  }

  /**
   * Formata valor como moeda BRL
   */
  _formatar(valor) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  }

  _assertVisivel() {
    if (!this._visivel) {
      throw new Error("Nenhum resultado está sendo exibido.");
    }
  }
}

module.exports = ResultadoPage;
