// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const socialMediaControllers = require('../controllers/SocialMediaControllers')
const multerConfif = require('../config/multer')


// Rotas de usuário não autenticado
routes.get('/', socialMediaControllers.index)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuário autenticado
routes.post('/create', multer(multerConfif).single('icon'), socialMediaControllers.create)
routes.delete('/:id', socialMediaControllers.deleteById)

module.exports = routes