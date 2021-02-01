// Local Modules
const Shepherds = require('../models/ShepherdSchema')
const Users = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')
const ShepherdSchema = require('../models/ShepherdSchema')

const bucketName = 'ieq-app-image-storage/covers-images'

module.exports = {
    async createShepherd(req, res) {
        var errors = []

        // Pegar file
        const { file } = req

        // ID do usuário e busca
        const { userId } = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if (!admUser || admUser.type > 1 || errors.length > 0) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({ error: 'user is not an administrator' })
        }

        // Pegar os dados a serem editados
        const { name, office, text, telephone, links, published} = req.body

        // Verificar se não existe no banco algum shepherd com o mesmo nome
        const existingShepherd = await Shepherds.findOne({ name }).catch((err) => errors.push(err))

        if (existingShepherd || errors.length > 0) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({ error: 'shepherd already exists' })
        }

        // Criar novo shepherd
        const newShepherd = await Shepherds.create({
            name,
            office,
            text,
            telephone,
            links,
            published,
            cover: file ? file.key : undefined
        }).catch((err) => errors.push(err))

        // Verificar se criou memso
        if (!newShepherd || errors.length > 0) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({ error: 'failed on shepherd creation' })
        }

        // Mensagem de confimação
        return res.status(200).json({ message: 'success on shepherd creation' })
    },


    async findPublishedShepherdsByPage(req, res) {
        var errors = []

        // Pegar a página informada
        const { page } = req.query

        // Buscar no banco
        const publishedShepherds = await Shepherds.paginate(
            {
                published: true
            },
            {
                page, limit: 10
            }
        ).catch((err) => errors.push(err))

        // Verificar se encontrou mesmo
        if (!publishedShepherds || errors.length > 0) {
            return res.status(404).json({ error: 'failed on getting shepherds' })
        }

        // Enviar informações
        return res.status(200).json(publishedShepherds)
    },


    async findUnpublishedShepherdsByPage(req, res) {
        // Instanciar lista de erros
        var errors = []

        // ID do usuário e busca no banco
        const { userId } = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if (!admUser || admUser.type > 1 || errors.length > 0) {
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // Buscar página informada
        const { page } = req.query

        // Busccar os shepherds não publicados
        const publishedShepherds = await Shepherds.paginate(
            {
                published: false
            },
            {
                page, limit: 10
            }
        ).catch((err) => errors.push(err))

        // Verificar se encontrou mesmo
        if (!publishedShepherds || errors.length > 0) {
            return res.status(400).json({ error: 'failed on geting shepherds' })
        }

        // Enviar
        return res.status(200).json(publishedShepherds)
    },


    async editShepherdById(req, res){
        // Intanciar errors e file
        var errors = []
        const {file} = req

        // PegarID e buscar usuário no banco
        const {userId} = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é administrador
        if(errors.length > 0 || !admUser || admUser.type > 1){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({error: 'user are not an administrator'})
        }

        // Pegar id do shepherd e buscar no banco de dados
        const {id} = req.params
        const shepHerdToEdit = await Shepherds.findById(id).catch((err) => errors.push(err))

        // Verificar se tem esse shepherd mesmo
        if(errors.length > 0 || !shepHerdToEdit){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({error: 'shepherd not found'})
        }

        // Pegar dados a serem editadas
        const {name, office, text, telephone, links, published} = req.body
        /* cover, */

        // Editar dados
        if(file){
            awsGF.deleteFile(shepHerdToEdit.cover, bucketName)
            shepHerdToEdit.cover = file.key
        }
        name && (shepHerdToEdit.name = name)
        office && (shepHerdToEdit.office = office)
        text && (shepHerdToEdit.text = text)
        telephone && (shepHerdToEdit.telephone = telephone)
        links && (shepHerdToEdit.links = links)
        published && (shepHerdToEdit.published = published)
        
        // Salvar e verificar se salvou
        await shepHerdToEdit.save().catch((err) => {erros.push(err)})
        if(errors.length > 0 || !shepHerdToEdit){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({error: 'failed on shepherd saving'})
        }

        // Mensagem de confirmação
        return res.json(shepHerdToEdit)
    },

    async deleteShepherd(req, res){
        // Instanciar errors
        const errors = []

        // Pergar id e verificar se é administrador
        const {userId} = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))
        if(errors.length > 1 || !admUser || admUser.type > 1){
            return res.status(403).json({error: 'user are not an administrator'})
        }

        // Pegar id do shepherd que vai deletar
        const {id} = req.params
        const shepherdToDelete = await Shepherds.findByIdAndDelete(id).catch((err) => errors.push(err))

        // Verificar se deletou mesmo
        if(errors.length > 0 || !shepherdToDelete){
            return res.status(404).json({error: 'shepherd not found'})
        }

        // Deletar imagem na AWS
        awsGF.deleteFile(shepherdToDelete.cover, bucketName)

        // Mensagem de confirmação
        res.status(200).json({message: 'success on removing shepherd'})
    },

}