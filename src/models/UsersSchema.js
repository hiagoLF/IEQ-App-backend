const mongoose = require('mongoose')

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
    about: {
        type: String,
        required: false,
        maxlength: 200,
        default: 'nothing'
    },
    memberSince: {
        type: String,
        required: false,
        default: 0
    },
    event: {
        type: [String, Boolean],
        required: false
    },
    type: {
        type: Number,
        required: true,
        default: 2,
    },
    ministry: {
        type: String,
        required: false
    },
    ministryLeader: {
        type: Number,
        required: false
    },
    relationShipGroup: {
        type: [String],
        required: false
    },
    ticket: {
        type: Number,
        required: false
    },
})

module.exports =  mongoose.model('users', UsersSchema)