/**
 * SistemaJuros — Controller principal
 * Orquestra FormularioPage, ResultadoPage e JurosService.
 */

const JurosService    = require("./services/JurosService");
const FormularioPage  = require("./pages/FormularioPage");
const ResultadoPage   = require("./pages/ResultadoPage");

class SistemaJuros {
  constructor() {
    this.service       = new JurosService();
    this.formulario    = new FormularioPage();
    this.resultado     = new ResultadoPage();
  }

  /**
   * Fluxo completo: preencher → validar → calcular → exibir
   */
  calcular({ principal, taxa, periodo, tipo }) {
    this.formulario.preencherFormulario({ principal, taxa, periodo, tipo });

    if (!this.formulario.validar()) {
      return { sucesso: false, erros: this.formulario.obterErros() };
    }

    const dados = this.formulario.obterDados();
    let resultado;

    switch (dados.tipo) {
      case "simples":
        resultado = this.service.calcularJurosSimples(dados);
        break;
      case "composto":
        resultado = this.service.calcularJurosCompostos(dados);
        break;
      case "price":
        resultado = this.service.calcularTabelaPrice(dados);
        break;
      default:
        return { sucesso: false, erros: [`Tipo inválido: ${dados.tipo}`] };
    }

    this.resultado.exibir(resultado);
    return { sucesso: true, resumo: this.resultado.obterResumo() };
  }

  limpar() {
    this.formulario.limpar();
    this.resultado.limpar();
  }
}

module.exports = SistemaJuros;
