// Node Modules
const routes = require('express').Router()
const multer = require('multer')
const multerConfig = require('../config/multer')

// Local Modules
const MinistriesControllers = require('../controllers/MinistriesControllers')
const authMiddleware = require('../middlewares/authMiddleware')
const MinistriesSchema = require('../models/MinistriesSchema')

routes.get('/ids', MinistriesControllers.findMinistriesIdentifications)
routes.get('/:id/info', MinistriesControllers.getInfosById)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas para usuários autenticados
routes.post('/create', MinistriesControllers.createMinistry)
routes.post('/editone', multer(multerConfig).single('coverImage'), MinistriesControllers.editMinistry)
routes.delete('/:id', MinistriesControllers.deleteMinistryById)
routes.put('/editmembers', MinistriesControllers.editMembersContent)

// exportar rotas
module.exports = routes;