// Node Modules
const path = require('path')
const multer = require('multer')
const crypto = require('crypto')
var aws = require('aws-sdk');
const multerS3 = require('multer-s3')

const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'tmp', 'uploads'))
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err)
                file.key = `${hash.toString('hex')}.${file.originalname}`
                cb(null, file.key)
            })
        },
    }),


    s3: multerS3({
        
        /* Dentro do new aws.S3 não precisa colocar as variáveis de ambiente pois ele já encherga elas graças ao dot-env */
        s3: new aws.S3(/* Aqui dentro já fica automaticamente as variáveis de ambiente */),
        
        //Nome do bucket utulizado lá no AWS S3
        bucket: (req, file, cb) => {
            if(file.fieldname === 'image'){
                cb(null, 'ieq-app-image-storage/users-profile-image')
            } else if (file.fieldname === 'coverImage'){
                cb(null, 'ieq-app-image-storage/covers-images')
            }
        },
        //Se contentType não for definido, o navegador vai baixar o app ao invés de exibir
        //AUTO_CONTENT_TYPE vai fazer com que o navegador intenda que o arquivo pode ser aberto
        contentType: multerS3.AUTO_CONTENT_TYPE,
        //acl --> Permissão --> Todos aqui poderão abrir os arquivos que foram feitos upload.
        acl: 'public-read',

        //key é semelhante ao fileName definido no modo de upload local
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if(err) cb(err)
                //toString('hex') --> Transformar em hexadecimal
                //Aqui eu não preciso colocar file.key porque o S3 já define automaticamente.
                const fileName = `${hash.toString('hex')}-${file.originalname}`
                //Passamos null para o cb porque não deu erro.
                cb(null, fileName)
            })
        }
    })
}

module.exports = {
    dest: path.resolve(__dirname, '..', '..', 'tmp', 'uploads'),

    storage: storageTypes['s3'],

    limits: {
        // 0.5 MB
        fileSize: 0.5 * 1024 * 1024
    },

    fileFilter: (req, file, cb) => {
        // Verificar formato das imagens
        const allowedMimeTypes = [
            'image/jpeg',
            'image/pjpeg',
            'image/png'
        ]
        if(!allowedMimeTypes.includes(file.mimetype)){
            cb(null, false)
        }

        cb(null, true)
    }
}