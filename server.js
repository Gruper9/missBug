import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'
import fs from 'fs'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { log } from 'console'


const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

// app.get('/', (req, res) => res.send('Hello there'))



app.get('/api/bug', (req, res) => {
    const filterBy = {
        title: req.query.title || '',
        pageIdx: req.query.pageIdx,
        minSeverity: +req.query.minSeverity,
        label: req.query.label,
        sortBy: req.query.sortBy,
        sortDir: req.query.sortDir
    }
    bugService.query(filterBy)
        .then(bugs => {

            const doc = new PDFDocument()
            const writeStream = fs.createWriteStream('output.pdf')

            writeStream.on('finish', () => {
                console.log('PDF has been written successfully.')
            });

            doc.pipe(writeStream)

            bugs.forEach(bug => {
                doc.text(`
                    #title:  ${bug.title}
                    #description: ${bug.description} 
                    #severity: ${bug.severity}`)
            })

            doc.end()

            return res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })

})



app.post('/api/bug', (req, res) => {

    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot add bug')

    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave,loggedinUser)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot update bug')

    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave,loggedinUser)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})




app.get('/api/bug/:bugId', (req, res) => {
    const bugId = req.params.bugId

    let visitedBugs = req.cookies.visitedBugs || []
    if (visitedBugs.length >= 3) return res.status(401).send('Wait for a bit')
    if (visitedBugs && !visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot get bug')
        })
})

// app.get('/api/bug/:bugId/remove', (req, res) => {
//     const bugId = req.params.bugId
//     bugService.remove(bugId)
//         .then(() => res.send(bugId))
//         .catch((err) => {
//             res.status(400).send('Cannot remove bug')
//         })

// })

app.delete('/api/bug/:id', (req, res) => {
    const loggedinUser = userService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Cannot remove bug')

    const bugId = req.params.id
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send(bugId))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})


app.post('/api/auth/login', (req, res) => {
    const credentials = req.body
    userService.checkLogin(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(401).send('Invalid Credentials')
            }
        }).catch((err) => {
            console.log('error:', err)
        })
})
app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body
    userService.save(credentials)
        .then(user => {
            if (user) {
                const loginToken = userService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })

})
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})




app.get('/api/user/', (req, res) => {
    userService.query()
        .then(users => {
            return res.send(users)
        })
        .catch(err => {
            loggerService.error('Cannot get users', err)
            res.status(400).send('Cannot get users')
        })

})


app.delete('/api/user/:id', (req, res) => {
    const userId = req.params.id
    userService.remove(userId)
        .then(() => res.send(userId))
        .catch((err) => {
            loggerService.error('Cannot remove user', err)
            res.status(400).send('Cannot remove user')
        })
})


app.get('/**', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})


app.listen(3030, () => console.log('Server ready at port 3030'))