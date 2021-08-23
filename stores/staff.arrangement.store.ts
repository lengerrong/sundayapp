import { makeAutoObservable } from 'mobx'
import { Arrangement } from '../common/arrangement'

const staffArrangementStore = makeAutoObservable({
    arrangements: [{} as Arrangement,{} as Arrangement,{} as Arrangement,{} as Arrangement],
    setArrangements(arrangements) {
        this.arrangements = arrangements
    }
})

export default staffArrangementStore;
