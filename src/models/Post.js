const mongoose = require('mongoose')

const paginate = require('mongoose-paginate')

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 40,
    },
    indexId: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: false
    },
    topics: {
        type: Array,
        required: false
    },
    peopleBoard: {
        type: Array,
        required: false
    },
    links: {
        type: Array,
        required: false
    },
    callTo: {
        type: Array,
        required: false
    },
    editors: {
        type: Array,
        required: false
    },
    public: {
        type: Boolean,
        default: false
    }
})

PostSchema.plugin(paginate)

module.exports =  mongoose.model('post', PostSchema)