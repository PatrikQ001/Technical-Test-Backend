const pool = require('../config/database');

exports.getProducts = async (req, res) => {
    try {
        const [products] = await pool.query('SELECT * FROM products ORDER BY name ASC');
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getProductById = async (req, res) => {
    try {
        const [product] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (product.length === 0) return res.status(404).json({ message: 'Product not found' });

        res.json(product[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createProduct = async (req, res) => {
    try {
        const { name, unit_price } = req.body;

        if (!name || !unit_price) {
            return res.status(400).json({ message: "Name and unit_price are required" });
        }

        const [result] = await pool.query(
            'INSERT INTO products (name, unit_price) VALUES (?, ?)',
            [name, unit_price]
        );

        res.status(201).json({ id: result.insertId, message: 'Product created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, unit_price } = req.body;

        const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (existingProduct.length === 0) return res.status(404).json({ message: 'Product not found' });

        await pool.query(
            'UPDATE products SET name = ?, unit_price = ? WHERE id = ?',
            [name, unit_price, req.params.id]
        );

        res.json({ message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const [existingProduct] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.id]);

        if (existingProduct.length === 0) return res.status(404).json({ message: 'Product not found' });

        await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);

        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
