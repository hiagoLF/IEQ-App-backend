const mongoose = require('mongoose')

const Ministry = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: false
    },
    about: {
        // [nome, texto, image]
        type: Array,
        required: false
    },
    call: {
        // [nome, número]
        type: Array,
        required: false
    },
    publishers: {
        type: String,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('ministry', Ministry)