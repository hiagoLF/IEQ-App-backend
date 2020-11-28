const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate')

const NewsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: false
    },
    links: {
        type: Array,
        required: false
    },
    published: {
        type: Boolean,
        default: false
    },
    authorIdentificator: {
        type: String,
        required: true
    },
    authorID: {
        type: String,
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: false
    }

})

NewsSchema.plugin(mongoosePaginate)

module.exports = mongoose.model('news', NewsSchema)