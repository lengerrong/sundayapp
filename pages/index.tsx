import { Button, ButtonGroup, Chip, Snackbar, Typography } from '@material-ui/core'
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

interface HomeProps {
  styles: any
}

const Home = observer(({ styles }: HomeProps) => {
  const { songsStore, goldenSentenceStore,
    preachingSentenceStore, readingSentenceStore,
    preachingArticleStore, reportMattersStore,
    staffArrangementStore
  } = stores
  const local = useLocalObservable(() => ({
    openSideBar: false,
    errorMessage: null as unknown as string,
    isGenPPT: false,
    setOpenSiderBar(openSideBar: boolean) {
      this.openSideBar = openSideBar
    },
    setErrorMessage(errorMessage: string) {
      this.errorMessage = errorMessage
    },
    setIsGenPPT(isGenPPT: boolean) {
      this.isGenPPT = isGenPPT
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
      let sundays: Date[] = []
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
    return now.getFullYear() + '???' + (now.getMonth() + 1) + '???' + now.getDate() + '???'
  }

  const generatePPT = () => {
    if (shouldShowSideBar()) {
      local.setOpenSiderBar(true)
      return
    }
    local.setIsGenPPT(true)
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
        link.download = getThisSundayYYMMDD() + '????????????.pptx'
        document.body.appendChild(link)
        link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }))
        link.remove()
        window.URL.revokeObjectURL(link.href)
        local.setIsGenPPT(false)
      })
      .catch((e:Error) => {
        local.setIsGenPPT(false)
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
          <CardLink href='/songs' text='?????? ???'>
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
          <CardLink href='/goldensentence' text='???????????? ???' >
            <span className={styles.golden}>{getScriptureSectionTitle(goldenSentenceStore.sentence)}</span>
          </CardLink>
        </div>
        <div className={styles.card}>
          <CardLink href='/minister' text={staffArrangeTitle(staffArrangementStore.arrangements) + '?????????????????? ???'} >
          </CardLink>
        </div>
        <div className={styles.card}>
          <CardLink href='/report' text='???????????? ???' >
            <pre>{reportMattersStore.content}</pre>
          </CardLink>
        </div>
        <div className={styles.card}>
          <CardLink href='/scriptures' text='??????????????????????????? ???' >
            {readingSentenceStore.scriptureSections && readingSentenceStore.scriptureSections.length > 0 &&
              <p>???????????????<span className={styles.reading}>{getScriptureSectionsTitle(readingSentenceStore.scriptureSections)}</span></p>}
            {preachingSentenceStore.scriptureSections && preachingSentenceStore.scriptureSections.length > 0 &&
              <p>???????????????<span className={styles.preaching}>{getScriptureSectionsTitle(preachingSentenceStore.scriptureSections)}</span></p>}
          </CardLink>
        </div>
        <div className={styles.card}>
          <CardLink href='/preaching' text='???????????? ???' >
            <pre>{preachingArticleStore.content}</pre>
          </CardLink>
        </div>
      </div>
      <div className={styles.buttongroup} >
        <ButtonGroup variant='contained' color='primary' size='large'>
          <Button disabled={local.isGenPPT} onClick={generatePPT}>??????PPT</Button>
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
              ????????????????????????
            </Typography>
          }
          {(!goldenSentenceStore.sentence || !goldenSentenceStore.sentence.scriptures || goldenSentenceStore.sentence.scriptures.length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
          {(!staffArrangementStore.arrangements || staffArrangementStore.arrangements.length <= 0 ||
            staffArrangementStore.arrangements.map(arrange => {let a = {...arrange}; delete a.riqi; return a})
              .filter(arrange => JSON.stringify(arrange) !== '{}').length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
          {(!reportMattersStore.content || reportMattersStore.content.length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
          {(!readingSentenceStore.scriptureSections || readingSentenceStore.scriptureSections.length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
          {(!preachingSentenceStore.scriptureSections || preachingSentenceStore.scriptureSections.length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
          {(!preachingArticleStore.content || preachingArticleStore.content.length <= 0) &&
            <Typography variant="h5" component="h5">
              ??????????????????????????????
            </Typography>
          }
        </Alert>
      </Snackbar>
    </>
  )
})

export default Home