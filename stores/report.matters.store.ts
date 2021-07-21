import { makeAutoObservable } from 'mobx'

const reportMattersStore = makeAutoObservable({
    content: '',
    setContent(content) {
        this.content = content
    }
})

export default reportMattersStore;
