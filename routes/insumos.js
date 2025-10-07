import express from 'express';
import InsumosController from '../controllers/insumosController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const insumosController = new InsumosController();

// Middleware para validar insumos
const validarInsumo = (req, res, next) => {
    const { nombre, categoria, stock, stockMinimo, unidadMedida, proveedor } = req.body;

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'Body vacío: envíe al menos un campo.' });
    }

    if (req.method === 'PUT') {
        const alguno = [nombre, categoria, stock, stockMinimo, unidadMedida, proveedor].some(f => f !== undefined);
        if (!alguno) {
            return res.status(400).json({ success: false, message: 'Incluya algún campo para actualizar.' });
        }
    }

    if (categoria && !['alimentos', 'bebidas', 'limpieza', 'utensilios', 'otros'].includes(categoria)) {
        return res.status(400).json({
            success: false,
            message: 'Categoría debe ser: alimentos, bebidas, limpieza, utensilios, otros'
        });
    }

    next();
};

// Rutas API
router.get('/', insumosController.getAll.bind(insumosController));
router.get('/bajo-stock', insumosController.getBajoStock.bind(insumosController));
router.get('/alertas', insumosController.getAlertas.bind(insumosController));
router.get('/categoria/:categoria', insumosController.getByCategoria.bind(insumosController));
router.get('/:id', insumosController.getById.bind(insumosController));

router.post(
    '/',
    ValidationMiddleware.validarCamposRequeridos(['nombre', 'categoria', 'stock', 'stockMinimo']),
    validarInsumo,
    insumosController.create.bind(insumosController)
);

router.put('/:id', validarInsumo, insumosController.update.bind(insumosController));
router.put('/:id/stock', insumosController.actualizarStock.bind(insumosController));
router.put('/:id/descontar', insumosController.descontarStock.bind(insumosController));

router.delete('/:id', insumosController.delete.bind(insumosController));

export default router;