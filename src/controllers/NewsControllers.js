// Local Modules
const News = require('../models/NewsSchema')
const User = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')
const { findByIdAndDelete } = require('../models/NewsSchema')

const coverBucket = 'ieq-app-image-storage/covers-images'

module.exports = {
    async create(req, res){
        // Buscar file
        const {file} = req

        // Verificar se é administrador ou líder de ministério
        const {userId} = req
        const user = await User.findById(userId)
        var isLeader = false
        for(myn of user.ministry){
            console.log(myn)
            if(myn.leader){
                isLeader = true
                break
            }
        }
        if(!isLeader){
            if(user.type > 1){
                if (file) {
                    awsGF.deleteFile(file.key, coverBucket)
                }
                return res.status(403).json({error: 'user do not have permission to create news'})
                
            }
        }

        // Buscar dados a serem introduzidos
        // title, cover, links[title, url], published, authorIdentificator, authorID, authorName,
        const {title, links, published, text} = req.body
        const authorIdentificator = user.identificator
        const authorID = userId
        const authorName = user.name

        // Salvar notícia
        const news = await News.create({
            title,
            links,
            published,
            authorIdentificator,
            authorID,
            authorName,
            text,
            cover: file? file.key: undefined
        })

        // Ver se salvou mesmo
        if(!news){
            if (file) {
                awsGF.deleteFile(file.key, coverBucket)
            }
            return res.status(400).json({error: 'something went wrong'})
        }

        //  Mensagem de confirmação
        return res.status(200).json({message: 'news was created'})

    },


    async editNoticeById(req, res){
        const errors = [] 

        /* 
        --> Dados a fornecer
            :id --> ID da notícia --> No link
            title,
            links,
            published,
            coverImage --> file
         */

        // Pegar file
        const {file} = req

        // Pegar id de quem fez a requisição e id da notícia que se deseja editar
        const {userId} = req
        const {id} = req.params

        // Buscar notícia no banco de dados
        const news = await News.findById(id).catch((err) => {errors.push(err)})
        
        // Verificar existe essa notícia
        if(!news){
            file && awsGF.deleteFile(file.key, coverBucket)
            return res.status(400).json({error: 'User not found'})
        }

        // Buscar usuário no banco de dados
        const user = await User.findById(userId)

        // Verificar se é autor da notícia ou administrador
        if(news.authorID.toString() != userId){
            if(user.type > 1){
                file && awsGF.deleteFile(file.key, coverBucket)
                return res.status(403).json({error: 'user do not have permition to edit this news'})
            }
        }

        // Pegar dados solicitados para edição
        const {title, links, published, text} = req.body

        // Alterar os dados da notícia
        title && ( news.title = title )
        links && ( news.links = links )
        text && ( news.text = text )
        published && ( news.published = published )
        if(file){
            awsGF.deleteFile(news.cover, coverBucket)
            news.cover = file.key 
        }

        // Salvar os novos dados
        const editedNews = await news.save().catch((err) => {errors.push(err)})

        // Verificar se salvou
        if(!editedNews){
            return res.status(400).json({error: 'failed on saving news'})
        }

        // Mensagem de confirmação
        return res.status(200).json({error: 'success on news editing'})
    },


    async getPublishedNews(req, res){
        // Pegar o número da página de notícias
        const {page} = req.query ? req.query : 1

        console.log(page)

        // Buscar notícias pela página informada
        const news = await News.paginate(
            {
                published: true
            },
            {
                page, limit: 10, select: '-authorID'
            }
        )

        // Enviar de volta
        return res.status(200).json(news)
    },

    async getUnpublishedNews(req, res){
        // Pegar página
        const {page} = req.query

        // Pegar ID de quem fez a requisição e buscar usuário
        const {userId} = req
        const userPublished = await User.findById(userId)

        // Instanciar se é adm
        const isAdm = userPublished.type < 2 ? true : false

        // Pegar todas as notícias publicadas caso seja adm
        var unpublishedNews = undefined
        if(isAdm){
            unpublishedNews = await News.paginate(
                {
                    published: false
                },
                {
                    page, limit: 10, select: '-authorID'
                }
            )
        } else {
            // Se não for adm, pegar as notícias que o usuário escreveu
            unpublishedNews = await News.paginate(
                {
                    published: false,
                    authorID: userId
                },
                {
                    page, limit: 10, select: '-authorID'
                }
            )
        }

        // Verificar se houveram notícias mesmo
        if(!unpublishedNews){
            return res.status(403).json({error: 'user do not have permition to view this news'})
        }

        // Mensagem de confirmação
        return res.status(200).json(unpublishedNews)
    },


    async deleteNewsById(req, res){
        const errors = []

        // Id de quem fez a requisição e id da notícia
        const {userId} = req
        const {id} = req.params

        // Buscar notícia no banco
        const noticeToDelete = await News.findById(id).catch((err) => errors.push(err))
        if(!noticeToDelete){
            return res.status(404).json({message: 'notice not found'})
        }

        // Buscar usuário no banco
        const user = await User.findById(userId)
        
        // Instanciar se é adm
        const isAdm = user.type < 2 ? true: false

        // Verificar se é adm ou autor da notícia
        if(noticeToDelete.authorID != user._id.toString()){
            if(!isAdm){
                return res.status(403).json({error: 'user do not have permitions to delete this news'})
            }
        }

        // Deltar a notícia
        const deletedNews = await News.findByIdAndDelete(id)
        if(!deletedNews){
            return res.status(400).json({error: 'failed on news deletion'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'success on news removing'})
    },
}