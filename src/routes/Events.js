// Node Modules
const router = require('express').Router

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const authAdmMiddleware = require('../middlewares/authAdm')
const authToConfirmSubscriber = require('../middlewares/authToConfirmSubscriber')
const EventControllers = require('../controllers/Event')

// Routes Instance
const routes = router()

// Rotas Abertas

// Barreira de Autenticação
routes.use(authMiddleware)

// Rotas para usuários logados
routes.get('/:page', EventControllers.getEventsByPage)
routes.post('/:id/subscribe', EventControllers.subscribeOnEvent)
routes.post('/confirm/:eventid/:identificator', authToConfirmSubscriber, EventControllers.confirmSubscriber)

// Barreira de Autenticação do Administrador
routes.use(authAdmMiddleware)

// Rotas do administrador
routes.post('/create', EventControllers.create)
routes.delete('/:id', EventControllers.deleteEvent)
routes.put('/edit/:id', EventControllers.updateEvent)

module.exports = routes