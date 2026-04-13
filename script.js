console.log("✅ VERSION FIRESTORE ACTIVA"); {
  const res = {};
  gastos.forEach(g => {
    const mes = g.fecha.slice(0, 7);
    res[mes] = (res[mes] || 0) + g.monto;
  });
  return res;
}

// ===============================
// Tabla
// ===============================
async function renderTabla() {
  tabla.innerHTML = "";
  const gastos = await obtenerGastos();

  gastos.forEach(g => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${g.fecha}</td>
      <td>${g.categoria}</td>
      <td>$${g.monto}</td>
      <td>
        <button onclick='editarGasto(${JSON.stringify(g)})'>✏️</button>
        <button onclick="borrarGasto('${g.id}')">🗑️</button>
      </td>
    `;
    tabla.appendChild(tr);
  });
}

// ===============================
// Totales
// ===============================
async function renderTotales() {
  const gastos = await obtenerGastos();

  totalGeneralSpan.textContent =
    gastos.reduce((a, g) => a + g.monto, 0);

  const porMes = agruparPorMes(gastos);
  mesSelect.innerHTML = `<option value="">Todos</option>`;

  Object.keys(porMes).sort().forEach(m => {
    const o = document.createElement("option");
    o.value = m;
    o.textContent = m;
    mesSelect.appendChild(o);
  });

  mesSelect.value = mesSeleccionado;

  if (mesSeleccionado) {
    totalMesSpan.textContent = gastos
      .filter(g => g.fecha.startsWith(mesSeleccionado))
      .reduce((a, g) => a + g.monto, 0);
  } else {
    totalMesSpan.textContent =
      gastos.reduce((a, g) => a + g.monto, 0);
  }
}

// ===============================
// Gráficos
// ===============================
async function renderGraficoCategoria() {
  const gastos = await obtenerGastos();
  const totales = {};

  gastos.forEach(g =>
    totales[g.categoria] = (totales[g.categoria] || 0) + g.monto
  );

  const total = Object.values(totales).reduce((a, b) => a + b, 0);

  if (grafico) grafico.destroy();

  grafico = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(totales).map(
        c => `${c} (${((totales[c] / total) * 100).toFixed(1)}%)`
      ),
      datasets: [{ data: Object.values(totales) }]
    },
    options: {
      plugins: {
        title: { display: true, text: "Distribución por categoría" },
        legend: { position: "bottom" }
      }
    }
  });
}

async function renderGraficoMensual() {
  const gastos = await obtenerGastos();
  const porMes = agruparPorMes(gastos);
  const meses = Object.keys(porMes).sort();

  if (grafico) grafico.destroy();

  grafico = new Chart(canvas, {
    type: "bar",
    data: {
      labels: meses,
      datasets: [{
        label: "Total mensual",
        data: meses.map(m => porMes[m])
      }]
    },
    options: {
      plugins: {
        title: { display: true, text: "Comparativa mensual" }
      }
    }
  });
}

// ===============================
// CRUD
// ===============================
function editarGasto(g) {
  fecha.value = g.fecha;
  categoria.value = g.categoria;
  monto.value = g.monto;
  gastoEditandoId = g.id;
}

async function borrarGasto(id) {
  if (!confirm("¿Eliminar gasto?")) return;
  await db.collection("gastos").doc(id).delete();
  await refrescarUI();
}

form.addEventListener("submit", async e => {
  e.preventDefault();

  const gasto = {
    fecha: fecha.value,
    categoria: categoria.value,
    monto: Number(monto.value)
  };

  if (gastoEditandoId) {
    await db.collection("gastos").doc(gastoEditandoId).update(gasto);
    gastoEditandoId = null;
  } else {
    await db.collection("gastos").add(gasto);
  }

  form.reset();
  await refrescarUI();
});

// ===============================
// Eventos
// ===============================
btnFiltrar.onclick = async () => {
  filtroDesde = desde.value || null;
  filtroHasta = hasta.value || null;
  await refrescarUI();
};

btnLimpiar.onclick = async () => {
  filtroDesde = null;
  filtroHasta = null;
  desde.value = "";
  hasta.value = "";
  await refrescarUI();
};

mesSelect.onchange = async () => {
  mesSeleccionado = mesSelect.value;
  await refrescarUI();
};

tipoGraficoSelect.onchange = async () => {
  await refrescarUI();
};

// ===============================
// Refresco general
// ===============================
async function refrescarUI() {
  await renderTabla();
  await renderTotales();

  if (tipoGraficoSelect.value === "mes") {
    await renderGraficoMensual();
  } else {
    await renderGraficoCategoria();
  }
}

refrescarUI();


// DOM
const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

const totalGeneralSpan = document.getElementById("total-general");
const totalMesSpan = document.getElementById("total-mes");
const mesSelect = document.getElementById("mes-select");
const tipoGraficoSelect = document.getElementById("tipo-grafico");

const btnFiltrar = document.getElementById("btn-filtrar");
const btnLimpiar = document.getElementById("btn-limpiar");

let grafico = null;
let gastoEditandoId = null;

let filtroDesde = null;
let filtroHasta = null;
let mesSeleccionado = "";

// ===============================
// Firestore
// ===============================
async function obtenerGastos() {
  let query = db.collection("gastos");

  if (filtroDesde) query = query.where("fecha", ">=", filtroDesde);
  if (filtroHasta) query = query.where("fecha", "<=", filtroHasta);

  query = query.orderBy("fecha");

  const snapshot = await query.get();
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ===============================
// Utilidades
// ===============================
