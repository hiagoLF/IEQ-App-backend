// Local Modules
const News = require('../models/NewsSchema')
const User = require('../models/UsersSchema')
const awsGF = require('../global_functions/awsGlobalFunctions')

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
                    awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
                }
                return res.status(403).json({error: 'user do not have permission to create news'})
                
            }
        }

        // Buscar dados a serem introduzidos
        // title, cover, links[title, url], published, authorIdentificator, authorID, authorName,
        const {title, links, published} = req.body
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
            cover: file? file.key: undefined
        })

        // Ver se salvou mesmo
        if(!news){
            if (file) {
                awsGF.deleteFile(file.key, 'ieq-app-image-storage/covers-images')
            }
            return res.status(400).json({error: 'something went wrong'})
        }

        //  Mensagem de confirmação
        return res.status(200).json({message: 'news was created'})

    }
}