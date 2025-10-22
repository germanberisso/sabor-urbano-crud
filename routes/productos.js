import express from 'express';
import ProductosController from '../controllers/productosController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const productosController = new ProductosController();

// Middleware global para logs de todas las requests
router.use(ValidationMiddleware.logRequest);

// Middleware específico para validar body en PUT
const validarProductoPUT = (req, res, next) => {
    const { nombre, precio, stock } = req.body;

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'Body vacío: envíe al menos un campo.' });
    }

    if (req.method === 'PUT') {
        const alguno = [nombre, precio, stock].some(f => f !== undefined);
        if (!alguno) {
            return res.status(400).json({ success: false, message: 'Incluya algún campo para actualizar.' });
        }
    }

    next();
};

// Validaciones comunes
const validarCamposPOST = ValidationMiddleware.validarCamposRequeridos(['nombre', 'precio', 'stock']);
const validarNumericos = [ValidationMiddleware.validarNumerico('precio')];

// Rutas
router.get('/', productosController.getAll);
router.get('/:id', ValidationMiddleware.validarParametroId, productosController.getById);

router.post(
    '/',
    ValidationMiddleware.sanitizarDatos,
    validarCamposPOST,
    validarNumericos,
    productosController.create
);

router.put(
    '/:id',
    ValidationMiddleware.validarParametroId,
    ValidationMiddleware.sanitizarDatos,
    validarProductoPUT,
    validarNumericos,
    productosController.update
);

router.delete(
    '/:id',
    ValidationMiddleware.validarParametroId,
    productosController.delete
);

export default router;