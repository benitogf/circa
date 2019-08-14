import React, { useState } from 'react'
import { withRouter } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TablePagination from '@material-ui/core/TablePagination'

const rootStyles = makeStyles((theme) => ({
  tableHead: {
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  tableHeadRoot: {
    position: 'sticky',
    top: (props) => props.top,
  },
  tableRoot: {
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6',
  },
  tableRow: {
    textDecoration: 'none',
    '&:hover': {
      background: '#efefef',
      cursor: 'pointer'
    }
  },
  tableCell: {
    paddingTop: 20,
    paddingBottom: 20
  },
  tableCellRoot: {
    wordBreak: 'break-all',
    [theme.breakpoints.down('xs')]: {
      padding: '14px 20px 14px 9px'
    }
  },
  tablePagination: {
    position: 'fixed',
    bottom: 0,
    right: 0,
    width: '100%',
    borderTop: '1px solid #b5b5b57a',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  paginationActions: {
    margin: 0
  },
  paginationInput: {
    [theme.breakpoints.down('xs')]: {
      marginRight: 7
    }
  },
  fakeTableHead: {
    visibility: 'collapse'
  },
  fakeTableRow: {
    visibility: 'collapse'
  },
}))

function desc(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map(el => el[0]);
}

function getSorting(order, orderBy) {
  return order === 'desc' ? (a, b) => desc(a, b, orderBy) : (a, b) => -desc(a, b, orderBy);
}

export default withRouter(({
  rows,
  top = 0,
  pagination = false,
  hiddenFields = [],
  hiddenMobileFields = [],
  link,
  history }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights, top })
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.between('s', 'sm'))
  // const laptop = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  // table
  const responsiveTableFields = (field) => hiddenFields.indexOf(field) === -1 &&
    ((!mobile && !tablet) ||
      ((mobile || tablet) && hiddenMobileFields.indexOf(field) === -1))
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  function handleRequestSort(_event, property) {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
  }
  const createSortHandler = property => event => {
    handleRequestSort(event, property)
  }
  function handleChangePage(_event, newPage) {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return [<Table key="tableHead" className={styles.tableHeadRoot}>
    <TableHead className={styles.tableHead}>
      <TableRow>
        {rows.length > 0 && Object.keys(rows[0]).map((v, i) => responsiveTableFields(v) ?
          <TableCell classes={{
            root: styles.tableCellRoot
          }}
            key={v} align={i > 0 ? 'right' : 'left'}>
            <TableSortLabel active={orderBy === v}
              direction={order}
              onClick={createSortHandler(v)}
            >{v}</TableSortLabel>
          </TableCell> : null)}
      </TableRow>
    </TableHead>
    <TableBody className={styles.tableRoot}>
      {stableSort(rows, getSorting(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row, index) => <TableRow key={index}
          className={styles.fakeTableRow}>
          {Object.keys(rows[0]).map((v, i) => responsiveTableFields(v) ?
            <TableCell classes={{
              root: styles.tableCellRoot
            }}
              key={v}
              component={i === 0 ? 'th' : ''}
              scope={i === 0 ? 'row' : ''}
              align={i > 0 ? 'right' : 'left'}>{row[v]}</TableCell> : null)}
        </TableRow>)}
    </TableBody>
  </Table>,
  <Table key="table" className={styles.table}>
    <TableHead className={styles.fakeTableHead}>
      <TableRow>
        {rows.length > 0 && Object.keys(rows[0]).map((v, i) => responsiveTableFields(v) ?
          <TableCell classes={{
            root: styles.tableCellRoot
          }}
            key={v} align={i > 0 ? 'right' : 'left'}>
            <TableSortLabel active={orderBy === v}
              direction={order}
              onClick={createSortHandler(v)}
            >{v}</TableSortLabel>
          </TableCell> : null)}
      </TableRow>
    </TableHead>
    <TableBody className={styles.tableRoot}>
      {stableSort(rows, getSorting(order, orderBy))
        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
        .map((row, index) => <TableRow key={index}
          className={styles.tableRow}
          hover
          onClick={() => history.push(link(row))}>
          {Object.keys(rows[0]).map((v, i) => responsiveTableFields(v) ?
            <TableCell classes={{
              root: styles.tableCellRoot
            }}
              key={v}
              component={i === 0 ? 'th' : ''}
              scope={i === 0 ? 'row' : ''}
              align={i > 0 ? 'right' : 'left'}>{row[v]}</TableCell> : null)}
        </TableRow>)}
    </TableBody>
  </Table>,
  pagination && <TablePagination key="tablePagination" className={styles.tablePagination}
    classes={{
      actions: styles.paginationActions,
      input: styles.paginationInput
    }}
    rowsPerPageOptions={[15, 40, 100]}
    component="div"
    count={rows.length}
    rowsPerPage={rowsPerPage}
    page={page}
    backIconButtonProps={{
      'aria-label': 'previous page',
    }}
    nextIconButtonProps={{
      'aria-label': 'next page',
    }}
    onChangePage={handleChangePage}
    onChangeRowsPerPage={handleChangeRowsPerPage}
  />
  ]
})