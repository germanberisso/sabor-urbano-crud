import express from 'express';
import EmpleadosController from '../controllers/empleadosController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const empleadosController = new EmpleadosController();

// Middleware para validar campos específicos de empleados
const validarEmpleado = (req, res, next) => {
    const { nombre, apellido, email, telefono, rol, area, fechaIngreso } = req.body;

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El body no puede estar vacío. Debe incluir al menos un campo para actualizar.'
        });
    }

    if (req.method === 'PUT') {
        const camposValidos = [nombre, apellido, email, telefono, rol, area, fechaIngreso].some(f => f !== undefined);
        if (!camposValidos) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo válido para actualizar.'
            });
        }
    }

    if (rol && !['administrador', 'cocinero', 'repartidor', 'mozo', 'encargado_stock'].includes(rol)) {
        return res.status(400).json({ success: false, message: 'Rol inválido' });
    }

    if (area && !['cocina', 'reparto', 'salon', 'inventario', 'administracion'].includes(area)) {
        return res.status(400).json({ success: false, message: 'Área inválida' });
    }

    if (req.method === 'POST' && email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Formato de email no válido' });
        }
    }

    next();
};

// Rutas API
router.get('/', empleadosController.getAll.bind(empleadosController));
router.get('/rol/:rol', empleadosController.getByRol.bind(empleadosController));
router.get('/area/:area', empleadosController.getByArea.bind(empleadosController));
router.get('/validar-email', empleadosController.validarEmail.bind(empleadosController));
router.get('/:id', empleadosController.getById.bind(empleadosController));

router.post(
    '/',
    ValidationMiddleware.validarCamposRequeridos(['nombre', 'apellido', 'email', 'rol', 'area']),
    ValidationMiddleware.validarEmail,
    validarEmpleado,
    empleadosController.create.bind(empleadosController)
);

router.put(
    '/:id',
    ValidationMiddleware.validarEmail,
    validarEmpleado,
    empleadosController.update.bind(empleadosController)
);

router.delete('/:id', empleadosController.delete.bind(empleadosController));

export default router;