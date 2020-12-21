// Node Modules
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')


// Local Modules
const Users = require('../models/UsersSchema')
const authConfig = require('../config/authConfig.json')
const { where, $where } = require('../models/UsersSchema')
const awsGlobalFunctions = require('../global_functions/awsGlobalFunctions')

var error = undefined

// Users Schema configuration


// s3 instance
const s3 = new aws.S3()

// General functions
async function getLoginToken(id) {
    return await jwt.sign({ id: id }, authConfig.jwtHash, { expiresIn: 86400 })
}

async function verifyID(userId) {
    const admUsers = await Users.$where('this.type <= 1')
    var valid = false
    for (var admUser of admUsers) {
        if (admUser._id == userId) {
            valid = true
            break
        }
    }
    return valid
}

async function changePassword(userId, oldPassword, newPassword) {
    // Buscar usuário no banco
    const user = await Users.findById(userId)

    // Verificar se existe o usuário
    if (!user) {
        return (0)
    }

    // Verificar se a senha antiga bate
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
        return (1)
    }

    // Mudar a senha
    const newPasswordHash = await bcrypt.hash(newPassword, 10)
    const updateResult = await Users.findOneAndUpdate({ _id: userId }, { password: newPasswordHash })

    // Verificar se a senha foi alterada
    if (!updateResult) {
        return (2)
    }

    return (3)
}


module.exports = {
    async create(req, res) {
        // Pegar login, password e name
        const { login, password, name } = req.body

        // Verificar se existem as informações acima
        if (!login && !password && !name) {
            return res.status(400).json({ error: 'missing data' })
        }

        // Verificar no banco se o login já existe
        if (await Users.findOne({ login })) {
            return res.status(401).json({ error: 'user alredy exists' })
        }

        // Criando um identificator
        const identificator = (Math.random() * Date.now()).toString()

        // Encriptar a senha
        const haspass = await bcrypt.hash(password, 10)

        // Guardar no banco de dados
        const user = await Users.create({ login, password: haspass, name, identificator })

        // Gerar Token de Login
        const token = await getLoginToken(user._id)

        // Enviar token para o usuário
        return res.json({ token })
    },


    async login(req, res) {
        // Pegar login e password
        const { login, password } = req.body

        // Verificar se existe um login e password
        if (!login || !password) {
            res.status(400).json({ error: 'missing login or password' })
        }

        // Buscar usuário com o login informado
        const user = await Users.findOne({ login })

        console.log(user)

        // Verificar se existe usuário com este login
        if (!user) {
            return res.status(404).json({ error: 'incorrect login or password' })
        }

        // Verificar se a senha bate com o usuário
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(404).json({ error: 'incorrect login or password' })
        }

        // Gerar um token
        const token = await getLoginToken(user.id)

        //Enviar token
        return res.json({ token })
    },


    async findAll(req, res) {
        // Pegar id de quem fez a requisição
        const { userId } = req


        // Verificar se o id é do tipo mínimo 1
        const valid = await verifyID(userId)
        if (!valid) {
            res.status(403).json({ error: 'access denined' })
        }

        // Buscar todos os usuários do banco
        var users = await Users.find()

        // Retirando _id e password
        for (var i = 0; i < users.length; i++) {
            users[i].id = null
            users[i].password = null
        }

        // Enviar todos os usuários
        return res.json(users)
    },



    async findByIdentificator(req, res) {
        // Pegar o id de quem fez a requisição
        const { userId } = req

        // Verificar se o id é do tipo mínimo 1
        const valid = await verifyID(userId)
        if (!valid) {
            return res.status(403).json({ error: 'no permission to access this content' })
        }

        // Pegar o identificador
        const { identificator } = req.params

        // Buscar no banco o usuário deste identificador
        const userFound = await Users.findOne({ identificator })

        // Verificar se existe mesmo este usuário
        if (!userFound) {
            return res.status(404).json('user not found')
        }

        // Retirar _id e password do usuário
        userFound._id = null
        userFound.password = null

        return res.json(userFound)
    },


    async LoggedUserInformations(req, res) {
        // Pegar id do usuário logado
        const { userId } = req

        // Buscas as informações deste usuário na banco de dados
        const userInfos = await Users.findOne({ _id: userId })

        // Verificar ser o usuário foi encontrado
        if (!userInfos) {
            return res.status(404).json({ error: 'no user found' })
        }

        // Retirar id e password do usuário
        userInfos._id = null
        userInfos.password = null

        // Enviar as informações
        return res.json(userInfos)
    },


    async editUserPassword(req, res) {
        // Pegar antigo e novo password
        const { oldPassword, newPassword } = req.body

        /* return res.json({oldPassword, newPassword}) */

        // Ver se existe antigo e novo password
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ error: 'provide both old and new password' })
        }

        // Pegar id do usuário que fez a requisição
        const { userId } = req

        // Alterar senha deste usuário
        const result = await changePassword(userId, oldPassword, newPassword)

        if (result < 3) {
            return res.status(404).json({ error: 'failed to change password' })
        }

        return res.json({ message: 'password was changed' })
    },



    async editUserData(req, res) {
        const { file, userId } = req
        const { about, memberSince } = req.body

        // Buscando Usuário
        const user = await Users.findById(userId).catch((err) => error = err)

        // Verificando se o usuário exista
        if (!user || error) {
            awsGlobalFunctions.deleteFile(file.key, 'ieq-app-image-storage/users-profile-image')
            res.status(404).json({ error: 'no user found' })
        }

        // alterando imagem do usuário
        var modifiedImage = false
        if (file) {
            if (user.image) {
                s3.deleteObject({
                    Bucket: 'ieq-app-image-storage/users-profile-image',
                    Key: user.image,
                }, () => null
                )
            }
            user.image = file.key
        }

        // alterando about do usuário
        if (about) {
            user.about = about
        }

        // alterando o memberSince
        if (memberSince) {
            if (user.memberSince === '0') {
                user.memberSince = memberSince
                console.log('membro desde mudado')
            }
        }

        await user.save().catch((err) => error = err)

        if(!user){
            awsGlobalFunctions.deleteFile(file.key, 'ieq-app-image-storage/users-profile-image')
            res.status(400).json({ error: 'failed on users update'})
        }

        // Retirando senha e ID
        user.password = null
        user._id = null

        res.json({
            user,
        })
    },


    async editUserDataByAdm(req, res) {
        // Pegando id de quem está fazendo a requisição
        const { userId } = req
        const { identificator, login, password, name, about, memberSince, type } = req.body
        const { file } = req

        // Pegar este usuário no banco de dados
        const admUser = await Users.findById(userId).catch((err) => error = err)

        // Ver se pegou algum usuário mesmo e se ele é administrador
        if (error || !admUser || admUser.type > 1) {
            awsGlobalFunctions.deleteFile(file.key, 'ieq-app-image-storage/users-profile-image')
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // Buscar o usuário que será modificado por meio do identificador
        const userUpdated = await Users.findOne({ identificator }).catch((err) => error = err)

        // Ver se encontrou o tal usuário que será modificado
        if (error || !userUpdated) {
            awsGlobalFunctions.deleteFile(file.key, 'ieq-app-image-storage/users-profile-image')
            return res.status(404).json('user not found')
        }

        //Modificar login
        if (login) {
            userUpdated.login = login
        }
        //Modificar password
        if (password) {
            userUpdated.password = await bcrypt.hash(password, 16)
        }
        //Modificar name
        if (name) {
            userUpdated.name = name
        }
        //Modificar about
        if (about) {
            userUpdated.about = about
        }
        //Modificar memberSince
        if (memberSince) {
            userUpdated.memberSince = memberSince
        }
        //Modificar type
        if (type && admUser.type == 0) {
            userUpdated.type = type
        }
        //Modificar imagem
        if (file) {
            if (userUpdated.image) {
                s3.deleteObject({
                    Bucket: 'ieq-app-image-storage/users-profile-image',
                    Key: userUpdated.image,
                }, () => null
                )
            }
            userUpdated.image = file.key
        }

        // Salvar modificações
        const result = await userUpdated.save().catch((err) => error = err)

        if (!result) {
            awsGlobalFunctions.deleteFile(file.key, 'ieq-app-image-storage/users-profile-image')
            return res.status(400).json('something went wrong')
        }

        result.password = null
        result._id = null
        return res.status(200).json({
            message: 'successful',
            data: result
        })
    },


    async getUsersIndexByName(req, res) {
        const { userId } = req

        // Buscando usuário que fez a requisição
        const admUser = await Users.findById(userId)

        // Verificar é uma adm
        if (admUser.type < 1) {
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // buscar o nome a ser pesquisado
        const { name } = req.query

        console.log(name)

        // pesquisar usuários com esse nome
        var results = await Users.find({
            "name": {
                $regex: '.*' + name + '.*',
                $options: 'i'
            }
        }).select('name image identificator -_id')

        // Preparar uma view
        const baseUrl = process.env.IMAGES_BASE_URL
        for (var i = 0; i < results.length; i++) {
            if (results[i].image) {
                results[i].image = baseUrl + results[i].image
            }
        }

        return res.json(results)
    },


    async getAllUsersIndexByPage(req, res) {
        // Pegar id do usuário que está fazendo a requisição
        const { userId } = req

        // Verificar se é um adm
        const admUser = await Users.findById(userId)
        if (!admUser || admUser.type > 1) {
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // Pegar página especificada pelo usuário
        const { pg } = req.query

        // Buscar no mongoose paginate
        const pageResults = await Users.paginate(
            {},
            {
                page:pg, limit: 10, select: 'identificator name image -_id'
            }
        )

        // Enviar de volta
        return res.status(200).json(pageResults)
    },


    async deleteUserById(req, res){
        // Pegar usuário que fez a requisição e verificar se é administrador
        const {userId} = req
        const admUser = await Users.findById(userId)
        if(!admUser || admUser.type > 1){
            return res.status(403).json({error: 'user are not an administrator'})
        }

        // Pegar o identificador do usuário, deletar no banco de dados e verificar se deletou mesmo
        const {identificator} = req.params
        const userDeleted = await Users.findOneAndDelete({identificator})
        if(!userDeleted){
            return res.status(404).json({error: 'user not found'})
        }

        // Enviar mensagem de confirmação
        return res.status(200).json({message: 'user removal success'})
    },
}