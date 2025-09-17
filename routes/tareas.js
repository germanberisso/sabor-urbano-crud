const express = require('express');
const router = express.Router();
const TareasController = require('../controllers/tareasController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador
const tareasController = new TareasController();

// Middleware de validación específico para tareas
const validarTarea = (req, res, next) => {
    const { area, prioridad, estado } = req.body;
    
    // Validar área (según especificaciones del trabajo)
    if (area && !['gestion_pedidos', 'control_inventario'].includes(area)) {
        return res.status(400).json({
            success: false,
            message: 'Área debe ser: gestion_pedidos o control_inventario'
        });
    }
    
    // Validar prioridad
    if (prioridad && !['alta', 'media', 'baja'].includes(prioridad)) {
        return res.status(400).json({
            success: false,
            message: 'Prioridad debe ser: alta, media o baja'
        });
    }
    
    // Validar estado
    if (estado && !['pendiente', 'en_proceso', 'finalizada'].includes(estado)) {
        return res.status(400).json({
            success: false,
            message: 'Estado debe ser: pendiente, en_proceso o finalizada'
        });
    }
    
    next();
};

// Rutas principales CRUD
router.get('/', (req, res) => tareasController.getAll(req, res));
router.get('/estadisticas', (req, res) => tareasController.getEstadisticas(req, res));
router.get('/urgentes', (req, res) => tareasController.getTareasUrgentes(req, res));
router.get('/filtrar', (req, res) => tareasController.filtrar(req, res));
router.get('/area/:area', (req, res) => tareasController.getByArea(req, res));
router.get('/:id', (req, res) => tareasController.getById(req, res));

router.post('/', validationMiddleware.validarCamposRequeridos(['titulo', 'area']), validarTarea, (req, res) => {
    tareasController.create(req, res);
});

router.put('/:id', validarTarea, (req, res) => tareasController.update(req, res));
router.delete('/:id', (req, res) => tareasController.delete(req, res));

module.exports = router;