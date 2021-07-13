import { makeAutoObservable } from 'mobx'

const goldenSentenceStore = makeAutoObservable({
    sentence: {},
    setLayout(sentence) {
        this.sentence = sentence
    }
})

export default goldenSentenceStore;
