import React, { useState } from 'react'
import moment from 'moment'
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
import Slider from '@material-ui/core/Slider'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

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
  select: {
    background: '#41ce157a',
    borderRadius: 5
  },
  menu: {
    top: '82px !important',
    height: 300,
    left: '-10px !important'
  },
  tableHead: {
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  timeHeader: {
    top: 55
  },
  timeHeaderContent: {
    background: props => props.lights ? '#bcdcf9' : '#172735'
  },
  sectionHeader: {
    top: 115
  },
  sectionHeaderContent: {
    textAlign: 'center',
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  selectInput: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  lineChart: {
    margin: '3em auto',
  },
  slider: {
    marginLeft: '3em',
    marginRight: '3em'
  }
}))

const reverseIndex = (index) => index === 0 ? index : -1 * index

const mapStocks = (stocks, country, timeIndex) => stocks.filter((s) =>
  s.index === stocks[reverseIndex(timeIndex)].index && s.data.country === country).map((stock) => ({
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

const getIndices = (stocks) => stocks.reduce((result, current, index) => {
  const hex = parseInt(current.index, 16)
  if (result.filter(i => i.hex === hex).length === 0) {
    result.push({
      label: moment.unix(hex / 1000000000).format('DD/MM/YY'),
      value: reverseIndex(index),
      hex,
    })
  }
  return result
}, [])

const getClosestIndex = (goal, indices) => indices.reduce((prev, curr) =>
  (Math.abs(curr.value - goal) < Math.abs(prev.value - goal) ? curr : prev)).value

export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [stocks, socket] = useSubscribe('stocks/*/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.down('sm'))
  const laptop = useMediaQuery(theme.breakpoints.down('md'))

  // country select
  const [country, setCountry] = useState('HK')

  // time slider
  const stocksIndices = stocks ? getIndices(stocks) : null
  const [timeIndex, setTimeIndex] = useState(0)

  // table
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
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

  const stocksMap = stocks ? mapStocks(stocks, country, timeIndex) : null
  const notEmpty = stocksMap && stocksMap.length > 0

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          <ListItemText className={styles.listHeaderText} primary={country + ' stock indices'} />
          {stocks && <Select className={styles.select}
            MenuProps={{ className: styles.menu }}
            inputProps={{ className: styles.selectInput }}
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
    {notEmpty && <AppBar className={styles.timeHeader} position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.timeHeaderContent}>
          {stocksIndices && <Slider
            value={timeIndex}
            onChangeCommitted={(_e, v) => setTimeIndex(getClosestIndex(v, stocksIndices))}
            className={styles.slider}
            getAriaValueText={(_v, i) => stocksIndices[i].label}
            aria-labelledby="time-slider"
            valueLabelDisplay="off"
            marks={stocksIndices}
            min={stocksIndices[stocksIndices.length - 1].value}
            max={0}
          />}
        </ListItem>
      </List>
    </AppBar>}
    {notEmpty && <Table className={styles.table}>
      <TableHead className={styles.tableHead}>
        <TableRow>
          {Object.keys(stocksMap[0]).map((v, i) => v !== 'priceChange1Day' || (!mobile && !tablet) ?
            <TableCell key={v} align={i > 0 ? 'right' : 'left'}>
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
              <TableCell key={v} component={i === 0 ? 'th' : ''}
                scope={i === 0 ? 'row' : ''}
                align={i > 0 ? 'right' : 'left'}>{row[v]}</TableCell> : null)}
          </TableRow>)}
      </TableBody>
    </Table>}
    {notEmpty && <TablePagination component="div"
      rowsPerPageOptions={[10, 25, 50]}
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
    {notEmpty && <AppBar className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.sectionHeaderContent}>
          <ListItemText className={styles.listHeaderText} primary={'price/index'} />
        </ListItem>
      </List>
    </AppBar>}
    {notEmpty && <LineChart className={styles.lineChart} width={mobile ? 320 : tablet ? 340 : laptop ? 700 : 900} height={400} data={stocksMap}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="price" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
    {notEmpty && <AppBar className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.sectionHeaderContent}>
          <ListItemText className={styles.listHeaderText} primary={'priceChange1Day/index'} />
        </ListItem>
      </List>
    </AppBar>}
    {notEmpty && <LineChart className={styles.lineChart} width={mobile ? 320 : tablet ? 340 : laptop ? 700 : 900} height={400} data={stocksMap}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="priceChange1Day" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
  </Paper>
}