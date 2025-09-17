const express = require('express');
const router = express.Router();
const PedidosController = require('../controllers/pedidosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador
const pedidosController = new PedidosController();

// Middleware de validación específico para pedidos
const validarPedido = (req, res, next) => {
    const { tipo, plataforma } = req.body;
    
    // Validar tipo (según especificaciones del trabajo)
    if (tipo && !['presencial', 'delivery'].includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo debe ser: presencial o delivery'
        });
    }
    
    // Validar plataforma (según especificaciones del trabajo)
    if (plataforma && !['rappi', 'pedidosya', 'propia', 'local'].includes(plataforma)) {
        return res.status(400).json({
            success: false,
            message: 'Plataforma debe ser: rappi, pedidosya, propia o local'
        });
    }
    
    next();
};

// Rutas principales CRUD
router.get('/', (req, res) => pedidosController.getAll(req, res));
router.get('/estadisticas', (req, res) => pedidosController.getEstadisticas(req, res));
router.get('/tipo/:tipo', (req, res) => pedidosController.getByTipo(req, res));
router.get('/plataforma/:plataforma', (req, res) => pedidosController.getByPlataforma(req, res));
router.get('/estado/:estado', (req, res) => pedidosController.getByEstado(req, res));
router.get('/:id', (req, res) => pedidosController.getById(req, res));

router.post('/', 
    validationMiddleware.validarCamposRequeridos(['cliente', 'items', 'total', 'tipo', 'plataforma']), 
    validarPedido, 
    (req, res) => pedidosController.create(req, res)
);

router.put('/:id', validarPedido, (req, res) => pedidosController.update(req, res));
router.delete('/:id', (req, res) => pedidosController.delete(req, res));

module.exports = router;