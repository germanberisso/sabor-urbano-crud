// Importa módulos necesarios para rutas y controladores
const express = require('express');
const router = express.Router();
const TareasController = require('../controllers/tareasController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador de tareas
const tareasController = new TareasController();

// Middleware para validar campos específicos de tareas
const validarTarea = (req, res, next) => {
    const { area, prioridad, estado } = req.body;
    // Valida que el área sea válida según especificaciones
    if (area && !['gestion_pedidos', 'control_inventario'].includes(area)) {
        return res.status(400).json({
            success: false,
            message: 'Área debe ser: gestion_pedidos o control_inventario'
        });
    }
    // Valida que la prioridad sea válida
    if (prioridad && !['alta', 'media', 'baja'].includes(prioridad)) {
        return res.status(400).json({
            success: false,
            message: 'Prioridad debe ser: alta, media o baja'
        });
    }
    // Valida que el estado sea válido
    if (estado && !['pendiente', 'en_proceso', 'finalizada'].includes(estado)) {
        return res.status(400).json({
            success: false,
            message: 'Estado debe ser: pendiente, en_proceso o finalizada'
        });
    }
    // Continúa al siguiente middleware o controlador
    next();
};

// Rutas principales CRUD para tareas
router.get('/', (req, res) => tareasController.getAll(req, res)); // Obtiene todas las tareas
router.get('/estadisticas', (req, res) => tareasController.getEstadisticas(req, res)); // Obtiene estadísticas de tareas por área
router.get('/urgentes', (req, res) => tareasController.getTareasUrgentes(req, res)); // Obtiene tareas pendientes de alta prioridad
router.get('/filtrar', (req, res) => tareasController.filtrar(req, res)); // Filtra tareas por múltiples criterios
router.get('/area/:area', (req, res) => tareasController.getByArea(req, res)); // Filtra tareas por área
router.get('/:id', (req, res) => tareasController.getById(req, res)); // Obtiene una tarea por ID

// Crea una nueva tarea con validaciones
router.post('/', 
    validationMiddleware.validarCamposRequeridos(['titulo', 'area']), 
    validarTarea, 
    (req, res) => tareasController.create(req, res)
);

// Actualiza una tarea existente con validaciones
router.put('/:id', validarTarea, (req, res) => tareasController.update(req, res));

// Elimina una tarea
router.delete('/:id', (req, res) => tareasController.delete(req, res));

module.exports = router;