// Node Modules
const router = require('express').Router
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const authAdmMiddleware = require('../middlewares/authAdm')
const AlbumRoutes = require('../controllers/Album')
const multerConfig = require('../config/multer')

// Routes Instance
const routes = router()

// Rotas Abertas
routes.get('/:page', AlbumRoutes.getAlbunsBypage)

// Barreira de Autenticação do Usuário
routes.use(authMiddleware)

// Rotas para usuários logados

// Barreira de Autenticação do Administrador
routes.use(authAdmMiddleware)

// Rotas dos administradores
routes.post('/create', AlbumRoutes.create)
routes.put('/update/:id', AlbumRoutes.updateTitle)
routes.put('/:albumid/newimage', multer(multerConfig).array('albumImage'), AlbumRoutes.insertNewImage)
routes.delete('/:albumid/image', AlbumRoutes.deleteImageFromAlbum)
routes.delete('/:id', AlbumRoutes.deleteAlbum)


module.exports = routes