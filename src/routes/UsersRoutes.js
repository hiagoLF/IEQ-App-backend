// Node Modules
const router = require('express').Router
const multer = require('multer')

// Local Modules
const UsersController = require('../controllers/UsersController')
const UserController = require('../controllers/UsersController')
const authMiddleware = require('../middlewares/authMiddleware')
const multerConfig= require('../config/multer')

const routes = router()

// Rotas Abertas a todos
routes.post('/create', UserController.create)
routes.post('/login', UserController.login)

// MiddleWare Barreira de Login
routes.use(authMiddleware)

// Rotas Para usuários logados
routes.get('/', UserController.findAll)
routes.get('/:identificator?', UserController.findByIdentificator)
routes.get('/info/me', UsersController.LoggedUserInformations)
routes.put('/edit/password', UsersController.editUserPassword)
routes.put('/edit/me', multer(multerConfig).single('image'), UsersController.editUserData)
routes.put('/edit/byadm', multer(multerConfig).single('image'), UsersController.editUserDataByAdm)
routes.get('/indexes/by', UsersController.getUsersIndexByName)
routes.get('/indexes/page', UsersController.getAllUsersIndexByPage)

module.exports = routes;