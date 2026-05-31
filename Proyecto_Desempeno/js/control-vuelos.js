// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  'lanzamientos' es un array (lista) de objetos. Cada objeto representa
//  un vuelo con sus propiedades: id, nombre, tipo, fecha, objetivo, estado.
//
//  'filtroActivo' guarda qué botón de filtro está seleccionado en este momento.
//  Empieza en "todos" porque al abrir la app se ven todos los vuelos.
//
//  'contadorId' es un número que sube cada vez que creamos un vuelo nuevo.
//  Lo usamos para generar IDs únicos como SX-2026-001, SX-2026-002, etc.
// ─────────────────────────────────────────────────────────────────────────────

let lanzamientos = [];      
let filtroActivo = "todos";  
let contadorId   = 1;       


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  generarId()
//    Genera un string como "SX-2026-001".
//    Usamos padStart(3, "0") para que el número siempre tenga 3 dígitos:
//    1 → "001", 12 → "012", 123 → "123".
//    Luego incrementamos contadorId para que el próximo ID sea diferente.
//
//  formatearFecha(fechaStr)
//    Recibe el valor del campo datetime-local ("2026-05-30T14:30")
//    y lo convierte a "2026-05-30 · 14:30 UTC" para mostrar en las tarjetas.
//    Si la cadena no tiene al menos 16 caracteres devuelve el valor original.
// ─────────────────────────────────────────────────────────────────────────────

const generarId = () => {

    const id = `SX-2026-${String(contadorId).padStart(3, "0")}`;
  contadorId++;   
  return id;
};

const formatearFecha = (fechaStr) => {

    if (!fechaStr || fechaStr.length < 16) return fechaStr;

  const [fecha, hora] = fechaStr.split("T");
  return `${fecha} · ${hora} UTC`;
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 3 — RENDERIZADO DE TARJETAS
//
//  crearTarjeta(lanzamiento)
//    Recibe un objeto lanzamiento y construye un <article> con toda la
//    estructura HTML que exige el proyecto. Usa createElement() para
//    cada elemento —no innerHTML en bloque— tal como pide la rúbrica.
//    Al final añade los listeners de hover (Sección 4) y retorna el artículo.
//
//  renderizarTarjetas()
//    Vacía el grid (excepto el estado vacío), crea una tarjeta por cada
//    lanzamiento en el almacén, aplica el filtro activo, y actualiza
//    los contadores de la topbar y del pie de la barra de filtros.
// ─────────────────────────────────────────────────────────────────────────────

const crearTarjeta = (lanzamiento) => {


    const article = document.createElement("article");

  article.className = `organism-launch-card organism-launch-card--${lanzamiento.estado}`;
  article.dataset.id     = lanzamiento.id;
  article.dataset.tipo   = lanzamiento.tipo;
  article.dataset.estado = lanzamiento.estado;

  const header = document.createElement("div");
  header.className = "molecule-card-header";

  const spanId = document.createElement("span");
  spanId.className   = "molecule-card-header__id atom-mono";
  spanId.textContent = lanzamiento.id;

  const badge = document.createElement("span");
  badge.className   = `atom-badge atom-badge--${lanzamiento.estado}`;
  badge.textContent = lanzamiento.estado.toUpperCase();

  header.appendChild(spanId);
  header.appendChild(badge);

  const body = document.createElement("div");
  body.className = "molecule-card-body";

  const nombre = document.createElement("div");
  nombre.className   = "molecule-card-body__name";
  nombre.textContent = lanzamiento.nombre;

  const tipo = document.createElement("div");
  tipo.className = "molecule-card-body__type";
  const nombresTipo = {
    "falcon":       "FALCON 9",
    "falcon-heavy": "FALCON HEAVY",
    "starship":     "STARSHIP"
  };
  tipo.textContent = nombresTipo[lanzamiento.tipo] || lanzamiento.tipo.toUpperCase();

  const objetivo = document.createElement("div");
  objetivo.className   = "molecule-card-body__objective";
  objetivo.textContent = lanzamiento.objetivo;

  const fecha = document.createElement("div");
  fecha.className   = "molecule-card-body__date atom-mono";
  fecha.textContent = formatearFecha(lanzamiento.fecha);

  body.appendChild(nombre);
  body.appendChild(tipo);
  body.appendChild(objetivo);
  body.appendChild(fecha);

  const footer = document.createElement("div");
  footer.className = "molecule-card-footer";

  const btnEditar = document.createElement("button");
  btnEditar.className    = "atom-btn atom-btn--secondary atom-btn--sm";
  btnEditar.dataset.action = "editar";
  btnEditar.dataset.id     = lanzamiento.id;
  btnEditar.textContent    = "EDITAR";

  const btnCancelar = document.createElement("button");
  btnCancelar.className    = "atom-btn atom-btn--danger atom-btn--sm";
  btnCancelar.dataset.action = "cancelar";
  btnCancelar.dataset.id     = lanzamiento.id;
  btnCancelar.textContent    = "CANCELAR";


  if (lanzamiento.estado !== "pendiente") {
    btnEditar.disabled  = true;
    btnEditar.style.opacity = "0.35";
    btnCancelar.disabled = true;
    btnCancelar.style.opacity = "0.35";
  }

  footer.appendChild(btnEditar);
  footer.appendChild(btnCancelar);

  article.appendChild(header);
  article.appendChild(body);
  article.appendChild(footer);

  agregarHover(article);

  btnEditar.addEventListener("click",  manejarAccionTarjeta);
  btnCancelar.addEventListener("click", manejarAccionTarjeta);

  return article;
};

const renderizarTarjetas = () => {
  const grid        = document.getElementById("grid-lanzamientos");
  const estadoVacio = document.getElementById("estado-vacio");

  
  const tarjetasExistentes = grid.querySelectorAll(".organism-launch-card");
  tarjetasExistentes.forEach(t => t.remove());

  if (lanzamientos.length === 0) {
    estadoVacio.style.display = ""; 
    actualizarContadores(0);
    actualizarEstadisticas();
    return;
  }

  estadoVacio.style.display = "none";

  let visibles = 0;

  lanzamientos.forEach(lanzamiento => {
    const tarjeta = crearTarjeta(lanzamiento);

    if (filtroActivo !== "todos" && lanzamiento.estado !== filtroActivo) {
      tarjeta.style.display = "none";
    } else {
      visibles++;
    }

    grid.appendChild(tarjeta);
  });

  actualizarContadores(visibles);
  actualizarEstadisticas();
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 4 — ANIMACIONES DE TARJETAS (HOVER)
//
//  agregarHover(tarjeta)
//    Agrega dos listeners al elemento tarjeta:
//      mouseover → añade la clase "is-hovered" (el CSS aplica la elevación)
//      mouseout  → quita la clase "is-hovered" (el CSS revierte la animación)
//
//  El CSS ya tiene definida la transición en .organism-launch-card,
//  así que solo necesitamos cambiar la clase.
// ─────────────────────────────────────────────────────────────────────────────

const agregarHover = (tarjeta) => {
  tarjeta.addEventListener("mouseover", () => {
    tarjeta.classList.add("is-hovered");
  });
  tarjeta.addEventListener("mouseout", () => {
    tarjeta.classList.remove("is-hovered");
  });
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 5 — FORMULARIO: REGISTRO Y EDICIÓN
//
//  manejarFormulario(event)
//    Se ejecuta cuando el usuario pulsa "REGISTRAR LANZAMIENTO".
//    Pasos:
//      1. Previene el comportamiento nativo del <form> (recarga de página)
//      2. Lee los valores de los cuatro campos
//      3. Valida que ninguno esté vacío (try/catch + if/else)
//      4. Comprueba si hay un ID en el campo oculto (modo edición)
//         → Si hay ID: busca el objeto en el almacén con find() y lo actualiza
//         → Si no hay ID: crea un objeto nuevo y lo agrega al array con push()
//      5. Limpia el formulario y renderiza de nuevo
//
//  limpiarFormulario()
//    Vacía todos los campos y sale del modo edición:
//    - Pone el campo oculto a ""
//    - Restaura el texto del botón principal
//    - Oculta el botón "CANCELAR EDICIÓN"
// ─────────────────────────────────────────────────────────────────────────────

const manejarFormulario = (event) => {
  event.preventDefault();

  try {
    const nombre   = document.getElementById("input-nombre-serie").value.trim();
    const tipo     = document.getElementById("select-tipo-cohete").value;
    const fecha    = document.getElementById("input-fecha-lanzamiento").value;
    const objetivo = document.getElementById("input-objetivo-mision").value.trim();
    const idEdicion = document.getElementById("input-id-edicion").value;


    if (!nombre || !tipo || !fecha || !objetivo) {
      alert("⚠️ Todos los campos son obligatorios. Por favor completa el formulario.");
      return;   
    }

    if (idEdicion) {

      const lanzamiento = lanzamientos.find(l => l.id === idEdicion);

      if (lanzamiento) {
       
        lanzamiento.nombre   = nombre;
        lanzamiento.tipo     = tipo;
        lanzamiento.fecha    = fecha;
        lanzamiento.objetivo = objetivo;
      }
    } else {
      const nuevoLanzamiento = {
        id:       generarId(),    
        nombre:   nombre,
        tipo:     tipo,
        fecha:    fecha,
        objetivo: objetivo,
        estado:   "pendiente"    
      };
      lanzamientos.push(nuevoLanzamiento);  
    }

    limpiarFormulario();
    renderizarTarjetas();

  } catch (error) {
    console.error("Error al procesar el formulario:", error);
    alert(" Ocurrió un error inesperado. Revisa la consola.");
  }
};

const limpiarFormulario = () => {
  document.getElementById("input-nombre-serie").value      = "";
  document.getElementById("select-tipo-cohete").value      = "";
  document.getElementById("input-fecha-lanzamiento").value = "";
  document.getElementById("input-objetivo-mision").value   = "";
  document.getElementById("input-id-edicion").value        = "";

  document.getElementById("btn-registrar").textContent = "▶ REGISTRAR LANZAMIENTO";

  document.getElementById("btn-cancelar-edicion").style.display = "none";
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  manejarAccionTarjeta(event)
//    Un solo listener que maneja EDITAR y CANCELAR.
//    Lee data-action y data-id del botón pulsado para saber qué hacer.
//
//  activarModoEdicion(id)
//    Busca el lanzamiento en el almacén, carga sus datos en el formulario
//    y muestra el botón "CANCELAR EDICIÓN".
//
//  cancelarLanzamiento(id)
//    Cambia el estado del lanzamiento a "cancelado" y re-renderiza.
// ─────────────────────────────────────────────────────────────────────────────

const manejarAccionTarjeta = (event) => {
  const accion = event.currentTarget.dataset.action;
  const id     = event.currentTarget.dataset.id;

  if (accion === "editar") {
    activarModoEdicion(id);
  } else if (accion === "cancelar") {
    cancelarLanzamiento(id);
  }
};

const activarModoEdicion = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id);
  if (!lanzamiento) return;   

  document.getElementById("input-nombre-serie").value      = lanzamiento.nombre;
  document.getElementById("select-tipo-cohete").value      = lanzamiento.tipo;
  document.getElementById("input-fecha-lanzamiento").value = lanzamiento.fecha;
  document.getElementById("input-objetivo-mision").value   = lanzamiento.objetivo;

  document.getElementById("input-id-edicion").value = lanzamiento.id;

  document.getElementById("btn-registrar").textContent = "💾 GUARDAR CAMBIOS";

  document.getElementById("btn-cancelar-edicion").style.display = "block";

  document.getElementById("form-lanzamiento").scrollIntoView({ behavior: "smooth" });
};

const cancelarLanzamiento = (id) => {
  const lanzamiento = lanzamientos.find(l => l.id === id);
  if (!lanzamiento || lanzamiento.estado !== "pendiente") return;

  lanzamiento.estado = "cancelado";
  renderizarTarjetas();
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 7 — FILTRADO POR ESTADO
//
//  aplicarFiltro(event)
//    Se ejecuta cuando el usuario pulsa cualquier botón del grupo de filtros.
//    Lee data-filter del botón pulsado y guarda ese valor en filtroActivo.
//    Luego actualiza la clase activa en los botones y re-renderiza.
//
//  actualizarBotonesFiltrro(filtro)
//    Recorre todos los botones del grupo, quita la clase activa de todos
//    y la agrega solo al que coincide con el filtro recibido.
// ─────────────────────────────────────────────────────────────────────────────

const aplicarFiltro = (event) => {
  const filtro = event.currentTarget.dataset.filter;
  filtroActivo = filtro;                   
  actualizarBotonesFiltrro(filtro);
  renderizarTarjetas();
};

const actualizarBotonesFiltrro = (filtro) => {
  const botones = document.querySelectorAll("#grupo-filtros .atom-btn--filter");

  botones.forEach(btn => {
    btn.classList.remove("atom-btn--filter-active");

    if (btn.dataset.filter === filtro) {
      btn.classList.add("atom-btn--filter-active");
    }
  });
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 8 — RELOJ Y MONITOREO AUTOMÁTICO
//
//  iniciarRelojYMonitor()
//    Lanza un setInterval que se ejecuta cada 1000 ms (1 segundo).
//
//    Tarea A — Reloj UTC:
//      Crea un objeto Date con la hora actual.
//      getUTCHours/Minutes/Seconds devuelven números; padStart los formatea
//      a 2 dígitos ("9" → "09") y concatenamos la "Z" de zona UTC.
//
//    Tarea B — Monitor automático de lanzamientos:
//      Recorre el array buscando lanzamientos pendientes cuya fecha ya pasó.
//      Date.now() devuelve milisegundos desde epoch; new Date(fecha).getTime()
//      convierte el string de fecha a la misma escala para comparar.
//      Si la fecha ya se alcanzó, cambia el estado a "lanzado" y re-renderiza.
// ─────────────────────────────────────────────────────────────────────────────

const iniciarRelojYMonitor = () => {
  setInterval(() => {

    const ahora = new Date();

    const hh = String(ahora.getUTCHours()).padStart(2, "0");
    const mm = String(ahora.getUTCMinutes()).padStart(2, "0");
    const ss = String(ahora.getUTCSeconds()).padStart(2, "0");

    document.getElementById("reloj-principal").textContent = `${hh}:${mm}:${ss}Z`;

    let huboCambio = false; 

    lanzamientos.forEach(lanzamiento => {
      if (lanzamiento.estado !== "pendiente") return;  

      const fechaProgramada = new Date(lanzamiento.fecha).getTime();

      if (Date.now() >= fechaProgramada) {
        lanzamiento.estado = "lanzado";
        huboCambio = true;
      }
    });

    if (huboCambio) {
      renderizarTarjetas();
    }

  }, 1000);  
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 9 — ESTADÍSTICAS
//
//  actualizarEstadisticas()
//    Recorre el array con filter() para contar cuántos lanzamientos hay
//    de cada estado y actualiza el textContent de los cuatro spans del panel.
//
//  actualizarContadores(visibles)
//    Actualiza el contador de vuelos activos en la topbar y el texto
//    "N REGISTROS" en la barra de filtros.
//    Recibe como argumento cuántas tarjetas son visibles con el filtro activo.
// ─────────────────────────────────────────────────────────────────────────────

const actualizarEstadisticas = () => {

  const pendientes  = lanzamientos.filter(l => l.estado === "pendiente").length;
  const lanzados    = lanzamientos.filter(l => l.estado === "lanzado").length;
  const cancelados  = lanzamientos.filter(l => l.estado === "cancelado").length;
  const total       = lanzamientos.length;

  document.getElementById("stat-pendientes").textContent = pendientes;
  document.getElementById("stat-lanzados").textContent   = lanzados;
  document.getElementById("stat-cancelados").textContent = cancelados;
  document.getElementById("stat-total").textContent      = total;
};

const actualizarContadores = (visibles) => {
  document.getElementById("contador-lanzamientos").textContent = lanzamientos.length;

  document.getElementById("contador-visibles").textContent = `${visibles} REGISTROS`;
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//
//  DOMContentLoaded se dispara cuando el navegador termina de leer el HTML.
//  Dentro conectamos todos los eventos, iniciamos el reloj y hacemos el
//  primer renderizado (que mostrará el estado vacío porque el array está vacío).
//
//  ¿Por qué dentro de DOMContentLoaded?
//  Si el script corre antes de que el HTML esté listo, getElementById()
//  devolverá null y el programa fallará.
// ─────────────────────────────────────────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {

  document.getElementById("form-lanzamiento")
    .addEventListener("submit", manejarFormulario);

  document.getElementById("btn-cancelar-edicion")
    .addEventListener("click", limpiarFormulario);

  document.getElementById("btn-cancelar-edicion").style.display = "none";

  const botonesFiltro = document.querySelectorAll("#grupo-filtros .atom-btn--filter");
  botonesFiltro.forEach(btn => {
    btn.addEventListener("click", aplicarFiltro);
  });

  iniciarRelojYMonitor();

  renderizarTarjetas();
});