// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const NewsControllers = require('../controllers/NewsControllers')
const multerConfig = require('../config/multer')


// Rotas de usuário não autenticado


// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuários autenticados
routes.post('/create', multer(multerConfig).single('coverImage'), NewsControllers.create)


module.exports = routes