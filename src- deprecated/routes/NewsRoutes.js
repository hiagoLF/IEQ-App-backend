// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const NewsControllers = require('../controllers/NewsControllers')
const multerConfig = require('../config/multer')


// Rotas de usuário não autenticado
routes.get('/published', NewsControllers.getPublishedNews)


// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuários autenticados
routes.post('/create', multer(multerConfig).single('coverImage'), NewsControllers.create)
routes.post('/:id/edit', multer(multerConfig).single('coverImage'), NewsControllers.editNoticeById)
routes.get('/unpublished', NewsControllers.getUnpublishedNews)
routes.delete('/:id', NewsControllers.deleteNewsById)

module.exports = routes