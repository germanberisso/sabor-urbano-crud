// models/actividadModel.js
const fs = require('fs');
const path = require('path');

// Ruta al archivo JSON
const filePath = path.join(__dirname, '../data/actividades.json');

function leerActividades() {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
}

function guardarActividades(actividades) {
    fs.writeFileSync(filePath, JSON.stringify(actividades, null, 2));
}

function obtenerTodas() {
    return leerActividades();
}

function obtenerPorId(id) {
    const actividades = leerActividades();
    return actividades.find(a => a.id === id);
}

function crearActividad(nuevaActividad) {
    const actividades = leerActividades();
    // Crear un nuevo id
    const nuevoId = actividades.length > 0 ? actividades[actividades.length - 1].id + 1 : 1;
    const actividad = { id: nuevoId, ...nuevaActividad };
    actividades.push(actividad);
    guardarActividades(actividades);
    return actividad;
}

function actualizarActividad(id, datosActualizados) {
    const actividades = leerActividades();
    const index = actividades.findIndex(a => a.id === id);
    if (index === -1) return null;
    actividades[index] = { id, ...datosActualizados };
    guardarActividades(actividades);
    return actividades[index];
}

function eliminarActividad(id) {
    let actividades = leerActividades();
    const index = actividades.findIndex(a => a.id === id);
    if (index === -1) return null;
    const eliminada = actividades.splice(index, 1);
    guardarActividades(actividades);
    return eliminada[0];
}

module.exports = {
    obtenerTodas,
    obtenerPorId,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};