// controllers/actividadController.js
const actividadModel = require('../models/actividadModel');

// Obtener todas las actividades
function getActividades(req, res) {
    const actividades = actividadModel.obtenerTodas();
    res.json(actividades);
}

// Obtener una actividad por ID
function getActividadPorId(req, res) {
    const id = parseInt(req.params.id);
    const actividad = actividadModel.obtenerPorId(id);
    if (!actividad) {
        return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    }
    res.json(actividad);
}

// Crear nueva actividad
function crearActividad(req, res) {
    const nuevaActividad = req.body;
    if (!nuevaActividad.nombre || !nuevaActividad.precio) {
        return res.status(400).json({ mensaje: 'Faltan datos obligatorios' });
    }
    const actividad = actividadModel.crearActividad(nuevaActividad);
    res.status(201).json(actividad);
}

// Actualizar actividad
function actualizarActividad(req, res) {
    const id = parseInt(req.params.id);
    const datos = req.body;
    const actividadActualizada = actividadModel.actualizarActividad(id, datos);
    if (!actividadActualizada) {
        return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    }
    res.json(actividadActualizada);
}

// Eliminar actividad
function eliminarActividad(req, res) {
    const id = parseInt(req.params.id);
    const actividadEliminada = actividadModel.eliminarActividad(id);
    if (!actividadEliminada) {
        return res.status(404).json({ mensaje: 'Actividad no encontrada' });
    }
    res.json({ mensaje: 'Actividad eliminada', actividad: actividadEliminada });
}

module.exports = {
    getActividades,
    getActividadPorId,
    crearActividad,
    actualizarActividad,
    eliminarActividad
};