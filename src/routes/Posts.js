// Node Modules
const router = require('express').Router
const multer = require('multer')

// Local Modules
const PostControllers = require('../controllers/Post')
const authMiddleware = require('../middlewares/authMiddleware')
const authAdmMiddleware = require('../middlewares/authAdm')
const authToEditPost = require('../middlewares/authToEditPost')
const multerConfig = require('../config/multer')

// Routes Instance
const routes = router()

// Rotas Abertas
routes.get('/:postId', PostControllers.getPostById)

// Autenticação de Usuário
routes.use(authMiddleware)

// Rotas para usuário logado
routes.put('/edit/:id', authToEditPost, PostControllers.update)
routes.put('/editimage/:id', authToEditPost, multer(multerConfig).single('coverImage'), PostControllers.editImage)

// Autenticação de Administrador
routes.use(authAdmMiddleware)

// Rotas para administradores
routes.post('/create', PostControllers.create)
routes.delete('/:id', PostControllers.delete)

module.exports = routes