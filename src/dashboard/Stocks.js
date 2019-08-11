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
import LinearProgress from '@material-ui/core/LinearProgress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

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
  menu: {
    height: 300,
    top: '80px !important',
  },
  lineChart: {
    margin: '3em auto',
  }
}))

const mapStocks = (stocks, country) => stocks.filter((s) => s.data.country === country).map((stock) => ({
  name: stock.data.id.replace(':IND', ''),
  price: stock.data.price,
  date: stock.created
}))

const getCountries = (stocks) => stocks.reduce((result, current) => {
  if (result.indexOf(current.data.country) === -1) {
    result.push(current.data.country)
  }
  return result
}, [])

export default ({ authorize }) => {
  const styles = rootStyles()
  const lights = window.localStorage.getItem('lights') === 'on'
  const [stocks, socket] = useSubscribe('stocks/*/*', authorize)
  const [country, setCountry] = useState('HK')
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  const tablet = useMediaQuery(theme.breakpoints.down('sm'))
  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          <ListItemText className={styles.listHeaderText} primary={country + ' stock indices/price'} />
          {stocks && <Select MenuProps={{ className: styles.menu }}
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            input={<OutlinedInput name="country" id="country" />}
          >
            {getCountries(stocks).map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>}
        </ListItem>
      </List>
      {(!stocks || !active) && <LinearProgress />}
    </AppBar>
    {stocks && <LineChart className={styles.lineChart} width={mobile ? 320 : tablet ? 350 : 700} height={300} data={mapStocks(stocks, country)}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#EEE' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="price" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
  </Paper>
}