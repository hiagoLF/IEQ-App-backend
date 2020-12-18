// Local modules
const Users = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')
const Event = require('../models/EventSchema')
const mongooseGF = require('../global_functions/mongooseGF')

// Variables instance
const bucketName = 'ieq-app-image-storage/covers-images'

// Funções

// Pega um array onde cada value é um subarray e altera para true a posição 1
// do subarray que tiver a posição 0 apontada
function makeArrayValueTrue(array, positionZero){
    for(var i=0; i<array.length; i++){
        if(array[i][0] == positionZero){
            array[i][1] = true
            return array
        }
    }
    return array
}



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
        const { name } = req.body
        const existingEvent = await Event.findOne({ name }).catch((err) => errors.push(err))
        if (existingEvent) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(403).json({ error: 'event already exists' })
        }

        // Pegar todas as informações do evento a ser criado
        const { date, description, text, openToSubscribe } = req.body
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

    async editEventById(req, res) {
        // Instanciar errors e file
        const errors = []
        const { file } = req

        // Pegar userId
        const { userId } = req

        // Buscar usuário no banco
        const userEditor = await Users.findById(userId).catch((err) => errors.push(err))
        if (!userEditor) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(404).json({ error: 'user nor found' })
        }

        // Pegar id do evento que se deseja editar e buscar no banco
        const { id } = req.params
        const eventToEdit = await Event.findById(id).catch((err) => errors.push(err))
        if (!eventToEdit) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(404).json({ error: 'event not found' })
        }

        // Verificar se o usuário é criador do evento ou administrador
        if (eventToEdit.creator != userId) {
            if (userEditor.type > 1) {
                file && awsGF.deleteFile(file.key, bucketName)
                return res.status(403).json({ error: 'user is not a leader or administrator' })
            }
        }

        // Pegar dados a serem editados
        const { name, date, description, text, openToSubscribe } = req.body
        // cover --> file.key

        // Modificar os dados
        if (name) {
            // Verificar se já existe um evento com o mesmo nome
            const existingEventWithSameName = await Event.findOne({ name }).catch((err) => errors.push(err))
            if (errors.length > 0 || existingEventWithSameName) {
                file && awsGF.deleteFile(file.key, bucketName)
                return res.status(403).json({ error: 'event already exists' })
            } else {
                eventToEdit.name = name
            }
        }
        date && (eventToEdit.date = date)
        description && (eventToEdit.description = description)
        text && (eventToEdit.text = text)
        openToSubscribe && (eventToEdit.openToSubscribe = openToSubscribe)
        if (file) {
            awsGF.deleteFile(eventToEdit.cover, bucketName)
            eventToEdit.cover = file.key
        }

        // Salvar os dados
        const savedEvent = await eventToEdit.save().catch((err) => errors.push(err))
        if (errors.length > 0 || !savedEvent) {
            file && awsGF.deleteFile(file.key, bucketName)
            return res.status(400).json({ error: 'failed on editing event' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'success on event editing' })
    },

    async deleteEventById(req, res) {
        // errors
        const errors = []

        // Pegar userId e buscar no banco
        const { userId } = req
        const userEraser = await Users.findById(userId).catch((err) => errors.push(err))
        if (errors.length > 0 || !userEraser) {
            return res.status(404).json({ error: 'user not found' })
        }

        // Pegar id do evento e buscar no banco
        const { id } = req.params
        const eventToDelete = await Event.findById(id).catch((err) => errors.push(err))
        if (errors.length > 0 || !eventToDelete) {
            return res.status(404).json({ error: 'event not found' })
        }

        // Verificar se o usuário é criador do evento ou administrador
        if (userId != eventToDelete.creator) {
            if (userEraser.type > 1) {
                return res.status(403).json({ error: 'user is not a leader or administrator' })
            }
        }

        // Deletar evento
        const deletedEvent = await Event.findByIdAndDelete(id).catch((err) => errors.push(err))
        if (errors.length > 0 || !deletedEvent) {
            return res.status(400).json({ error: 'failed on event deleting' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'success on event deleting' })
    },


    async subscribeByUser(req, res) {
        // Instanciar erros
        const errors = []

        // Pegar id do usuário e buscar no banco
        const { userId } = req
        const userToSubscribe = await Users.findById(userId).catch((err) => errors.push(err))
        if (errors.length > 0 || !userToSubscribe) {
            return res.status(404).json({ error: 'user not found' })
        }

        // Pegar id do evento e buscar no banco
        const { id } = req.params
        const eventToSubscribe = await Event.findById(id).catch((err) => errors.push(err))
        if (errors.length > 0 || !eventToSubscribe) {
            return res.status(400).json({ error: 'event not found' })
        }

        // Se o ministry do evento for diferente de 0, verificar no usuário se ele tem o id do ministry
        if (eventToSubscribe.ministry != 0) {
            var haveMinistry = false
            for (var mini of userToSubscribe.ministry) {
                if (mini[0] == eventToSubscribe.ministry) {
                    haveMinistry = true
                    break
                }
            }
            if (!haveMinistry) {
                return res.status(403).json({ error: 'user is not part of the ministry that created this event' })
            }
        }

        // Verificar se o usuário já está inscrito
        for (var evt of userToSubscribe.event) {
            if (evt[0] == id) {
                return res.status(403).json({ error: 'user is already subscribed on this event' })
            }
        }

        // Inscrever usuário no evento
        eventToSubscribe.subscribers.push([userToSubscribe.identificator, false])
        var result = await eventToSubscribe.save().catch((err) => errors.push(err))
        if (errors.length > 0 || !result) {
            return res.status(400).json({ error: 'failed on user subscribe' })
        }
        userToSubscribe.event.push([id, false])
        result = await userToSubscribe.save().catch((err) => errors.push(err))
        if (errors.length > 0 || !result) {
            return res.status(400).json({ error: 'failed on user subscribe' })
        }

        // Enviar mensagem de confirmação
        return res.status(200).json({ message: 'success on user subscribe' })
    },


    async unsubscribeByUser(req, res) {
        // Erros e userId
        var error = undefined
        const { userId } = req

        // Buscar no banco o usuário
        const userToUnsubscribe = await Users.findById(userId).catch((err) => error = err)
        if (error || !userToUnsubscribe) {
            return res.status(400).json({ error: 'user not found' })
        }

        // Pegar id do evento que se deseja excluir
        const { id } = req.params

        // Ver se existe entre os eventos dela e excluir caso não esteja confirmado
        for (var i = 0; i < userToUnsubscribe.event.length; i++) {
            if (userToUnsubscribe.event[i][0] == id) {
                if (userToUnsubscribe.event[i][1]) {
                    return res.status(403).json({ error: 'user is already confirmed to this event' })
                } else {
                    userToUnsubscribe.event.splice(i, 1)
                }
                break
            }
        }
        const result = await userToUnsubscribe.save().catch((err) => error = err)
        if (error || !result) {
            return res.status(400).json({ error: 'failed on user unsubscribe' })
        }

        // Buscar evento no banco de dados
        const eventToUnsubscribe = await Event.findById(id).catch((err) => error = err)
        if (error || !eventToUnsubscribe) {
            return res.status(404).json({ error: 'failed on getting event' })
        }

        // Excluir do evento
        for (var i = 0; i < eventToUnsubscribe.subscribers.length; i++) {
            if (eventToUnsubscribe.subscribers[i][0] == userToUnsubscribe.identificator) {
                eventToUnsubscribe.subscribers.splice(i, 1)
                break
            }
        }
        const editedEvent = await eventToUnsubscribe.save().catch((err) => error = err)
        if (error || !editedEvent) {
            W
            return res.status(400).json({ error: 'failed on event unsubscribe' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'successful on event unsubscribe' })
    },


    async unsubscribeByIdentificador(req, res) {
        // error, userId
        var error = undefined
        const { userId } = req

        // Buscar usuário no banco
        const admOrCreatorUser = await Users.findById(userId).catch((err) => error = err)
        if (error || !admOrCreatorUser) {
            return res.status(404).json({ error: 'user not found' })
        }

        // Pegar id do evento e buscar no banco
        const { id } = req.params
        const eventOfUnsubscribe = await Event.findById(id).catch((err) => error = err)
        if (error || !eventOfUnsubscribe) {
            return res.status(404).json({ error: 'event not found' })
        }

        // Instanciar se é creator do evento
        const isEventCreator = eventOfUnsubscribe.creator == userId

        // Verificar se é creator ou se é adm
        if (admOrCreatorUser.type > 1) {
            if (!isEventCreator) {
                return res.status(403).json({ error: 'user is not this event creator or administrator' })
            }
        }

        // Buscar usuário que se deseja desinscrever
        const { user } = req.params
        const userOfUnsubscribe = await Users.findOne({ identificator: user }).catch((err) => error = err)
        if (error || !userOfUnsubscribe) {
            return res.status(404).json({ error: 'user not found' })
        }

        // Desinscrever usuário no evento
        for (var i = 0; i < eventOfUnsubscribe.subscribers.length; i++) {
            if (eventOfUnsubscribe.subscribers[i][0] == userOfUnsubscribe.identificator) {
                eventOfUnsubscribe.subscribers.splice(i, 1)
                break
            }
        }
        const resultEvent = await eventOfUnsubscribe.save().catch((err) => error = err)
        if (error || !resultEvent) {
            return res.status(400).json({ error: 'failed on event usubscribe' })
        }

        // Desinscrever evento no usuário
        for (var i = 0; i < userOfUnsubscribe.event.length; i++) {
            if (userOfUnsubscribe.event[i][0] == id) {
                userOfUnsubscribe.event.splice(i, 1)
                break
            }
        }
        const resultUser = await userOfUnsubscribe.save().catch((err) => error = err)
        if (error || !resultUser) {
            return res.status(400).json({ error: 'failed on user usubscribe' })
        }

        // Mensagem de confimação
        return res.status(200).json({ message: 'success on unsubscribe' })
    },


    async confirmSubscriberByIdentificator(req, res) {
        // ID do evento
        const {eventid} = req.params

        // Buscar usuário no banco
        const {userId} = req
        const admOrLeaderUser = await mongooseGF.getUser(userId)
        !admOrLeaderUser && res.status(404).json({error: 'user not found'})

        // Buscar evento no banco
        const eventToConfirmsubscription = await mongooseGF.getEvent(eventid)
        !eventToConfirmsubscription && res.status(404).json({error: 'event not found'})

        // Se não for adm...
        if(admOrLeaderUser.type > 1 && eventToConfirmsubscription.ministry != '0'){
            // Verificar se é líder no ministry
            const ministryId = eventToConfirmsubscription.ministry
            const isLeader = mongooseGF.verifyMinistryLeader(admOrLeaderUser, ministryId)
            if(!isLeader){
                return res.status(403).json({error: 'user is not administrator or this event ministry leader'})
            }
        }

        // Buscar pessoa no banco
        const {identificator} = req.body
        const userToConfirmsubscription = await mongooseGF.getUserByIdentificator(identificator)

        // confirmar evento na pessoa
        userToConfirmsubscription.event = makeArrayValueTrue(
            userToConfirmsubscription.event,
            eventid
        )
        const userResult = await mongooseGF.saveToData(userToConfirmsubscription, mode='user')
        if(!userResult){
            return res.status(400).json({error: 'failed on user update'})
        }

        // confirmar pessoa no evento
        eventToConfirmsubscription.subscribers = makeArrayValueTrue(
            eventToConfirmsubscription.subscribers,
            identificator
        )
        eventToConfirmsubscription.name = 'nada de mais não'
        const eventResult = await mongooseGF.saveToData(eventToConfirmsubscription, mode='event')
        if(!eventResult){
            return res.status(400).json({error: 'failed on event update'})
        }

        // Confirmação
        return res.status(200).json({
            message: 'success on subscription confirmation'
        })
    },


    async subscribeAndConfirmPersonToEvent(req, res){
        // Bucar usuário no banco
        const {userId} = req
        const admOrLeaderUser = await mongooseGF.getUser(userId)
        if(!admOrLeaderUser){
            return res.status(404).json({error: 'user not found'})
        }

        // Buscar o evento no banco
        const {eventid} = req.params
        const eventToSubscribeAndConfirm = await mongooseGF.getEvent(eventid)
        if(!eventToSubscribeAndConfirm){
            return res.status(404).json({error: 'event not found'})
        }

        // instanciar isLeader como false
        var isLeader = false
        // Se o evento não tiver ministério...
        if(eventToSubscribeAndConfirm.ministry != '0'){
            // Instanciar se o usuário é líder do ministério do evento
            isLeader = await mongooseGF.verifyMinistryLeader(
                admOrLeaderUser,
                eventToSubscribeAndConfirm.ministry
            )
        }

        // Verificar se o usuário é adm...
        if(admOrLeaderUser.type > 1){
            // Verificar se o usuário não é líder
            if(!isLeader){
                return res.status(403).json({error: 'user is not adm or this ministry leader'})
            }
        }

        // Buscar a pessoa no banco
        const {identificator} = req.body
        const userToSubscribeAndConfirm = await mongooseGF.getUserByIdentificator(identificator)
        if(!userToSubscribeAndConfirm){
            return res.status(404).json({error: 'user to subscribe not found'})
        }

        // Ver se o evento está entre os eventos da pessoa...
        const isEventAlreadySubscribed = await mongooseGF.verifyEventInUser(userToSubscribeAndConfirm, eventid)
        if(isEventAlreadySubscribed){
            return res.status(403).json({error: 'user is already subscribed to this event'})
        }

        // Inscrever evento na pessoa
        userToSubscribeAndConfirm.event.push([eventid, true])
        await mongooseGF.saveToData(userToSubscribeAndConfirm)

        // Escrever pessoa no evento
        eventToSubscribeAndConfirm.subscribers.push([identificator, true])
        await mongooseGF.saveToData(eventToSubscribeAndConfirm)

        return res.status(200).json({message: 'user was subscribed and confirmed to this event'})
    },
}