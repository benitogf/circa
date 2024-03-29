import React from 'react'
import moment from 'moment'
import { useSubscribe } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import Table from '../table'
import { useMatch } from 'react-router-dom'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    overflow: 'auto',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  list: {
    padding: 0
  },
  listHeader: {
    background: theme.palette.primary.main,
    minHeight: 55
  },
  listHeaderText: {
    fontSize: '0.9rem',
  },
  sectionHeader: {
    top: 55
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
  },
}))

const mapStock = (stocks) => stocks.map((stock) => ({
  price: stock.data.price,
  change: stock.data.priceChange1Day,
  date: stock.data.priceDate,
})).sort((a, b) => moment(a.date).unix() - moment(b.date).unix())

const Stock = ({ authorize }) => {
  const match = useMatch('/dashboard/stock/:id')
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [stock, socket] = useSubscribe('stocks/' + match.params.id + '/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.between('s', 'sm'))
  const laptop = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  // charts
  const chartWidth = mobile && !tablet ? 310 : tablet ? 350 : laptop ? 700 : 900
  const chartHeight = mobile && !tablet ? 310 : tablet ? 350 : 400

  const stockMap = stock ? mapStock(stock) : null

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          {(() => stock && stock.length ?
            <ListItemText primary={stock[0].data.country + ' - ' + stock[0].data.name} /> :
            <CircularProgress color="inherit" size={24} />)()}
        </ListItem>
      </List>
      {(!stock || !active) && <LinearProgress />}
    </AppBar>
    {stockMap && [<Table key="stockTable"
      rows={stockMap}
      top={57}
      hiddenMobileFields={['change']} />,
    <AppBar key="priceChartHeader" className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.sectionHeaderContent}>
          <ListItemText disableTypography className={styles.listHeaderText} primary={'date/price'} />
        </ListItem>
      </List>
    </AppBar>,
    <LineChart key="priceChart" className={styles.lineChart} width={chartWidth} height={chartHeight} data={stockMap}>
      <XAxis dataKey="date" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="price" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>,
    <AppBar key="priceChangeChartHeader" className={styles.sectionHeader} position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.sectionHeaderContent}>
          <ListItemText disableTypography className={styles.listHeaderText} primary={'date/change'} />
        </ListItem>
      </List>
    </AppBar>,
    <LineChart key="priceChangeChart" className={styles.lineChart} width={chartWidth} height={chartHeight} data={stockMap}>
      <XAxis dataKey="date" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#CCC' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="change" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>
    ]}
  </Paper>
}

export default Stock