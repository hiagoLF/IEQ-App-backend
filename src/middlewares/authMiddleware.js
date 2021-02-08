// Local Modules
const jwt = require('jsonwebtoken')
const authConfig = require('../config/authConfig.json')
const userFunctions = require('../GenericFunctions/user')
const gFunctions = require('../GenericFunctions')


module.exports = function authentication(req, res, next) {
    // Pegar a header authorization
    const authHeader = req.headers.authorization
    // Ver se realmente existe essa header authorization
    if (!authHeader) {
        return res.status(400).json({ error: 'no authorization header provided' })
    }
    // Verificando se a header possui duas partes
    const parts = authHeader.split(' ')
    if (parts.length !== 2) {
        return res.status(400).json({ error: 'malformated authorization header' })
    }
    // Verificando se a primeira parte é Bearer
    if (parts[0] !== 'Bearer') {
        return res.status(400).json({ error: 'inappropriate sintax' })
    }
    // Verificar com jwt se o token é válido
    jwt.verify(parts[1], authConfig.jwtHash, async (err, decoded) => {
        // Se não for um token válido...
        if (err) {
            // Retornar um erro
            return res.status(401).json({
                error: 'invalid token',
                details: err
            })
        }
        // Buscar usuário no banco
        const user = await userFunctions.getUser('_id', decoded.id)
        // Verificar se o token é atual
        if (user.loggedToken !== parts[1]) {
            return res.status(401).json({
                error: 'deprecated token',
            })
        }
        // Tratamento de erro e de usuário não confirmado
        if (!user || user.type > 2) {
            // Ocultar dados para serem enviados
            gFunctions.hideData(['password', '_id'], user._doc)
            return res.status(200).json(user)
        }
        // Criar um Objeto no req que contenha os dados do usuário
        req.userData = user
        return next()
    })
}