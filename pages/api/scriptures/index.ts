const cnvs = require('./cnvs/bible.json')
const path = require('path')
const fs = require('fs')

function getScripturesByVolume(book) {
    let scriptures = []
    for (let i = 1; i <= book.bookChapterMaxNumber; i++) {
        const chapterPath = ('../../cnvs/' + book.canon + '/' + book.bookUsfm + '/' + i).toLowerCase()
        let chapterContent = fs.readFileSync(path.join(__dirname, chapterPath), { encoding: 'utf8', flag: 'r' })
        chapterContent = chapterContent.split('\n')
        scriptures.push(chapterContent)
    }
    return scriptures
}

function getScriptures({ search }) {
    // example of search
    // 约翰福音15:5
    // 约翰福音15:5,7,9
    // 约翰福音15:5-7,10,22-23
    // 约翰福音15:5-7;19:4-9
    const m = search.match(/(\W+)[\s+]?[\s+]?(.*)[\s+]?/)
    if (!m) {
        return null
    }
    const volume = m[1]
    let book = null
    for (let i = 0; i < 2; i++) {
        book = cnvs.data[i].booksList.find(e => e.bookName === volume || e.bookAbbrName === volume)
        if (book) {
            break
        }
    }
    if (!book) {
        return null
    }
    if (!m[2]) {
        return getScripturesByVolume(book)
    }
    const chapters = m[2].split(';')
    if (chapters.length <= 0) {
        return getScripturesByVolume(book)
    }
    const chapterSectionsArray = chapters.map(chapter => {
        const cm = chapter.match(/[\s+]?(\d+)([\s+]?:[\s+]?(.*)[\s+]?)?/)
        if (cm) {
            const chapterIndex = Number(cm[1])
            let sections = []
            if (cm[3]) {
                sections = cm[3].split(',')
            }
            return { chapterIndex, sections }
        }
        return null
    }).filter(e => e != null)
    let scriptures = []
    for (const chapterIndexSections of chapterSectionsArray) {
        const { chapterIndex, sections } = chapterIndexSections
        if (chapterIndex > book.bookChapterMaxNumber) {
            continue
        }
        const chapterPath = ('../../cnvs/' + book.canon + '/' + book.bookUsfm + '/' + chapterIndex).toLowerCase()
        let chapterContent = fs.readFileSync(path.join(__dirname, chapterPath), { encoding: 'utf8', flag: 'r' })
        chapterContent = chapterContent.split('\n')
        let sectionScriptures = []
        if (sections.length <= 0) {
            sectionScriptures = chapterContent
        } else {
            for (const section of sections) {
                if (section.indexOf('-') != -1) {
                    const seIndexs = section.split('-').map(index => chapterContent.findIndex(e => e.startsWith(index)))
                    if (seIndexs[1] > seIndexs[0] && seIndexs[0] >= 0) {
                        sectionScriptures = sectionScriptures.concat(chapterContent.slice(seIndexs[0], seIndexs[1] + 1))
                    }
                } else {
                    const seIndex = chapterContent.findIndex(e => e.startsWith(section))
                    if (seIndex != -1) {
                        sectionScriptures.push(chapterContent[seIndex])
                    }
                }
            }
        }
        scriptures.push(sectionScriptures)
    }
    return scriptures
}

export default function handler(req, res) {
    const { query } = req
    let result = {}
    if (Array.isArray(query.search)) {
        for (const search of query.search) {
            result[search] = getScriptures({search})
        }
    } else {
        result[query.search] = getScriptures(query)
    }
    res.status(200).json(result)
}
