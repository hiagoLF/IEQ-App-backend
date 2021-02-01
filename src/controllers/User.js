// Node Modules
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const aws = require('aws-sdk')

// Local Modules
const authConfig = require('../config/authConfig.json')
const Users = require('../models/User')
const GFunctions = require('../GenericFunctions')
const userFunctions = require('../GenericFunctions/user')
const awsFunctions = require('../GenericFunctions/aws')

// Errors Instance
var error = undefined

// Buket Name
const bucketName = 'ieq-app-image-storage/users-profile-image'

// User General Functions
async function getLoginToken(id) {
    return await jwt.sign({ id: id }, authConfig.jwtHash, { expiresIn: 86400 })
}

async function includeLoggedTokenOnDataBase(user) {
    const token = await getLoginToken(user._id)
    user.loggedToken = token
    const result = await user.save().catch(() => error = true)
    return (result || !error) ? true : false
}

// Export
module.exports = {



    // ................................
    // Criar Novo Usuário
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
        // Incluir token no banco
        const result = await includeLoggedTokenOnDataBase(user)
        // Ver se incluiu
        if (!result) {
            return res.status(400).json({ error: 'failed' })
        }
        // Ocultar dados
        GFunctions.hideData(['password', '_id'], user._doc)
        // Enviar dados para o usuário
        return res.json({ ...user._doc })
    },



    // .......................................
    // Logar Usuário
    async login(req, res) {
        // Pegar login e password
        const { login, password } = req.body
        // Verificar se existe um login e password
        if (!login || !password) {
            res.status(400).json({ error: 'missing data' })
        }
        // Buscar usuário com o login informado
        const user = await Users.findOne({ login })
        // Verificar se existe usuário com este login
        if (!user) {
            return res.status(404).json({ error: 'incorrect login or password' })
        }
        // Verificar se a senha bate com o usuário
        if (!await bcrypt.compare(password, user.password)) {
            return res.status(404).json({ error: 'incorrect login or password' })
        }
        // Incluir token no banco
        const result = await includeLoggedTokenOnDataBase(user)
        // Ver se incluiu
        if (!result) {
            return res.status(400).json({ error: 'failed' })
        }
        // Ocultar dados
        GFunctions.hideData(['password', '_id'], user._doc)
        // Enviar dados para o usuário
        return res.status(200).json({ ...user._doc })
    },




    // .........................................
    // Refresh User
    async refresh(req, res) {
        // Pegar as informações do usuário
        const user = await req.userData
        // Gerar Novo token
        const result = await includeLoggedTokenOnDataBase(user)
        // Verificar se salvou mesmo
        if (!result) {
            res.status(400).json({ error: 'not refreshed' })
        }
        // Ocultar Informações
        GFunctions.hideData(['password', '_id'], user._doc)
        // Enviar
        return res.status(200).json({ ...user._doc })
    },




    // ...........................................
    // Editando informações do usuário
    async edit(req, res) {
        // Pegar as informações do usuário
        var user = req.userData
        // Pegar as informações enviadas
        var { type, login, name, memberSince, password } = req.body
        // Se não for adm...
        if (user.type > 1) {
            // Zerar informações de name, memberSince e type
            name = undefined
            memberSince = undefined
            type = undefined
        } else {
            // Se for adm...
            // Instanciar se é adm 0
            const isZeroAdm = user.type == 0 ? true : false
            console.log(isZeroAdm)
            // Buscar usuário pelo identificator e substituir user pelas informações deste usuário
            const { identificator } = req.params
            user = await userFunctions.getUser('identificator', identificator)
            if (!user) {
                return res.status(400).json({ error: 'user not found' })
            }
            // Se não for adm 0 e estiver tentando colocar 0 em alguém ou tirar o 0 de alguém...
            if (!isZeroAdm && (type < 1 || user.type == 0)) {
                // Zerar o type
                type = undefined
            }
        }
        // Colocar dados novos
        (type != undefined && (type >= 0 && type <= 3)) && (user.type = type)
        name && (user.name = name)
        memberSince && (user.memberSince = memberSince)
        login && (user.login = login)
        password && (user.password = await bcrypt.hash(password, 10))
        // Salvar Usuário
        const result = await userFunctions.saveUser(user)
        if (!result || error) {
            return res.status(400).json({ error: 'failed on update' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'user updated' })
    },




    // ....................................
    // Editando a imagem de perfil
    async editImage(req, res) {
        // Pegar as informações do usuário
        var user = req.userData
        // Pegar a key da imagem
        var image = req.file.key
        // Se for adm...
        if (user.type < 2) {
            // Buscar usuário pelo identificator e substituir user pelas informações deste usuário
            const { identificator } = req.params
            user = await userFunctions.getUser('identificator', identificator)
            if (!user) {
                return res.status(400).json({ error: 'user not found' })
            }
        }
        // Deletar última imagem se haver
        user.image && awsFunctions.deleteFile(user.image, bucketName)
        // Guardar nome da nova imagem no banco
        user.image = image
        // Salvar Usuário
        const result = await userFunctions.saveUser(user)
        if (!result || error) {
            return res.status(400).json({ error: 'failed on update' })
        }
        // Mensagem de confirmação
        return res.status(200).json({ message: 'image updated' })
    },




    // ..........................
    // Deletando usuário
    async delete(req, res) {
        // Pegar identificator deste usuário
        const { identificator } = req.params
        // Excluir o usuário que tiver este identificator
        const user = await Users.findOneAndDelete({ identificator }).catch(() => { error = true })
        // Verificar se excluiu alguma coisa mesmo
        if (!user || error) {
            return res.status(400).json({ error: 'failed on deletion' })
        }
        // Deletar a imagem da aws
        user.image && awsFunctions.deleteFile(user.image, bucketName)
        // Mensagem de confirmação
        return res.status(200).json({ message: 'user was deleted' })
    },




    // ..................................
    // Pegando Usuário pelo nome
    async getUsersByName(req, res) {
        // Pegar o nome enviado
        const { name } = req.params
        // Buscar no banco os usuários  ocultando _id, password e loggedToken
        const users = await Users.find({
            "name": {
                $regex: '.*' + name + '.*',
                $options: 'i'
            }
        })
            .select('-_id -password -loggedToken')
            .catch(() => { error = true })
        // Verificar se os dados vieram direirinho
        if (!users || error) {
            return res.status(400).json({ message: 'data not found' })
        }
        // Enviar
        return res.status(200).json(users)
    },





    // .......................................
    // Pegando Usuários por página
    async getUsersByPage(req, res) {
        // Pegar o número da página
        const { page } = req.params
        // Buscar os usuários ocultando _id, password e loggedToken
        const pageResults = await Users.paginate(
            {},
            {
                page: page, limit: 10, select: '-_id -password -loggedToken'
            }
        ).catch(() => { error = true })
        // Verificar se buscou tudo direitinho
        if (!pageResults || error) {
            return res.status(404).json({ message: 'data not found' })
        }
        // Enviar
        return res.status(200).json(pageResults)
    },




    // ..............................
    // Logout de Usuário
    async logout(req, res) {
        const authHeader = req.headers.authorization
        const token = (authHeader.split(' '))[1]
        // Pegar o usuário
        const user = await Users.findOne({ loggedToken: token }).catch(() => { error = true })
        // Ver se encontrou usuário mesmo
        if (!user || error) {
            return res.status(404).json({ error: 'user not found' })
        }
        // Remover o token
        user.loggedToken = undefined
        // Salvar
        const response = await userFunctions.saveUser(user)
        // Verificar se salvou mesmo
        if (!response) {
            return res.status(400).json({ error: 'failed on logout' })
        }
        // Enviar resposta
        return res.status(200).json({ message: 'success on logout' })
    }
}