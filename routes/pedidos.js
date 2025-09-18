// Importa módulos necesarios para rutas y controladores
const express = require('express');
const router = express.Router();
const PedidosController = require('../controllers/pedidosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador de pedidos
const pedidosController = new PedidosController();

// Middleware para validar campos específicos de pedidos
const validarPedido = (req, res, next) => {
    const { tipo, plataforma } = req.body;
    // Valida que el tipo sea válido según especificaciones
    if (tipo && !['presencial', 'delivery'].includes(tipo)) {
        return res.status(400).json({
            success: false,
            message: 'Tipo debe ser: presencial o delivery'
        });
    }
    // Valida que la plataforma sea válida según especificaciones
    if (plataforma && !['rappi', 'pedidosya', 'propia', 'local'].includes(plataforma)) {
        return res.status(400).json({
            success: false,
            message: 'Plataforma debe ser: rappi, pedidosya, propia o local'
        });
    }
    // Continúa al siguiente middleware o controlador
    next();
};

// Rutas principales CRUD para pedidos
router.get('/', (req, res) => pedidosController.getAll(req, res)); // Obtiene todos los pedidos
router.get('/estadisticas', (req, res) => pedidosController.getEstadisticas(req, res)); // Obtiene estadísticas de pedidos
router.get('/tipo/:tipo', (req, res) => pedidosController.getByTipo(req, res)); // Filtra pedidos por tipo
router.get('/plataforma/:plataforma', (req, res) => pedidosController.getByPlataforma(req, res)); // Filtra pedidos por plataforma
router.get('/estado/:estado', (req, res) => pedidosController.getByEstado(req, res)); // Filtra pedidos por estado
router.get('/:id', (req, res) => pedidosController.getById(req, res)); // Obtiene un pedido por ID

// Crea un nuevo pedido con validaciones
router.post('/', 
    validationMiddleware.validarCamposRequeridos(['cliente', 'items', 'total', 'tipo', 'plataforma']), 
    validarPedido, 
    (req, res) => pedidosController.create(req, res)
);

// Actualiza un pedido existente con validaciones
router.put('/:id', validarPedido, (req, res) => pedidosController.update(req, res));

// Elimina un pedido
router.delete('/:id', (req, res) => pedidosController.delete(req, res));

module.exports = router;