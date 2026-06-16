/**
 * Testes — JurosService
 * Cobre: Juros Simples, Compostos, Tabela Price e conversão de taxas.
 */

const { expect } = require("chai");
const JurosService = require("../../src/services/JurosService");

describe("JurosService", () => {
  let service;

  beforeEach(() => {
    service = new JurosService();
  });

  // ─── Juros Simples ──────────────────────────────────────────────────────────

  describe("calcularJurosSimples()", () => {
    it("deve calcular corretamente para R$1.000 a 2% por 6 meses", () => {
      const r = service.calcularJurosSimples({ principal: 1000, taxa: 2, periodo: 6 });
      expect(r.juros).to.equal(120);
      expect(r.montante).to.equal(1120);
      expect(r.tipo).to.equal("Simples");
    });

    it("deve retornar juros zero quando taxa é 0%", () => {
      const r = service.calcularJurosSimples({ principal: 5000, taxa: 0, periodo: 12 });
      expect(r.juros).to.equal(0);
      expect(r.montante).to.equal(5000);
    });

    it("deve calcular para período de 1 mês", () => {
      const r = service.calcularJurosSimples({ principal: 2000, taxa: 1.5, periodo: 1 });
      expect(r.juros).to.equal(30);
      expect(r.montante).to.equal(2030);
    });

    it("deve lançar erro quando principal é zero", () => {
      expect(() =>
        service.calcularJurosSimples({ principal: 0, taxa: 1, periodo: 6 })
      ).to.throw("Principal deve ser maior que zero.");
    });

    it("deve lançar erro quando principal é negativo", () => {
      expect(() =>
        service.calcularJurosSimples({ principal: -100, taxa: 1, periodo: 6 })
      ).to.throw("Principal deve ser maior que zero.");
    });

    it("deve lançar erro quando taxa é negativa", () => {
      expect(() =>
        service.calcularJurosSimples({ principal: 1000, taxa: -1, periodo: 6 })
      ).to.throw("Taxa não pode ser negativa.");
    });

    it("deve lançar erro quando período não é inteiro", () => {
      expect(() =>
        service.calcularJurosSimples({ principal: 1000, taxa: 1, periodo: 1.5 })
      ).to.throw("Período deve ser um número inteiro positivo.");
    });

    it("deve lançar erro quando período é zero", () => {
      expect(() =>
        service.calcularJurosSimples({ principal: 1000, taxa: 1, periodo: 0 })
      ).to.throw("Período deve ser um número inteiro positivo.");
    });
  });

  // ─── Juros Compostos ────────────────────────────────────────────────────────

  describe("calcularJurosCompostos()", () => {
    it("deve calcular corretamente R$1.000 a 1% por 12 meses", () => {
      const r = service.calcularJurosCompostos({ principal: 1000, taxa: 1, periodo: 12 });
      expect(r.montante).to.equal(1126.83);
      expect(r.juros).to.equal(126.83);
      expect(r.tipo).to.equal("Composto");
    });

    it("deve ser maior que juros simples para mesmo cenário", () => {
      const params = { principal: 1000, taxa: 2, periodo: 6 };
      const simples   = service.calcularJurosSimples(params);
      const composto  = service.calcularJurosCompostos(params);
      expect(composto.montante).to.be.above(simples.montante);
    });

    it("deve retornar montante igual ao principal quando taxa é 0%", () => {
      const r = service.calcularJurosCompostos({ principal: 3000, taxa: 0, periodo: 24 });
      expect(r.montante).to.equal(3000);
    });

    it("deve lançar erro para entradas inválidas", () => {
      expect(() =>
        service.calcularJurosCompostos({ principal: -500, taxa: 1, periodo: 6 })
      ).to.throw("Principal deve ser maior que zero.");
    });
  });

  // ─── Tabela Price ────────────────────────────────────────────────────────────

  describe("calcularTabelaPrice()", () => {
    it("deve calcular a parcela corretamente para R$10.000 a 1% por 12 meses", () => {
      const r = service.calcularTabelaPrice({ principal: 10000, taxa: 1, periodo: 12 });
      expect(r.parcela).to.equal(888.49);
      expect(r.tipo).to.equal("Price");
    });

    it("deve retornar exatamente 12 parcelas", () => {
      const r = service.calcularTabelaPrice({ principal: 10000, taxa: 1, periodo: 12 });
      expect(r.parcelas).to.have.lengthOf(12);
    });

    it("cada parcela deve ter os campos obrigatórios", () => {
      const r = service.calcularTabelaPrice({ principal: 5000, taxa: 1.5, periodo: 6 });
      r.parcelas.forEach((p) => {
        expect(p).to.have.all.keys("numero", "parcela", "juros", "amortizacao", "saldo");
      });
    });

    it("a soma das amortizações deve ser aproximadamente igual ao principal", () => {
      const r = service.calcularTabelaPrice({ principal: 10000, taxa: 1, periodo: 12 });
      const somaAmort = r.parcelas.reduce((acc, p) => acc + p.amortizacao, 0);
      expect(Math.round(somaAmort)).to.equal(10000);
    });

    it("o saldo final deve ser próximo de zero", () => {
      const r = service.calcularTabelaPrice({ principal: 10000, taxa: 1, periodo: 12 });
      const ultimo = r.parcelas[r.parcelas.length - 1];
      expect(ultimo.saldo).to.be.closeTo(0, 0.05);
    });

    it("o total pago deve ser maior que o principal", () => {
      const r = service.calcularTabelaPrice({ principal: 10000, taxa: 1, periodo: 12 });
      expect(r.totalPago).to.be.above(10000);
    });

    it("deve lançar erro para entradas inválidas", () => {
      expect(() =>
        service.calcularTabelaPrice({ principal: 1000, taxa: 1, periodo: 0 })
      ).to.throw("Período deve ser um número inteiro positivo.");
    });
  });

  // ─── Conversão de Taxas ──────────────────────────────────────────────────────

  describe("converterTaxaAnualMensal()", () => {
    it("deve converter 12% a.a. corretamente", () => {
      const mensal = service.converterTaxaAnualMensal(12);
      expect(mensal).to.be.closeTo(0.95, 0.01);
    });

    it("deve retornar 0 para taxa anual 0%", () => {
      expect(service.converterTaxaAnualMensal(0)).to.equal(0);
    });

    it("deve lançar erro para taxa negativa", () => {
      expect(() => service.converterTaxaAnualMensal(-5)).to.throw(
        "Taxa não pode ser negativa."
      );
    });
  });

  describe("converterTaxaMensalAnual()", () => {
    it("deve converter 1% a.m. para ~12.68% a.a.", () => {
      const anual = service.converterTaxaMensalAnual(1);
      expect(anual).to.be.closeTo(12.68, 0.01);
    });

    it("deve retornar 0 para taxa mensal 0%", () => {
      expect(service.converterTaxaMensalAnual(0)).to.equal(0);
    });

    it("deve ser inversa da conversão anual→mensal (ida e volta)", () => {
      const taxaAnual  = 18;
      const mensal     = service.converterTaxaAnualMensal(taxaAnual);
      const anualRecalc = service.converterTaxaMensalAnual(mensal);
      expect(anualRecalc).to.be.closeTo(taxaAnual, 0.05);
    });
  });
});
