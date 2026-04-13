const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

let grafico = null;

// ===============================
// 🔹 OBTENER GASTOS DESDE FIRESTORE
// ===============================
async function obtenerGastos() {
  const snapshot = await db.collection("gastos").get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// ===============================
// 🔹 RENDER TABLA
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
// 🔹 RENDER GRÁFICO
// ===============================
async function renderGrafico() {
  const gastos = await obtenerGastos();
  const totales = {};

  gastos.forEach(g => {
    totales[g.categoria] =
      (totales[g.categoria] || 0) + g.monto;
  });

  if (grafico) {
    grafico.destroy();
  }

  grafico = new Chart(canvas, {
    type: "pie",
    data: {
      labels: Object.keys(totales),
      datasets: [{
        data: Object.values(totales),
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
// 🔹 EVENTO SUBMIT (GUARDAR ONLINE)
// ===============================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  // 🔥 Guardar en Firestore
  await db.collection("gastos").add(gasto);

  alert("Gasto agregado en la base de datos online ✅");

  form.reset();

  await renderTabla();
  await renderGrafico();
});

// ===============================
// 🔹 CARGA INICIAL
// ===============================
renderTabla();
renderGrafico();
