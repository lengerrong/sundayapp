import { makeAutoObservable } from 'mobx'

const staffArrangementStore = makeAutoObservable({
    arrangements: [{},{},{},{}],
    setArrangements(arrangements) {
        this.arrangements = arrangements
    }
})

export default staffArrangementStore;
