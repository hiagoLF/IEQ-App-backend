// Node Modules
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

// Local Modules
const Users = require('../models/UsersSchema')
const authConfig = require('../config/authConfig.json')

// General functions
async function getLoginToken(id){
    return await jwt.sign({id: id}, authConfig.jwtHash , {expiresIn: 1000})
}

async function verifyID(userId){
    const admUsers = await Users.$where('this.type <= 1')
    var valid = false
    for(var admUser of admUsers){
        if(admUser._id == userId){
            valid = true
            break
        }
    }
    return valid
}

async function changePassword(userId, oldPassword, newPassword){
    // Buscar usuário no banco
    const user = await Users.findById(userId)

    // Verificar se existe o usuário
    if(!user){
        return(0)
    }

    // Verificar se a senha antiga bate
    const valid = await bcrypt.compare(oldPassword, user.password)
    if(!valid){
        return(1)
    }

    // Mudar a senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    const updateResult = await Users.findOneAndUpdate({_id: userId}, {password: newPasswordHash})

    // Verificar se a senha foi alterada
    if(!updateResult){
        return(2)
    }

    return(3)
}

module.exports =  {
    async create(req, res){
        // Pegar login, password e name
        const {login, password, name} = req.body
        
        // Verificar se existem as informações acima
        if(!login && !password && !name) {
            return res.status(400).json({error: 'missing data'})
        }

        // Verificar no banco se o login já existe
        if(await Users.findOne({login})){
            return res.status(401).json({error: 'user alredy exists'})
        }

        // Criando um identificator
        const identificator = (Math.random() * Date.now()).toString()

        // Encriptar a senha
        const haspass = await bcrypt.hash(password, 10)

        // Guardar no banco de dados
        const user = await Users.create({login, password:haspass, name, identificator})

        // Gerar Token de Login
        const token = await getLoginToken(user._id)

        // Enviar token para o usuário
        return res.json({token})
    },


    async login(req, res){
        // Pegar login e password
        const {login, password} = req.body

        // Verificar se existe um login e password
        if(!login || !password){
            res.status(400).json({error: 'missing login or password'})
        }

        // Buscar usuário com o login informado
        const user = await Users.findOne({login})

        console.log(user)

        // Verificar se existe usuário com este login
        if(!user){
            return res.status(404).json({error: 'incorrect login or password'})
        }

        // Verificar se a senha bate com o usuário
        if(!await bcrypt.compare(password, user.password)){
            return res.status(404).json({error: 'incorrect login or password'})
        }

        // Gerar um token
        const token = await getLoginToken(user.id)

        //Enviar token
        return res.json({token})
    },


    async findAll(req, res){
        // Pegar id de quem fez a requisição
        const {userId} = req
        

        // Verificar se o id é do tipo mínimo 1
        const valid = await verifyID(userId)
        if(!valid){
            res.status(403).json({error: 'access denined'})
        }

        // Buscar todos os usuários do banco
        var users = await Users.find()

        // Retirando _id e password
        for(var i=0; i<users.length; i++){
            users[i].id = null
            users[i].password = null
        }

        // Enviar todos os usuários
        return res.json(users)
    },



    async findByIdentificator(req, res){
        // Pegar o id de quem fez a requisição
        const {userId} = req

        // Verificar se o id é do tipo mínimo 1
        const valid = await verifyID(userId)
        if(!valid){
            return res.status(403).json({error: 'no permission to access this content'})
        }

        // Pegar o identificador
        const {identificator} = req.params

        // Buscar no banco o usuário deste identificador
        const userFound = await Users.findOne({identificator})

        // Verificar se existe mesmo este usuário
        if(!userFound){
            return res.status(404).json('user not found')
        }

        // Retirar _id e password do usuário
        userFound._id = null
        userFound.password = null

        return res.json(userFound)
    },


    async LoggedUserInformations(req, res){
        // Pegar id do usuário logado
        const {userId} = req

        // Buscas as informações deste usuário na banco de dados
        const userInfos = await Users.findOne({_id: userId})

        // Verificar ser o usuário foi encontrado
        if(!userInfos){
            return res.status(404).json({error: 'no user found'})
        }

        // Retirar id e password do usuário
        userInfos._id = null
        userInfos.password = null

        // Enviar as informações
        return res.json(userInfos)
    },


    async editUserPassword(req, res){
        // Pegar antigo e novo password
        const {oldPassword, newPassword} = req.body

        /* return res.json({oldPassword, newPassword}) */

        // Ver se existe antigo e novo password
        if(!oldPassword || !newPassword){
            return res.status(400).json({error: 'provide both old and new password'})
        }

        // Pegar id do usuário que fez a requisição
        const {userId} = req

        // Alterar senha deste usuário
        const result = await changePassword(userId, oldPassword, newPassword)

        if(result < 3){
            return res.status(404).json({error: 'failed to change password'})
        }

        return res.json({message: 'password was changed'})
    }
}