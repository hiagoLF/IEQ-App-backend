const Users = require('../models/User')

// Instancies
var error = undefined

module.exports = {
    // .............................
    // Pegar usuário no banco
    async getUser(by = '_id', finder) {
        // Pegar o usuário
        var result = undefined
        if (by == '_id') {
            result = await Users.findById(finder).catch(() => { error = true })
        }
        if (by == 'identificator') {
            result = await Users.findOne({ identificator: finder }).catch(() => { error = true })
        }
        // Tratamento de erro
        if (!result || error) {
            return false
        }
        // Resposta
        return result
    },



    // ..................
    // Saving an user
    async saveUser(user) {
        try {
            const result = await user.save().catch(() => { error = true })
        } catch {
            error = undefined
            const response = await Users.findByIdAndUpdate(user._id, user).catch(() => { error = true })
            if (!response || error) {
                return false
            }
        }
        return true
    }


}