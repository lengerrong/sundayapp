import { makeAutoObservable } from 'mobx'

const readingSentenceStore = makeAutoObservable({
    sentence: {},
    setSentence(sentence) {
        this.sentence = sentence
    }
})

export default readingSentenceStore;
