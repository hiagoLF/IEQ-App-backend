// Local Modules
const Posts = require('../models/Post')
const postFunctions = require('../GenericFunctions/post')

const error = undefined

module.exports = async function authorizationToEditPost(req, res, next) {
    // Buscar a postagem no banco
    const { id } = req.params
    const post = await Posts.findById(id).catch(() => { error = true })
    // Verificar se existe o post
    if (!post || error) {
        return res.status(404).json({ error: 'post not found' })
    }
    // Verificar se o usuário é administrador ou editor da postagem
    const isEditor = postFunctions.verifyAutorizationToEdit(req.userData, post)
    if (!isEditor) {
        return res.status(403).json({ error: 'permission denied' })
    }
    req.postData = post
    return next()
}