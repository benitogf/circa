import React, { useState } from 'react'
import { useSubscribe } from '../api'
import { withRouter } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableSortLabel from '@material-ui/core/TableSortLabel'
import LinearProgress from '@material-ui/core/LinearProgress'
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
  },
  list: {
    padding: 0
  },
  listHeader: {
    background: theme.palette.primary.main
  },
  tableHead: {
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  loadingHeader: {
    top: 111
  },
  sectionHeader: {
    top: 115
  },
  sectionHeaderContent: {
    textAlign: 'center',
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  lineChart: {
    margin: '1em 0',
    [theme.breakpoints.up('xs')]: {
      margin: '1em auto',
    }
  },
  tableRow: {
    textDecoration: 'none',
    '&:hover': {
      background: '#efefef',
      cursor: 'pointer'
    }
  },
  tableCellRoot: {
    [theme.breakpoints.down('xs')]: {
      padding: '14px 20px 14px 9px'
    }
  }
}))

const mapStocks = (stocks, country) => stocks.filter((s) =>
  s.data.country === country).map((stock) => ({
    name: stock.data.id.replace(':IND', '').replace('-', ''),
    fullName: stock.data.name,
    price: stock.data.price,
    priceChange1Day: stock.data.priceChange1Day
  }))

export default withRouter(({ authorize, date, country, history }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [stocks, socket] = useSubscribe('stocks/*/' + date, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.between('s', 'sm'))
  const laptop = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  // charts
  const chartWidth = mobile && !tablet ? 310 : tablet ? 350 : laptop ? 700 : 900
  const chartHeight = mobile && !tablet ? 310 : tablet ? 350 : 400

  // table
  const hiddenMobileFields = ['fullName']
  const responsiveTableFields = (field) => (!mobile && !tablet) ||
    ((mobile || tablet) && hiddenMobileFields.indexOf(field) === -1)
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')

  function handleRequestSort(_event, property) {
    const isDesc = orderBy === property && order === 'desc'
    setOrder(isDesc ? 'asc' : 'desc')
    setOrderBy(property)
  }
  const createSortHandler = property => event => {
    handleRequestSort(event, property)
  }

  const stocksMap = stocks ? mapStocks(stocks, country) : null
  const notEmpty = stocksMap && stocksMap.length > 0

  return notEmpty ? [<AppBar key="loadingHeader" className={styles.loadingHeader} position="sticky" color="default">
    {(!active || !stocks) && <LinearProgress />}
  </AppBar>,
  <Table key="table" className={styles.table}>
    <TableHead className={styles.tableHead}>
      <TableRow>
        {Object.keys(stocksMap[0]).map((v, i) => responsiveTableFields(v) ?
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
    <TableBody>
      {stableSort(stocksMap, getSorting(order, orderBy))
        .map((row, index) => <TableRow key={index}
          className={styles.tableRow}
          hover
          onClick={() => history.push('/dashboard/stock/' + row['name'])}>
          {Object.keys(stocksMap[0]).map((v, i) => responsiveTableFields(v) ?
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
  <AppBar key="priceChartHeader" className={styles.sectionHeader} position="sticky" color="default">
    <List className={styles.list} component="nav">
      <ListItem className={styles.sectionHeaderContent}>
        <ListItemText className={styles.listHeaderText} primary={'price/index'} />
      </ListItem>
    </List>
  </AppBar>,
  <LineChart key="priceChart" className={styles.lineChart} width={chartWidth} height={chartHeight} data={stocksMap}>
    <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
    <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
    <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
    <Line type="monotone" dataKey="price" stroke="#03a9f4" />
    <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
  </LineChart>,
  <AppBar key="priceChangeChartHeader" className={styles.sectionHeader} position="sticky" color="default">
    <List className={styles.list} component="nav">
      <ListItem className={styles.sectionHeaderContent}>
        <ListItemText className={styles.listHeaderText} primary={'price change/index'} />
      </ListItem>
    </List>
  </AppBar>,
  <LineChart key="priceChangeChart" className={styles.lineChart} width={chartWidth} height={chartHeight} data={stocksMap}>
    <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
    <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
    <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
    <Line type="monotone" dataKey="priceChange1Day" stroke="#03a9f4" />
    <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
  </LineChart>] : <AppBar key="loadingHeader" className={styles.loadingHeader} position="sticky" color="default">
      <LinearProgress />
    </AppBar>
})