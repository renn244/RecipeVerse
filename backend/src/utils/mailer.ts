import nodemailer from 'nodemailer'

export const sendEmail = async (to: string, subject: string, html: string): Promise<boolean> => {
    const user = process.env.GMAIL_USER
    const pass = process.env.GMAIL_PASSWORD

    if(!user || !pass) {
        if(process.env.NODE_ENV === 'production') {
            console.log('[mailer] GMAIL_USER / GMAIL_PASSWORD are not set, cannot send email')
            return false
        }
        console.log(`[mailer] (dev, no Gmail credentials) email to ${to}\n  subject: ${subject}\n  body: ${html}`)
        return true
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user, pass }
        })
        const info = await transporter.sendMail({ from: user, to, subject, html })
        console.log('[mailer] email sent', info.response)
        return true
    } catch (error) {
        console.log('[mailer] failed to send email ' + error)
        return false
    }
}
