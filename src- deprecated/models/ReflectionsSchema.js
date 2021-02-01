const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const ReflectionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    cover: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: false
    },
    links: {
        type: Array
    },
    youTubeID: {
        type: String,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    }
})

ReflectionSchema.plugin(paginate)

module.exports = mongoose.model('reflection', ReflectionSchema)