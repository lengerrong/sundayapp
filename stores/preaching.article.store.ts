import { makeAutoObservable } from 'mobx'

const preachingArticleStore = makeAutoObservable({
    content: '',
    setContent(content) {
        this.content = content
    }
})

export default preachingArticleStore;
