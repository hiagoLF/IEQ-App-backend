// Local Modules
const Albuns = require('../models/Album')

// Error Instance
const error = false

module.exports = {



    // ...................................................
    // Removendo uma imagem de um album
    async removeImageOfAlbum(albumObject, imageKeys) {
        // Extrair o array de imagens
        var images = [...albumObject.images]
        // Percorrer imageKeys
        for (const imagekey of imageKeys) {
            // Verificar o índicie deste array que contem a imageKey
            const indexOfImage = images.indexOf(imagekey)
            // Verificar se este índicie é -1
            // Se for diferente de -1 ...
            if (indexOfImage != -1) {
                // Fazer um splice neste indicie
                images.splice(indexOfImage, 1)
            }else{
                return false
            }
        }
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