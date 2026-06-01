// =============================================================================
//  🚀  SPACEX FLIGHT CONTROL CENTER
//  Centro de Control de Lanzamientos Espaciales
//
//  Proyecto de Desempeño · SENA Formación Complementaria 3406211
//  Módulo: JavaScript · Unidades 1 a 7
//
//  INSTRUCCIONES PARA EL APRENDIZ:
//  ─────────────────────────────────────────────────────────────────────────────
//  Este archivo está vacío. Tu tarea es implementar todas las funciones
//  necesarias para que la aplicación funcione de acuerdo al enunciado.
//
//  Pasos recomendados:
//    1. Lee el enunciado completo en ENUNCIADO.md
//    2. Abre spacex_control_vuelos.html en el navegador con F12 activo
//    3. Revisa el HTML para conocer los IDs disponibles
//    4. Revisa el CSS para conocer las clases que debes aplicar
//    5. Implementa las secciones de este archivo en orden
//
//  IMPORTANTE: No modifiques spacex_control_vuelos.html ni styles-vuelos.css
// =============================================================================


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 1 — ALMACÉN DE DATOS
//
//  Declara aquí las variables que guardarán el estado global de la aplicación:
//  la colección de lanzamientos registrados y cualquier variable de control
//  que necesites para el funcionamiento de la interfaz.
//
//  Piensa en qué tipo de estructura de datos es más apropiada para
//  mantener una lista de registros, cada uno con múltiples propiedades.
// ─────────────────────────────────────────────────────────────────────────────

let lanzamientos = [];
let filtroActivo = "todos";
let contadorId   = 1;


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 2 — FUNCIONES UTILITARIAS
//
//  Funciones de propósito general que pueden reutilizarse en distintas
//  partes del código. Considera qué operaciones se repiten frecuentemente
//  y valdría la pena encapsular como función auxiliar.
//
//  Por ejemplo: generar un identificador único para cada registro,
//  o transformar una fecha al formato que se mostrará en las tarjetas.
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
//  Funciones que leen el almacén de datos y convierten cada lanzamiento
//  en un elemento HTML visible dentro del contenedor del grid.
//
//  La tarjeta debe construirse como un elemento del DOM con la estructura
//  documentada en el archivo HTML. Revisa los comentarios del grid para
//  conocer exactamente qué clases y atributos debe tener cada parte.
//
//  IDs relevantes del HTML:
//    · #grid-lanzamientos  → contenedor donde se insertan las tarjetas
//    · #estado-vacio       → se muestra cuando no hay tarjetas
//    · #contador-visibles  → muestra cuántas tarjetas son visibles
//    · #contador-lanzamientos → contador de vuelos en la topbar
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

  const nombresTipo = {
    "falcon":       "FALCON 9",
    "falcon-heavy": "FALCON HEAVY",
    "starship":     "STARSHIP"
  };

  const tipo = document.createElement("div");
  tipo.className   = "molecule-card-body__type";
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
  btnEditar.className      = "atom-btn atom-btn--secondary atom-btn--sm";
  btnEditar.dataset.action = "editar";
  btnEditar.dataset.id     = lanzamiento.id;
  btnEditar.textContent    = "EDITAR";

  const btnCancelar = document.createElement("button");
  btnCancelar.className      = "atom-btn atom-btn--danger atom-btn--sm";
  btnCancelar.dataset.action = "cancelar";
  btnCancelar.dataset.id     = lanzamiento.id;
  btnCancelar.textContent    = "CANCELAR";

  if (lanzamiento.estado !== "pendiente") {
    btnEditar.disabled        = true;
    btnEditar.style.opacity   = "0.35";
    btnCancelar.disabled      = true;
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
//  Cada tarjeta creada debe escuchar eventos del cursor y responder
//  aplicando o removiendo la clase CSS que activa la animación.
//
//  La clase de activación está definida en el archivo de estilos.
//  El CSS ya tiene la transición configurada para entrada y salida.
//
//  Eventos que debes capturar en cada tarjeta:
//    · mouseover  → activar el estado de hover
//    · mouseout   → desactivar el estado de hover
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
//  Función que responde al evento de envío del formulario.
//  Debe leer el valor de cada campo, verificar que no estén vacíos,
//  construir el objeto del lanzamiento y añadirlo al almacén.
//  Si el campo oculto de edición contiene un ID, debe actualizar el
//  registro existente en lugar de crear uno nuevo.
//
//  IDs relevantes del HTML:
//    · #form-lanzamiento        → el elemento <form>
//    · #input-nombre-serie      → campo texto nombre
//    · #select-tipo-cohete      → campo selección tipo
//    · #input-fecha-lanzamiento → campo fecha y hora
//    · #input-objetivo-mision   → campo texto objetivo
//    · #input-id-edicion        → campo oculto con el ID en modo edición
//    · #btn-registrar           → botón principal del formulario
//    · #btn-cancelar-edicion    → botón para salir del modo edición
// ─────────────────────────────────────────────────────────────────────────────

const manejarFormulario = (event) => {
  event.preventDefault();

  try {
    const nombre    = document.getElementById("input-nombre-serie").value.trim();
    const tipo      = document.getElementById("select-tipo-cohete").value;
    const fecha     = document.getElementById("input-fecha-lanzamiento").value;
    const objetivo  = document.getElementById("input-objetivo-mision").value.trim();
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
    alert("❌ Ocurrió un error inesperado. Revisa la consola.");
  }
};

const limpiarFormulario = () => {
  document.getElementById("input-nombre-serie").value       = "";
  document.getElementById("select-tipo-cohete").value       = "";
  document.getElementById("input-fecha-lanzamiento").value  = "";
  document.getElementById("input-objetivo-mision").value    = "";
  document.getElementById("input-id-edicion").value         = "";

  document.getElementById("btn-registrar").textContent          = "▶ REGISTRAR LANZAMIENTO";
  document.getElementById("btn-cancelar-edicion").style.display = "none";
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 6 — CAMBIOS DE ESTADO
//
//  Funciones que modifican un lanzamiento existente:
//    · Modo edición: cargar los datos del registro en el formulario
//    · Cancelación: cambiar el estado del registro a "cancelado"
//
//  Las tarjetas tienen botones con los atributos data-id y data-action.
//  Puedes usar estos atributos para saber qué registro modificar y
//  qué acción ejecutar cuando el usuario hace clic.
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
  document.getElementById("input-id-edicion").value        = lanzamiento.id;

  document.getElementById("btn-registrar").textContent          = "💾 GUARDAR CAMBIOS";
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
//  Funciones que muestran u ocultan tarjetas según el filtro activo.
//  Al aplicar un filtro, solo deben verse las tarjetas que coincidan
//  con el estado seleccionado. El botón activo debe marcarse visualmente.
//
//  IDs relevantes del HTML:
//    · #grupo-filtros  → contenedor de los botones de filtro
//
//  Atributo en los botones de filtro: data-filter
//  Valores posibles: "todos" · "pendiente" · "lanzado" · "cancelado"
//
//  Clase CSS del botón activo: atom-btn--filter-active
// ─────────────────────────────────────────────────────────────────────────────

const aplicarFiltro = (event) => {
  filtroActivo = event.currentTarget.dataset.filter;
  actualizarBotonesFiltrro(filtroActivo);
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
//  Un intervalo de tiempo que se ejecuta cada segundo y realiza dos tareas:
//
//    Tarea A: Reloj en tiempo real
//      Obtener la hora actual en UTC y mostrarla en el elemento del reloj
//      usando el formato HH:MM:SSZ (horas, minutos, segundos + letra Z).
//
//    Tarea B: Detección automática de lanzamientos
//      Recorrer el almacén y buscar registros con estado "pendiente"
//      cuya fecha programada ya se haya alcanzado o superado.
//      Cuando se detecte uno, cambiar su estado a "lanzado" y
//      actualizar la vista para reflejar el cambio.
//
//  ID relevante del HTML:
//    · #reloj-principal → elemento donde se despliega la hora
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
//  Función que recorre el almacén, cuenta los registros por estado
//  y actualiza los elementos del panel de estadísticas con los totales.
//
//  IDs relevantes del HTML:
//    · #stat-pendientes  → contador de lanzamientos pendientes
//    · #stat-lanzados    → contador de lanzamientos ejecutados
//    · #stat-cancelados  → contador de lanzamientos cancelados
//    · #stat-total       → total de registros en el sistema
// ─────────────────────────────────────────────────────────────────────────────

const actualizarEstadisticas = () => {
  const pendientes = lanzamientos.filter(l => l.estado === "pendiente").length;
  const lanzados   = lanzamientos.filter(l => l.estado === "lanzado").length;
  const cancelados = lanzamientos.filter(l => l.estado === "cancelado").length;
  const total      = lanzamientos.length;

  document.getElementById("stat-pendientes").textContent = pendientes;
  document.getElementById("stat-lanzados").textContent   = lanzados;
  document.getElementById("stat-cancelados").textContent = cancelados;
  document.getElementById("stat-total").textContent      = total;
};

const actualizarContadores = (visibles) => {
  document.getElementById("contador-lanzamientos").textContent = lanzamientos.length;
  document.getElementById("contador-visibles").textContent     = `${visibles} REGISTROS`;
};


// ─────────────────────────────────────────────────────────────────────────────
//  SECCIÓN 10 — INICIALIZACIÓN
//
//  Punto de arranque de la aplicación. Todo el código que necesita
//  interactuar con elementos del DOM debe ejecutarse aquí, dentro de
//  un mecanismo que garantice que la página ya terminó de cargar.
//
//  Desde aquí debes:
//    · Conectar los eventos del formulario y los botones
//    · Iniciar el intervalo del reloj y el monitor automático
//    · Hacer el primer renderizado y actualizar las estadísticas
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


 