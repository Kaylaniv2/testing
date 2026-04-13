const form = document.getElementById("form-gastos");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const gasto = {
    fecha: document.getElementById("fecha").value,
    categoria: document.getElementById("categoria").value,
    monto: Number(document.getElementById("monto").value)
  };

  const gastos = JSON.parse(localStorage.getItem("gastos")) || [];
  gastos.push(gasto);
  localStorage.setItem("gastos", JSON.stringify(gastos));

  alert("Gasto agregado");
});
``