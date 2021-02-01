// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const HistoryControllers = require('../controllers/HistoryController')
const multerConfig = require('../config/multer')

// Rotas de usuário não logado
routes.get('/byuser', HistoryControllers.getHistoriesByUser)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuário logado
routes.post('/create', multer(multerConfig).single('coverImage'), HistoryControllers.createHistory)
routes.put('/:id/edit', multer(multerConfig).single('coverImage'),HistoryControllers.editHistoryById)
routes.get('/byadm', HistoryControllers.getHistoriesByAdm)
routes.delete('/:id', HistoryControllers.deleteHistoryById)


module.exports = routes