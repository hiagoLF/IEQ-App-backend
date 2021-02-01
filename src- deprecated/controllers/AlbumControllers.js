// Local Modules
const awsGlobalFunctions = require('../global_functions/awsGlobalFunctions')
const mongooseGF = require('../global_functions/mongooseGF')
const Albuns = require('../models/AlbumSchema')

const bucketName = 'ieq-app-image-storage/albuns-images'

const error = undefined

module.exports = {
    async createAlbum(req, res){
        // files
        const {files} = req

        // Verificar se é adm
        const isADM = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isADM){
            files && awsGlobalFunctions.deleteArrayFiles(files, bucketName)
            return res.status(403).json({error: 'user is not an administrator'})
        }

        // Pegar as informações colocadas
        const {title, description, date, published} = req.body
        // images -- files

        // Pegar todas as keys e colocar em um array
        const imageKeysArray = awsGlobalFunctions.getImageKeys(files)

        // Criar album no banco
        const newAlbum = await Albuns.create({
            title,
            description,
            date,
            published,
            images: imageKeysArray
        }).catch((err) => error = err)
        if(error || !newAlbum){
            files && awsGlobalFunctions.deleteArrayFiles(files, bucketName)
            return res.status(400).json({error: 'failed on new album creation'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'new image album created'})
    },


    async getPublishedAlbunsByPage(req, res){
        // Pegar a página informada
        const {page} = req.query

        // Buscar no banco os albuns publicados por página
        const albuns = await mongooseGF.getAlbuns(page)
        if(!albuns){
            return res.status(404).json({error: 'albuns not found'})
        }

        // Enviar
        return res.status(200).json(albuns)
    },


    async getUnpublishedAlbunsByPage(req, res){
        // Verificar se usuário é administrador
        const isAdm = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isAdm){
            return res.status(403).json({error: 'user is not administrator'})
        }

        // Pegar página informada
        const {page} = req.query

        // Pegar todos os albuns não publicados
        const albuns = await mongooseGF.getAlbuns(page, published=false)
        if(!albuns){
            return res.status(404).json({error: 'albuns not found'})
        }

        // Enviar
        return res.status(200).json(albuns)
    },


    async editAlbumById(req, res){
        // Verificar se é administrador
        const isAdm = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isAdm){
            return res.status(403).json({error: 'user is not an administrator'})
        }

        // Pegar id do album a ser editado
        const {albumid} = req.params

        // Pegar informações a serem editadas
        const {title, description, date, published} = req.body

        // Editar album
        const editedAlbum = await Albuns.findByIdAndUpdate(albumid, {
            title, description, date, published
        }).catch((err) => error = err)
        if(error || !editedAlbum){
            return res.status(400).json({error: 'failed on album edition'})
        }

        // Confirmação
        return res.status(200).json({message: 'success on album edition'})
    },


    async deleteImageByKey(req, res){
        // Verificar se é adm
        const isADM = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isADM){
            return res.status(403).json({message: 'user is not an administrator'})
        }

        // Pegar albumid imagekey
        const {albumid, imagekey} = req.params

        // Deletar imagem do album
        const result = await mongooseGF.deleteImageInAlbum(albumid, imagekey)
        if(!result){
            return res.status(400).json({error: 'failed on image deletion'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'success on image deletion'})
    },


    async deleteAlbumById(req, res){
        // Verificar se é adm
        const isAdm = mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isAdm){
            return res.status(403).json({error: 'user is not an administrator'})
        }

        // Pegar id do album
        const {id} = req.params

        // Deletar album
        const result = await mongooseGF.deleteAlbum(albumid = id)
        if(!result){
            return res.status(404).json({error: 'album not found'})
        }

        // Enviar confirmação
        return res.status(200).json({messagem: 'success on album deletion'})
    },


    async includeImageInAlbum(req, res){
        // Pegar file
        const {file} = req
        // Verificar se é administrador
        const isADM = await mongooseGF.verifyIfUserIsAdministrator(req)
        console.log(isADM)
        if(!isADM){
            file && awsGlobalFunctions.deleteFile(file.key, bucketName)
            return res.status(403).json({error: 'user is not an admistrator'})
        }

        // Pegar id do album
        const {albumid} = req.params

        // incluir imagem no album
        const result = await mongooseGF.includeImageToDataAlbum(file.key, albumid)
        if(!result){
            file && awsGlobalFunctions.deleteFile(file.key, bucketName)
            return res.status(404).json({error: 'album not found'})
        }

        // Confirmação
        return res.status(200).json({messagem: 'success on album update'})
    },
}