import { observer } from 'mobx-react-lite'
import { TextareaAutosize } from '@material-ui/core'
import reportMattersStore from '../../stores/report.matters.store'
interface ReportProps {
  styles: any
}
const Report = observer(({ styles }: ReportProps) => {
  const { content } = reportMattersStore;
  const onChange = (e) => {
      reportMattersStore.setContent(e.target.value)
  }
  return (
    <div className={styles.grid}>
      <h1>报告事项</h1>
      <TextareaAutosize
        placeholder="1.&#10;2.&#10;3.&#10;"
        className={styles.textarea}
        value={content}
        onChange={onChange}
      />
    </div>
  )
})

export default Report