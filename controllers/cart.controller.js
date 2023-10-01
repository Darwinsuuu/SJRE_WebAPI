const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models');



async function getAllMyCartList(req, res) {

    try {

        // const result = await models.cart.findAll({ where: { custId: req.params.id } } );

        const result = await models.sequelize.query(`SELECT C.id AS cartId, C.prodId, C.quantity as quantity, C.active, P.product as productName, P.quantity as stocks, P.price, P.sale, P.computedPrice, P.imgFilename, P.status FROM carts C INNER JOIN products P ON C.prodId = P.id WHERE C.custId = ${req.params.id}`, { type: QueryTypes.SELECT })

        res.status(200).json({
            success: true,
            message: 'Get All Cart List successfuly fetched!',
            result: result,
            resultCount: result.length
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}

async function createCart(req, res) {
    try {

        const cartData = {
            custId: req.body.custId,
            prodId: req.body.prodId,
            quantity: req.body.prodQuantity,
            active: req.body.active
        }


        const checkCartData = await models.cart.findOne({ where: { custId: cartData.custId, prodId: cartData.prodId } });

        if (checkCartData) {
            const newQuantity = parseInt(cartData.quantity) + parseInt(checkCartData.quantity);
            models.cart.update({ quantity: newQuantity }, { where: { id: checkCartData.id } });
        } else {
            await models.cart.create(cartData);
        }

        res.status(201).json({
            success: true,
            message: 'Cart was successfully added!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}


async function updateCart(req, res) {
    try {


        const cartInfo = {
            quantity: req.body.quantity,
            active: req.body.active
        }

        models.cart.update(cartInfo, { where: { id: req.body.cartId } });

        res.status(201).json({
            success: true,
            message: 'Cart was successfully updated!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}



async function deleteCart(req, res) {
    try {

        await models.cart.destroy({ where: { id: req.params.id } })

        res.status(201).json({
            success: true,
            message: 'Cart was successfully deleted!',
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }
}



async function checkout(req, res) {

    try {

        const OLTransData = {
            custId: req.body.OLTransData.custId,
            location: req.body.OLTransData.location,
            mobileNo: req.body.OLTransData.mobileNo,
            remarks: '',
            status: 'Pending'
        }

        console.log(OLTransData)

        const activeCartIds = req.body.CartData
            .filter(item => item.active === 1)
            .map(item => item.prodId);

        let products;
        let transaction;

        models.sequelize
            .transaction()
            .then((t) => {
                transaction = t;
                return models.sequelize.query(`SELECT * FROM products WHERE id IN (${activeCartIds})`, { types: QueryTypes.SELECT })
            })
            .then((data) => {
                products = data;
                return models.onlineTransaction.create(OLTransData, { transaction });
            })
            .then((result) => {
                let productInfo = [];

                let cart = req.body.CartData.filter(item => item.active === 1);


                cart.forEach(element => {

                    let prod = products[0].filter(x => x.id == element.prodId);

                    models.product.update({quantity: prod[0].quantity - element.quantity}, { where: { id: prod[0].id } });
                    models.cart.destroy({ where: { id: element.cartId } });
                    // console.log(element.cartId)

                    let tempCart = {
                        OLTransID: result.id,
                        prodId: element.prodId,
                        currentPrice: prod[0].price,
                        currentSale: prod[0].sale,
                        currentComputedPrice: prod[0].computedPrice,
                        quantity: element.quantity,
                        totalPrice: parseFloat(prod[0].computedPrice) * parseFloat(element.quantity)
                    }

                    productInfo.push(tempCart);
                });

                return models.onlineSales.bulkCreate(productInfo);
            }).then((final) => {

                res.status(201).json({
                    success: true,
                    message: "Online transaction successfully created!",
                });

                // transaction.commit();   /* commit all query made */
            })
            .catch((error) => {
                // checks if transaction was initialized
                if (transaction) {
                    transaction.rollback(); /* rollback and return data that was submitted to database */
                }

                if (error.name === 'SequelizeUniqueConstraintError') {
                    // If a unique constraint is violated, return a user-friendly error message
                    return res.status(400).json({
                        success: false,
                        message: 'Validation Error',
                        error: error.errors[0].message,
                    });
                } else {
                    // Handle other types of errors here
                    console.log(error)
                    return res.status(500).json({
                        success: false,
                        message: "Something went wrong",
                        error: error.message,
                    });

                }
            });


    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong!",
            error: error.message
        })
    }

}


module.exports = {
    getAllMyCartList: getAllMyCartList,
    createCart: createCart,
    updateCart: updateCart,
    deleteCart: deleteCart,
    checkout: checkout
}