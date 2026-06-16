// ─── JurosService (browser) ───────────────────────────────────────────────────

class JurosService {
  calcularJurosSimples({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const i = taxa / 100;
    const montante = principal * (1 + i * periodo);
    return { principal, taxa, periodo, juros: this._r(montante - principal), montante: this._r(montante), tipo: "Simples" };
  }

  calcularJurosCompostos({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const montante = principal * Math.pow(1 + taxa / 100, periodo);
    return { principal, taxa, periodo, juros: this._r(montante - principal), montante: this._r(montante), tipo: "Composto" };
  }

  calcularTabelaPrice({ principal, taxa, periodo }) {
    this._validar({ principal, taxa, periodo });
    const i = taxa / 100;
    const fator = Math.pow(1 + i, periodo);
    const parcela = (principal * (i * fator)) / (fator - 1);
    const totalPago = parcela * periodo;
    const parcelas = [];
    let saldo = principal;
    for (let n = 1; n <= periodo; n++) {
      const jurosMes = saldo * i;
      const amort = parcela - jurosMes;
      saldo -= amort;
      parcelas.push({ numero: n, parcela: this._r(parcela), juros: this._r(jurosMes), amortizacao: this._r(amort), saldo: this._r(Math.max(0, saldo)) });
    }
    return { principal, taxa, periodo, parcela: this._r(parcela), totalPago: this._r(totalPago), totalJuros: this._r(totalPago - principal), parcelas, tipo: "Price" };
  }

  _validar({ principal, taxa, periodo }) {
    if (principal <= 0) throw new Error("Principal deve ser maior que zero.");
    if (taxa < 0) throw new Error("Taxa não pode ser negativa.");
    if (!Number.isInteger(periodo) || periodo <= 0) throw new Error("Período deve ser um número inteiro positivo.");
  }

  _r(v, d = 2) { return Math.round(v * 10 ** d) / 10 ** d; }
}

// ─── FormularioPage ────────────────────────────────────────────────────────────

class FormularioPage {
  constructor() { this._campos = {}; this._erros = []; }

  preencherFormulario({ principal, taxa, periodo, tipo }) {
    this._erros = [];
    this._campos = { principal, taxa, periodo, tipo: tipo || "simples" };
    return this;
  }

  validar() {
    this._erros = [];
    const { principal, taxa, periodo, tipo } = this._campos;
    if (principal === "" || principal == null) this._erros.push("O campo 'Principal' é obrigatório.");
    else if (isNaN(Number(principal)) || Number(principal) <= 0) this._erros.push("'Principal' deve ser maior que zero.");
    if (taxa === "" || taxa == null) this._erros.push("O campo 'Taxa' é obrigatório.");
    else if (isNaN(Number(taxa)) || Number(taxa) < 0) this._erros.push("'Taxa' deve ser não negativa.");
    if (periodo === "" || periodo == null) this._erros.push("O campo 'Período' é obrigatório.");
    else if (!Number.isInteger(Number(periodo)) || Number(periodo) <= 0) this._erros.push("'Período' deve ser inteiro positivo.");
    if (!["simples", "composto", "price"].includes(tipo)) this._erros.push("Tipo inválido.");
    return this._erros.length === 0;
  }

  obterDados() {
    return { principal: Number(this._campos.principal), taxa: Number(this._campos.taxa), periodo: Number(this._campos.periodo), tipo: this._campos.tipo };
  }

  obterErros() { return [...this._erros]; }
  limpar() { this._campos = {}; this._erros = []; return this; }
}

// ─── ResultadoPage ─────────────────────────────────────────────────────────────

class ResultadoPage {
  constructor() { this._resultado = null; this._visivel = false; }

  exibir(resultado) { this._resultado = resultado; this._visivel = true; return this; }
  estaVisivel() { return this._visivel; }
  obterResultadoBruto() { return { ...this._resultado }; }
  limpar() { this._resultado = null; this._visivel = false; return this; }

  formatar(v) {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  }
}

// ─── Controller / UI ──────────────────────────────────────────────────────────

const service    = new JurosService();
const formulario = new FormularioPage();
const resultado  = new ResultadoPage();

let tipoAtivo = "simples";

// Abas
document.querySelectorAll(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.remove("ativo"));
    btn.classList.add("ativo");
    tipoAtivo = btn.dataset.tipo;
  });
});

// Calcular
document.getElementById("btn-calcular").addEventListener("click", () => {
  const principal = document.getElementById("principal").value;
  const taxa      = document.getElementById("taxa").value;
  const periodo   = document.getElementById("periodo").value;

  formulario.preencherFormulario({ principal, taxa, periodo, tipo: tipoAtivo });

  const errosEl = document.getElementById("erros");
  const resultEl = document.getElementById("resultado");

  if (!formulario.validar()) {
    errosEl.style.display = "block";
    document.getElementById("erros-texto").innerHTML = formulario.obterErros().join("<br>");
    resultEl.style.display = "none";
    return;
  }

  errosEl.style.display = "none";
  const dados = formulario.obterDados();

  let calc;
  if (dados.tipo === "simples")   calc = service.calcularJurosSimples(dados);
  if (dados.tipo === "composto")  calc = service.calcularJurosCompostos(dados);
  if (dados.tipo === "price")     calc = service.calcularTabelaPrice(dados);

  resultado.exibir(calc);
  const r = resultado.obterResultadoBruto();

  // Badge
  document.getElementById("badge-tipo").textContent = r.tipo;

  // Grid métricas
  const grid = document.getElementById("grid-resultado");
  grid.innerHTML = "";

  const add = (label, valor, destaque = false) => {
    const d = document.createElement("div");
    d.className = "metrica";
    d.innerHTML = `<div class="metrica-label">${label}</div><div class="metrica-valor${destaque ? " destaque" : ""}" data-field="${label.toLowerCase().replace(/ /g,'-')}">${valor}</div>`;
    grid.appendChild(d);
  };

  const fmt = v => resultado.formatar(v);

  add("Principal", fmt(r.principal));
  add("Taxa", `${r.taxa}% a.m.`);
  add("Período", `${r.periodo} ${r.periodo === 1 ? "mês" : "meses"}`);

  if (r.tipo === "Price") {
    add("Parcela mensal", fmt(r.parcela), true);
    add("Total pago", fmt(r.totalPago));
    add("Total juros", fmt(r.totalJuros), true);

    // Tabela
    const tbody = document.getElementById("tabela-price-body");
    tbody.innerHTML = "";
    r.parcelas.forEach(p => {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${p.numero}</td><td>${fmt(p.parcela)}</td><td>${fmt(p.juros)}</td><td>${fmt(p.amortizacao)}</td><td>${fmt(p.saldo)}</td>`;
      tbody.appendChild(tr);
    });
    document.getElementById("tabela-price-wrap").style.display = "block";
  } else {
    add("Juros", fmt(r.juros), true);
    add("Montante final", fmt(r.montante), true);
    document.getElementById("tabela-price-wrap").style.display = "none";
  }

  resultEl.style.display = "block";
});

// Limpar
document.getElementById("btn-limpar").addEventListener("click", () => {
  ["principal", "taxa", "periodo"].forEach(id => document.getElementById(id).value = "");
  document.getElementById("resultado").style.display = "none";
  document.getElementById("erros").style.display = "none";
  formulario.limpar();
  resultado.limpar();
});
