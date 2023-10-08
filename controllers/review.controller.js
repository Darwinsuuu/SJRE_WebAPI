const { Sequelize, QueryTypes } = require('sequelize');
const models = require('../models')

async function createComment(req, res) {
    try {

        let data = {
            prodId: req.body.prodId,
            custId: req.body.custId,
            rating: req.body.rating,
            reviewDesc: req.body.reviewDesc
        }
        
        await models.review.create(data);

        res.status(200).json({
            success: true,
            message: "Review was successfully submitted!"
        })

    } catch(error) {

        res.status(500).json({
            status: false,
            message: "Something went wrong!",
            error: error.message
        })

    }
}


module.exports = {
    createComment: createComment
}