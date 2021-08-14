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

function getScripturesBig({ search }) {
    const searchs = search.split('|')
    return searchs.map(s => {
        return getScriptures({ search: s })
    })
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
        let r = {}
        r[search] = getScripturesByVolume(book)
        r.bookName = book.bookName
        r.chapter = '全卷'
        r.search = search
        return r
    }
    const chapters = m[2].split(';')
    if (chapters.length <= 0) {
        let r = {}
        r[search] = getScripturesByVolume(book)
        r.bookName = book.bookName
        r.search = search
        r.chapter = '全卷'
        return r
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
                        const prevIndex = seIndexs[0] - 1
                        if (prevIndex >= 0) {
                            if (!chapterContent[prevIndex].match(/^\d+/)) {
                                sectionScriptures.push(chapterContent[prevIndex])
                            }
                        }
                        sectionScriptures = sectionScriptures.concat(chapterContent.slice(seIndexs[0], seIndexs[1] + 1))
                    }
                } else {
                    const seIndex = chapterContent.findIndex(e => e.startsWith(section) && section && section.length > 0)
                    if (seIndex != -1) {
                        const prevIndex = seIndex - 1
                        if (prevIndex >= 0) {
                            if (!chapterContent[prevIndex].match(/^\d+/)) {
                                sectionScriptures.push(chapterContent[prevIndex])
                            }
                        }
                        sectionScriptures.push(chapterContent[seIndex])
                    }
                }
            }
        }
        scriptures.push(sectionScriptures)
    }
    let r = {}
    r[search] = scriptures
    r.bookName = book.bookName
    r.chapter = m[2]
    r.search = search
    return r
}

export default function handler(req, res) {
    const { query } = req
    if (!query.search) {
        return res.status(200).json([])
    }
    let result = []
    if (Array.isArray(query.search)) {
        for (const search of query.search) {
            result = result.concat(getScripturesBig({ search }))
        }
    } else {
        result = result.concat(getScripturesBig(query))
    }
    res.status(200).json(result)
}
