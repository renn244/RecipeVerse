import multer from 'multer'
import crypto from 'crypto'

const diskStorage = (destination: string) => {
    if(!destination) throw new Error('Destination is required, diskStorage utility')

    const multerStorage = multer.diskStorage({
        destination: function(req, file, cb) {
            return cb(null, destination)
        },
        filename: function(req, file, cb) {
            const photoid = crypto.randomBytes(10).toString('hex')
            return cb(null, `${photoid}_${file.originalname}`)
        }
    })

    return multerStorage
}

export default diskStorage