// Node modules
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')


const ShepherdSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: false
    },
    office: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: false
    },
    telephone: {
        type: String,
        required: false
    },
    links: {
        type: Array,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    },
})


ShepherdSchema.plugin(paginate)

module.exports = mongoose.model('shepherd', ShepherdSchema)