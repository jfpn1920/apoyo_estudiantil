//-------------------------------------//
//--|funcionalidad_apoyo_estudiantil|--//
//-------------------------------------//
const pestanas = document.querySelectorAll('.pestana');
const recursos = document.querySelectorAll('.recurso');
const casillas = document.querySelectorAll('[data-habito]');
const progresoHabitos = document.getElementById('progresoHabitos');
const formNota = document.getElementById('formNota');
const inputNota = document.getElementById('inputNota');
const mensaje = document.getElementById('mensaje');
const listaNotas = document.getElementById('listaNotas');
const promedioValor = document.getElementById('promedioValor');
const estadoTexto = document.getElementById('estado');
const btnBorrar = document.getElementById('btnBorrar');
const textoBloc = document.getElementById('textoBloc');
const CLAVE = 'apoyo_estado';
const estadoInicial = {
    tab: 'habitos',
    habitos: [],
    notas: [],
    bloc: ''
};
//--------------------------//
//--|leer_estado_guardado|--//
//--------------------------//
function leerEstado() {
    try {
        const guardado = localStorage.getItem(CLAVE);
        if (guardado) {
            return {
                ...estadoInicial,
                ...JSON.parse(guardado)
            };
        }
        return { ...estadoInicial };
    } catch (error) {
        return { ...estadoInicial };
    }
}
let estado = leerEstado();
function guardarEstado() {
    localStorage.setItem(CLAVE, JSON.stringify(estado));
}
//---------------------//
//--|cambiar_pestana|--//
//---------------------//
function cambiarTab(tab) {
    estado.tab = tab;
    guardarEstado();
    dibujarPantalla();
}
//-------------------------------//
//--|marcar_o_desmarcar_habito|--//
//-------------------------------//
function alternarHabito(id, marcado) {
    if (marcado) {
        estado.habitos.push(id);
    } else {
        estado.habitos = estado.habitos.filter(h => h !== id);
    }
    guardarEstado();
    dibujarPantalla();
}
//----------------------//
//--|agregar_una_nota|--//
//----------------------// 
function agregarNota(evento) {
    evento.preventDefault();
    const valor = parseFloat(inputNota.value);
    if (isNaN(valor) || valor < 0 || valor > 5) {
        mensaje.textContent = 'Escribe una nota entre 0.0 y 5.0.';
        return;
    }
    estado.notas.push({
        id: Date.now(),
        valor
    });
    guardarEstado();
    formNota.reset();
    mensaje.textContent = '';
    dibujarPantalla();
}
//-----------------------//
//--|eliminar_una_nota|--//
//-----------------------//
function eliminarNota(id) {
    estado.notas = estado.notas.filter(n => n.id !== id);
    guardarEstado();
    dibujarPantalla();
}
//----------------------------//
//--|borrar_todas_las_notas|--//
//----------------------------//
function borrarNotas() {
    if (estado.notas.length === 0) {
        return;
    }
    if (!confirm('¿Seguro que quieres borrar todas las notas?')) {
        return;
    }
    estado.notas = [];
    guardarEstado();
    dibujarPantalla();
}
//---------------------------------------//
//--|mostrar_lista_y_promedio_de_notas|--//
//---------------------------------------//
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
    const hayNotas = estado.notas.length > 0;
    const promedio = hayNotas ? suma / estado.notas.length : 0;
    promedioValor.textContent = hayNotas ? promedio.toFixed(2) : '—';
    estadoTexto.textContent = hayNotas ? (promedio >= 3 ? 'Aprobado' : 'Por mejorar') : '';
    estadoTexto.className = hayNotas ? (promedio >= 3 ? 'estado aprobado' : 'estado reprobado') : 'estado';
}
//-----------------------------------------//
//--|actualizar_elementos_de_la_pantalla|--//
//-----------------------------------------//
function dibujarPantalla() {
    pestanas.forEach(p => {
        p.classList.toggle('activa', p.dataset.tab === estado.tab);
    });
    recursos.forEach(r => {
        r.hidden = r.id !== estado.tab;
    });
    casillas.forEach(c => {
        c.checked = estado.habitos.includes(c.dataset.habito);
    });
    progresoHabitos.textContent = `${estado.habitos.length} de ${casillas.length} hábitos completados`;
    dibujarNotas();
}
//-------------------------------------// 
//--|eventos_de_navegacion_y_habitos|--//
//-------------------------------------//
pestanas.forEach(p => {
    p.addEventListener('click', () => cambiarTab(p.dataset.tab));
});
casillas.forEach(c => {
    c.addEventListener('change', () => alternarHabito(c.dataset.habito, c.checked));
});
formNota.addEventListener('submit', agregarNota);
btnBorrar.addEventListener('click', borrarNotas);
//----------------------------//
//--|guardar_texto_del_bloc|--//
//----------------------------//
textoBloc.addEventListener('input', () => {
    estado.bloc = textoBloc.value;
    guardarEstado();
});
//-------------------------------//
//--|iniciar_apoyo_estudiantil|--//
//-------------------------------//
textoBloc.value = estado.bloc;
dibujarPantalla();