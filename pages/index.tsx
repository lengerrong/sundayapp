import { Button, ButtonGroup, Chip, TextareaAutosize, Snackbar, Typography } from '@material-ui/core'
import Link from 'next/link'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import { observer, useLocalObservable } from 'mobx-react-lite'
import stores from '../stores'
import { getSongLable, staffArrangeTitle, getScriptureSectionTitle, getScriptureSectionsTitle } from '../utils'
import Alert from '../components/alert'
import { useEffect } from 'react'

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
  const local = useLocalObservable(() => ({
    openSideBar: false,
    errorMessage: null as unknown as string,
    setOpenSiderBar(openSideBar: boolean) {
      this.openSideBar = openSideBar
    },
    setErrorMessage(errorMessage: string) {
      this.errorMessage = errorMessage
    }
  }))
  const shouldShowSideBar = () => {
    return !songsStore.songs || songsStore.songs.length <= 0 ||
      !goldenSentenceStore.sentence || !goldenSentenceStore.sentence.scriptures || goldenSentenceStore.sentence.scriptures.length <= 0 ||
      !staffArrangementStore.arrangements || staffArrangementStore.arrangements.length <= 0 ||
      !reportMattersStore.content || reportMattersStore.content.length <= 0 ||
      !readingSentenceStore.scriptureSections || readingSentenceStore.scriptureSections.length <= 0 ||
      !preachingSentenceStore.scriptureSections || preachingSentenceStore.scriptureSections.length <= 0 ||
      !preachingArticleStore.content || preachingArticleStore.content.length <= 0
  }
  useEffect(() => {
    if (JSON.stringify(staffArrangementStore.arrangements[0]) === "{}") {
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
          staffArrangementStore.setArrangements(sundays.map(sunday => ({riqi: getYYMMDD(sunday)})))
        })
    }
  }, [])
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
    if (shouldShowSideBar()) {
      local.setOpenSiderBar(true)
      return
    }
    saveStaffArranges()
    let pptParameters = {
      songs: songsStore.songs,
      goldensentence: goldenSentenceStore.sentence,
      staffArranges: staffArrangementStore.arrangements,
      reports: reportMattersStore.content,
      readingScriptures: readingSentenceStore.scriptureSections,
      preachingScriptures: preachingSentenceStore.scriptureSections,
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
      .then(async (res) => {
        if (res.ok) {
          return res.blob()
        }
        let body = await res.json()
        console.error(body)
        throw new Error(body.stack)
      })
      .then(blob => {
        let link = document.createElement('a')
        link.href = window.URL.createObjectURL(blob)
        link.download = getThisSundayYYMMDD() + '敬拜唱诗.pptx'
        document.body.appendChild(link)
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
        link.remove()
        window.URL.revokeObjectURL(link.href)
      })
      .catch((e:Error) => {
        console.error(e)
        if (e.message) {
          local.setErrorMessage(e.message)
          local.setOpenSiderBar(true)
        }
      })
  }
  const handleSideBarClose = () => {
    local.setOpenSiderBar(false)
  }
  return (
    <>
      <div className={styles.grid}>
        <div className={styles.card}>
          <CardLink href='/songs' text='诗歌 →'>
            {songsStore.songs.map((song, index) => (
              <Chip
                key={getSongLable(song) + index}
                className={styles.chip}
                color='secondary'
                icon={<LibraryMusicIcon />}
                label={getSongLable(song)}
              />))
            }
          </CardLink>
        </div>
        <div className={styles.card}>
          <CardLink href='/goldensentence' text='本周金句 →' >
            <span className={styles.golden}>{getScriptureSectionTitle(goldenSentenceStore.sentence)}</span>
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
            {readingSentenceStore.scriptureSections && readingSentenceStore.scriptureSections.length > 0 &&
              <p>阅读经文：<span className={styles.reading}>{getScriptureSectionsTitle(readingSentenceStore.scriptureSections)}</span></p>}
            {preachingSentenceStore.scriptureSections && preachingSentenceStore.scriptureSections.length > 0 &&
              <p>证道经文：<span className={styles.preaching}>{getScriptureSectionsTitle(preachingSentenceStore.scriptureSections)}</span></p>}
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
        </ButtonGroup>
      </div>
      <Snackbar open={local.openSideBar} autoHideDuration={6000} onClose={handleSideBarClose}>
        <Alert onClose={handleSideBarClose} severity="error">
          {local.errorMessage &&
            <Typography variant="h5" component="h5">
            {JSON.stringify(local.errorMessage)}
            </Typography>
          }
          {(!songsStore.songs || songsStore.songs.length <= 0) &&
            <Typography variant="h5" component="h5">
              请选择诗歌！！！
            </Typography>
          }
          {(!goldenSentenceStore.sentence || !goldenSentenceStore.sentence.scriptures || goldenSentenceStore.sentence.scriptures.length <= 0) &&
            <Typography variant="h5" component="h5">
              请选择本周金句！！！
            </Typography>
          }
          {(!staffArrangementStore.arrangements || staffArrangementStore.arrangements.length <= 0 ||
            staffArrangementStore.arrangements.map(arrange => {let a = {...arrange}; delete a.riqi; return a})
              .filter(arrange => JSON.stringify(arrange) !== '{}').length <= 0) &&
            <Typography variant="h5" component="h5">
              请安排事奉人员！！！
            </Typography>
          }
          {(!reportMattersStore.content || reportMattersStore.content.length <= 0) &&
            <Typography variant="h5" component="h5">
              请输入报告事项！！！
            </Typography>
          }
          {(!readingSentenceStore.scriptureSections || readingSentenceStore.scriptureSections.length <= 0) &&
            <Typography variant="h5" component="h5">
              请添加阅读经文！！！
            </Typography>
          }
          {(!preachingSentenceStore.scriptureSections || preachingSentenceStore.scriptureSections.length <= 0) &&
            <Typography variant="h5" component="h5">
              请添加证道经文！！！
            </Typography>
          }
          {(!preachingArticleStore.content || preachingArticleStore.content.length <= 0) &&
            <Typography variant="h5" component="h5">
              请输入证道主题！！！
            </Typography>
          }
        </Alert>
      </Snackbar>
    </>
  )
})

export default Home