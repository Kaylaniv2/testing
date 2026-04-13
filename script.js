console.log("✅ VERSION FIRESTORE ACTIVA");

// ===============================
// Referencias al DOM
// ===============================
const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

const totalGeneralSpan = document.getElementById("total-general");
const btnFiltrar = document.getElementById("btn-filtrar");
const btnLimpiar = document.getElementById("btn-limpiar");

let grafico = null;
let gastoEditandoId = null;

let filtroDesde = null;
let filtroHasta = null;

// ===============================
// Obtener gastos desde Firestore
// ===============================
async function obtenerGastos() {
  try {
    let query = db.collection("gastos");

    if (filtroDesde) query = query.where("fecha", ">=", filtroDesde);
    if (filtroHasta) query = query.where("fecha", "<=", filtroHasta);

    query = query.orderBy("fecha");

    const snapshot = await query.get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("❌ Error obteniendo gastos:", error);
    return [];
  }
}

// ===============================
// Renderizar tabla (EXTENDIDA)
// ===============================
async function renderTabla() {
  tabla.innerHTML = "";

  const gastos = await obtenerGastos();

  gastos.forEach(gasto => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${gasto.fecha}</td>
      <td>${gasto.categoria}</td>
      <td>$${gasto.monto}</td>
      <td>
        <button onclick='editarGasto(${JSON.stringify(gasto)})'>✏️</button>
        <button onclick="borrarGasto('${gasto.id}')">🗑️</button>
      </td>
    `;

    tabla.appendChild(fila);
  });
}

// ===============================
// Renderizar gráfico
// ===============================
async function renderGrafico() {
  const gastos = await obtenerGastos();

  const totalesPorCategoria = {};

  gastos.forEach(g => {
    totalesPorCategoria[g.categoria] =
      (totalesPorCategoria[g.categoria] || 0) + g.monto;
  });

  if (grafico) grafico.destroy();

  grafico = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(totalesPorCategoria),
      datasets: [{
        data: Object.values(totalesPorCategoria),
        backgroundColor: [
          "#4CAF50",
          "#2196F3",
          "#FFC107",
          "#F44336",
          "#9C27B0",
          "#FF9800"
        ]
      }]
    }
  });
}

// ===============================
// Total general
// ===============================
async function renderTotalGeneral() {
  const gastos = await obtenerGastos();
  const total = gastos.reduce((acc, g) => acc + g.monto, 0);
  totalGeneralSpan.textContent = total;
}

// ===============================
// Editar gasto
// ===============================
function editarGasto(gasto) {
  document.getElementById("fecha").value = gasto.fecha;
  document.getElementById("categoria").value = gasto.categoria;
  document.getElementById("monto").value = gasto.monto;

  gastoEditandoId = gasto.id;
}

// ===============================
// Borrar gasto
// ===============================
async function borrarGasto(id) {
  if (!confirm("¿Eliminar este gasto?")) return;

  await db.collection("gastos").doc(id).delete();
  await refrescarUI();
}

// ===============================
// Submit del formulario
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  if (gastoEditandoId) {
    await db.collection("gastos").doc(gastoEditandoId).update(gasto);
    gastoEditandoId = null;
    alert("Gasto actualizado ✅");
  } else {
    await db.collection("gastos").add(gasto);
    alert("Gasto agregado ✅");
  }

  form.reset();
  await refrescarUI();
});

// ===============================
// Filtros
// ===============================
btnFiltrar.addEventListener("click", async () => {
  filtroDesde = document.getElementById("desde").value || null;
  filtroHasta = document.getElementById("hasta").value || null;
  await refrescarUI();
});

btnLimpiar.addEventListener("click", async () => {
  filtroDesde = null;
  filtroHasta = null;
  document.getElementById("desde").value = "";
  document.getElementById("hasta").value = "";
  await refrescarUI();
});

// ===============================
// Refresco general
// ===============================
async function refrescarUI() {
  await renderTabla();
  await renderGrafico();
  await renderTotalGeneral();
}

// ===============================
// Carga inicial
// ===============================
refrescarUI();
``
