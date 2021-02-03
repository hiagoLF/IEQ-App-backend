// Local Modules
const Events = require('../models/Event')

// Error Instance
const error = undefined

module.exports = async function authToConfirmSubscriber(req, res, next) {

    // Pegar id do event
    const { eventid } = req.params
    // Buscar o evento no banco
    const eventToVerifyAuthorization = await Events.findById(eventid).catch(() => { error = true })
    // Verificar se existe mesmo este evento
    if (!eventToVerifyAuthorization || error) {
        return res.status(404).json({ error: 'event not found' })
    }
    // Pegar a lista de eventADMs
    const { eventADMs } = eventToVerifyAuthorization
    // Pegar identificator do usuário
    const { identificator, type } = req.userData
    // Verificar se o identificator do usuário esta na lista de eventADMs
    const indexOfIdentificator = eventADMs.indexOf(identificator)
    // Se não estiver
    if(indexOfIdentificator == -1){
        // Se o usuário não for adm...
        if (type > 1){
            // Não autorizar
            return res.status(403).json({error: 'permision denied'})
        }
    }
    // Se estiver...
    // Guardar os dados do event em req.eventData
    req.eventData = eventToVerifyAuthorization
    // retornar next
    return next()
}