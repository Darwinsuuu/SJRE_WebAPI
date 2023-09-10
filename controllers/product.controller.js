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



function updateProduct(req, res) {

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
            imgFilename: req.file.filename || req.body.imgFilename,
            status: req.body.status
        }

        console.log(req.body)

        models.product.update(productInfo, { where: { id: req.body.productId } })
            .then(result => {
                res.status(200).json({
                    success: true,
                    message: "Product details was successfully updated!",
                });
            })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    }

}


async function getAllProducts(req, res) {
    const response = await models.sequelize.query("SELECT c.category AS category, p.id AS productId, p.product AS productName, p.quantity AS quantity, p.stockReminder, p.imgFilename as filename, p.status, COALESCE(s.totalSold, 0) AS sold, ROUND(COALESCE(r.averageRating, 0), 2) AS ratings FROM products p INNER JOIN categories c ON p.categoryId = c.id LEFT JOIN (SELECT prodId, COUNT(*) AS totalSold FROM sales GROUP BY prodId) s ON p.id = s.prodId LEFT JOIN (SELECT prodId, AVG(rating) AS averageRating FROM reviews GROUP BY prodId) r ON p.id = r.prodId", { type: QueryTypes.SELECT });

    // Initialize a map to store categories and their items
    const categoryMap = new Map();

    for (const row of response) {
        const category = row.category;

        if (!categoryMap.has(category)) {
            // If the category doesn't exist in the map, create an entry for it
            categoryMap.set(category, []);
        }

        // Add the product to the category's list of items
        categoryMap.get(category).push({
            productId: row.productId,
            productName: row.productName,
            quantity: row.quantity,
            filename: row.filename,
            stockReminder: row.stockReminder,
            sold: row.sold,
            ratings: row.ratings,
            status: row.status == 1 ? true : false,
        });
    }

    // Convert the map to an array of objects
    const groupedResults = Array.from(categoryMap, ([category, items]) => ({
        category,
        items,
    }));

    // Send the grouped results in the response
    res.status(200).json({
        success: true,
        result: groupedResults,
    });
}


async function getSpecificProduct(req, res) {

    const response = await models.sequelize.query("SELECT c.id AS categoryId, p.id AS productId, p.product AS productName, p.barcode, p.productDesc AS productDesc, p.productDesc AS productDesc, p.computedPrice AS computedPrice, p.sale AS sale, p.price AS price, p.quantity AS quantity, p.stockReminder, p.imgFilename as filename, p.status, COALESCE(s.totalSold, 0) AS sold, ROUND(COALESCE(r.averageRating, 0), 2) AS ratings FROM products p INNER JOIN categories c ON p.categoryId = c.id LEFT JOIN (SELECT prodId, COUNT(*) AS totalSold FROM sales GROUP BY prodId) s ON p.id = s.prodId LEFT JOIN (SELECT prodId, AVG(rating) AS averageRating FROM reviews GROUP BY prodId) r ON p.id = r.prodId WHERE p.id = '" + req.params.id +"'", { type: QueryTypes.SELECT });

    const reponseReview = await models.review.findAll({where: {id: req.params.id}});

    // Send the grouped results in the response
    res.status(200).json({
        success: true,
        result: {productInfo: response, reviews: reponseReview},
    });
}



async function getSpecificProductByBarcode(req, res) {

    const response = await models.sequelize.query("SELECT p.id, p.product, p.price, p.sale, p.computedPrice, p.quantity AS stocks FROM `products` p WHERE p.barcode = '" + req.params.id +"'", { type: QueryTypes.SELECT });

    const reponseReview = await models.product.findAll({where: {id: req.params.id}});

    // Send the grouped results in the response
    res.status(200).json({
        success: true,
        result: response,
    });
}


module.exports = {
    createProduct: createProduct,
    getAllProducts: getAllProducts,
    getSpecificProduct: getSpecificProduct,
    getSpecificProductByBarcode: getSpecificProductByBarcode,
    updateProduct: updateProduct
}