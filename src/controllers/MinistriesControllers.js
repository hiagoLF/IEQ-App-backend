const Ministries = require('../models/MinistriesSchema')
const Users = require('../models/UsersSchema')
const aws = require('aws-sdk')

const s3 = new aws.S3()

module.exports = {
    async createMinistry(req, res) {
        // Pegar o id de quem fez a requisição
        const { userId, editors } = req

        // Verificar se quem fez arequisição é um administrador
        const admUser = await Users.findById(userId)
        if (admUser.type > 1) {
            return res.status(403).json({ error: 'user are not an administrator' })
        }

        // Pegar o nome do ministério a ser criado
        const { name } = req.body

        // Verificar se já existe um ministério com esse nome
        const existingMinistry = await Ministries.findOne({ name })
        if (existingMinistry) {
            return res.status(403).json({ error: 'ministry already exists' })
        }

        // Pegar os editores enviados
        const { publishers } = req.body

        // Converter os identificators dos editores em _id dos editores
        var publishersIds = []
        if(publishers){
            for(publisher of publishers){
                publishersIds.push((await Users.findOne({identificator: publisher}).select('_id'))._id)
            }
        }
        
        // Criar um ministério com o nome e os editores e as identificações dos editores
        const newMinistry = await Ministries.create({ 
            name, 
            publishers: publishersIds, 
            publishersIdentificators: publishers,
            members: publishersIds,
            membersIdentificators: publishers,
        })

        // Verificar se realmente foi criado
        if (!newMinistry) {
            return res.status(400).json({ error: 'failed on creating a new ministry' })
        }

        // Inserir o id do ministério nos editores
        for(publisherId of publishersIds){
            const userOnMinistry = await Users.findById(publisherId)
            userOnMinistry.ministry.push({id: newMinistry._id, leader: true})
            await userOnMinistry.save()
        }

        // Enviar informações de confirmação
        return res.status(200).json({ message: 'success on creating a new ministry' })

    },

    async editMinistry(req, res){
        // Pegar id de quem fez a requisição
        const {userId} = req

        // Buscar usuário no banco de dados
        const user = await Users.findById(userId)

        // Pegar id do ministério que será editado
        const {ministryId} = req.body

        // Buscar o ministério no banco de dados
        const ministryOfEdition = await Ministries.findById(ministryId)

        // Verificar se este ministério existe mesmo
        if(!ministryOfEdition){
            return res.status(404).json({error: 'ministry not found'})
        }
        
        // Verificar se o usuário está na lista de publishers
        var included = false
        for(publisher of ministryOfEdition.publishers){
            console.log(publisher, user._id)
            if(publisher == user._id.toString()){
                included = true
                break
            }
        }

        // Se o usuário não estiver incluído ou não for adm
        if(!included){
            if(user.type > 1){
                return res.status(403).json({error: 'user are not a publisher or adm'})
            }
        }

        // Edição dos dados
        // name, cover, about[título, texto], call, published

        // Pegar os dados
        const {name, about, call, published} = req.body

        // Modificar os dados símples
        if(name){
            ministryOfEdition.name = name
        }
        if(call){
            if(call.length === 2){
                ministryOfEdition.call = call
            }
        }
        if(published != undefined){
            ministryOfEdition.published = published
        }
        if(about){
            ministryOfEdition.about = about
        }

        // pegar file
        const {file} = req
        if(file){
            s3.deleteObject({
                Bucket: 'ieq-app-image-storage/covers-images',
                Key: ministryOfEdition.cover,
            }, () => null
            )
            ministryOfEdition.cover = file.key
        }

        // Salvar alterações
        const savedMinistry = await ministryOfEdition.save()

        // Verificar se salvou mesmo
        if(!savedMinistry){
            s3.deleteObject({
                Bucket: 'ieq-app-image-storage/covers-images',
                Key: ministryOfEdition.cover,
            }, () => null
            )
            ministryOfEdition.cover = file.key
            return res.status(400).json({error: 'something went wrong'})
        }

        // Mensagem de confirmação
        return res.status(200).json({message: 'successful on ministry edition'})
    },


    async findMinistriesIdentifications(req, res){
        // Pegar id, name, image de todos os ministérios publicados
        const ministries = await Ministries.find({published: true}).select('_id name cover')

        // Ver se pegou mesmo os ministérios
        if(!ministries){
            return res.status(400).json({error: 'error on getting ministries'})
        }

        return res.status(200).json(ministries)
    },


    async getInfosById(req, res){
        // Pegar o id que foi solicitado
        const {id} = req.params

        // Buscar o ministério no banco de dados
        const ministry = await Ministries.findById(id).select('-members -publishers')

        // Ver se encontrou algo
        if(!ministry){
            return res.status(404).json({error: 'ministry not found'})
        }

        // Enviar todas as informações e os identificators das pessoas
        return res.json(ministry)
    },


    async deleteMinistryById(req, res){
        // Pegar o id de quem está fazendo a requisição
        const {userId} = req

        // Buscar este usuário no banco de dados e verificar se é administrador
        const admUser = await Users.findById(userId)
        if(!admUser || admUser.type > 1){
            return res.status(403).json({error: 'user are not an administrator'})
        }

        // Pegar o id do ministério que ser deseja deletar
        const {id} = req.params

        // Deletar esse ministério
        const deletedMinistry = await Ministries.findByIdAndDelete(id)

        // Ver se havia mesmo um ministério
        if(!deletedMinistry){
            return res.status(404).json({error: 'ministry not found'})
        }

        return res.status(200).json({message: 'the ministry was deleted'})
    },


    async editMembersContent(req, res){
        // id do usuário que fez a requisição
        const {userId} = req

        // Buscar no banco e verificar se deu certo
        const user = await Users.findById(userId)
        if(!user){
            return res.status(400).json({error: 'user not found'})
        }

        // Pegar o id do ministério
        const {ministryId} = req.body

        // Buscar ministério e verificar se deu tudo certo
        const ministry = await Ministries.findById(ministryId)
        if(!ministry){
            return res.status(404).json({error: 'ministry not found'})
        }

        // Instanciar se o usuário é um publisher
        var isPublisher = false
        for(publisher of ministry.publishers){
            if(userId == publisher.toString()){
                isPublisher = true
                break
            }
        }

        // Verificar se o usuário é um publisher ou adm
        if(!isPublisher){
            if(user.type > 1){
                return res.status(403).json({error: 'user do not have permitions to edit this ministry'})
            }
        }

        // pegar a lista de members para a edição
        const {members} = req.body

        // Ver se existe members mesmo
        if(!members){
            return res.status(400).json({error: 'members not provided'})
        }

        // Separar apenas líderes e membros no geral
        var leaderMembers = []
        var generalMembers = []
        for(member of members){
            if(member[1]){
                leaderMembers.push(member[0])
                generalMembers.push(member[0])
            }else{
                generalMembers.push(member[0])
            }
        }

        // converter líderes e não líderes em id
        var leaderMembersId = []
        var generalMembersId = []
        for(leaderMember of leaderMembers){
            leaderMembersId.push((await Users.findOne({identificator: leaderMember}).select('_id'))._id)
        }
        for(generalLeaderMember of generalMembers){
            generalMembersId.push((await Users.findOne({identificator: generalLeaderMember}).select('_id'))._id)
        }

        // leaderMembers --> Identificators
        // generalMembers --> Identificators
        // leaderMembersId --> Ids
        // generalMembersId --> Ids

        // Antes de salvar os dados nos ministérios, percorrer todos usuários que são membros do ministério e excluir o ministério deles
        // Percorrendo os ids dos membros...
        for(member of ministry.members){
            var currentMember = await Users.findById(member)
            // Percorrendo os ministérios dentro do membro
            for(var i = 0; i<currentMember.ministry.length; i++){
                if(currentMember.ministry[i][0] == ministry._id.toString()){
                    // excluir o ministério do membro
                    currentMember.ministry.splice(i, 1)
                    break
                }
            }
            await currentMember.save()
        }

        // Inserir os novos dados no ministério
        ministry.members = generalMembersId
        ministry.publishers = leaderMembersId
        ministry.membersIdentificators = generalMembers
        ministry.publishersIdentificators = leaderMembers

        // Salvar o ministério
        const editedMinistry = await ministry.save()

        // Verificar se salvou mesmo
        if(!editedMinistry){
            return res.status(400).json({error: 'failed on ministry editing'})
        }

        // Colocar ministérios nos usuários
        for(member of editedMinistry.members){
            var currentMember = await Users.findById(member)
            var isLeader = false
            for(pub of editedMinistry.publishers){
                if(pub.toString() === currentMember._id.toString()){
                    isLeader = true
                    break
                }
            }
            currentMember.ministry.push([editedMinistry._id, isLeader])
            await currentMember.save()
        }

        // Confirmação
        return res.status(200).json({message: 'success on ministry editing'})

        // O que há de errado?
        // Na tabela de ministérios a atualização ocorre como esperado
        // Na tabela de usuários o comportamento é estranho


    },
}