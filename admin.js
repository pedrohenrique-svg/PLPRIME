const KEY = "plprime_produtos_v1";

function load(){
  const raw = localStorage.getItem(KEY);
  const data = raw ? JSON.parse(raw) : null;
  return Array.isArray(data) ? data : [];
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

const nome = document.getElementById("nome");
const preco = document.getElementById("preco");
const categoria = document.getElementById("categoria");
const foto = document.getElementById("foto");
const lista = document.getElementById("lista");

const preview = document.getElementById("preview");
const previewImg = document.getElementById("previewImg");

document.getElementById("btnAdd").addEventListener("click", () => {
  const n = nome.value.trim();
  const p = Number(preco.value);
  const c = categoria.value;
  const f = foto.value.trim();

  if (!n || !p || p <= 0){
    alert("Preencha nome e preço certinho 🙂");
    return;
  }

  const produtos = load();
  produtos.push({ id: nextId(produtos), nome: n, preco: p, categoria: c, foto: f, emoji: "🛍️" });
  save(produtos);

  nome.value = "";
  preco.value = "";
  foto.value = "";
  preview.style.display = "none";
  render();
});

document.getElementById("btnLimpar").addEventListener("click", () => {
  if (!confirm("Apagar todos os produtos?")) return;
  save([]);
  render();
});

foto.addEventListener("input", () => {
  const u = foto.value.trim();
  if (!u){
    preview.style.display = "none";
    previewImg.src = "";
    return;
  }
  preview.style.display = "block";
  previewImg.src = u;
});

document.addEventListener("click", (e) => {
  const del = e.target.closest("[data-del]");
  if (!del) return;

  const id = Number(del.dataset.del);
  const produtos = load().filter(p => p.id !== id);
  save(produtos);
  render();
});

function render(){
  const produtos = load();
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
              : `<span style="font-size:22px;">🛍️</span>`
          }
        </div>
        <div>
          <strong>${p.nome}</strong>
          <div class="muted small">${p.categoria} • ${formatBRL(p.preco)}</div>
        </div>
      </div>
      <button class="btn btn--ghost" data-del="${p.id}">Excluir</button>
    `;
    lista.appendChild(row);
  });

  if (produtos.length === 0){
    lista.innerHTML = `<p class="muted">Nenhum produto cadastrado ainda.</p>`;
  }
}

render();