// Node modules

// Local modules
const Reflections = require('../models/ReflectionsSchema')
const Users = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')

// bucket name instance
const coverBucket = 'ieq-app-image-storage/covers-images'

module.exports = {
    async createReflection(req, res) {
        var errors = []

        // Pegar file
        const { file } = req

        // Pegar id e buscar no banco
        const { userId } = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if (admUser.type > 1) {
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(403).json({ error: 'user is not an administrator' })
        }

        // Buscar os campos a serem iseridos
        const { title, description, text, links, youTubeID, published } = req.body

        // Verificar se já existe uma reflexão com o mesmo título
        const existingReflection = await Reflections.findOne({ title }).catch((err) => errors.push(err))
        if (existingReflection) {
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(400).json({ error: 'reflection already exists' })
        }

        // Criar a nova reflexão
        const newReflection = await Reflections.create({
            title,
            description,
            text,
            links,
            youTubeID,
            published,
            cover: file ? file.key : undefined,
        }).catch((err) => errors.push(err))

        // Ver se criou mesmo
        if (!newReflection) {
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(400).json({ error: 'failed on reflection creating' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'success on reflection creation' })
    },

    async getPublishedReflectionsByPage(req, res) {
        var errors = []

        // Pegar a página solicitada
        const { page } = req.query

        // Buscar no banco de dados
        const reflections = await Reflections.paginate(
            {
                published: true
            },
            {
                page, limit: 10
            }
        ).catch((err) => errors.push(err))

        // Verificar se veio mesmo
        if(!reflections){
            return res.status(404).json({error: 'no reflections found'})
        }

        // Enviar informações
        return res.status(200).json(reflections)
    },


    async getUnPublishedReflectionsByPage(req, res){
        var errors = []

        // Pegar id do usuário e buscar no banco de dados
        const {userId} = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if(!admUser || admUser.type > 1){
            return res.status(403).json({error: 'user are not and administrator'})
        }

        // Pegar a página
        const {page} = req.query

        // Buscar as reflexões no banco de dados
        const reflections = await Reflections.paginate(
            {
                published: false
            },
            {
                page, limit: 10
            }
        ).catch((err) => errors.push(err))

        // Ver se buscou mesmo
        if(!reflections){
            return res.status(400).json({error: 'no reflections found'})
        }

        // Enviar informações
        return res.status(200).json(reflections)
    },


    async editReflectionByID(req, res){
        var errors = []

        // Pegar file
        const {file} = req

        // Pegar id do usuário e buscar no banco
        const {userId} = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if(!admUser || admUser.type > 1){
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(403).json({error: 'user are not an administrator'})
        }

        const {id} = req.params

        // Buscar a reflexão a ser editada e verificar se existe mesmo
        const reflectionToEdit = await Reflections.findById(id).catch((err) => errors.push(err))
        if(!reflectionToEdit){
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(404).json({error: 'reflection not found'})
        }

        

        // Pegar as informações a serem editadas
        const {title, description, text, links, youTubeID, published} = req.body

        // Alterar as informações
        if(file){
            awsGF.deleteFile(reflectionToEdit.cover, coverBucket)
            reflectionToEdit.cover = file.key
        }
        title && (reflectionToEdit.title = title)
        description && (reflectionToEdit.description = description)
        text && (reflectionToEdit.text = text)
        links && (reflectionToEdit.links = links)
        youTubeID && (reflectionToEdit.youTubeID = youTubeID)
        published && (reflectionToEdit.published = published)

        // Salvar novas informações
        const editedReflection = await reflectionToEdit.save().catch((err) => errors.push(err))

        // Verificar se salvou mesmo
        if(!editedReflection){
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(400).json({error: 'failed on reflection editing'})
        }

        // Enviar mensagem de confirmação
        return res.status(200).json({message: 'success on reflection editing'})
    },


    async deleteReflection(req, res){
        var errors = []

        // Pegar id do usuário e buscar no banco de dados
        const {userId} = req
        const admUser = await Users.findById(userId).catch((err) => errors.push(err))

        // Verificar se é adm
        if(!admUser || admUser.type > 1){
            return res.status(403).json({error: 'user is not an administrator'})
        }

        // Pegar o id da reflexão
        const {id} = req.params

        // Deletar a reflexão
        const deletedReflection = await Reflections.findByIdAndDelete(id).catch((err) => errors.push(err))

        // Verificar se deletou mesmo
        if(!deletedReflection){
            return res.status(400).json({error: 'failed on reflection deleting'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'success on reflection deleting'})
    },
}