const mongoose = require('mongoose')

const AlbumSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 40,
    },
    images: {
        type: Array,
        required: false,
    }
})

module.exports =  mongoose.model('album', AlbumSchema)