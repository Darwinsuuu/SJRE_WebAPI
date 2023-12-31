const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

const authRoute = require('./routes/auth');
const categoryRoute = require('./routes/category.route');
const productRoute = require('./routes/product.route');
const cashierRoute = require('./routes/cashier.route');
const locationRoute = require('./routes/location.route');
const userRoute = require('./routes/customer.route');
const emailerRoute = require('./routes/emailer.route');
const cartRoute = require('./routes/cart.route');
const dashboardRoute = require('./routes/dashboard.route');
const orderRoute = require('./routes/order.route');
const reportRoute = require('./routes/reports.route');
const reviewRoute = require('./routes/review.route');

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
app.use('/api/location', locationRoute);
app.use('/api/user', userRoute);
app.use('/api/emailer', emailerRoute);
app.use('/api/cart', cartRoute);
app.use('/api/dashboard', dashboardRoute);
app.use('/api/order', orderRoute);
app.use('/api/report', reportRoute);
app.use('/api/review', reviewRoute);

module.exports = app;