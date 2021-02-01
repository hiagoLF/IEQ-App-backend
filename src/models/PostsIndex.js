const mongoose = require('mongoose')

const PostIndexSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 40,
    },
    postsIds: {
        type: Array,
        required: false,
    }
})

module.exports =  mongoose.model('postindex', PostIndexSchema)