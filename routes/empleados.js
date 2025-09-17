const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleadosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador
const empleadosController = new EmpleadosController();

// Instancia del modelo para los nuevos endpoints
const Empleado = require('../models/Empleado');
const empleadoModel = new Empleado();

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

// NUEVAS RUTAS PARA ROLES Y ÁREAS
// Obtener todos los roles disponibles
router.get('/roles', async (req, res) => {
    try {
        const roles = await empleadoModel.getRoles();
        res.json({
            success: true,
            message: 'Roles obtenidos exitosamente',
            data: roles,
            total: roles.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles',
            error: error.message
        });
    }
});

// Obtener todas las áreas disponibles  
router.get('/areas', async (req, res) => {
    try {
        const areas = await empleadoModel.getAreas();
        res.json({
            success: true,
            message: 'Áreas obtenidas exitosamente',
            data: areas,
            total: areas.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener áreas',
            error: error.message
        });
    }
});

// Validar rol específico
router.get('/validar-rol/:rol', async (req, res) => {
    try {
        const { rol } = req.params;
        const esValido = await empleadoModel.validarRol(rol);
        res.json({
            success: true,
            data: {
                rol: rol,
                valido: esValido,
                mensaje: esValido ? 'Rol válido' : 'Rol no encontrado o inactivo'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al validar rol'
        });
    }
});

// Validar área específica
router.get('/validar-area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const esValida = await empleadoModel.validarArea(area);
        res.json({
            success: true,
            data: {
                area: area,
                valida: esValida,
                mensaje: esValida ? 'Área válida' : 'Área no encontrada o inactiva'
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al validar área'
        });
    }
});
// FIN DE NUEVAS RUTAS

// Rutas principales CRUD (las que ya tenías)
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