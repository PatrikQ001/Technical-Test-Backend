const pool = require('../config/database');

exports.getOrderProducts = async (req, res) => {
    try {
        const [products] = await pool.query(
            `SELECT op.id, p.name, p.unit_price, op.quantity, op.total_price 
             FROM order_products op 
             JOIN products p ON op.product_id = p.id 
             WHERE op.order_id = ?`,
            [req.params.order_id]
        );
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.addProductToOrder = async (req, res) => {
    try {
        const { order_id, product_id, quantity } = req.body;

        const [[product]] = await pool.query('SELECT unit_price FROM products WHERE id = ?', [product_id]);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const total_price = product.unit_price * quantity;

        const [result] = await pool.query(
            'INSERT INTO order_products (order_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)',
            [order_id, product_id, quantity, total_price]
        );

        await pool.query(
            'UPDATE orders SET total_products = total_products + ?, final_price = final_price + ? WHERE id = ?',
            [quantity, total_price, order_id]
        );

        res.status(201).json({ id: result.insertId, message: "Product added to order" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProductInOrder = async (req, res) => {
    try {
        const { quantity } = req.body;

        const [[orderProduct]] = await pool.query('SELECT * FROM order_products WHERE id = ?', [req.params.id]);

        if (!orderProduct) return res.status(404).json({ message: "Order product not found" });

        const [[product]] = await pool.query('SELECT unit_price FROM products WHERE id = ?', [orderProduct.product_id]);

        if (!product) return res.status(404).json({ message: "Product not found" });

        const new_total_price = product.unit_price * quantity;

        await pool.query(
            'UPDATE order_products SET quantity = ?, total_price = ? WHERE id = ?',
            [quantity, new_total_price, req.params.id]
        );

        const price_difference = new_total_price - orderProduct.total_price;
        const quantity_difference = quantity - orderProduct.quantity;

        await pool.query(
            'UPDATE orders SET total_products = total_products + ?, final_price = final_price + ? WHERE id = ?',
            [quantity_difference, price_difference, orderProduct.order_id]
        );

        res.json({ message: "Product quantity updated in order" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.removeProductFromOrder = async (req, res) => {
    try {
        const [[orderProduct]] = await pool.query('SELECT * FROM order_products WHERE id = ?', [req.params.id]);

        if (!orderProduct) return res.status(404).json({ message: "Order product not found" });

        await pool.query('DELETE FROM order_products WHERE id = ?', [req.params.id]);

        await pool.query(
            'UPDATE orders SET total_products = total_products - ?, final_price = final_price - ? WHERE id = ?',
            [orderProduct.quantity, orderProduct.total_price, orderProduct.order_id]
        );

        res.json({ message: "Product removed from order" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
