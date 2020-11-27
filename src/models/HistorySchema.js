/*  title,
    description,
    cover --> Image,
    text,
    links[title, url],
    published,
*/

const mongoose = require('mongoose')

const HistorySchema = new mongoose.Schema({
    title: {
        required: true,
        type: String
    },
    description: {
        required: false,
        type: String
    },
    cover: {
        required: false,
        type: String
    },
    text: {
        required: false,
        type: String,
    },
    links: {
        required: false,
        type: Array
    },
    published: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('history', HistorySchema)