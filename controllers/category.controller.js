const { Sequelize, QueryTypes, QueryError } = require('sequelize');
const models = require('../models')

function createCategory(req, res) {

    try {

        const categoryInfo = {
            category: req.body.category,
            category_desc: req.body.category_desc,
            status: 1
        }


        models.categories.create(categoryInfo)
            .then((result) => {
                res.status(201).json({
                    success: true,
                    message: "New category created!",
                });
            })
            .catch((error) => {
                res.status(500).json({
                    success: false,
                    message: "Something went wrong in creating category.",
                    error: error.message,
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


function updateCategory(req, res) {

    try {

        const categoryInfo = {
            category: req.body.category,
            category_desc: req.body.category_desc,
            status: req.body.status,
            updateAt: new Date()
        }

        models.categories.update(categoryInfo, { where: { id: req.body.id } })
            .then(result => {
                res.status(200).json({
                    success: true,
                    message: "Category details was successfully updated!",
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


function getAllCategoryList(req, res) {

    models.categories.findAll({ where: {status: 1} }).then((result) => {
        res.status(200).json({
            success: true,
            count: result.length,
            result: result
        });
    })
    .catch((error) => {
        res.status(500).json({
            success: false,
            message: "Something went wrong.",
            error: error.message,
        });
    })

}

module.exports = {
    createCategory: createCategory,
    updateCategory: updateCategory,
    getAllCategoryList: getAllCategoryList
}