/**
 * JurosService — lógica de cálculo de juros
 * Suporta: Simples, Composto e Price (Tabela Price)
 */

class JurosService {
  /**
   * Juros Simples
   * M = P * (1 + i * t)
   */
  calcularJurosSimples({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const taxaDecimal = taxa / 100;
    const montante = principal * (1 + taxaDecimal * periodo);
    const juros = montante - principal;
    return {
      principal,
      taxa,
      periodo,
      juros: this._arredondar(juros),
      montante: this._arredondar(montante),
      tipo: "Simples",
    };
  }

  /**
   * Juros Compostos
   * M = P * (1 + i)^t
   */
  calcularJurosCompostos({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const taxaDecimal = taxa / 100;
    const montante = principal * Math.pow(1 + taxaDecimal, periodo);
    const juros = montante - principal;
    return {
      principal,
      taxa,
      periodo,
      juros: this._arredondar(juros),
      montante: this._arredondar(montante),
      tipo: "Composto",
    };
  }

  /**
   * Tabela Price — parcelas fixas
   * PMT = PV * [i*(1+i)^n] / [(1+i)^n - 1]
   */
  calcularTabelaPrice({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const i = taxa / 100;
    const fator = Math.pow(1 + i, periodo);
    const parcela = (principal * (i * fator)) / (fator - 1);
    const totalPago = parcela * periodo;
    const totalJuros = totalPago - principal;

    const parcelas = [];
    let saldo = principal;
    for (let n = 1; n <= periodo; n++) {
      const jurosMes = saldo * i;
      const amortizacao = parcela - jurosMes;
      saldo -= amortizacao;
      parcelas.push({
        numero: n,
        parcela: this._arredondar(parcela),
        juros: this._arredondar(jurosMes),
        amortizacao: this._arredondar(amortizacao),
        saldo: this._arredondar(Math.max(0, saldo)),
      });
    }

    return {
      principal,
      taxa,
      periodo,
      parcela: this._arredondar(parcela),
      totalPago: this._arredondar(totalPago),
      totalJuros: this._arredondar(totalJuros),
      parcelas,
      tipo: "Price",
    };
  }

  /**
   * Taxa Efetiva Anual → Mensal
   */
  converterTaxaAnualMensal(taxaAnual) {
    if (taxaAnual < 0) throw new Error("Taxa não pode ser negativa.");
    return this._arredondar((Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100);
  }

  /**
   * Taxa Efetiva Mensal → Anual
   */
  converterTaxaMensalAnual(taxaMensal) {
    if (taxaMensal < 0) throw new Error("Taxa não pode ser negativa.");
    return this._arredondar(
      (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100
    );
  }

  _validar({ principal, taxa, periodo }) {
    if (principal <= 0) throw new Error("Principal deve ser maior que zero.");
    if (taxa < 0) throw new Error("Taxa não pode ser negativa.");
    if (!Number.isInteger(periodo) || periodo <= 0)
      throw new Error("Período deve ser um número inteiro positivo.");
  }

  _arredondar(valor, casas = 2) {
    return Math.round(valor * Math.pow(10, casas)) / Math.pow(10, casas);
  }
}

module.exports = JurosService;
