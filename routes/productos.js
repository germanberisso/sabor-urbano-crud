import express from 'express';
import ProductosController from '../controllers/productosController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const productosController = new ProductosController();

// Middleware para validar productos
const validarProducto = (req, res, next) => {
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

// Rutas API
router.get('/', productosController.getAll.bind(productosController));
router.get('/:id', productosController.getById.bind(productosController));

router.post(
    '/',
    ValidationMiddleware.validarCamposRequeridos(['nombre', 'precio', 'stock']),
    validarProducto,
    productosController.create.bind(productosController)
);

router.put('/:id', validarProducto, productosController.update.bind(productosController));
router.delete('/:id', productosController.delete.bind(productosController));

export default router;