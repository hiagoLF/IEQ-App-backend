// Local modules
const Users = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')
const Event = require('../models/EventSchema')

// Variables instance
const bucketName = 'ieq-app-image-storage/covers-images'

module.exports = {
    async createEvent(req, res) {
        // Instanciar erros e file
        const errors = []
        const { file } = req

        // Pegar id do usuário e buscar no banco de dados
        const { userId } = req
        const userCreator = await Users.findById(userId).catch((err) => errors.push(err))
        if (errors.length > 0 || !userCreator) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(404).json({ error: 'user not found' })
        }

        // Pegar ministry(ID) que foi enviado pelo body
        var { ministry } = req.body

        // Se ministry é diferente de 0, ver se o usuário possui liderança neste minitry e instanciar isLeader
        var isLeader = false
        if (!ministry || ministry != 0) {
            for (var mins of userCreator.ministry) {
                if (mins.id.toString() == ministry && mins.leader) {
                    isLeader = true
                    break
                }
            }
        }

        // Se não for isLeader ou é adm
        if (!isLeader) {
            if (userCreator.type > 1) {
                file && awsGF.deleteFile(file.key, bucketName)
                return res.status(403).json({ error: 'user is not a leader or administrator' })
            }
        }

        // Pegar name do evento e verificar se já existe
        const {name} = req.body
        const existingEvent = await Event.findOne({name}).catch((err) => errors.push(err))
        if(existingEvent){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({ error: 'event already exists' })
        }

        // Pegar todas as informações do evento a ser criado
        const {date, description, text, openToSubscribe } = req.body
        // file.key, ministry
        // creator

        // Criar evento
        const eventCreated = await Event.create({
            name,
            date,
            description,
            text,
            openToSubscribe,
            creator: userCreator._id.toString(),
            ministry,
            cover: file && file.key
        }).catch((err) => errors.push(err))

        // Verificar se criou mesmo
        if (errors.length > 0 || !eventCreated) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({ error: 'failed on event creation' })
        }

        // Enviar confirmação
        return res.status(200).json({ message: 'success on event creation' })
    },

    async editEventById(req, res){
        // Instanciar errors e file
        const errors = []
        const {file} = req

        // Pegar userId
        const {userId} = req

        // Buscar usuário no banco
        const userEditor = await Users.findById(userId).catch((err) => errors.push(err))
        if(!userEditor){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(404).json({error: 'user nor found'})
        }

        // Pegar id do evento que se deseja editar e buscar no banco
        const {id} = req.params
        const eventToEdit = await Event.findById(id).catch((err) => errors.push(err))
        if(!eventToEdit){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(404).json({error: 'event not found'})
        }

        // Verificar se o usuário é criador do evento ou administrador
        if(eventToEdit.creator != userId){
            if(userEditor.type > 1){
                file && awsGF.deleteFile(file.key, bucketName)
                return res.status(403).json({error: 'user is not a leader or administrator'})
            }
        }

        // Pegar dados a serem editados
        const {name, date, description, text, openToSubscribe} = req.body
        // cover --> file.key
        
        // Modificar os dados
        if(name){
            // Verificar se já existe um evento com o mesmo nome
            const existingEventWithSameName = await Event.findOne({name}).catch((err) => errors.push(err))
            if(errors.length > 0 || existingEventWithSameName){
                file && awsGF.deleteFile(file.key, bucketName)
                return res.status(403).json({error: 'event already exists'})
            } else {
                eventToEdit.name = name
            }
        }
        date && (eventToEdit.date = date)
        description && (eventToEdit.description = description)
        text && (eventToEdit.text = text)
        openToSubscribe && (eventToEdit.openToSubscribe = openToSubscribe)
        if(file){
            awsGF.deleteFile(eventToEdit.cover, bucketName)
            eventToEdit.cover = file.key
        }

        // Salvar os dados
        const savedEvent = await eventToEdit.save().catch((err) => errors.push(err))
        if(errors.length > 0 || !savedEvent){
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({error: 'failed on editing event'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'success on event editing'})
    },

    async deleteEventById(req, res){
        // errors
        const errors = []

        // Pegar userId e buscar no banco
        const {userId} = req
        const userEraser = await Users.findById(userId).catch((err) => errors.push(err))
        if(errors.length > 0 || !userEraser){
            return res.status(404).json({error: 'user not found'})
        }

        // Pegar id do evento e buscar no banco
        const {id} = req.params
        const eventToDelete = await Event.findById(id).catch((err) => errors.push(err))
        if(errors.length > 0 || !eventToDelete){
            return res.status(404).json({error: 'event not found'})
        }

        // Verificar se o usuário é criador do evento ou administrador
        if(userId != eventToDelete.creator){
            if(userEraser.type > 1){
                return res.status(403).json({error: 'user is not a leader or administrator'})
            }
        }

        // Deletar evento
        const deletedEvent = await Event.findByIdAndDelete(id).catch((err) => errors.push(err))
        if(errors.length > 0 || !deletedEvent){
            return res.status(400).json({error: 'failed on event deleting'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'success on event deleting'})
    }
}