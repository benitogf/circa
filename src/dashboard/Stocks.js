import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

const rootStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 0
  },
  header: {
    backgroundColor: theme.palette.primary.main,
    maxWidth: 'unset',
    borderRadius: 0,
  },
  icon: {
    verticalAlign: "bottom",
    color: "#f0cf81"
  },
  lineChart: {
    margin: '3em auto',
  }
}))

export default ({ authorize }) => {
  const styles = rootStyles()
  const lights = window.localStorage.getItem('lights') === 'on'
  const [stocks, socket] = useSubscribe('stocks/*/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  return <Paper className={styles.paper} elevation={1}>
    <SnackbarContent className={styles.header} color="primary"
      message={(
        <Typography component="p">
          HK stock indices/price
        </Typography>
      )}
    />
    {(!stocks || !active) && <LinearProgress />}
    {stocks && <LineChart className={styles.lineChart} width={mobile ? 350 : 700} height={300} data={stocks.filter((s) => s.data.country === "HK").map((stock) => ({
      name: stock.data.id.replace(':IND', ''),
      price: stock.data.price,
      date: stock.created
    }))}>
      <XAxis dataKey="name" stroke={lights ? '#5ebd56' : '#bed294'} />
      <YAxis stroke={lights ? '#bb8b4b' : '#e2b880'} />
      <CartesianGrid stroke={lights ? '#EEE' : '#FFF'} strokeDasharray="5 5" />
      <Line type="monotone" dataKey="price" stroke="#03a9f4" />
      <Tooltip contentStyle={{ backgroundColor: lights ? '#FCFCFC' : '#000' }} />
    </LineChart>}
  </Paper>
}