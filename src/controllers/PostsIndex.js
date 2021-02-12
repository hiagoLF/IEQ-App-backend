// Local Modules
const PostsIndex = require('../models/PostsIndex')
const PostsFunctions = require('../GenericFunctions/post')
const AlbumFunctions = require('../GenericFunctions/album')


const error = undefined

module.exports = {



    // .................................
    // Criando Índicie de Postagem
    async create(req, res) {
        // Pegar o name que foi enviado
        const { name } = req.body
        // Criar um índicie com este nome
        const postIndex = await PostsIndex.create({ name }).catch(() => { error = true })
        // Verificar se criou mesmo
        if (!postIndex || error) {
            return res.status(400).json({ error: 'index creation failed' })
        }
        // Confirmação
        return res.status(200).json({ message: 'index created' })
    },




    // ..........................................
    // Deletando Índicie
    async delete(req, res) {
        // Pegar o id do índicie
        const { id } = req.params
        // Deletar o índex pelo id
        const indexDeletionResult = await PostsIndex.findByIdAndDelete(id).catch(() => { error = true })
        // Verificar se deletou mesmo
        if (!indexDeletionResult) {
            return res.status(404).json({ error: 'index not found' })
        }
        // Deletar todos os posts que tiverem esse index
        const postsSetDeletionResult = await PostsFunctions.deletSetOfPosts(id)
        // Verificar se deletou
        if (!postsSetDeletionResult) {
            return res.status(404).json({ error: 'no posts deleted' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'index deleted' })
    },




    // Editando título de índicie
    async update(req, res) {
        // Pegar o id do índicie
        const { id } = req.params
        // Pegar o name enviado
        const { name } = req.body
        // Buscar o índicie e atualizar
        const indexUpdateResult = await PostsIndex.findByIdAndUpdate(id, { name: name }).catch(() => error = true)
        // Verificar se atualizou mesmo
        if (!indexUpdateResult || error) {
            return res.status(404).json({ error: 'index not found' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'index updated' })
    },




    // ........................................................
    // Buscar todos os índicies
    async findEveryIndex(req, res) {
        // Pegar todos os índicies
        var indexes = await PostsIndex.find().sort({_id: 'desc'}).catch(() => { error })
        // Verificar se conseguiu pegar
        if (!indexes || error) {
            return res.status(404).json({ error: 'no index found' })
        }
        // Incluir os dois indicies de Eventos(001) e Albuns(002)
        indexes.push({ _doc: { _id: "001", name: "Eventos" } })
        indexes.push({ _doc: { _id: "002", name: "Albuns" } })
        // Inclui Thumb em cada índicie
        const indexWithThumbnail = await PostsFunctions.includeThumbOnIndexes(indexes)
        // Enviar
        return res.status(200).json(indexWithThumbnail)
    },




    // ............................................
    // Buscar Postagens por índicie e organizadas em páginas
    async findPostsByIndexAndPaginate(req, res) {
        // Pegar o id do index e a página
        const { indexid, page } = req.params
        // Buscar as postagens públicas e paginadas
        // Fazer um Switch com opções para 001, 002 e o default para postagens comuns
        var posts = undefined
        switch (indexid) {
            // Opção 001 (Eventos)
            case '001':
                // Pegar os posts de eventos
                posts = await PostsFunctions.getPosts(indexid, page, populate='eventId')
                break
            // Opção 002 (Albuns)
            case '002':
                posts = await AlbumFunctions.getAlbunsBypage(page)
                break
            default:
                posts = await PostsFunctions.getPosts(indexid, page)
        }
        
        if (!posts) {
            return res.status(404).json({ error: 'posts not found' })
        }
        // Enviar
        return res.status(200).json(posts)
    },
}