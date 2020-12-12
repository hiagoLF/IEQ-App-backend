// Node modules
const routes = require('express').Router()
const multer = require('multer')

// Local modules
const authMiddleware = require('../middlewares/authMiddleware')
const ShepherdsControllers = require('../controllers/ShepherdController')
const multerConfig = require('../config/multer')

// Rotas para qualquer usuário
routes.get('/published', ShepherdsControllers.findPublishedShepherdsByPage)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuário autenticado
routes.post('/create', multer(multerConfig).single('coverImage'), ShepherdsControllers.createShepherd)
routes.get('/unpublished', ShepherdsControllers.findUnpublishedShepherdsByPage)
routes.put('/edit/:id', multer(multerConfig).single('coverImage'), ShepherdsControllers.editShepherdById)
routes.delete('/:id', ShepherdsControllers.deleteShepherd)

module.exports = routes