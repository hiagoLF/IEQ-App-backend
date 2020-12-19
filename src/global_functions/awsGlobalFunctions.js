// Node Modules
const aws = require('aws-sdk')

// s3 instance
const s3 = new aws.S3()

module.exports = {
    deleteFile(fileKey, Bucket){
        s3.deleteObject({
            Bucket: Bucket,
            Key: fileKey,
        }, () => null
        )
    },

    deleteArrayFiles(filesKeys, Bucket){
        for(var file of filesKeys){
            console.log(file)
            this.deleteFile(file.key, Bucket)
        }
    },


    getImageKeys(files){
        var keys = []
        for(var file of files){
            keys.push(file.key)
        }
        return keys
    }
}