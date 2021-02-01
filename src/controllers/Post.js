// Local Modules
const Posts = require('../models/Post')
const postFunctions = require('../GenericFunctions/post')
const awsFunctions = require('../GenericFunctions/aws')
const post = require('../GenericFunctions/post')

// Error Instance
const error = undefined

// Name of AWS Bucket
const bucketName = 'ieq-app-image-storage/covers-images'

module.exports = {



    // ..............................................
    // Criando nova postagem
    async create(req, res) {
        // Pegar todos os dados enviados
        const data = postFunctions.getPostJsonData(req)
        // Verificar se existe o índexId informado
        const postIndex = await postFunctions.getPostIndex(data.indexId)
        if (!postIndex) {
            return res.status(404).json({ mesage: 'post index not found' })
        }
        // Criar nova postagem com os dados informados
        const newPost = await Posts.create({ ...data }).catch(() => { error = true })
        // Verificar se criou direitinho
        if (!newPost || error) {
            return res.status(400).json({ message: 'creation failed' })
        }
        // Gravar o id da postagem no indexId
        const writenIdInIndex = await postFunctions.writePostIdInIndex(newPost._id, postIndex)
        // Verificar se o index foi modificado com sucesso
        if (!writenIdInIndex) {
            await Posts.findByIdAndDelete(newPost._id)
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'post created' })
    },




    // .....................................
    // Editando postagem
    async update(req, res) {
        // Pegar todos os dados enviados
        const data = postFunctions.getPostJsonData(req)
        // Pegar a postagem
        const post = req.postData
        // Verificar se o indexId enviado é o mesmo da postagem
        // Se não for o mesmo...
        if (post.indexId !== data.indexId) {
            // Ver se existe o novo índexId
            const postIndex = await postFunctions.getPostIndex(data.indexId)
            if (!postIndex) {
                return res.status(404).json({ mesage: 'post index not found' })
            }
            // Excluir postagem do index antigo
            const resultOfIndexUpdate = await postFunctions.deletePostOfIndex(post)
            // Colocar postagem no index novo
            await postFunctions.writePostIdInIndex(post._id, postIndex)
        }
        // Atualizar os dados da postagem
        const upDatedPost = Posts.findByIdAndUpdate(post._id, { ...data }).catch(() => { error = true })
        // Verificar se atualizou mesmo
        if(!upDatedPost || error){
            return res.status(400).json({error: 'failed on update'})
        }
        // Confirmação
        return res.status(200).json({message: 'post updated'})
    },




    // .........................................
    // Deletando Post
    async delete(req, res){
        // Pegar o ID do post
        const {id} = req.params
        // Deletar post
        const deletedPost = await Posts.findByIdAndDelete(id).catch(() => {error = true})
        // Verificar se deletou mesmo
        if(!deletedPost || error){
            return res.status(404).json({error: 'post not found'})
        }
        console.log(deletedPost)
        // Deletar post do seu índex
        await postFunctions.deletePostOfIndex(deletedPost)
        // Mensagem de confirmação
        return res.status(200).json({message: 'post deleted'})
    },




    // ..................................................
    // Editando Imagem Cover do post
    async editImage(req, res){
        // Pegando o file e verificando se existe mesmo
        const {file} = req
        if(!file){
            return res.status(400).json({error: 'file not provided'})
        }
        // Pegar os dados do post
        const {postData} = req
        // Apagar do Bucket a última imagem do post
        if(postData.image){
            awsFunctions.deleteFile(postData.image, bucketName)
        }
        // Substituir o nome da imagem pela imagem atual
        postData.image = file.key
        const updatedPostResult = await postData.save().catch(() => {error = true})
        if(!updatedPostResult || error){
            return res.status(400).json({error: 'image was updated but not post table'})
        }
        // Mensagem de confirmação
        return res.status(200).json({message: 'post image updated'})
    }
}