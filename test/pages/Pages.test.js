/**
 * Testes — FormularioPage e ResultadoPage
 */

const { expect } = require("chai");
const FormularioPage = require("../../src/pages/FormularioPage");
const ResultadoPage  = require("../../src/pages/ResultadoPage");

// ─── FormularioPage ───────────────────────────────────────────────────────────

describe("FormularioPage", () => {
  let form;
  beforeEach(() => { form = new FormularioPage(); });

  describe("preencherFormulario()", () => {
    it("deve aceitar dados válidos sem erros", () => {
      form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12, tipo: "simples" });
      expect(form.validar()).to.be.true;
      expect(form.obterErros()).to.be.empty;
    });

    it("deve usar tipo 'simples' como padrão", () => {
      form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 12 });
      form.validar();
      expect(form.obterDados().tipo).to.equal("simples");
    });
  });

  describe("preencherCampo()", () => {
    it("deve atualizar um campo individual", () => {
      form.preencherFormulario({ principal: 500, taxa: 1, periodo: 6, tipo: "simples" });
      form.preencherCampo("principal", 2000);
      form.validar();
      expect(form.obterDados().principal).to.equal(2000);
    });

    it("deve lançar erro para campo desconhecido", () => {
      expect(() => form.preencherCampo("inexistente", 99)).to.throw('Campo desconhecido: "inexistente"');
    });
  });

  describe("validar() — erros", () => {
    it("deve rejeitar principal vazio", () => {
      form.preencherFormulario({ principal: "", taxa: 1, periodo: 6, tipo: "simples" });
      expect(form.validar()).to.be.false;
      expect(form.obterErros()).to.include("O campo 'Principal' é obrigatório.");
    });

    it("deve rejeitar principal zero", () => {
      form.preencherFormulario({ principal: 0, taxa: 1, periodo: 6, tipo: "simples" });
      expect(form.validar()).to.be.false;
    });

    it("deve rejeitar taxa negativa", () => {
      form.preencherFormulario({ principal: 1000, taxa: -0.5, periodo: 6, tipo: "simples" });
      expect(form.validar()).to.be.false;
      expect(form.obterErros()).to.include("A 'Taxa' deve ser um número não negativo.");
    });

    it("deve rejeitar período decimal", () => {
      form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 1.5, tipo: "simples" });
      expect(form.validar()).to.be.false;
    });

    it("deve rejeitar tipo inválido", () => {
      form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 6, tipo: "invalido" });
      expect(form.validar()).to.be.false;
    });

    it("deve aceitar taxa zero", () => {
      form.preencherFormulario({ principal: 1000, taxa: 0, periodo: 6, tipo: "simples" });
      expect(form.validar()).to.be.true;
    });

    it("deve aceitar todos os tipos válidos", () => {
      ["simples", "composto", "price"].forEach(tipo => {
        form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 6, tipo });
        expect(form.validar(), `tipo ${tipo} deve ser aceito`).to.be.true;
      });
    });
  });

  describe("obterDados()", () => {
    it("deve converter strings numéricas para Number", () => {
      form.preencherFormulario({ principal: "5000", taxa: "1.5", periodo: "24", tipo: "composto" });
      form.validar();
      const dados = form.obterDados();
      expect(dados.principal).to.equal(5000);
      expect(dados.taxa).to.equal(1.5);
      expect(dados.periodo).to.equal(24);
    });
  });

  describe("limpar()", () => {
    it("deve resetar campos e erros", () => {
      form.preencherFormulario({ principal: 1000, taxa: 1, periodo: 6, tipo: "simples" });
      form.validar();
      form.limpar();
      expect(form.obterErros()).to.be.empty;
    });
  });
});

// ─── ResultadoPage ────────────────────────────────────────────────────────────

describe("ResultadoPage", () => {
  let page;
  const resultadoSimples = { principal: 1000, taxa: 2, periodo: 6, juros: 120, montante: 1120, tipo: "Simples" };
  const resultadoPrice   = {
    principal: 10000, taxa: 1, periodo: 3,
    parcela: 3400.21, totalPago: 10200.63, totalJuros: 200.63, tipo: "Price",
    parcelas: [
      { numero: 1, parcela: 3400.21, juros: 100, amortizacao: 3300.21, saldo: 6699.79 },
      { numero: 2, parcela: 3400.21, juros: 66.99, amortizacao: 3333.22, saldo: 3366.57 },
      { numero: 3, parcela: 3400.21, juros: 33.66, amortizacao: 3366.55, saldo: 0.02  },
    ],
  };

  beforeEach(() => { page = new ResultadoPage(); });

  describe("exibir()", () => {
    it("deve marcar como visível após exibir resultado", () => {
      page.exibir(resultadoSimples);
      expect(page.estaVisivel()).to.be.true;
    });

    it("deve lançar erro para resultado inválido", () => {
      expect(() => page.exibir(null)).to.throw("Resultado inválido");
      expect(() => page.exibir("texto")).to.throw("Resultado inválido");
    });
  });

  describe("obterResumo() — Simples/Composto", () => {
    it("deve retornar campos corretos", () => {
      page.exibir(resultadoSimples);
      const resumo = page.obterResumo();
      expect(resumo).to.include.keys("tipo", "principal", "taxa", "periodo", "juros", "montante");
    });

    it("deve formatar valores como moeda BRL", () => {
      page.exibir(resultadoSimples);
      const resumo = page.obterResumo();
      expect(resumo.principal).to.include("R$");
      expect(resumo.montante).to.include("R$");
    });
  });

  describe("obterParcelas()", () => {
    it("deve retornar as parcelas para Tabela Price", () => {
      page.exibir(resultadoPrice);
      const parcelas = page.obterParcelas();
      expect(parcelas).to.have.lengthOf(3);
    });

    it("cada parcela deve ter campos formatados", () => {
      page.exibir(resultadoPrice);
      page.obterParcelas().forEach(p => {
        expect(p).to.have.all.keys("numero", "parcela", "juros", "amortizacao", "saldo");
        expect(p.parcela).to.include("R$");
      });
    });

    it("deve lançar erro ao pedir parcelas de resultado Simples", () => {
      page.exibir(resultadoSimples);
      expect(() => page.obterParcelas()).to.throw("Parcelas disponíveis apenas para Tabela Price.");
    });
  });

  describe("limpar()", () => {
    it("deve ocultar o resultado ao limpar", () => {
      page.exibir(resultadoSimples);
      page.limpar();
      expect(page.estaVisivel()).to.be.false;
    });

    it("deve lançar erro ao tentar obter resumo após limpar", () => {
      page.exibir(resultadoSimples);
      page.limpar();
      expect(() => page.obterResumo()).to.throw("Nenhum resultado está sendo exibido.");
    });
  });
});
