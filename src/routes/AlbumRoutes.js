// Node Modules
const routes = require('express').Router()
const multer = require('multer')

// Local Modules
const authMiddleware = require('../middlewares/authMiddleware')
const AlbumControllers = require('../controllers/AlbumControllers')
const multerConfig = require('../config/multer')

// Rotas de usuários não autenticados
routes.get('/published', AlbumControllers.getPublishedAlbunsByPage)

// Barreira de autenticação
routes.use(authMiddleware)

// Rotas de usuários autenticados
routes.post('/create', multer(multerConfig).array('albumImage'), AlbumControllers.createAlbum)
routes.get('/unpublished', AlbumControllers.getUnpublishedAlbunsByPage)
routes.put('/edit/:albumid', AlbumControllers.editAlbumById)
routes.delete('/:albumid/:imagekey', AlbumControllers.deleteImageByKey)
routes.delete('/:id', AlbumControllers.deleteAlbumById)
routes.put('/:albumid', multer(multerConfig).single('albumImage'), AlbumControllers.includeImageInAlbum)

module.exports = routes