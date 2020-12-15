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
    about: {
        type: String,
        required: false,
        maxlength: 200,
    },
    memberSince: {
        type: String,
        required: false,
        default: 0
    },
    event: {
        // ID do evento, Confirmado ou não
        type: [String, Boolean],
        required: false
    },
    type: {
        type: Number,
        required: true,
        default: 2,
    },
    ministry: {
        type: Array,
        // [id, leader?]
        required: false
    },
    // Número de membro
    ticket: {
        type: Number,
        required: false
    },
})

UsersSchema.plugin(mongoosePaginate)

module.exports =  mongoose.model('users', UsersSchema)