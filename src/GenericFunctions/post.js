// Local Modules
const PostIndex = require('../models/PostsIndex')
const Posts = require('../models/Post')
const GenericFunctions = require('.')
const awsFunctions = require('../GenericFunctions/aws')

// Error Instance
const error = undefined

// Other Instancies
const bucketName = 'ieq-app-image-storage/covers-images'

module.exports = {




    // ................................................
    // Bucar índicies de postagem
    async getPostIndex(indexId) {
        const postIndex = await PostIndex.findById(indexId).catch((err) => { error = true })
        if (!postIndex || error) {
            return false
        }
        return postIndex
    },




    // ...............................................
    // Escrevendo id de um post dentro de um índicie
    async writePostIdInIndex(postId, IndexObject) {
        const { postsIds } = IndexObject
        // Verificar se já tem
        if (postsIds.indexOf(postId.toString()) != -1) {
            return true
        }
        // Se não tiver...
        // Inserir Dentro
        const newIdList = [...postsIds]
        newIdList.push(postId.toString())
        const result = await PostIndex.findByIdAndUpdate(IndexObject._doc._id, { postsIds: newIdList }).catch(() => { error = true })
        // Verificar se Inseriu
        if (!result || error) {
            return false
        }
        // Retornar true
        return true
    },




    async deletePostOfIndex(postObject) {
        // Buscar o índicie de postagem no banco de dados
        const { indexId } = postObject
        const indexObject = await this.getPostIndex(indexId)
        // Pegar o array
        var newArray = [...indexObject.postsIds]
        // Verificar qual o índicie que o postId está
        const index = newArray.indexOf(postObject._id.toString())
        // Se encontrou o índicie...
        if (index != -1) {
            // Dar um splice no índicie
            newArray.splice(index, 1)
        } else {
            // Se não encontrou...
            // Retornar False
            return false
        }
        // Jogar o Array no objeto e salvar
        const result = await PostIndex.findByIdAndUpdate(indexObject._id, { postsIds: newArray }).catch(() => { error = true })
        if (!result || error) {
            return false
        }
        return true
    },





    // .............................
    // Pegando os dados do JSON das requisições de post
    getPostJsonData(req) {
        const {
            title,
            indexId,
            topics,
            peopleBoard,
            links,
            callTo,
            editors,
            public,
        } = req.body
        return {
            title,
            indexId,
            topics,
            peopleBoard,
            links,
            callTo,
            editors,
            public,
        }
    },




    // ........................................
    // Verificar autorização para editar
    verifyAutorizationToEdit(userObject, postObject) {
        // Se o usuário for ADM
        if (userObject.type <= 1) {
            // Retornar true
            return true
        }
        // Pegar o array de editores da postagem
        const { editors } = postObject
        console.log(editors, userObject.identificator)
        // Verificar se o identificator do usuário está lá dentro
        const userIndex = editors.indexOf(userObject.identificator)
        console.log(userIndex)
        // Se estiver ...
        if (userIndex !== -1) {
            // Retorna true
            return true
        }
        // Se não for ADM...
        // Retornar false
        return false
    },




    // ...........................................
    // Deletar conjunto de posts vinculados a um índicie
    async deletSetOfPosts(indexId) {
        // Buscar a lista de todos estes posts
        const postsToDelete = await Posts.find({ indexId: indexId }).catch(() => { error = true })
        // Verificar se tem estes posts mesmo
        if (!postsToDelete || error) {
            return false
        }
        // Deletar todos os posts que tiverem o id vinculado
        const postsDeletionResult = await Posts.deleteMany({ indexId: indexId })
        // Verificar se deletou tudo
        if (!postsDeletionResult.ok) {
            return false
        }
        // Excluir as imagens
        for (const post of postsToDelete) {
            awsFunctions.deleteFile(post.image, bucketName)
        }
        // Retornar true
        return true
    },





    // .................................................
    // Colocar Thumbs nos índicie
    async includeThumbOnIndexes(indexes) {
        // Instanciar um novo array
        var newIndexArray = []
        // Percorrer todos os índicies...
        for (const index of indexes) {
            // Buscar posts do índicie atual
            const posts = (await Posts.paginate({ indexId: index._id }, { page: 1, limit: 10 })).docs
            console.log(posts)
            // criar um array com as imagens deles
            var postsImage = []
            for (const post of posts) {
                console.log(post.image)
                post.image && postsImage.push(post.image)
            }
            // Se tiver imagem nestes posts...
            if (postsImage.length != 0) {
                // Sortear uma imagem
                const ramdomImageIndex = GenericFunctions.getRandomIntInclusive(0, postsImage.length - 1)
                const randomImage = postsImage[ramdomImageIndex]
                // Incluir como image neste íncie
                newIndexArray.push({ ...index._doc, image: randomImage })
            } else {
                newIndexArray.push(index)
            }
        }
        // Retornar o novo array de índicies
        return newIndexArray
    },



    // .....................................
    // Buscando os posts por índicie e página
    async getPosts(indexId, page) {
        const posts = await Posts.paginate(
            { indexId },
            { page, limit: 10, sort: { _id: 'desc' } }
        ).catch(() => { error = true })
        if(!posts || error){
            return false
        }
        return posts
    },

}