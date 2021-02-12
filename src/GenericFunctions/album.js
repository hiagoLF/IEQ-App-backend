// Local Modules
const Albuns = require('../models/Album')

// Error Instance
const error = false

module.exports = {



    // ...................................................
    // Removendo uma imagem de um album
    async removeImageOfAlbum(albumObject, imagekey) {
        // Extrair o array de imagens
        var images = [...albumObject.images]
        // Verificar o índicie deste array que contem a imageKey
        const indexOfImage = images.indexOf(imagekey)
        // Verificar se este índicie é -1
        // Se for -1 ...
        if (indexOfImage == -1) {
            // Retornar false
            return false
        }
        // Fazer um splice neste indicie
        images.splice(indexOfImage, 1)
        // Alterar o album
        albumObject.images = images
        // Retornar o album
        return albumObject
    },



    // .....................................
    // Pegando albuns por página
    async getAlbunsBypage(page) {
        // Buscar os albuns no paginate pela página informada
        const albuns = await Albuns.paginate({},
            { page, limit: 10, sort: { _id: 'desc' } }
        ).catch(() => { error = true })
        // Ver se encontrou alguma coisa
        if (!albuns || error) {
            return false
        }
        // Devolver Albuns
        return albuns
    }
}