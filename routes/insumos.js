const express = require('express');
const router = express.Router();
const InsumosController = require('../controllers/insumosController');
const validationMiddleware = require('../middleware/validation');

// Instancia del controlador
const insumosController = new InsumosController();

// Middleware de validación específico para insumos
const validarInsumo = (req, res, next) => {
    const { stock, stockMinimo } = req.body;
    
    // Validar que stock sea un número si está presente
    if (stock !== undefined && (isNaN(parseInt(stock)) || parseInt(stock) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Stock debe ser un número mayor o igual a 0'
        });
    }
    
    // Validar que stockMinimo sea un número si está presente
    if (stockMinimo !== undefined && (isNaN(parseInt(stockMinimo)) || parseInt(stockMinimo) < 0)) {
        return res.status(400).json({
            success: false,
            message: 'Stock mínimo debe ser un número mayor o igual a 0'
        });
    }
    
    next();
};

// Rutas principales CRUD
router.get('/', (req, res) => insumosController.getAll(req, res));
router.get('/bajo-stock', (req, res) => insumosController.getBajoStock(req, res));
router.get('/alertas', (req, res) => insumosController.getAlertas(req, res));
router.get('/categoria/:categoria', (req, res) => insumosController.getByCategoria(req, res));
router.get('/:id', (req, res) => insumosController.getById(req, res));

router.post('/', 
    validationMiddleware.validarCamposRequeridos(['nombre', 'categoria']), 
    validarInsumo, 
    (req, res) => insumosController.create(req, res)
);

// Rutas específicas para gestión de stock
router.put('/:id/stock', (req, res) => insumosController.actualizarStock(req, res));
router.put('/:id/descontar', (req, res) => insumosController.descontarStock(req, res));

router.put('/:id', validarInsumo, (req, res) => insumosController.update(req, res));
router.delete('/:id', (req, res) => insumosController.delete(req, res));

module.exports = router;