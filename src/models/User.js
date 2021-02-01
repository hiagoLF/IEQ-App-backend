const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate');

const UsersSchema = new mongoose.Schema({
    identificator: {
        type: String,
        required: true
    },
    login: {
        type: String,
        required: true,
        minlength: 4,
        maxlength: 25,
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 40
    },
    image: {
        type: String,
        required: false
    },
    memberSince: {
        type: String,
        required: false,
        default: undefined
    },
    type: {
        type: Number,
        required: true,
        default: 3,
    },
    loggedToken: {
        type: String,
        required: false
    }
})

UsersSchema.plugin(mongoosePaginate)

module.exports =  mongoose.model('users', UsersSchema)