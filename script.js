const KEY = "plprime_produtos_v1";

const produtosPadrao = [
  { id: 1, nome: "Camiseta BMW", categoria: "camisetas", preco: 59.9, emoji: "👕", foto: "" },
  { id: 2, nome: "Tenis BMW", categoria: "tenis", preco: 149.9, emoji: "👟", foto: "" },
  { id: 3, nome: "NOVA CAMISA BRASIL STYLE", categoria: "camisetas", preco: 189.9, emoji: "👕", foto: "" },
  { id: 4, nome: "Blusa Moletom", categoria: "camisetas", preco: 129.9, emoji: "🧥", foto: "" },
  { id: 5, nome: "Cinto Couro", categoria: "acessorios", preco: 79.9, emoji: "👜", foto: "" },
  { id: 6, nome: "Saia Jeans", categoria: "calcas", preco: 119.9, emoji: "👚", foto: "" }
];

function loadProdutos(){
  try{
    const raw = localStorage.getItem(KEY);
    const data = raw ? JSON.parse(raw) : null;
    return (Array.isArray(data) && data.length) ? data : produtosPadrao;
  } catch {
    return produtosPadrao;
  }
}

let produtos = loadProdutos();

// ✅ Novidades: pega os 3 primeiros produtos (assim não depende de IDs fixos)
function getNovidades(){
  return produtos.slice(0, 3);
}

const carrinho = new Map();

const gridNovidades = document.getElementById("gridNovidades");
const gridColecao = document.getElementById("gridColecao");
const qtdCarrinho = document.getElementById("qtdCarrinho");
const totalCarrinho = document.getElementById("totalCarrinho");
const itensCarrinho = document.getElementById("itensCarrinho");

const modalCarrinho = document.getElementById("modalCarrinho");
const btnCarrinho = document.getElementById("btnCarrinho");
const overlayCarrinho = document.getElementById("overlayCarrinho");
const fecharCarrinho = document.getElementById("fecharCarrinho");

const linkWhats = document.getElementById("linkWhats");
const checkoutWhats = document.getElementById("checkoutWhats");

document.getElementById("ano").textContent = new Date().getFullYear();

// ✅ WhatsApp: 55 + DDD + número (SEM +, sem espaço, sem traço)
const WHATS_NUMERO = "5511992414612";

function formatBRL(v){
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ✅ Card com FOTO (URL) se existir, senão emoji
function criaCardProduto(p){
  const div = document.createElement("div");
  div.className = "card";

  const temFoto = p.foto && String(p.foto).trim().length > 0;

  div.innerHTML = `
    <div class="product__img" style="overflow:hidden;">
      ${
        temFoto
          ? `<img src="${p.foto}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:14px;">`
          : `<span style="font-size:38px;">${p.emoji || "🛍️"}</span>`
      }
    </div>
    <div>
      <strong>${p.nome}</strong>
      <div class="muted small">Categoria: ${p.categoria}</div>
    </div>
    <div class="product__row">
      <span class="price">${formatBRL(p.preco)}</span>
      <button class="btn btn--ghost" data-add="${p.id}">Adicionar</button>
    </div>
  `;
  return div;
}

function renderProdutos(lista, container){
  container.innerHTML = "";
  lista.forEach(p => container.appendChild(criaCardProduto(p)));
}

function atualizaCarrinhoUI(){
  let totalQtd = 0;
  let total = 0;

  itensCarrinho.innerHTML = "";

  for (const [id, qtd] of carrinho.entries()){
    const p = produtos.find(x => x.id === id);
    if (!p) continue;

    totalQtd += qtd;
    total += Number(p.preco) * qtd;

    const item = document.createElement("div");
    item.className = "cart__item";
    item.innerHTML = `
      <div>
        <strong>${p.nome}</strong>
        <div class="muted small">${qtd} x ${formatBRL(p.preco)}</div>
      </div>
      <div style="display:flex; gap:6px; align-items:center;">
        <button class="btn btn--ghost" data-dec="${id}">-</button>
        <button class="btn btn--ghost" data-inc="${id}">+</button>
      </div>
    `;
    itensCarrinho.appendChild(item);
  }

  qtdCarrinho.textContent = totalQtd;
  totalCarrinho.textContent = formatBRL(total);

  const msg = montaMensagemWhats();
  checkoutWhats.href = `https://wa.me/${WHATS_NUMERO}?text=${encodeURIComponent(msg)}`;
  linkWhats.href = `https://wa.me/${WHATS_NUMERO}?text=${encodeURIComponent("Oi! Quero saber mais sobre os produtos :)")}`;
}

function montaMensagemWhats(){
  if (carrinho.size === 0) return "Olá! Quero comprar na loja. Pode me ajudar?";
  let linhas = ["Olá! Quero finalizar meu pedido:", ""];
  for (const [id, qtd] of carrinho.entries()){
    const p = produtos.find(x => x.id === id);
    if (!p) continue;
    linhas.push(`- ${p.nome} (x${qtd}) — ${formatBRL(p.preco)}`);
  }
  linhas.push("");
  linhas.push(`Total: ${totalCarrinho.textContent}`);
  return linhas.join("\n");
}

function addProduto(id){
  carrinho.set(id, (carrinho.get(id) || 0) + 1);
  atualizaCarrinhoUI();
}
function incProduto(id){ addProduto(id); }
function decProduto(id){
  const atual = carrinho.get(id) || 0;
  if (atual <= 1) carrinho.delete(id);
  else carrinho.set(id, atual - 1);
  atualizaCarrinhoUI();
}

function abreCarrinho(){
  modalCarrinho.classList.add("is-open");
  modalCarrinho.setAttribute("aria-hidden", "false");
}
function fechaCarrinho(){
  modalCarrinho.classList.remove("is-open");
  modalCarrinho.setAttribute("aria-hidden", "true");
}

document.addEventListener("click", (e) => {
  const add = e.target.closest("[data-add]");
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");

  if (add) addProduto(Number(add.dataset.add));
  if (inc) incProduto(Number(inc.dataset.inc));
  if (dec) decProduto(Number(dec.dataset.dec));
});

btnCarrinho.addEventListener("click", abreCarrinho);
overlayCarrinho.addEventListener("click", fechaCarrinho);
fecharCarrinho.addEventListener("click", fechaCarrinho);

// ✅ filtros (se a categoria do produto bater com o data-filter do botão)
document.querySelectorAll(".chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".chip").forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");

    const f = btn.dataset.filter;
    const lista = (f === "todos") ? produtos : produtos.filter(p => p.categoria === f);
    renderProdutos(lista, gridColecao);
  });
});

// ✅ Recarrega produtos caso você tenha alterado no admin e voltou pra loja
function recarregarProdutos(){
  produtos = loadProdutos();
  renderProdutos(getNovidades(), gridNovidades);
  renderProdutos(produtos, gridColecao);
  atualizaCarrinhoUI();
}

// inicial
recarregarProdutos();

// se voltar pra aba e tiver mudado no admin, atualiza também
window.addEventListener("focus", recarregarProdutos);