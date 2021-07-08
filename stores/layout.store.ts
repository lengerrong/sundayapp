import { makeAutoObservable } from 'mobx'
import { DefaultLayout } from '../layouts'

const layoutStore = makeAutoObservable({
    layout: DefaultLayout,
    setLayout(layout) {
        this.layout = layout
    }
})

export default layoutStore;
