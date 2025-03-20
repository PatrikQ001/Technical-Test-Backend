const pool = require('../config/database');

exports.getOrders = async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY date DESC');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getOrderById = async (req, res) => {
    try {
        const [order] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

        if (order.length === 0) return res.status(404).json({ message: 'Order not found' });

        res.json(order[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createOrder = async (req, res) => {
    try {
        const { order_number, final_price, status } = req.body;

        const [result] = await pool.query(
            'INSERT INTO orders (order_number, final_price, status) VALUES (?, ?, ?)',
            [order_number, final_price || 0, status || 'Pending']
        );

        res.status(201).json({ id: result.insertId, message: 'Order created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateOrder = async (req, res) => {
    try {
        const { order_number, final_price, status } = req.body;

        const [existingOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

        if (existingOrder.length === 0) return res.status(404).json({ message: 'Order not found' });

        if (existingOrder[0].status === 'Completed') {
            return res.status(400).json({ message: 'Completed orders cannot be modified' });
        }

        await pool.query(
            'UPDATE orders SET order_number = ?, final_price = ?, status = ? WHERE id = ?',
            [order_number, final_price, status, req.params.id]
        );

        res.json({ message: 'Order updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteOrder = async (req, res) => {
    try {
        const [existingOrder] = await pool.query('SELECT * FROM orders WHERE id = ?', [req.params.id]);

        if (existingOrder.length === 0) return res.status(404).json({ message: 'Order not found' });

        if (existingOrder[0].status === 'Completed') {
            return res.status(400).json({ message: 'Completed orders cannot be deleted' });
        }

        await pool.query('DELETE FROM orders WHERE id = ?', [req.params.id]);

        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
