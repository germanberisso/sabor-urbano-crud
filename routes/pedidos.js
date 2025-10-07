import express from 'express';
import PedidosController from '../controllers/pedidosController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const pedidosController = new PedidosController();

// Middleware para validar pedidos
const validarPedido = (req, res, next) => {
    const { cliente, items, total, tipo, plataforma, estado, tiempoEstimado, observaciones } = req.body;

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'El body de la solicitud no puede estar vacío. Debe incluir al menos un campo para actualizar.'
        });
    }

    if (req.method === 'PUT') {
        const alguno = [cliente, items, total, tipo, plataforma, estado, tiempoEstimado, observaciones].some(f => f !== undefined);
        if (!alguno) {
            return res.status(400).json({
                success: false,
                message: 'Debe proporcionar al menos un campo válido para actualizar.'
            });
        }
    }

    if (tipo && !['presencial', 'delivery'].includes(tipo)) {
        return res.status(400).json({ success: false, message: 'Tipo debe ser: presencial, delivery' });
    }

    if (plataforma && !['rappi', 'pedidosya', 'propia', 'local'].includes(plataforma)) {
        return res.status(400).json({ success: false, message: 'Plataforma debe ser: rappi, pedidosya, propia, local' });
    }

    if (estado && !['pendiente', 'en_preparacion', 'listo', 'en_camino', 'entregado', 'finalizado'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado debe ser: pendiente, en_preparacion, listo, en_camino, entregado, finalizado' });
    }

    next();
};

// Rutas API
router.get('/', pedidosController.getAll.bind(pedidosController));
//router.get('/tipo/:tipo', pedidosController.getByTipo.bind(pedidosController));
//router.get('/plataforma/:plataforma', pedidosController.getByPlataforma.bind(pedidosController));
router.get('/:id', pedidosController.getById.bind(pedidosController));

router.post(
    '/',
    ValidationMiddleware.validarCamposRequeridos(['itemsText', 'total', 'tipo', 'plataforma', 'estado']),
    validarPedido,
    pedidosController.create.bind(pedidosController)
);

router.put('/:id', validarPedido, pedidosController.update.bind(pedidosController));
router.delete('/:id', pedidosController.delete.bind(pedidosController));

export default router;