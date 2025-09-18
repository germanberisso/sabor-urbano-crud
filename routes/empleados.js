// Importa módulos necesarios para rutas y controladores
const express = require('express');
const router = express.Router();
const EmpleadosController = require('../controllers/empleadosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador de empleados
const empleadosController = new EmpleadosController();

// Instancia del modelo para los nuevos endpoints de roles y áreas
const Empleado = require('../models/Empleado');
const empleadoModel = new Empleado();

// Middleware para validar campos específicos de empleados
const validarEmpleado = (req, res, next) => {
    const { rol, area } = req.body;
    // Valida que el rol sea válido según especificaciones
    if (rol && !['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'].includes(rol)) {
        return res.status(400).json({
            success: false,
            message: 'Rol debe ser: administrador, cocinero, repartidor, mozo, encargado_stock'
        });
    }
    // Valida que el área sea válida según especificaciones
    if (area && !['cocina', 'reparto', 'salon', 'inventario', 'administracion'].includes(area)) {
        return res.status(400).json({
            success: false,
            message: 'Área debe ser: cocina, reparto, salon, inventario, administracion'
        });
    }
    // Continúa al siguiente middleware o controlador
    next();
};

// NUEVAS RUTAS PARA ROLES Y ÁREAS

// Obtiene todos los roles disponibles
router.get('/roles', async (req, res) => {
    try {
        const roles = await empleadoModel.getRoles();
        // Responde con la lista de roles y su cantidad
        res.json({
            success: true,
            message: 'Roles obtenidos exitosamente',
            data: roles,
            total: roles.length
        });
    } catch (error) {
        // Maneja errores internos del servidor
        res.status(500).json({
            success: false,
            message: 'Error al obtener roles',
            error: error.message
        });
    }
});

// Obtiene todas las áreas disponibles
router.get('/areas', async (req, res) => {
    try {
        const areas = await empleadoModel.getAreas();
        // Responde con la lista de áreas y su cantidad
        res.json({
            success: true,
            message: 'Áreas obtenidas exitosamente',
            data: areas,
            total: areas.length
        });
    } catch (error) {
        // Maneja errores internos del servidor
        res.status(500).json({
            success: false,
            message: 'Error al obtener áreas',
            error: error.message
        });
    }
});

// Valida un rol específico
router.get('/validar-rol/:rol', async (req, res) => {
    try {
        const { rol } = req.params;
        const esValido = await empleadoModel.validarRol(rol);
        // Responde con el resultado de la validación del rol
        res.json({
            success: true,
            data: {
                rol: rol,
                valido: esValido,
                mensaje: esValido ? 'Rol válido' : 'Rol no encontrado o inactivo'
            }
        });
    } catch (error) {
        // Maneja errores internos del servidor
        res.status(500).json({
            success: false,
            message: 'Error al validar rol'
        });
    }
});

// Valida un área específica
router.get('/validar-area/:area', async (req, res) => {
    try {
        const { area } = req.params;
        const esValida = await empleadoModel.validarArea(area);
        // Responde con el resultado de la validación del área
        res.json({
            success: true,
            data: {
                area: area,
                valida: esValida,
                mensaje: esValida ? 'Área válida' : 'Área no encontrada o inactiva'
            }
        });
    } catch (error) {
        // Maneja errores internos del servidor
        res.status(500).json({
            success: false,
            message: 'Error al validar área'
        });
    }
});
// FIN DE NUEVAS RUTAS

// Rutas principales CRUD para empleados
router.get('/', (req, res) => empleadosController.getAll(req, res)); // Obtiene todos los empleados
router.get('/activos', (req, res) => empleadosController.getActivos(req, res)); // Obtiene empleados activos
router.get('/estadisticas', (req, res) => empleadosController.getEstadisticas(req, res)); // Obtiene estadísticas de empleados
router.get('/validar-email', (req, res) => empleadosController.validarEmail(req, res)); // Valida email único
router.get('/rol/:rol', (req, res) => empleadosController.getByRol(req, res)); // Filtra empleados por rol
router.get('/area/:area', (req, res) => empleadosController.getByArea(req, res)); // Filtra empleados por área
router.get('/:id', (req, res) => empleadosController.getById(req, res)); // Obtiene un empleado por ID

// Crea un nuevo empleado con validaciones
router.post('/', 
    validationMiddleware.validarCamposRequeridos(['nombre', 'apellido', 'email', 'rol', 'area']), 
    validationMiddleware.validarEmail,
    validarEmpleado, 
    (req, res) => empleadosController.create(req, res)
);

// Actualiza un empleado existente con validaciones
router.put('/:id', validarEmpleado, (req, res) => empleadosController.update(req, res));

// Desactiva un empleado (eliminación lógica)
router.delete('/:id', (req, res) => empleadosController.delete(req, res));

module.exports = router;