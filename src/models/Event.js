// Node Modules
const mongoose = require('mongoose')
const paginate = require('mongoose-paginate')

// Local Modules
const Posts = require('./Post')

const EventSchema = new mongoose.Schema({

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
    ministryId: {
        type: String,
        required: false,
    },
    postId: {
        type: String,
        required: true
    }
})

EventSchema.plugin(paginate)

module.exports =  mongoose.model('event', EventSchema)