// src/routes/produtosRoutes.js
const express = require('express');
const produtosController = require('../controllers/produtosController');

const router = express.Router();

router.post('/', produtosController.createProduto);
router.get('/:id', produtosController.getProdutoById);
router.get('/', produtosController.getProdutos);
router.put('/:id', produtosController.updateProduto);
router.delete('/:id', produtosController.deleteProduto);

module.exports = router;
