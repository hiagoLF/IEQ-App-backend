// Local Modules
const Histories = require('../models/HistorySchema')
const Users = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')

const mongoose = require('mongoose')

module.exports = {
    async createHistory(req, res) {
        // Pegar a file
        const { file } = req

        // Pegar o usuário que fez a requisição e verificar se é um administrador
        const { userId } = req
        const admUser = await Users.findById(userId)
        if (!admUser || admUser.type > 1) {
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(403).json({ erro: 'user are not an administrator' })
        }

        // Pegar as informações da história a ser criado
        const { title, descripription, text, links, published } = req.body

        // Verificar se já existe um título semelhante no banco de dados
        const ExistingHistory = await Histories.findOne({ title })
        if (ExistingHistory) {
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(400).json({ error: 'history already exists' })
        }

        // Criar uma nova história com as informações acima
        const newHistory = await Histories.create({
            title,
            descripription,
            text,
            links,
            published,
            cover: file ? file.key : null
        })

        // Verificar se criou mesmo
        if (!newHistory) {
            // Deletar a imagem da aws caso não tenha criado a história no banco
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(400).json({ error: 'failed on history creation' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'success on history creation' })
    },


    async getHistoriesByAdm(req, res) {
        // Pegar o id do usuário e ver se é administrador
        const { userId } = req
        const admUser = await Users.findById(userId)
        if (!admUser || admUser.type > 1) {
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // Buscar todas as histórias no banco de dados e verificar se buscou mesmo
        const histories = await Histories.find()
        if (!histories) {
            return res.status(400).json({ error: 'failed on getting histories' })
        }

        // Enviar histórias para o admnistrador
        return res.status(200).json(histories)
    },



    async getHistoriesByUser(req, res) {
        // Buscar no banco de dados as histórias que já estão publicadas
        const publisedHistories = await Histories.find({ published: true })

        // Verificar se pegou mesmo
        if (!publisedHistories) {
            return res.status(400).json({ error: 'failed on getting histories' })
        }

        // Enviar as histórias
        return res.status(200).json(publisedHistories)
    },



    async editHistoryById(req, res) {
        // Buscar arquivo de imagem
        const { file } = req

        // Verificar se quem fez a requisição é um adiministrador
        const { userId } = req
        const admUser = await Users.findById(userId)
        if (!admUser || admUser.type > 1) {
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(403).json({ error: 'user do not have permition to edit histories' })
        }

        // Buscar a history pelo id informado
        const { id } = req.params

        const historyToEdit = await Histories.findById(id) || undefined

        // Verificar se realmente existe esta história
        if (!historyToEdit) {
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(404).json({ error: 'history not found' })
        }

        // Começar a editar os dados
        // title, description, cover, text, links, published
        const { title, descripription, text, links, published } = req.body

        if (title) {
            historyToEdit.title = title
        }
        if (descripription) {
            historyToEdit.descripription = descripription
        }
        if (text) {
            historyToEdit.text = text
        }
        if (links) {
            historyToEdit.links = links
        }
        if (published != undefined) {
            historyToEdit.published = published
        }
        if (file) {
            if (historyToEdit.cover) {
                awsGF.deleteFile(historyToEdit.cover, 'ieq-app-image-storage/covers-images')
            }
            historyToEdit.cover = file.key
        }

        // Salvar os novos dados
        const editedHistory = await historyToEdit.save()

        // Verificar se salvou mesmo
        if (!editedHistory) {
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            res.status(400).json({ error: 'failed on history edition' })
        }

        // Mensagem de confirmação
        return res.status(200).json({ message: 'success on history editing' })
    },


    async deleteHistoryById(req, res){
        // Verificar se é administrador
        const {userId} = req
        const admUser = await Users.findById(userId)
        if(!admUser || admUser.type > 1){
            return res.status(403).json({error: 'user are not an administrator'})
        }

        // Deletar a história
        const {id} = req.params
        const deletedHistory = await Histories.findByIdAndDelete(id)
        if(!deletedHistory){
            return res.status(404).json({error: 'history not found'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'history was deleted'})
    },

}