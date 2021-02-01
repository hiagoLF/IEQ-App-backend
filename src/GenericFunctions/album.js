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
        if(indexOfImage == -1){
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
}