const mongooseGF = require('../global_functions/mongooseGF')
const awsGF = require('../global_functions/awsGlobalFunctions')
const SocialMedia = require('../models/SocialMediaSchema')

const bucketName = 'ieq-app-image-storage/icons'

const error = undefined

module.exports = {

    async index(req, res){
        // Buscar todas as redes sociais no banco
        const socials = await SocialMedia.find()

        // Enviar
        return res.status(200).json(socials)
    },



    async create(req, res){
        // AJEITAR AS CONDIÇÕES DE FILE DEPOIS
        // Pegar file
        const {file} = req

        // Verificar se é administrador
        const isAdm = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isAdm){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({error: 'user is not administrator'})
        }

        // Pegar as informações enviadas
        const {name, adress} = req.body

        // Guardar a nova rede social criada
        const newSocialMedia = await SocialMedia.create({
            name,
            adress,
            icon: file ? file.key : undefined
        }).catch((err) => error = err)
        if(error || !newSocialMedia){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({error: 'failed on social media creation'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'new social media created'})
    },


    async deleteById(req, res){
        // Verificar se é adm
        const isAdm = await mongooseGF.verifyIfUserIsAdministrator(req)
        if(!isAdm){
            return res.status(403).json({error: 'user is not administrator'})
        }
        
        // Pegar o id da rede social
        const {id} = req.params

        // Apagar a rede social
        const deletedSocialMedia = await SocialMedia.findOneAndDelete(id).catch((err) => error = err)
        if(error || !deletedSocialMedia){
            return res.status(404).json({error: 'social media not found'})
        }

        awsGF.deleteFile(deletedSocialMedia.icon, bucketName)

        // Mensagem de confirmação
        return res.status(200).json({message: 'social media deleted'})
    }
}