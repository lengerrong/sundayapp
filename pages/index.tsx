import { Button, ButtonGroup, Chip } from '@material-ui/core'
import Link from 'next/link'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import { observer } from 'mobx-react-lite'
import stores from '../stores'
import getSongLable from '../utils'

const CardLink = ({ href, text, children }) => {
  return <Link href={href} >
    <div>
      <h2>{text}</h2>
      {children}
    </div>
  </Link>
}

const Home = observer(({ styles }) => {
  const { songsStore, goldenSentenceStore } = stores
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
          <p>Choose a scentence </p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/minister' text={new Date().getMonth() + 1 + '月份事奉人员 →'} >
          <p>Ministers of the month</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/report' text='报告事项 →' >
          <p>Report matters of the week</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/scriptures' text='阅读经文、证道经文 →' >
          <p>Report matters of the week</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/preaching' text='证道 →' >
          <p>Report matters of the week</p>
        </CardLink>
      </div>
    </div>
    <div className={styles.buttongroup} >
          <ButtonGroup variant='contained' color='primary' size='large'>
          <Button >生成PPT</Button>
          <Button >生成PDF</Button>
        </ButtonGroup>
    </div>
    </>
  )
})

export default Home