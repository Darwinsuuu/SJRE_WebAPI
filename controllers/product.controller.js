const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');
const imageUploader = require('../helpers/image-uploader')

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
            imgFilename: req.file ? req.file.filename : req.body.imgFilename,
            status: req.body.status
        }


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
    const response = await models.sequelize.query(`SELECT
    c.category AS category,
    p.id AS productId,
    p.product AS productName,
    p.quantity AS quantity,
    p.stockReminder,
    p.imgFilename AS filename,
    p.status,
    COALESCE(s.totalSold, 0) AS sold,
    ROUND(COALESCE(r.averageRating, 0), 2) AS ratings
FROM
    products p
INNER JOIN
    categories c ON p.categoryId = c.id
LEFT JOIN
    (SELECT prodId, SUM(totalSold) AS totalSold FROM
        (SELECT id AS prodId, quantity AS totalSold FROM sales
         UNION ALL
         SELECT id AS prodId, quantity AS totalSold FROM onlinesales) sales_combined
     GROUP BY prodId) s ON p.id = s.prodId
LEFT JOIN
    (SELECT prodId, AVG(rating) AS averageRating FROM reviews GROUP BY prodId) r ON p.id = r.prodId;
`, { type: QueryTypes.SELECT });

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

    const response = await models.sequelize.query(`SELECT
                                                        c.id AS categoryId,
                                                        p.id AS productId,
                                                        p.product AS productName,
                                                        p.barcode,
                                                        p.productDesc AS productDesc,
                                                        p.productDesc AS productDesc,
                                                        p.computedPrice AS computedPrice,
                                                        p.sale AS sale,
                                                        p.price AS price,
                                                        p.quantity AS quantity,
                                                        p.stockReminder,
                                                        p.imgFilename AS filename,
                                                        p.status,
                                                        COALESCE(s.totalSold, 0) AS sold,
                                                        ROUND(COALESCE(r.averageRating, 0), 2) AS ratings
                                                    FROM
                                                        products p
                                                    INNER JOIN
                                                        categories c ON p.categoryId = c.id
                                                    LEFT JOIN
                                                        (
                                                            SELECT
                                                                prodId,
                                                                SUM(totalSold) AS totalSold
                                                            FROM
                                                                (
                                                                    SELECT
                                                                        prodId,
                                                                        SUM(quantity) AS totalSold
                                                                    FROM
                                                                        sales
                                                                    WHERE
                                                                        prodId = ${req.params.id}
                                                                    GROUP BY
                                                                        prodId

                                                                    UNION ALL

                                                                    SELECT
                                                                        prodId,
                                                                        SUM(quantity) AS totalSold
                                                                    FROM
                                                                        onlinesales
                                                                    WHERE
                                                                        prodId = ${req.params.id}
                                                                    GROUP BY
                                                                        prodId
                                                                ) combinedSales
                                                            GROUP BY
                                                                prodId
                                                        ) s ON p.id = s.prodId
                                                    LEFT JOIN
                                                        (
                                                            SELECT
                                                                prodId,
                                                                AVG(rating) AS averageRating
                                                            FROM
                                                                reviews
                                                            WHERE
                                                                prodId = ${req.params.id}
                                                            GROUP BY
                                                                prodId
                                                        ) r ON p.id = r.prodId
                                                    WHERE
                                                        p.id = ${req.params.id};
                                                    `, { type: QueryTypes.SELECT });

    // const reponseReview = await models.review.findAll({ where: { prodId: req.params.id } });
    const responseReview = await models.sequelize.query(`SELECT C.firstname, C.lastname, R.reviewDesc, R.rating, R.createdAt FROM reviews R INNER JOIN customers C ON c.id = R.custId WHERE R.prodId=${req.params.id}`);

    console.log(responseReview)

    // Send the grouped results in the response
    res.status(200).json({
        success: true,
        result: { productInfo: response, reviews: responseReview[0] },
    });
}



async function getSpecificProductByBarcode(req, res) {

    const response = await models.sequelize.query("SELECT p.id, p.product, p.price, p.sale, p.computedPrice, p.quantity AS stocks FROM `products` p WHERE p.barcode = '" + req.params.id + "'", { type: QueryTypes.SELECT });

    const reponseReview = await models.product.findAll({ where: { id: req.params.id } });

    // Send the grouped results in the response
    res.status(200).json({
        success: true,
        result: response,
    });
}


async function buyProductViaBarcode(req, res) {

    let productInfo = []

    req.body.forEach(element => {
        let tempArr = {
            transactionId: element.transactionId,
            prodId: element.id,
            cashierId: element.cashierId,
            currentPrice: element.price,
            currentSale: element.sale,
            currentComputedPrice: element.computedPrice,
            quantity: element.quantity,
            totalPrice: element.total * element.quantity,
        }

        productInfo.push(tempArr);
        models.product.update({ quantity: element.stocks - 1 }, { where: { id: element.id } });

    });



    models.sale.bulkCreate(productInfo)
        .then((result) => {
            res.status(201).json({
                success: true,
                message: "New sales created!",
            });
        }).catch(error => {
            res.status(500).json({
                success: false,
                message: "Something went wrong.",
                error: error.message,
            });
        })
}



async function getAllProductsWithoutCategory(req, res) {

    try {

        const result = await models.product.findAll({ where: { status: 1 } });

        if (result) {

            res.status(200).json({
                success: true,
                message: "Get all products without category is successfully loaded!",
                result: result,
                resultCount: result.length
            })

        } else {
            res.status(500).json({
                success: false,
                message: "Something went wrong.",
                error: error.message,
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
    createProduct: createProduct,
    getAllProducts: getAllProducts,
    getSpecificProduct: getSpecificProduct,
    getSpecificProductByBarcode: getSpecificProductByBarcode,
    updateProduct: updateProduct,
    buyProductViaBarcode: buyProductViaBarcode,
    getAllProductsWithoutCategory: getAllProductsWithoutCategory
}