import { DataGrid } from '@material-ui/data-grid'
import { Arrangement } from '../common/arrangement';

const columns = [
    { field: 'title', sortable: false, width: 130 },
    { field: '0', editable: true, sortable: false, width: 130 },
    { field: '1', editable: true, sortable: false, width: 130 },
    { field: '2', editable: true, sortable: false, width: 130 },
    { field: '3', editable: true, sortable: false, width: 130 },
];

let rows = [
    { title: '日期', id: 0 },
    { title: '带领', id: 1 },
    { title: '司事', id: 2 },
    { title: '司琴', id: 3 }
];

const keys = ['riqi', 'dailing', 'sishi', 'siqing', 'siku']
const iToKey = (i) => {
    return keys[i]
}

interface StaffDataGridProps {
    arrangements: Arrangement[]
    onChange: (arrangements: Arrangement[]) => void
}

const StaffDataGrid = ({ arrangements, onChange }: StaffDataGridProps) => {
    for (const index in arrangements) {
        for (let i = 0; i < 4; i++) {
            rows[i][index] = arrangements[index][iToKey(i)]
        }
    }
    const handleEditCellChangeCommitted = ({ id, field, value }) => {
        let newArrangements = Array.from(arrangements)
        newArrangements[field][iToKey(id)] = value;
        onChange && onChange(newArrangements)
    }
    return (
        <div style={{ width: '655px' }}>
            <DataGrid rows={rows} columns={columns}
                onCellEditCommit={handleEditCellChangeCommitted}
                headerHeight={0} autoHeight disableColumnMenu hideFooter hideFooterPagination hideFooterRowCount hideFooterSelectedRowCount />
        </div>
    )
}

export default StaffDataGrid