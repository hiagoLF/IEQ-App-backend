const mongoose = require('mongoose')

const paginate = require('mongoose-paginate')

const AlbumSchema = new mongoose.Schema({
    albumTitle: {
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

AlbumSchema.plugin(paginate)

module.exports =  mongoose.model('album', AlbumSchema)