// Node Modules
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

const EventSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: String,
        required: false,
    },
    description: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: false
    },
    subscribers: {
        type: Array,
        required: false
    },
    creator: {
        type: String,
        required: true
    },
    openToSubscribe: {
        type: String,
        required: false
    },
    ministry: {
        type: String,
        default: 0
    },
    cover: {
        type: String,
        required: false
    }
})

EventSchema.plugin(paginate)

module.exports = mongoose.model('event', EventSchema)