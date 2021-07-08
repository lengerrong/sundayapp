import { Button, ButtonGroup } from '@material-ui/core';
import Link from 'next/link'
import { observer } from 'mobx-react-lite'
import stores from '../stores'

const CardLink = ({ href, text, children }) => {
  return <Link href={href} >
    <div>
      <h2>{text}</h2>
      {children}
    </div>
  </Link>
}

const Home = observer(({ styles }) => {
  const { songsStore } = stores;
  return (
    <>
    <div className={styles.grid}>
      <div className={styles.card}>
        <CardLink href='/songs' text='诗歌 &rarr;'>
          <p>Choose songs from Psalm</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/goldensentence' text='本周金句 &rarr;' >
          <p>Choose a scentence </p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/minister' text={new Date().getMonth() + 1 + '月份事奉人员 →'} >
          <p>Ministers of the month</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/report' text='报告事项 &rarr;' >
          <p>Report matters of the week</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/scriptures' text='阅读经文、证道经文 &rarr;' >
          <p>Report matters of the week</p>
        </CardLink>
      </div>
      <div className={styles.card}>
        <CardLink href='/preaching' text='证道 &rarr;' >
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

export default Home;