import { Button, ButtonGroup, Chip, TextareaAutosize } from '@material-ui/core'
import Link from 'next/link'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import { observer } from 'mobx-react-lite'
import stores from '../stores'
import { getSongLable, staffArrangeTitle } from '../utils'

const CardLink = ({ href, text, children }) => {
  return <Link href={href} >
    <div>
      <h2>{text}</h2>
      {children}
    </div>
  </Link>
}

const to2D = (n: Number) => {
  if (n < 10) {
    return '0' + n
  }
  return n.toString()
}

const getYYMMDD = (date: Date) => {
  return date.getFullYear() + "-" + to2D(date.getMonth() + 1) + "-" + to2D(date.getDate())
}

const Home = observer(({ styles }) => {
  const { songsStore, goldenSentenceStore, 
    preachingSentenceStore, readingSentenceStore,
    preachingArticleStore, reportMattersStore,
    staffArrangementStore
   } = stores
  
  if (JSON.stringify(staffArrangementStore.arrangements[0]) === "{}" && global.window) {
    let sundays = []
    const now = new Date()
    sundays.push(new Date(now.setDate(now.getDate() - now.getDay())))
    sundays.push(new Date(now.setDate(now.getDate() + 7)))
    sundays.push(new Date(now.setDate(now.getDate() + 7)))
    sundays.push(new Date(now.setDate(now.getDate() + 7)))
    fetch('/api/minster?dates=' + sundays.map(sunday => getYYMMDD(sunday)).join(','))
      .then(res => res.json())
      .then(staffArranges => {
        staffArrangementStore.setArrangements(staffArranges)
      })
      .catch(e => {
        console.log(e)
      })
  }

  const saveStaffArranges = () => {
    fetch('/api/minster', {
      body: JSON.stringify(staffArrangementStore.arrangements), // must match 'Content-Type' header
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'same-origin',
      redirect: 'follow',
      referrer: 'no-referrer'
    }).catch(e => {
      console.log(e)
    })
  }

  const getThisSundayYYMMDD = () => {
    const now = new Date()
    now.setDate(now.getDate() - now.getDay() + 7)
    return now.getFullYear() + '年' + (now.getMonth() + 1) + '月' + now.getDate() + '日'
  }

  const generatePPT = () => {
    saveStaffArranges()
    let pptParameters = {
      songs: songsStore.songs,
      goldensentence: goldenSentenceStore.sentence,
      staffArranges: staffArrangementStore.arrangements,
      reports: reportMattersStore.content,
      readingScriptures: readingSentenceStore.sentence,
      preachingScriptures: preachingSentenceStore.sentence,
      preachingArticle: preachingArticleStore.content,
    }
    fetch('/api/ppt', {
      body: JSON.stringify(pptParameters), // must match 'Content-Type' header
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        'content-type': 'application/json'
      },
      method: 'POST',
      mode: 'same-origin',
      redirect: 'follow',
      referrer: 'no-referrer'
    })
    .then( res => res.blob() )
    .then( blob => {
      let link = document.createElement('a')
      link.href = window.URL.createObjectURL(blob)
      link.download = getThisSundayYYMMDD() + '敬拜唱诗.pptx'
      document.body.appendChild(link)
      link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}))
      link.remove()
      window.URL.revokeObjectURL(link.href)
    })
    .catch(e => {
      console.error(e)
    })
  }
  
  return (
    <>
    <div className={styles.grid}>
      <div className={styles.card}>
        <CardLink href='/songs' text='诗歌 →'>
          {songsStore.songs.map((song, index) => (
             <Chip
                  key={getSongLable(song)+index}
                  className={styles.chip}
                  color='second'
                  icon={<LibraryMusicIcon />}
                  label={getSongLable(song)}
                />))
          }
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/goldensentence' text='本周金句 →' >
          <span className={styles.golden}>{goldenSentenceStore.sentence.search}</span>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/minister' text={staffArrangeTitle(staffArrangementStore.arrangements) + '月份事奉人员 →'} >
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/report' text='报告事项 →' >
          <pre>{reportMattersStore.content}</pre>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/scriptures' text='阅读经文、证道经文 →' >
          {readingSentenceStore.sentence.search && <p>阅读经文：<span className={styles.reading}>{readingSentenceStore.sentence.search}</span></p>}
          {preachingSentenceStore.sentence.search && <p>证道经文：<span className={styles.preaching}>{preachingSentenceStore.sentence.search}</span></p>}
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/preaching' text='证道主题 →' >
          <pre>{preachingArticleStore.content}</pre>
        </CardLink>
      </div>
    </div>
    <div className={styles.buttongroup} >
          <ButtonGroup variant='contained' color='primary' size='large'>
          <Button onClick={generatePPT}>生成PPT</Button>
          <Button >生成PDF</Button>
        </ButtonGroup>
    </div>
    </>
  )
})

export default Home