const form = document.getElementById("form-gastos");
const tabla = document.getElementById("tabla-gastos");

function obtenerGastos() {
  return JSON.parse(localStorage.getItem("gastos")) || [];
}

function guardarGastos(gastos) {
  localStorage.setItem("gastos", JSON.stringify(gastos));
}

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
});

// Mostrar gastos al cargar la página
renderTabla();
``
