// Importa módulos necesarios para rutas y controladores
const express = require('express');
const router = express.Router();
const InsumosController = require('../controllers/insumosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador de insumos
const insumosController = new InsumosController();

// Middleware para validar campos específicos de insumos
const validarInsumo = (req, res, next) => {
    const { stock, stockMinimo } = req.body;
    // Valida que stock sea un número no negativo si está presente
    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Stock debe ser un número mayor o igual a 0'
        });
    }
    // Valida que stockMinimo sea un número no negativo si está presente
    if (stockMinimo !== undefined && (isNaN(parseInt(stockMinimo)) || parseInt(stockMinimo) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Stock mínimo debe ser un número mayor o igual a 0'
        });
    }
    // Continúa al siguiente middleware o controlador
    next();
};

// Rutas principales CRUD para insumos
router.get('/', (req, res) => insumosController.getAll(req, res)); // Obtiene todos los insumos
router.get('/bajo-stock', (req, res) => insumosController.getBajoStock(req, res)); // Obtiene insumos con stock bajo
router.get('/alertas', (req, res) => insumosController.getAlertas(req, res)); // Obtiene alertas de stock bajo
router.get('/categoria/:categoria', (req, res) => insumosController.getByCategoria(req, res)); // Filtra insumos por categoría
router.get('/:id', (req, res) => insumosController.getById(req, res)); // Obtiene un insumo por ID

// Crea un nuevo insumo con validaciones
router.post('/', 
    validationMiddleware.validarCamposRequeridos(['nombre', 'categoria']), 
    validarInsumo, 
    (req, res) => insumosController.create(req, res)
);

// Rutas específicas para gestión de stock
router.put('/:id/stock', (req, res) => insumosController.actualizarStock(req, res)); // Actualiza el stock de un insumo
router.put('/:id/descontar', (req, res) => insumosController.descontarStock(req, res)); // Descuenta stock de un insumo

// Actualiza un insumo existente con validaciones
router.put('/:id', validarInsumo, (req, res) => insumosController.update(req, res));

// Elimina un insumo
router.delete('/:id', (req, res) => insumosController.delete(req, res));

module.exports = router;