// Local Modules
const Events = require('../models/Event')

// Error Instance
const error = undefined

module.exports = {



    // .........................................
    // Inscrever usuário em um evento
    async subscribeUser(userObject, eventObject) {
        // Verificar se o usuário já está inscrito
        const isUserAlreadySubscribed = this.verifySubscription(userObject, eventObject)
        // Se já estiver...
        if (isUserAlreadySubscribed) {
            // Retornar false
            return false
        }
        // Pegar o array de unconfirmedSubscribers
        var { unconfirmedSubscribers } = eventObject
        // Inserir o identificator do usuário dentro de unconfirmedSubscribers
        unconfirmedSubscribers = [...unconfirmedSubscribers, userObject.identificator]
        // Salvar o evento
        const resultOfEventUpdate = await Events.findByIdAndUpdate(eventObject._id, { unconfirmedSubscribers }).catch(() => { error = true })
        // Verificar se Salvou mesmo
        if (!resultOfEventUpdate || error) {
            return false
        }
        // Retornar true
        return true
    },



    // ..................................................
    // Verificando se o usuário já está inscrito no evento
    verifySubscription(userObject, eventObject) {
        // Pegar o array confirmedSubscribers e unconfirmedSubscribers
        const { confirmedSubscribers, unconfirmedSubscribers } = eventObject
        // Verificar se está em confirmedSubscribers
        const indexOfConfirmed = confirmedSubscribers.indexOf(userObject.identificator)
        // Se estiver...
        if (indexOfConfirmed != -1) {
            // Retornar true
            return true
        }
        // Verificar se está em unconfirmedSubscribers
        const indexOfUnconfirmed = unconfirmedSubscribers.indexOf(userObject.identificator)
        // Se estiver...
        if (indexOfUnconfirmed != -1) {
            // Retornar true
            return true
        }
        // Se não estiver em lugar algum...
        // Retornar true
        return false
    },




    // ............................................................
    // Confirmar Inscrição de Usuário em um Evento
    async confirmSubscriber(identificator, eventObject) {
        // Pegar o unconfirmedSubscribers do evento
        const { unconfirmedSubscribers } = eventObject
        // Verificar o índicie do identificator dentro deste array
        const indexOfIdentificator = unconfirmedSubscribers.indexOf(identificator)
        // Se o índicie for -1...
        if (indexOfIdentificator == -1) {
            // Retornar False
            return false
        }
        // Dar um splice no índicie
        unconfirmedSubscribers.splice(indexOfIdentificator, 1)
        // Pegar o confirmedSubscribers do evento
        const { confirmedSubscribers } = eventObject
        // Adicionar o identificator lá dentro
        confirmedSubscribers.push(identificator)
        console.log('unconfirmedSubscribers >> ', unconfirmedSubscribers)
        console.log('confirmedSubscribers >> ', confirmedSubscribers)
        // Salvar o evento com as informação atualizadas
        const updatedEvent = await Events.findByIdAndUpdate(eventObject._id, {
            unconfirmedSubscribers,
            confirmedSubscribers
        }).catch(() => { error = true })
        // Verificar se salvou mesmo
        // Se não salvou
        if (!updatedEvent || error) {
            // Retornar false
            return false
        }
        // Retornar true
        return true
    },




    // ...................................
    // Preencher eventos com suas postagens
}