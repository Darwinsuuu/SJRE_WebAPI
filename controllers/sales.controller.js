const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');

function createProduct(req, res) {

    try {

        const productInfo = {
            product: req.body.product,
            categoryId: req.body.categoryId,
            productDesc: req.body.productDesc,
            price: req.body.price,
            barcode: req.body.barcode,
            sale: req.body.sale,
            computedPrice: req.body.computedPrice,
            quantity: req.body.quantity,
            stockReminder: req.body.stockReminder,
            imgFilename: req.file.filename,
            status: 1
        }

        if (req.file.filename) {
            models.product.create(productInfo)
            .then((result) => {
                res.status(201).json({
                    success: true,
                    message: "New product created!",
                });
            })
            .catch((error) => {

                if (error.name === 'SequelizeUniqueConstraintError') {
                    // If a unique constraint is violated, return a user-friendly error message
                    return res.status(400).json({
                        success: false,
                        message: 'Validation Error',
                        error: error.errors[0].message,
                    });
                } else {
                    // Handle other types of errors here
                    return res.status(500).json({
                        success: false,
                        message: 'Something went wrong in creating product.',
                        error: error,
                    });
                }
            })
        } else {
            return res.status(500).json({
                success: false,
                message: 'Unsupported file.',
                error: error,
            });
        }





    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}


module.exports = {
    createSales: createSales,
}