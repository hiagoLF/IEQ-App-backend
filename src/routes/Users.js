// Node Modules
const router = require('express').Router
const multer = require('multer')

// Local Modules
const UserController = require('../controllers/User')
const authMiddleware = require('../middlewares/authMiddleware')
const multerConfig = require('../config/multer')
const authAdministratorMiddleware = require('../middlewares/authAdm')

// Routes Instance
const routes = router()

// Rotas Abertas
routes.post('/create', UserController.create)
routes.post('/login', UserController.login)
routes.delete('/lougout', UserController.logout)

// Barreira de Autenticação para usuário
routes.use(authMiddleware)

// Rotas para usuários logados
routes.get('/refresh', UserController.refresh)
routes.put('/edit/:identificator', UserController.edit)
routes.put('/editimage/:identificator', multer(multerConfig).single('image'), UserController.editImage)
routes.put('/me/password', UserController.changeMyPassword)

// Barreira de Autenticação para administrador
routes.use(authAdministratorMiddleware)

// Rotas para o adm
routes.delete('/:identificator', UserController.delete)
routes.get('/byname/:name', UserController.getUsersByName)
routes.get('/bypage/:page', UserController.getUsersByPage)

module.exports = routes