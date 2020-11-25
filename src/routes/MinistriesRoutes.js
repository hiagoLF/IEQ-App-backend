// Node Modules
const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('../config/multer')

// Local Modules
const MinistriesControllers = require('../controllers/MinistriesControllers')
const authMiddleware = require('../middlewares/authMiddleware')


// Barreira de autenticação
routes.use(authMiddleware)

// Rotas do administrador
routes.post('/create', MinistriesControllers.createMinistry)


// exportar rotas
module.exports = routes;