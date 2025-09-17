const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleadosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador
const empleadosController = new EmpleadosController();

// Middleware de validación específico para empleados
const validarEmpleado = (req, res, next) => {
    const { rol, area } = req.body;
    
    // Validar rol (según especificaciones del trabajo)
    if (rol && !['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'].includes(rol)) {
        return res.status(400).json({
            success: false,
            message: 'Rol debe ser: administrador, cocinero, repartidor, mozo, encargado_stock'
        });
    }
    
    // Validar área (según especificaciones del trabajo)
    if (area && !['cocina', 'reparto', 'salon', 'inventario', 'administracion'].includes(area)) {
        return res.status(400).json({
            success: false,
            message: 'Área debe ser: cocina, reparto, salon, inventario, administracion'
        });
    }
    
    next();
};

// Rutas principales CRUD
router.get('/', (req, res) => empleadosController.getAll(req, res));
router.get('/activos', (req, res) => empleadosController.getActivos(req, res));
router.get('/estadisticas', (req, res) => empleadosController.getEstadisticas(req, res));
router.get('/validar-email', (req, res) => empleadosController.validarEmail(req, res));
router.get('/rol/:rol', (req, res) => empleadosController.getByRol(req, res));
router.get('/area/:area', (req, res) => empleadosController.getByArea(req, res));
router.get('/:id', (req, res) => empleadosController.getById(req, res));

router.post('/', 
    validationMiddleware.validarCamposRequeridos(['nombre', 'apellido', 'email', 'rol', 'area']), 
    validationMiddleware.validarEmail,
    validarEmpleado, 
    (req, res) => empleadosController.create(req, res)
);

router.put('/:id', validarEmpleado, (req, res) => empleadosController.update(req, res));
router.delete('/:id', (req, res) => empleadosController.delete(req, res));

module.exports = router;