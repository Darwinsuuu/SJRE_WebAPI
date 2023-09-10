const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const authRoute = require('./routes/auth');
const categoryRoute = require('./routes/category.route');
const productRoute = require('./routes/product.route');
const cashierRoute = require('./routes/cashier.route');

app.use(cors({
    origin: '*',
    methods: ['GET','POST','DELETE','UPDATE','PUT','PATCH']
}));


app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// routes
app.use('/api/auth', authRoute);
app.use('/api/category', categoryRoute);
app.use('/api/product', productRoute);
app.use('/api/cashier', cashierRoute);

module.exports = app;