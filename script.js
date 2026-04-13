const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");
const canvas = document.getElementById("grafico");

let grafico;

// ===== LocalStorage =====
function obtenerGastos() {
  return JSON.parse(localStorage.getItem("gastos")) || [];
}

function guardarGastos(gastos) {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

// ===== Tabla =====
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

// ===== Gráfico =====
function renderGrafico() {
  const gastos = obtenerGastos();
  const totales = {};

  gastos.forEach(g => {
    totales[g.categoria] = (totales[g.categoria] || 0) + g.monto;
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
          "#9C27B0"
        ]
      }]
    }
  });
}

// ===== Evento =====
form.addEventListener("submit", e => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  const gastos = obtenerGastos();
  gastos.push(gasto);
  guardarGastos(gastos);

  alert("Gasto agregado"); // ✅ RESTAURADO

  form.reset();
  renderTabla();
  renderGrafico();
});

// ===== Inicial =====
renderTabla();
renderGrafico();
``
