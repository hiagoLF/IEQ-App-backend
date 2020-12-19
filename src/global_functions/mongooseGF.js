const Users = require('../models/UsersSchema')
const Event = require('../models/EventSchema')
const Ministry = require('../models/MinistriesSchema')
const SocialMedia = require('../models/SocialMediaSchema')
const Albuns = require('../models/AlbumSchema')
const awsGF = require('./awsGlobalFunctions')

const error = undefined

module.exports = {
    async saveToData(data, mode=undefined){
        var result = undefined
    
        if(!mode){
            result = await data.save().catch((err) => error = err)
        }else if(mode == 'user'){
            result = await Users.findByIdAndUpdate(data._id, data)
        }else if(mode == 'event'){
            result = await Event.findByIdAndUpdate(data._id, data)
        }
    
        if(error || !result){
            console.log(error)
            return undefined
        }else{
            return result
        }
    },

    async getUser(id){
        const user = await Users.findById(id).catch((err) => error = err)
        if(error || !user){
            return undefined
        }else{
            return user
        }
    },
    
    async getUserByIdentificator(identificator){
        const user = await Users.findOne({identificator}).catch((err) => error = err)
        if(error || !user){
            return undefined
        }else{
            return user
        }
    },
    
    async getEvent(id){
        const event = Event.findById(id).catch((err) => error = err)
        if(error || !event){
            return undefined
        }else{
            return event
        }
    },
    
    async getMinistry(id){
        const ministry = Ministry.findById(id).catch((err) => error = err)
        if(error || !ministry){
            return undefined
        }else{
            return ministry
        }
    },
    
    async convertUserIdentificatorsToUsersIDs(identificators){
        const ids = []
        for(var identificator of identificators){
            const idOfIdentificator = (await Users.findOne({identificator}).select('_id'))._id
            ids.push(idOfIdentificator)
        }

        return ids
    },
 
    verifyMinistryLeader(user, ministryId){
        //Recebe o json do usuário e o id do ministério e retorna se é líder (true) ou não (false)

        for(var mm of user.ministry){
            console.log(mm, ministryId)
            if(mm[0] == ministryId){
                if(mm[1]){
                    return true
                }else{
                    return false
                }
            }
        }
        return false
    },

    async editMinistry(ministryId, data){
        const result = await Ministry.findByIdAndUpdate(ministryId, data).catch((err) => error = err)
        if(error || !result){
            return undefined
        }else{
            return result
        }
    },

    verifyEventInUser(userToSubscribeAndConfirm, eventid){
        // Recebe Objeto do usuário e id do evento e retorna se a pessoa está (true) ou não éstá (false) no evento
        var isAlreadyOnEvent = false
        for(var evt of userToSubscribeAndConfirm.event){
            if(evt[0] == eventid){
                return true
            }
        }
        return false
    },

    async verifyIfUserIsAdministrator(req){
        // req: Request (Express)
        // Retorna se quem fez a requisição é administrador (true) ou não (false)
        // Retorna undefined se nada foi encontrado
        const {userId} = req
        const admUser = await this.getUser(userId)
        if(!admUser){
            return undefined
        }
        if(admUser.type>1){
            return false
        }else{
            return true
        }
    },


    async getAlbuns(page = 1, published = true){
        const albuns = await Albuns.paginate(
            {
                published
            },
            {
                limit: 10,
                page: page
            }
        ).catch((err) => error = err)
        if(error || !albuns){
            return undefined
        }
        return albuns
    },

    async getAlbumById(albumid){
        const album = await Albuns.findById(albumid).catch((err) => error = err)
        console.log(album)
        if(error || !album){
            return undefined
        }
        return album
    },

    async deleteImageInAlbum(albumid, imagekey){
        const albumToEdit = await this.getAlbumById(albumid)
        if(!albumToEdit){
            return undefined
        }
        const index = albumToEdit.images.indexOf(imagekey)
        if(index != -1){
            albumToEdit.images.splice(index, 1)
            const editedAlbum = await this.saveToData(albumToEdit)
            if(editedAlbum){
                awsGF.deleteFile(imagekey, 'ieq-app-image-storage/albuns-images')
                return true
            }
        }
        return undefined
    },

    async deleteAlbum(albumid){
        // Deletar o album e pegar informações do album deletado
        const deletedAlbum = await Albuns.findByIdAndDelete(albumid).catch((err) => error = err)
        // Se deletou mesmo...
        if(!error && deletedAlbum ){
            // Percorrer images do album...
            for(var imagekey of deletedAlbum.images){
                // Deletar cada uma das images
                awsGF.deleteFile(imagekey, 'ieq-app-image-storage/albuns-images')
            }
            return true
        }
        return undefined
    },


    async includeImageToDataAlbum(filekey, albumid){
        const album = await this.getAlbumById(albumid)
        if(!album){
            return undefined
        }
        album.images.push(filekey)
        const result = await this.saveToData(album)
        if(!result){
            return undefined
        }
        return true
    }
}