const router = require('express').Router
const UsersController = require('../controllers/UsersController')
const UserController = require('../controllers/UsersController')
const authMiddleware = require('../middlewares/authMiddleware')

const routes = router()

// Rotas Abertas a todos
routes.post('/users/create', UserController.create)
routes.post('/users/login', UserController.login)

// MiddleWare Barreira de Login
routes.use(authMiddleware)

// Rotas Para usuários logados
routes.get('/users', UserController.findAll)
routes.get('/users/:identificator?', UserController.findByIdentificator)
routes.get('/users/info/me', UsersController.LoggedUserInformations)
routes.put('/users/edit/password', UsersController.editUserPassword)

module.exports = routes;