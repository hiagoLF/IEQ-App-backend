// Node Modules
const router = require('express').Router

// Local Modules
const PostIndexController = require('../controllers/PostsIndex')
const authAdministratorMiddleware = require('../middlewares/authAdm')
const authMiddleware = require('../middlewares/authMiddleware')

// Routes Instance
const routes = router()

// Rotas Abertas
routes.get('/', PostIndexController.findEveryIndex)
routes.get('/:indexid/:page', PostIndexController.findPostsByIndexAndPaginate)

// Barreira de Autenticação do usuário
routes.use(authMiddleware)

// Barreira de Autenticação do administrador
routes.use(authAdministratorMiddleware)

// Rotas que só o administrador pode utilizar
routes.post('/create', PostIndexController.create)
routes.delete('/:id', PostIndexController.delete)
routes.put('/:id', PostIndexController.update)

module.exports = routes