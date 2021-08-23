export interface Verse {
    subtitle: string,
    index: number,
    text: string
}

export interface Song {
    type: number,
    index: number,
    title: string,
    verses: Verse[],
    position?: number,
    arrayIndex?: number
}