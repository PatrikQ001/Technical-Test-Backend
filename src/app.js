const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const helmet = require('helmet');

const ordersRoutes = require('./routes/orders.routes');
const productsRoutes = require('./routes/products.routes');
const orderProductsRoutes = require('./routes/orderProducts.routes');

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(helmet());

app.use('/api/orders', ordersRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/order-products', orderProductsRoutes);

module.exports = app;
