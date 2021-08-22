import { makeAutoObservable } from 'mobx'
import { ScriptureSection } from '../common/scritpure.section'

const readingSentenceStore = makeAutoObservable({
    scriptureSections: [] as ScriptureSection[],
    setScriptureSections(scriptureSections: ScriptureSection[]) {
        this.scriptureSections = scriptureSections
    }
})

export default readingSentenceStore;
