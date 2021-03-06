const jwt = require('jsonwebtoken')
const authConfig = require('../config/authConfig.json')
const mongooseGF = require('../global_functions/mongooseGF')

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

    // Verificar com jwt se o token corresponde a alguém
    jwt.verify(parts[1], authConfig.jwtHash, async (err, decoded) => {
        if (err) {
            return res.status(401).json({
                error: 'invalid token',
                details: err
            })

        }

        const user = await mongooseGF.getUser(decoded.id)
        if(!user || user.type > 2){
            return res.status(200).json({message: 'user need to be confirmed', user})
        }

        req.userId = decoded.id

        return next()

    })
}