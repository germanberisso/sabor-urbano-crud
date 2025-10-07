import express from 'express';
import TareasController from '../controllers/tareasController.js';
import ValidationMiddleware from '../middleware/validation.js';

const router = express.Router();
const tareasController = new TareasController();

// Middleware para validar tareas
const validarTarea = (req, res, next) => {
    const { titulo, descripcion, area, estado, prioridad, empleadoAsignado, pedidoAsociado, observaciones } = req.body;

    if (req.method === 'PUT' && Object.keys(req.body).length === 0) {
        return res.status(400).json({ success: false, message: 'Body vacío: proporcione al menos un campo.' });
    }

    if (req.method === 'PUT') {
        const camposValidos = [titulo, descripcion, area, estado, prioridad, empleadoAsignado, pedidoAsociado, observaciones]
            .some(f => f !== undefined);
        if (!camposValidos) {
            return res.status(400).json({ success: false, message: 'Debe enviar al menos un campo válido.' });
        }
    }

    if (area && !['gestion_pedidos', 'control_inventario'].includes(area)) {
        return res.status(400).json({ success: false, message: 'Área debe ser: gestion_pedidos, control_inventario' });
    }
    if (estado && !['pendiente', 'en_proceso', 'finalizada'].includes(estado)) {
        return res.status(400).json({ success: false, message: 'Estado debe ser: pendiente, en_proceso, finalizada' });
    }
    if (prioridad && !['alta', 'media', 'baja'].includes(prioridad)) {
        return res.status(400).json({ success: false, message: 'Prioridad debe ser: alta, media, baja' });
    }

    next();
};

// Rutas API
router.get('/', tareasController.getAll.bind(tareasController));
router.get('/area/:area', tareasController.getByArea.bind(tareasController));
router.get('/:id', tareasController.getById.bind(tareasController));

router.post(
    '/',
    ValidationMiddleware.validarCamposRequeridos(['titulo', 'area']),
    validarTarea,
    tareasController.create.bind(tareasController)
);

router.put('/:id', validarTarea, tareasController.update.bind(tareasController));

// Transiciones de estado
router.patch('/:id/iniciar', tareasController.iniciar.bind(tareasController));
router.patch('/:id/finalizar', tareasController.finalizar.bind(tareasController));

router.delete('/:id', tareasController.delete.bind(tareasController));

export default router;