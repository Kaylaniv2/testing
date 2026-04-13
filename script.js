// ===== Referencias al DOM =====
const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

let grafico = null;

// ===== LocalStorage =====
function obtenerGastos() {
  return JSON.parse(localStorage.getItem("gastos")) || [];
}

function guardarGastos(gastos) {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

// ===== Render tabla =====
function renderTabla() {
  tabla.innerHTML = "";

  const gastos = obtenerGastos();

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

// ===== Render gráfico =====
function renderGrafico() {
  const gastos = obtenerGastos();
  const totales = {};

  gastos.forEach(g => {
    totales[g.categoria] = (totales[g.categoria] || 0) + g.monto;
  });

  const categorias = Object.keys(totales);
  const montos = Object.values(totales);

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

// ===== Evento submit =====
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  const gastos = obtenerGastos();
  gastos.push(gasto);
  guardarGastos(gastos);

  form.reset();
  renderTabla();
  renderGrafico();
});

// ===== Inicial =====
renderTabla();
renderGrafico();
