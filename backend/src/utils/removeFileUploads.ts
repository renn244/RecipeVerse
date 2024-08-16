import fs from 'fs'
import path from 'path'

export const removeFile = (destination: string, fileName: string) => {
    try {
        if(!destination) throw new Error('path is required')
        if(!fileName) throw new Error('fileName is required')
        
        const completePath = path.join(destination, fileName)

        fs.unlink(completePath, (err) => {
            if(err) {
                throw new Error(err.message)
            }
            return fileName
        })

        return true
    } catch (error) {
        console.log('error in the removeFile' + error)
        return false
    }

}