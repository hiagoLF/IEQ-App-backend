// Node Modules
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

// Local Modules
const Posts = require('./Post')

const EventSchema = new mongoose.Schema({
    postId: {
        type: String,
        ref: Posts,
    },
    confirmedSubscribers: {
        type: Array,
        required: false,
    },
    unconfirmedSubscribers: {
        type: Array,
        required: false,
    },
    eventADMs: {
        type: Array,
        required: false,
    },
})

EventSchema.plugin(paginate)

module.exports =  mongoose.model('event', EventSchema)