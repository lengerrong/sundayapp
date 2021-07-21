import { DataGrid } from '@material-ui/data-grid'

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
    { title: '司琴', id: 3 },
    { title: '司库', id: 4 }
];

const keys = ['riqi', 'dailing', 'sishi', 'siqing', 'siku']
const iToKey = (i) => {
    return keys[i]
}

const StaffDataGrid = ({ arrangements, onChange }) => {
    for (const index in arrangements) {
        for (let i = 0; i < 5; i++) {
            rows[i][index] = arrangements[index][iToKey(i)]
        }
    }
    const handleEditCellChangeCommitted = ({ id, field, props }) => {
        let newArrangements = Array.from(arrangements)
        newArrangements[field][iToKey(id)] = props.value;
        onChange && onChange(newArrangements)
    }

    return (
        <div style={{ width: '655px' }}>
            <DataGrid rows={rows} columns={columns}
                onEditCellChangeCommitted={handleEditCellChangeCommitted}
                headerHeight={0} autoHeight disableColumnMenu hideFooter hideFooterPagination hideFooterRowCount hideFooterSelectedRowCount />
        </div>
    )
}

export default StaffDataGrid