import { makeAutoObservable } from 'mobx'

const goldenSentenceStore = makeAutoObservable({
    sentence: {},
    setSentence(sentence) {
        this.sentence = sentence
    }
})

export default goldenSentenceStore;
