// Node Modules
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const AlbumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    date: {
        type: String,
        required: false
    },
    images: {
        type: Array,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    }
})

AlbumSchema.plugin(paginate)

module.exports = mongoose.model('album', AlbumSchema)