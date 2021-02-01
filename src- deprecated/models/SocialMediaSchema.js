const mongoose = require('mongoose')

const SocialMediaSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    adress: {
        type: String,
        required: true
    },
    icon: {
        type: String,
        required: false
    }
})

module.exports = mongoose.model('social', SocialMediaSchema)