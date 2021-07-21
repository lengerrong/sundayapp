import { observer } from 'mobx-react-lite'
import staffArrangementStore from '../../stores/staff.arrangement.store'
import StaffDataGrid from '../../components/staff.data.grid';

const Minister = observer(({ styles }) => {
  const { arrangements } = staffArrangementStore;
  const onChange = (newArrangements) => {
    staffArrangementStore.setArrangements(newArrangements)
  }
  let displayARs = Array.from(arrangements)
  displayARs = displayARs.map((ar, index) => ({...ar}))
  return (
    <div className={styles.grid}>
      <StaffDataGrid arrangements={displayARs} onChange={onChange}></StaffDataGrid>
    </div>
  )
})

export default Minister