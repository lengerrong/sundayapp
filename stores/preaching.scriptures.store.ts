import { makeAutoObservable } from 'mobx'

const preachingSentenceStore = makeAutoObservable({
    sentence: {},
    setSentence(sentence) {
        this.sentence = sentence
    }
})

export default preachingSentenceStore;
