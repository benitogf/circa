import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Table from '../table'
import LinearProgress from '@material-ui/core/LinearProgress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

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
  listHeaderText: {
    fontSize: '0.9rem',
  },
  loadingHeader: {
    top: 111
  },
  sectionHeader: {
    top: 117
  },
  sectionHeaderContent: {
    textAlign: 'center',
    height: 45,
    background: props => props.lights ? '#e2e2e2' : '#000'
  },
  lineChart: {
    margin: '3em 0',
    [theme.breakpoints.up('s')]: {
      margin: '3em auto',
    }
  }
}))

const mapStocks = (stocks, country) => stocks.filter((s) =>
  s.data.country === country).map((stock) => ({
    name: stock.data.id.replace(':IND', '').replace('-', ''),
    fullName: stock.data.name,
    price: stock.data.price,
    change: stock.data.priceChange1Day
  }))

export default ({ authorize, date, country }) => {
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

  const stocksMap = stocks ? mapStocks(stocks, country) : null
  const notEmpty = stocksMap && stocksMap.length > 0

  return notEmpty ? [<AppBar key="loadingHeader" className={styles.loadingHeader} position="sticky" color="default">
    {(!active || !stocks) && <LinearProgress />}
  </AppBar>,
  <Table key="stocksTable"
    rows={stocksMap}
    top={117}
    link={(row) => '/dashboard/stock/' + row['name']}
    hiddenMobileFields={hiddenMobileFields} />,
  <AppBar key="priceChartHeader" className={styles.sectionHeader} position="sticky" color="default">
    <List className={styles.list} component="nav">
      <ListItem className={styles.sectionHeaderContent}>
        <ListItemText disableTypography className={styles.listHeaderText} primary={'price/index'} />
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
        <ListItemText disableTypography className={styles.listHeaderText} primary={'price change/index'} />
      </ListItem>
    </List>
  </AppBar>,
  <LineChart key="priceChangeChart" className={styles.lineChart} width={chartWidth} height={chartHeight} data={stocksMap}>
    <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
    <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
    <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
    <Line type="monotone" dataKey="change" stroke="#03a9f4" />
    <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
  </LineChart>] : <AppBar key="loadingHeader" className={styles.loadingHeader} position="sticky" color="default">
      <LinearProgress />
    </AppBar>
}