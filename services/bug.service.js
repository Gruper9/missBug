import fs from 'fs'
import { utilService } from "./utils.service.js";


export const bugService = {
    query,
    getById,
    remove,
    save
}
const PAGE_SIZE = 3
const bugs = utilService.readJsonFile('data/bug.json')



function query(filterBy) {
    let bugsToReturn = bugs 
    if (filterBy.title) {
        const regExp = new RegExp(filterBy.title, 'i')
        bugsToReturn = bugsToReturn.filter(bug => regExp.test(bug.title))
    }
    if (filterBy.minSeverity) {
        bugsToReturn = bugsToReturn.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.label) {
        bugsToReturn = bugsToReturn.filter(bug => bug.labels.includes(filterBy.label))
    }
    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugsToReturn = bugsToReturn.slice(startIdx, startIdx + PAGE_SIZE)
    }
    if (filterBy.sortBy) {
        bugsToReturn = sortBugs(filterBy, bugsToReturn)
    }
    return Promise.resolve(bugsToReturn)
}

function sortBugs(filterBy, bugs) {
    let bugsToSort = bugs
    if (filterBy.sortBy === 'title') {
        bugsToSort.sort((bug1, bug2) => bug1.title.localeCompare(bug2.title) * filterBy.sortDir)
    }
    if (filterBy.sortBy === 'severity') {
        bugsToSort.sort((bug1, bug2) => (bug1.severity - bug2.severity)* filterBy.sortDir)
    }
    if (filterBy.sortBy === 'createdAt') {
        bugsToSort.sort((bug1, bug2) => (bug1.createdAt - bug2.createdAt)* filterBy.sortDir)
    }
    return bugsToSort
}




function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('bug dosent exist!')

    return Promise.resolve(bug)
}

function remove(bugId,loggedinUser) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('No Such Bug')
    const bug = bugs[bugIdx]
    if (!loggedinUser.isAdmin &&
        bug.owner._id !== loggedinUser._id) {
        return Promise.reject('Not your bug')
    }
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bug,loggedinUser) {
    if (bug._id) {
        const bugIdx = bugs.findIndex(currBug => currBug._id === bug._id)
        bugs[bugIdx] = bug
        if (!loggedinUser.isAdmin &&
            bugs[bugIdx].owner._id !== loggedinUser._id) {
            return Promise.reject('Not your bug')
        }
    } else {
        if(!loggedinUser)return Promise.reject('none logged in')
        bug._id = utilService.makeId()
        bug.owner = loggedinUser
        bugs.unshift(bug)
    }
    return _saveBugsToFile().then(() => bug)
}


function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 2)
        fs.writeFile('data/Bug.json', data, (err) => {
            if (err) {
                console.log(err)
                return reject(err)
            }
            return resolve()
        })
    })
}