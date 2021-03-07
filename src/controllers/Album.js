// Local Modules
const Albuns = require('../models/Album')
const awsFunctions = require('../GenericFunctions/aws')
const albumFunctions = require('../GenericFunctions/album')
const { findByIdAndUpdate } = require('../models/Album')

// Error Instance
const error = undefined

// Bucket Name
const bucketName = 'ieq-app-image-storage/albuns-images'

module.exports = {




    // .................................................
    // Criar Novo Album
    async create(req, res) {
        // Pegar title enviado
        const { albumTitle } = req.body
        // Criar o album
        const newAlbum = await Albuns.create({ albumTitle }).catch(() => { error = true })
        // Ver se criou
        if (!newAlbum || error) {
            return res.status(400).json({ error: 'album not created' })
        }
        // Confirmação
        return res.status(200).json(newAlbum)
    },




    // ...............................................
    // Mudar Título de um album
    async updateTitle(req, res) {
        // Pegar o id do album
        const { id } = req.params
        // Pegar o title enviado
        const { albumTitle } = req.body
        // Buscar e modificar
        const updatedAlbum = await Albuns.findByIdAndUpdate(id, { albumTitle }).catch(() => { error = true })
        // Ver se modificou alguma coisa
        if (!updatedAlbum || error) {
            return res.status(404).json({ error: 'album not found' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'album updated' })
    },




    // .................................................
    // Inserir Nova imagem em um album
    async insertNewImage(req, res) {
        // Pegar file
        const { files } = req
        console.log(files)
        // Verificar se files existe
        if (files.length == 0) {
            return res.status(400).json({ error: 'albumImage not provided' })
        }
        // Pegar o id do album
        const { albumid } = req.params
        // Buscar album no banco
        const albumToInsertImage = await Albuns.findById(albumid).catch(() => { error = true })
        // Verificar se este album existe mesmo
        if (!albumToInsertImage || error) {
            return res.status(404).json({ error: 'album not found' })
        }
        // Inserir imagens no seu array de imagens
        files.map((file) => {
            albumToInsertImage.images.push(file.key)
        })
        // Salvar o album
        const updateResult = await Albuns.findByIdAndUpdate(
            albumToInsertImage.id,
            { images: albumToInsertImage.images }
        ).catch(() => { error = true })
        // Verificar se inseriu mesmo
        if (!updateResult || error) {
            return res.status(400).json({ error: 'failed on update' })
            awsFunctions.deleteFile(file.key, bucketName)
        }
        // Confirmação
        return res.status(200).json({ message: 'images updated' })
    },




    // ...........................................
    // Deletando imagens de um album
    async deleteImageFromAlbum(req, res) {
        // Pegar id do album e keys da imagem
        const { albumid } = req.params
        const { imageKeys } = req.body
        console.log(imageKeys)
        // Buscar o album
        const albumToRemoveImage = await Albuns.findById(albumid).catch(() => { error = true })
        // Verificar se o album existe
        if (!albumToRemoveImage || error) {
            return res.status(404).json({ message: 'album not found' })
        }
        // Remover a imagem da sua lista de imagens
        const imageRemovalResult = await albumFunctions.removeImageOfAlbum(albumToRemoveImage, imageKeys)
        // Verificar se a imagem foi realmente encontrada
        if (!imageRemovalResult) {
            return res.status(404).json({ error: 'image not found' })
        }
        // Remover as imagens da aws
        for(const imageKey of imageKeys){
            awsFunctions.deleteFile(imageKey, bucketName)
        }
        // Salvar informação no banco de dados
        await Albuns.findByIdAndUpdate(albumid, { images: imageRemovalResult.images })
        // Mensagem de confirmação
        return res.status(200).json({ message: 'images removed' })
    },




    // ....................................................
    // Deletar Album
    async deleteAlbum(req, res) {
        // Pegar o id do album]
        const { id } = req.params
        // Remover este album do banco de dados
        const removedAlbum = await Albuns.findByIdAndRemove(id).catch(() => { error = true })
        // Ver se removeu alguma coisa mesmo
        if (!removedAlbum || error) {
            return res.status(404).json({ message: 'album not found' })
        }
        // Pegar a lista images do album que foi removido
        const { images } = removedAlbum
        // Deletar todas as imagens dele na AWS
        for (const image of images) {
            awsFunctions.deleteFile(image, bucketName)
        }
        // Confirmação
        return res.status(200).json({ message: 'album removed' })
    },




    // ..........................................................
    // Pegando albuns por página
    async getAlbunsBypage(req, res) {
        // Pegar o número da página
        const { page } = req.params
        // Buscar todos os alguns no paginate
        const albuns = await Albuns.paginate({},
            { page, limit: 10, sort: { _id: 'desc' } }
        ).catch(() => { error = true })
        // Ver se encontrou alguma coisa
        if (!albuns || error) {
            return res.status(404).json({ error: 'albuns not found' })
        }
        // Enviar albuns
        return res.status(200).json(albuns)
    },
}