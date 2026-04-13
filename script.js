console.log("✅ VERSION FIRESTORE ACTIVA");

// ===============================
// Referencias al DOM
// ===============================
const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

let grafico = null;

// ===============================
// Obtener gastos desde Firestore
// ===============================
async function obtenerGastos() {
  try {
    const snapshot = await db.collection("gastos").orderBy("fecha").get();

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
// Renderizar tabla
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

  const categorias = Object.keys(totalesPorCategoria);
  const montos = Object.values(totalesPorCategoria);

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(canvas, {
    type: "pie",
    data: {
      labels: categorias,
      datasets: [{
        data: montos,
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
// Submit del formulario (GUARDAR ONLINE)
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  console.log("➡️ Intentando guardar gasto en Firestore:", gasto);

  try {
    const ref = await db.collection("gastos").add(gasto);
    console.log("✅ Gasto guardado con ID:", ref.id);

    alert("Gasto guardado ONLINE ✅");

    form.reset();

    await renderTabla();
    await renderGrafico();

  } catch (error) {
    console.error("❌ Error guardando gasto:", error);
    alert("Error al guardar el gasto");
  }
});

// ===============================
// Carga inicial
// ===============================
renderTabla();
renderGrafico();
