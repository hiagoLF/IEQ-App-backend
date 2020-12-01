// Node modules
const routes = require('express').Router()

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const ReflectionsControllers = require('../controllers/ReflectionsControllers')
const multerConfig = require('../config/multer')
const multer = require('multer')


// Rotas para usuário não autenticado
routes.get('/published', ReflectionsControllers.getPublishedReflectionsByPage)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas para usuário autenticado
routes.post('/create', multer(multerConfig).single('coverImage'), ReflectionsControllers.createReflection)
routes.get('/unpublished', ReflectionsControllers.getUnPublishedReflectionsByPage)
routes.put('/:id/edit', multer(multerConfig).single('coverImage'), ReflectionsControllers.editReflectionByID)
routes.delete('/:id', ReflectionsControllers.deleteReflection)

module.exports = routes