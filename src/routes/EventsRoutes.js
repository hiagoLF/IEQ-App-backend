// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const EventsControllers = require('../controllers/EventsControllers')
const multerConfig = require('../config/multer')

// Rotas de usuário não autenticado

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuário autenticados
routes.post('/create', multer(multerConfig).single('coverImage') ,EventsControllers.createEvent)
routes.put('/:id', multer(multerConfig).single('coverImage'),EventsControllers.editEventById)
routes.delete('/:id', EventsControllers.deleteEventById)

module.exports = routes