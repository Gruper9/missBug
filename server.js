import express from 'express'
import { bugService } from './services/bug.service.js'
import cookieParser from 'cookie-parser'
import PDFDocument from 'pdfkit'
import { loggerService } from './services/logger.service.js'
import fs from 'fs'


const app = express()
app.use(express.json())
app.use(express.static('public'))
app.use(cookieParser())

// app.get('/', (req, res) => res.send('Hello there'))



app.get('/api/bug', (req, res) => {
    const filterBy = {
        title: req.query.title || '',
        pageIdx: req.query.pageIdx,
        minSeverity:+req.query.minSeverity,
        label:req.query.label,
        sortBy:req.query.sortBy,
        sortDir:req.query.sortDir
    }
console.log('req.query',req.query);
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
            });
            
            doc.end()

            return res.send(bugs)
        })
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(400).send('Cannot get bugs')
        })

})

// app.get('/api/bug/save', (req, res) => {
//     const bugToSave = {
//         _id: req.query._id,
//         title: req.query.title,
//         description: req.query.description,
//         severity: +req.query.severity,
//         createdAt: Date.now()
//     }

//     bugService.save(bugToSave).then(bug => {
//         return res.send(bug)
//     })
//         .catch(err => (err) => {
//             res.status(400).send('Cannot save bug')
//         })
// })


app.post('/api/bug', (req, res) => {

    const bugToSave = {
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave)
        .then(bug => res.send(bug))
        .catch((err) => {
            loggerService.error('Cannot save bug', err)
            res.status(400).send('Cannot save bug')
        })
})

app.put('/api/bug', (req, res) => {
    const bugToSave = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: Date.now()
    }

    bugService.save(bugToSave)
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
    const bugId = req.params.id
    bugService.remove(bugId)
        .then(() => res.send(bugId))
        .catch((err) => {
            loggerService.error('Cannot remove bug', err)
            res.status(400).send('Cannot remove bug')
        })
})





app.listen(3030, () => console.log('Server ready at port 3030'))