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
        // [nome, texto]
        type: Array,
        required: false
    },
    call: {
        // [nome, número]
        type: Array,
        required: false
    },
    members: {
        type: Array,
        required: false
    },
    membersIdentificators: {
        type: Array,
        required: false
    },
    publishers: {
        type: Array,
        required: false
    },
    publishersIdentificators: {
        type: Array,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('ministry', Ministry)