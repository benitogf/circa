import React, { useState } from 'react'
import { fetch } from '../api'
import { withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    overflow: 'auto',
    background: 'transparent',
    flex: 1,
    marginBottom: 57
  },
  list: {
    padding: 0
  },
  listHeader: {
    background: (props) => props.lights ? '#ececec' : '#3e3e3e',
    justifyContent: 'space-between'
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  searchInput: {
    marginBottom: 4,
    marginTop: 4,
    marginRight: 20
  },
  searchInputRoot: {
    padding: '14px 12px 10px',
  },
  searchInputLabel: {
    transform: 'translate(14px, 14px) scale(1)',
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
  sortButton: {
    height: '2.88em'
  }
}))

function desc(a, b) {
  if (b < a) {
    return -1
  }
  if (b > a) {
    return 1
  }
  return 0
}

function stableSort(array, cmp) {
  const stabilizedThis = array.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = cmp(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  });
  return stabilizedThis.map(el => el[0])
}

function getSorting(order) {
  return order === 'desc' ? (a, b) => desc(a, b) : (a, b) => -desc(a, b)
}

function glob(pattern, input) {
  var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, "\\$1").replace(/\*/g, '.*'))
  return re.test(input)
}

export default withRouter(({ authorize, history }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [keys, setKeys] = useState(null)
  const [fetched, setFetched] = useState(null)

  const getKeys = async () => {
    if (!fetched) {
      setFetched(true)
      try {
        const response = await fetch('', authorize)
        setTimeout(() => {
          setKeys(response.keys)
        }, 400)
      } catch (e) {
        console.error(e)
      }
    }
  }

  getKeys()

  // table
  const storedSearch = window.localStorage.getItem('storage:search')
  const [search, setSearch] = useState(!storedSearch ? '' : storedSearch)
  const [order, setOrder] = useState('asc')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(15)
  function handleRequestSort(_event) {
    const isDesc = order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
  }
  function handleChangePage(_event, newPage) {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          <TextField
            id="search"
            label="Search"
            className={styles.searchInput}
            value={search}
            margin="normal"
            fullWidth
            autoFocus
            InputLabelProps={{
              classes: {
                outlined: styles.searchInputLabel
              }
            }}
            InputProps={{
              classes: {
                input: styles.searchInputRoot
              }
            }}
            onChange={(e) => {
              setSearch(e.target.value)
              window.localStorage.setItem('storage:search', e.target.value)
            }}
            variant="outlined"
          />
          <Button variant="contained"
            color="primary"
            onClick={handleRequestSort}
            className={styles.sortButton}>
            <TableSortLabel active
              direction={order}
            ></TableSortLabel>
          </Button>
        </ListItem>
      </List>
      {!keys && (<LinearProgress />)}
    </AppBar>
    {keys && <Table className={styles.tableRoot}>
      <TableBody>
        {stableSort(keys, getSorting(order))
          .filter(key => glob(search, key))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((key, index) => <TableRow key={index}
            className={styles.tableRow}
            hover
            onClick={() => history.push('/dashboard/storage/' + key.replace(/\//gi, ':'))}>
            <TableCell key={key}
              component={'th'}
              className={styles.tableCell}
              scope={'row'}
              align={'left'}>{key}</TableCell>
          </TableRow>)}
      </TableBody>
    </Table>}
    {keys && <TablePagination className={styles.tablePagination}
      classes={{
        actions: styles.paginationActions,
        input: styles.paginationInput
      }}
      rowsPerPageOptions={[15, 40, 100]}
      component="div"
      count={keys.filter(key => glob(search, key)).length}
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
    />}
  </Paper>
})