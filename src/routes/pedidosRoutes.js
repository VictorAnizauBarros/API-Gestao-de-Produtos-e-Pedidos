// src/routes/pedidosRoutes.js
const express = require('express');
const pedidosController = require('../controllers/pedidosController');

const router = express.Router();

router.post('/', pedidosController.createPedido);
router.get('/:id', pedidosController.getPedidoById);
router.get('/', pedidosController.getPedidos);
router.put('/:id/status', pedidosController.updatePedidoStatus);
router.delete('/:id', pedidosController.deletePedido);

module.exports = router;
