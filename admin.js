const KEY = "plprime_produtos_v1";
const AUTH_KEY = "plprime_admin_auth_v1";

// ✅ senha simples (troque se quiser)
const ADMIN_PASSWORD = "plprime123";

const padrao = [
  { id: 1, nome: "Camiseta BMW", categoria: "camisetas", preco: 59.9, emoji: "👕", foto: "" },
  { id: 2, nome: "Tenis BMW", categoria: "tenis", preco: 149.9, emoji: "👟", foto: "" },
  { id: 3, nome: "NOVA CAMISA BRASIL STYLE", categoria: "camisetas", preco: 189.9, emoji: "👕", foto: "" },
  { id: 4, nome: "Blusa Moletom", categoria: "camisetas", preco: 129.9, emoji: "🧥", foto: "" },
  { id: 5, nome: "Cinto Couro", categoria: "acessorios", preco: 79.9, emoji: "👜", foto: "" },
  { id: 6, nome: "Saia Jeans", categoria: "calcas", preco: 119.9, emoji: "👚", foto: "" }
];

function load(){
  const raw = localStorage.getItem(KEY);
  const data = raw ? JSON.parse(raw) : null;
  return Array.isArray(data) ? data : null;
}
function save(produtos){
  localStorage.setItem(KEY, JSON.stringify(produtos));
}
function nextId(produtos){
  return produtos.length ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
}
function formatBRL(v){
  return Number(v).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
function isAuthed(){
  return localStorage.getItem(AUTH_KEY) === "1";
}
function setAuthed(v){
  localStorage.setItem(AUTH_KEY, v ? "1" : "0");
}

const loginBox = document.getElementById("loginBox");
const painel = document.getElementById("painel");
const adminPass = document.getElementById("adminPass");
const btnLogin = document.getElementById("btnLogin");
const btnHint = document.getElementById("btnHint");
const hint = document.getElementById("hint");

const formTitulo = document.getElementById("formTitulo");
const elNome = document.getElementById("nome");
const elPreco = document.getElementById("preco");
const elCategoria = document.getElementById("categoria");
const elEmoji = document.getElementById("emoji");
const elFoto = document.getElementById("foto");

const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");

const btnSalvar = document.getElementById("btnSalvar");
const btnCancelar = document.getElementById("btnCancelar");
const btnLimparTudo = document.getElementById("btnLimparTudo");
const btnResetar = document.getElementById("btnResetar");
const btnSair = document.getElementById("btnSair");
const btnExportar = document.getElementById("btnExportar");

const busca = document.getElementById("busca");
const lista = document.getElementById("lista");

let editId = null;

function showPainel(){
  loginBox.style.display = "none";
  painel.style.display = "block";
}
function showLogin(){
  painel.style.display = "none";
  loginBox.style.display = "block";
}

function getProdutos(){
  return load() ?? padrao;
}

function setPreview(url){
  const u = (url || "").trim();
  if (!u){
    preview.style.display = "none";
    previewImg.src = "";
    return;
  }
  preview.style.display = "block";
  previewImg.src = u;
}

elFoto.addEventListener("input", () => setPreview(elFoto.value));

function limparForm(){
  editId = null;
  formTitulo.textContent = "Novo produto";
  elNome.value = "";
  elPreco.value = "";
  elCategoria.value = "camisetas";
  elEmoji.value = "";
  elFoto.value = "";
  setPreview("");
  btnCancelar.style.display = "none";
}

function preencherForm(p){
  editId = p.id;
  formTitulo.textContent = `Editando: ${p.nome}`;
  elNome.value = p.nome ?? "";
  elPreco.value = p.preco ?? "";
  elCategoria.value = p.categoria ?? "camisetas";
  elEmoji.value = p.emoji ?? "";
  elFoto.value = p.foto ?? "";
  setPreview(elFoto.value);
  btnCancelar.style.display = "inline-flex";
}

function render(){
  const q = (busca.value || "").trim().toLowerCase();
  const produtos = getProdutos()
    .filter(p => (p.nome || "").toLowerCase().includes(q));

  lista.innerHTML = "";

  produtos.forEach(p => {
    const row = document.createElement("div");
    row.className = "cart__item";

    const hasFoto = p.foto && p.foto.trim().length > 0;

    row.innerHTML = `
      <div style="display:flex; gap:10px; align-items:center;">
        <div style="width:54px;height:54px;border-radius:14px;border:1px solid var(--line);overflow:hidden;background:#0b0c10;display:flex;align-items:center;justify-content:center;">
          ${
            hasFoto
              ? `<img src="${p.foto}" alt="${p.nome}" style="width:100%;height:100%;object-fit:cover;">`
              : `<span style="font-size:22px;">${p.emoji || "🛍️"}</span>`
          }
        </div>

        <div>
          <strong>${p.nome}</strong>
          <div class="muted small">
            ${p.categoria} • ${formatBRL(p.preco)}
          </div>
          ${hasFoto ? `<div class="muted small">foto: ok</div>` : `<div class="muted small">sem foto</div>`}
        </div>
      </div>

      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn btn--ghost" data-edit="${p.id}">Editar</button>
        <button class="btn btn--ghost" data-del="${p.id}">Excluir</button>
      </div>
    `;

    lista.appendChild(row);
  });
}

document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  const edit = e.target.closest("[data-edit]");

  if (del){
    const id = Number(del.dataset.del);
    if (!confirm("Excluir este produto?")) return;
    const produtos = getProdutos().filter(p => p.id !== id);
    save(produtos);
    if (editId === id) limparForm();
    render();
  }

  if (edit){
    const id = Number(edit.dataset.edit);
    const p = getProdutos().find(x => x.id === id);
    if (p) preencherForm(p);
  }
});

btnSalvar.addEventListener("click", () => {
  const nome = elNome.value.trim();
  const preco = Number(elPreco.value);
  const categoria = elCategoria.value;
  const emoji = (elEmoji.value.trim() || "🛍️");
  const foto = elFoto.value.trim();

  if (!nome || !preco || preco <= 0){
    alert("Preencha nome e preço certinho 🙂");
    return;
  }

  const produtos = getProdutos();

  if (editId){
    const idx = produtos.findIndex(p => p.id === editId);
    if (idx >= 0){
      produtos[idx] = { ...produtos[idx], nome, preco, categoria, emoji, foto };
    }
  } else {
    produtos.push({ id: nextId(produtos), nome, preco, categoria, emoji, foto });
  }

  save(produtos);
  limparForm();
  render();
});

btnCancelar.addEventListener("click", limparForm);

btnLimparTudo.addEventListener("click", () => {
  if (!confirm("Apagar todos os produtos?")) return;
  save([]);
  limparForm();
  render();
});

btnResetar.addEventListener("click", () => {
  if (!confirm("Restaurar produtos padrão?")) return;
  save(padrao);
  limparForm();
  render();
});

busca.addEventListener("input", render);

btnExportar.addEventListener("click", () => {
  const produtos = getProdutos();
  const blob = new Blob([JSON.stringify(produtos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "produtos-plprime.json";
  a.click();

  URL.revokeObjectURL(url);
});

btnSair.addEventListener("click", () => {
  setAuthed(false);
  showLogin();
});

btnLogin.addEventListener("click", () => {
  const pass = adminPass.value;
  if (pass === ADMIN_PASSWORD){
    setAuthed(true);
    showPainel();
    render();
  } else {
    alert("Senha incorreta.");
  }
});

btnHint.addEventListener("click", () => {
  hint.style.display = (hint.style.display === "none") ? "block" : "none";
});

// init
if (isAuthed()){
  showPainel();
  render();
} else {
  showLogin();
}
limparForm();