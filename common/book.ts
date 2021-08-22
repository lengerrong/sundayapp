export interface Book {
    versionCode: string,
    bookId: number,
    bookUsfm: string,
    canon: string,
    bookName: string,
    bookAbbrName: string,
    bookChapterMaxNumber: number,
    versesCount: number,
    bookChapterIndex?: number
}
