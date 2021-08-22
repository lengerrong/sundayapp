export interface Scripture {
    chapterIndex: number,
    verses: string[]
}

export interface ScriptureSection {
    bookName: string,
    scriptures: Scripture[]
}