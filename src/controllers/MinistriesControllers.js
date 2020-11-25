const Ministries = require('../models/MinistriesSchema')
const Users = require('../models/UsersSchema')

module.exports = {
    async createMinistry(req, res){
        // Pegar o id de quem fez a requisição
        const {userId} = req

        // Verificar se quem fez arequisição é um administrador
        const admUser = await Users.findById(userId)
        if(admUser.type > 1){
            return res.status(403).json({error: 'user are not an administrator'})
        }

        // Pegar o nome do ministério a ser criado
        const {name} = req.body

        // Verificar se já existe um ministério com esse nome
        const existingMinistry = await Ministries.findOne({name})
        if(existingMinistry){
            return res.status(403).json({error: 'ministry already exists'})
        }

        // Criar um ministério com o nome fornecido
        const newMinistry = await Ministries.create({name})

        // Verificar se realmente foi criado
        if(!newMinistry){
            return res.status(400).json({error: 'failed on creating a new ministry'})
        }

        // Enviar informações de volta
        return res.status(200).json({message: 'success on creating a new ministry'})
    }
}