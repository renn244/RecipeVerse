import express, { NextFunction, Request, Response } from 'express'
import session from 'express-session'
import dotenv from 'dotenv'
import cors from 'cors'
import { prisma } from './db/db'
import { PrismaSessionStore } from '@quixo3/prisma-session-store'
import path from 'path'

import AuthRoutes from './routes/AuthRoute';
import RecipeRoute from './routes/RecipeRoute'
import DashboardRoute  from './routes/DashboardRoute'
import PostRoute from './routes/PostRoute'
import UserRoute from './routes/UserRoute'

import './passport/passportLocal'
import passport from 'passport';

import { app, server } from './socket/socket'

dotenv.config()

const port = process.env.PORT ||  4000

// application middlewares
app.use(session({
    secret: 'secret keyboard cat',
    resave: false,
    saveUninitialized: false, // // Only save sessions that have been modified
    cookie: { secure: false }, /// Set to true when using HTTPS in production
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000, // Clean expired sessions every 2 minutes
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined
    })
}))

app.use(passport.initialize())
app.use(passport.session())


app.use(express.json())
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.use('/recipePhoto', express.static(path.join(__dirname, '../uploads/RecipePhotos')))
app.use('/Avatar', express.static(path.join(__dirname, '../uploads/Avatars')))

//ROUTES
app.use('/api/auth', AuthRoutes)
app.use('/api/recipe', RecipeRoute)
app.use('/api/dashboard', DashboardRoute)
app.use('/api/post', PostRoute)
app.use('/api/user', UserRoute)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ error: error})
})

server.listen(port, () => {
    console.log('[server]  listening to port ' + port)
})