// routes/actividadRoutes.js
const express = require('express');
const router = express.Router();
const actividadController = require('../controllers/actividadController');

// Rutas CRUD
router.get('/', actividadController.getActividades);          // Obtener todas
router.get('/:id', actividadController.getActividadPorId);    // Obtener por ID
router.post('/', actividadController.crearActividad);         // Crear nueva
router.put('/:id', actividadController.actualizarActividad); // Actualizar
router.delete('/:id', actividadController.eliminarActividad); // Eliminar

module.exports = router;