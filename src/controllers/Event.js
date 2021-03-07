// Node modules

// Local Modules
const postFunctions = require('../GenericFunctions/post')
const awsFunctions = require('../GenericFunctions/aws')
const eventFunctions = require('../GenericFunctions/event')
const Events = require('../models/Event')
const Posts = require('../models/Post')

// Error Instance
const error = undefined

// Bucket Name
const bucketName = 'ieq-app-image-storage/covers-images'

module.exports = {





    // .....................................................................
    // Criar Evento
    async create(req, res) {
        // Pegar os dados de criação do post
        const data = postFunctions.getPostJsonData(req)
        // substituir indexID por 001
        data.indexId = '001'
        // Criar postagem com os dados informados
        const newPost = await Posts.create({ ...data }).catch(() => { error = true })
        // Verificar se criou
        if (!newPost || error) {
            return res.status(400).json({ message: 'creation failed' })
        }
        // Pegar os dados de criação do evento
        const { ministryId, eventADMs } = req.body
        // Criar evento com postId como o id da postagem recentemente criado
        const newEvent = await Events.create({
            ministryId,
            eventADMs,
            postId: newPost._id,
        }).catch(() => { error = true })
        // Verificar se criou mesmo
        if (!newEvent || error) {
            return res.status(400).json({ error: 'post was created but not event' })
        }
        // Colocar o id do evento no post
        newPost.eventId = newEvent._id
        // Salvar o post novamente
        await newPost.save().catch(() => {})
        // Confirmação
        return res.status(200).json(newPost)
    },




    // ......................................................
    // Deletar um evento
    async deleteEvent(req, res) {
        // Pegar o id do evento
        const { id } = req.params
        // Deletar evento
        const deletedEvent = await Events.findByIdAndDelete(id).catch(() => { error = true })
        // Ver se deletou alguma coisa
        if (!deletedEvent || error) {
            return res.status(404).json({ error: 'event not found' })
        }
        // Deletar a postagem deste evento
        const deletedPost = await Posts.findByIdAndDelete(deletedEvent.postId).catch(() => { error = true })
        // Ver se deletou
        if (!deletedPost || error) {
            return res.status(404).json({ error: 'this event post was not found, delete manualy' })
        }
        // Deletar imagem da aws
        deletedPost.image && awsFunctions.deleteFile(deletedPost.image, bucketName)
        // Confirmação
        return res.status(200).json({ message: 'event deleted' })
    },




    // ...........................................
    // Editando alguns dados do evento (Não é a postagem do evento)
    async updateEvent(req, res) {
        // Pegar id do evento
        const { id } = req.params
        // Pegar eventADMs
        const { eventADMs } = req.body
        // Buscar evento e fazer alteração
        const updatedEvent = await Events.findByIdAndUpdate(id, { eventADMs: eventADMs }).catch(() => { error = true })
        // Verificar se alterou mesmo
        if (!updatedEvent || error) {
            return res.status(404).json({ error: 'event not found' })
        }
        // Confirmação
        return res.status(200).json({ message: 'event updated' })
    },




    // .....................................................
    // Usuário se inscrever em um evento
    async subscribeOnEvent(req, res) {
        // Pegar id do evento
        const { id } = req.params
        // Buscar o evento
        const eventToSubscribe = await Events.findById(id).catch(() => { error = true })
        // Ver se existe mesmo
        if (!eventToSubscribe || error) {
            return res.status(404).json({ error: 'event not found' })
        }
        // Pegar os dados do usuário
        const { userData } = req
        // Pegar o identificator do usuário e inserir dentro de unconfirmedSubscribers e salvar
        const resultOfSubscribe = await eventFunctions.subscribeUser(userData, eventToSubscribe)
        // Verificar se salvou mesmo
        if (!resultOfSubscribe) {
            return res.status(400).json({ error: 'subscription failed' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'user subscribed' })
    },





    // ........................................................
    // Confirmar um Inscrito
    async confirmSubscriber(req, res) {
        // Pegar os dados do evento
        const { eventData } = req
        // Pegar o identificator do usuário
        const { identificator } = req.params
        // Transferir o identificator dele de unconfirmedSubscribers para confirmedSubscribers
        const resultOfSubscriberConfirmation = await eventFunctions.confirmSubscriber(identificator, eventData)
        // Verificar se transferiu mesmo
        if (!resultOfSubscriberConfirmation) {
            return res.status(400).json({ error: 'fail on confirmation' })
        }
        // Confirmação
        return res.status(200).json({ message: 'user confirmed' })
    },




    // ...................................................
    // Pegar eventos por página
    async getEventsByPage(req, res) {
        // Pegar a página do evento
        const { page } = req.params
        // Buscar Eventos no banco de dados
        var events = await Events.paginate({},
            { page, limit: 10, populate: 'postId', sort: { _id: 'desc' } }
        ).catch(() => { error = true })
        // Verificar se encontrou mesmo
        if (!events || error) {
            return res.status(404).json({ error: 'not found' })
        }
        return res.status(200).json(events)
    },




    // .......................................................
    // Pegar Evento por seu id
    async getEventById(req, res){
        // Pegar o id do evento
        const {eventId} = req.params
        // Pegar o evento
        const event = await Events.findById(eventId).catch(() => {error = true})
        // Verificar se encontrou
        if(!event || error){
            return res.status(404).json({error: 'event not found'})
        }
        // Enviar
        return res.status(200).json(event)
    },
}