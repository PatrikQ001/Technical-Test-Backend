const express = require('express');
const router = express.Router();
const {
    getOrderProducts,
    addProductToOrder,
    updateProductInOrder,
    removeProductFromOrder
} = require('../controllers/orderProducts.controller');

router.get('/:order_id', getOrderProducts);
router.post('/', addProductToOrder);
router.put('/:id', updateProductInOrder);
router.delete('/:id', removeProductFromOrder);

module.exports = router;
