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
}