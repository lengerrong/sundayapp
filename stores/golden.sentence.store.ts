import { makeAutoObservable } from 'mobx'
import { ScriptureSection } from '../common/scritpure.section'

const goldenSentenceStore = makeAutoObservable({
    sentence: null as unknown as ScriptureSection,
    setSentence(sentence: ScriptureSection) {
        this.sentence = sentence
    }
})

export default goldenSentenceStore;
