// ===== REFERENCIAS A LOS ELEMENTOS DEL HTML =====
const pestanas = document.querySelectorAll('.pestana');         // botones de las pestañas
const recursos = document.querySelectorAll('.recurso');         // las tres secciones
const casillas = document.querySelectorAll('[data-habito]');    // casillas de hábitos
const progresoHabitos = document.getElementById('progresoHabitos');
const formNota = document.getElementById('formNota');
const inputNota = document.getElementById('inputNota');
const mensaje = document.getElementById('mensaje');
const listaNotas = document.getElementById('listaNotas');
const promedioValor = document.getElementById('promedioValor');
const estadoTexto = document.getElementById('estado');
const btnBorrar = document.getElementById('btnBorrar');
const textoBloc = document.getElementById('textoBloc');
// ===== CLAVE DE LOCALSTORAGE =====
const CLAVE = 'apoyo_estado';
// ===== ESTADO POR DEFECTO =====
// tab: pestaña abierta | habitos: ids marcados | notas: lista de notas | bloc: texto libre
const estadoInicial = { tab: 'habitos', habitos: [], notas: [], bloc: '' };
// ===== LEER EL ESTADO GUARDADO =====
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        // Si hay datos guardados los usamos; si no, partimos del estado inicial
        return guardado ? { ...estadoInicial, ...JSON.parse(guardado) } : { ...estadoInicial };
    } catch (error) {
      return { ...estadoInicial }; // si algo falla, empezamos desde cero
    }
}
// Al cargar la página recuperamos todo lo guardado
let estado = leerEstado();
// ===== GUARDAR EL ESTADO =====
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
// ===== CAMBIAR DE PESTAÑA =====
function cambiarTab(tab) {
    estado.tab = tab;
    guardarEstado();
    dibujarPantalla();
}
// ===== MARCAR O DESMARCAR UN HÁBITO =====
function alternarHabito(id, marcado) {
    if (marcado) estado.habitos.push(id);                          // lo agregamos a la lista
    else estado.habitos = estado.habitos.filter(h => h !== id);    // lo quitamos de la lista
    guardarEstado();
    dibujarPantalla();
}
// ===== AGREGAR UNA NOTA =====
function agregarNota(evento) {
    evento.preventDefault();  // evita que la página se recargue
    const valor = parseFloat(inputNota.value);
    // Validación: la nota debe estar entre 0 y 5
    if (isNaN(valor) || valor < 0 || valor > 5) {
        mensaje.textContent = 'Escribe una nota entre 0.0 y 5.0.';
        return;
    }
    estado.notas.push({ id: Date.now(), valor });  // id único con la fecha
    guardarEstado();
    formNota.reset();
    mensaje.textContent = '';
    dibujarPantalla();
}
// ===== ELIMINAR UNA NOTA O TODAS =====
function eliminarNota(id) {
    estado.notas = estado.notas.filter(n => n.id !== id);  // conserva todas menos esa
    guardarEstado();
    dibujarPantalla();
}
function borrarNotas() {
    if (estado.notas.length === 0) return;
    if (!confirm('¿Seguro que quieres borrar todas las notas?')) return;
    estado.notas = [];
    guardarEstado();
    dibujarPantalla();
}
// ===== DIBUJAR EL RECURSO DE PROMEDIO =====
function dibujarNotas() {
    listaNotas.innerHTML = '';
    let suma = 0;
    estado.notas.forEach((nota, indice) => {
        suma += nota.valor;
        const item = document.createElement('li');
        const texto = document.createElement('span');
        texto.textContent = `Nota ${indice + 1}: ${nota.valor.toFixed(1)}`;
        const boton = document.createElement('button');
        boton.className = 'btn-texto';
        boton.textContent = 'Eliminar';
        boton.addEventListener('click', () => eliminarNota(nota.id));
        item.append(texto, boton);
        listaNotas.appendChild(item);
    });
    // Promedio = suma de notas dividida entre la cantidad de notas
    const hayNotas = estado.notas.length > 0;
    const promedio = hayNotas ? suma / estado.notas.length : 0;
    promedioValor.textContent = hayNotas ? promedio.toFixed(2) : '—';
    estadoTexto.textContent = hayNotas ? (promedio >= 3 ? 'Aprobado' : 'Por mejorar') : '';
    estadoTexto.className = hayNotas ? (promedio >= 3 ? 'estado aprobado' : 'estado reprobado') : 'estado';
}
// ===== ACTUALIZAR TODO LO QUE SE VE EN PANTALLA =====
function dibujarPantalla() {
    // Pestañas: marcamos la activa y mostramos solo su sección
    pestanas.forEach(p => p.classList.toggle('activa', p.dataset.tab === estado.tab));
    recursos.forEach(r => { r.hidden = r.id !== estado.tab; });
    // Hábitos: marcamos las casillas guardadas y mostramos el progreso
    casillas.forEach(c => { c.checked = estado.habitos.includes(c.dataset.habito); });
    progresoHabitos.textContent = `${estado.habitos.length} de ${casillas.length} hábitos completados`;
    dibujarNotas();
}
// ===== EVENTOS =====
pestanas.forEach(p => p.addEventListener('click', () => cambiarTab(p.dataset.tab)));
casillas.forEach(c => c.addEventListener('change', () => alternarHabito(c.dataset.habito, c.checked)));
formNota.addEventListener('submit', agregarNota);
btnBorrar.addEventListener('click', borrarNotas);
// El bloc de notas se guarda mientras se escribe
textoBloc.addEventListener('input', () => {
    estado.bloc = textoBloc.value;
    guardarEstado();
});
// ===== INICIO: se ejecuta al cargar o refrescar la página =====
textoBloc.value = estado.bloc;  // recupera el texto del bloc de notas
dibujarPantalla();              // dibuja pestañas, hábitos y notas guardados