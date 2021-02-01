// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const EventsControllers = require('../controllers/EventsControllers')
const multerConfig = require('../config/multer')



// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuário autenticados
routes.post('/create', multer(multerConfig).single('coverImage') ,EventsControllers.createEvent)
routes.put('/:id', multer(multerConfig).single('coverImage'),EventsControllers.editEventById)
routes.delete('/:id', EventsControllers.deleteEventById)
routes.post('/:id/subscribe', EventsControllers.subscribeByUser)
routes.delete('/:id/unsubscribe', EventsControllers.unsubscribeByUser)
routes.delete('/:id/unsubscribe/:user', EventsControllers.unsubscribeByIdentificador)
routes.put('/:eventid/confirm/', EventsControllers.confirmSubscriberByIdentificator)
routes.put('/:eventid/subscribe/byadm', EventsControllers.subscribeAndConfirmPersonToEvent)



module.exports = routes