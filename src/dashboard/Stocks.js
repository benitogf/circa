import React, { useState } from 'react'
import { useSubscribe } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TablePagination from '@material-ui/core/TablePagination'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import LinearProgress from '@material-ui/core/LinearProgress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { style } from '@material-ui/system';


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

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    overflow: 'auto'
  },
  list: {
    padding: 0
  },
  listHeader: {
    background: theme.palette.primary.main
  },
  listSection: {
    textAlign: 'center',
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  select: {
    background: '#41ce157a',
    borderRadius: 5
  },
  menu: {
    height: 300,
    top: '75px !important',
  },
  tableHead: {
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  sectionHeader: {
    top: 72
  },
  lineChart: {
    margin: '3em auto',
  }
}))

const mapStocks = (stocks, country) => stocks.filter((s) => s.data.country === country).map((stock) => ({
  name: stock.data.id.replace(':IND', ''),
  fullName: stock.data.name,
  price: stock.data.price,
  priceChange1Day: stock.data.priceChange1Day
}))

const getCountries = (stocks) => stocks.reduce((result, current) => {
  if (result.indexOf(current.data.country) === -1) {
    result.push(current.data.country)
  }
  return result
}, [])

export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [stocks, socket] = useSubscribe('stocks/*/*', authorize)
  const [country, setCountry] = useState('HK')
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.down('sm'))
  const laptop = useMediaQuery(theme.breakpoints.down('md'))
  const stocksMap = stocks ? mapStocks(stocks, country) : null

  // table
  const [order, setOrder] = React.useState('asc');
  const [orderBy, setOrderBy] = React.useState('name')
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(10)
  function handleRequestSort(event, property) {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
  }
  const createSortHandler = property => event => {
    handleRequestSort(event, property)
  }
  function handleChangePage(event, newPage) {
    setPage(newPage)
  }
  function handleChangeRowsPerPage(event) {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          <ListItemText className={styles.listHeaderText} primary={country + ' stock indices'} />
          {stocks && <Select className={styles.select}
            MenuProps={{ className: styles.menu }}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              setPage(0)
            }}
            input={<OutlinedInput name="country" id="country" />}
          >
            {getCountries(stocks).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>}
        </ListItem>
      </List>
      {(!stocks || !active) && <LinearProgress />}
    </AppBar>
    {stocksMap && <Table className={styles.table}>
      <TableHead className={styles.tableHead}>
        <TableRow>
          {Object.keys(stocksMap[0]).map((v, i) => v !== 'priceChange1Day' || (!mobile && !tablet) ?
            <TableCell align={i > 0 ? 'right' : ''}>
              <TableSortLabel active={orderBy === v}
                direction={order}
                onClick={createSortHandler(v)}
              >{v}</TableSortLabel>
            </TableCell> : null)}
        </TableRow>
      </TableHead>
      <TableBody>
        {stableSort(stocksMap, getSorting(order, orderBy))
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((row, index) => <TableRow key={index}>
            {Object.keys(stocksMap[0]).map((v, i) => v !== 'priceChange1Day' || (!mobile && !tablet) ?
              <TableCell component={i === 0 ? 'th' : ''}
                scope={i === 0 ? 'row' : ''}
                align={i > 0 ? 'right' : ''}>{row[v]}</TableCell> : null)}
          </TableRow>)}
      </TableBody>
    </Table>}
    {stocksMap && <TablePagination
      rowsPerPageOptions={[10, 25, 50]}
      component="div"
      count={stocksMap.length}
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
    {stocksMap && <AppBar className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listSection}>
          <ListItemText className={styles.listHeaderText} primary={'price/index'} />
        </ListItem>
      </List>
    </AppBar>}
    {stocksMap && <LineChart className={styles.lineChart} width={mobile ? 320 : tablet ? 350 : laptop ? 700 : 900} height={400} data={stocksMap}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="price" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
    {stocksMap && <AppBar className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listSection}>
          <ListItemText className={styles.listHeaderText} primary={'priceChange1Day/index'} />
        </ListItem>
      </List>
    </AppBar>}
    {stocksMap && <LineChart className={styles.lineChart} width={mobile ? 320 : tablet ? 350 : laptop ? 700 : 900} height={400} data={stocksMap}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="priceChange1Day" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
  </Paper>
}