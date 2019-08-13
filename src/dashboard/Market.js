import React, { useState } from 'react'
import moment from 'moment'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import MenuItem from '@material-ui/core/MenuItem'
import Select from '@material-ui/core/Select'
import OutlinedInput from '@material-ui/core/OutlinedInput'
import LinearProgress from '@material-ui/core/LinearProgress'
import Slider from '@material-ui/core/Slider'
import Stocks from './Stocks'

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
    top: '82px !important',
    height: 300,
    left: '-10px !important'
  },
  timeHeader: {
    top: 55
  },
  timeHeaderContent: {
    background: props => props.lights ? '#bcdcf9' : '#172735'
  },
  select: {
    background: '#41ce157a',
    borderRadius: 5
  },
  selectInput: {
    paddingTop: 10,
    paddingBottom: 10,
  },
  slider: {
    marginLeft: '3em',
    marginRight: '3em'
  }
}))

const getIndices = (dates) => dates.reduce((result, current) => {
  const hex = parseInt(current.data.date, 16)
  if (result.filter(i => i.hex === current.data.date).length === 0) {
    result.push({
      label: moment.unix(hex / 1000000000).format('DD/MM/YY'),
      value: hex,
      index: current.data.date
    })
  }
  return result
}, [])

const getClosestIndex = (goal, indices) => indices.reduce((prev, curr) =>
  (Math.abs(curr.value - goal) < Math.abs(prev.value - goal) ? curr : prev)).value

const countries = ["CZ", "GH", "LT", "RO", "KZ", "MULT", "EE", "LV", "MT", "SE", "BG", "TZ", "MA", "AT", "MK", "HR", "IL", "SK", "IE", "MU", "PT", "OM", "LU", "BE", "LB", "CY", "BA", "NA", "IT", "NL", "IS", "ES", "NG", "HU", "PS", "PL", "SI", "JO", "NO", "RS", "KE", "CH", "UA", "KW", "QA", "BW", "FI", "ZA", "DK", "SA", "GR", "RU", "EU", "ME", "AE", "DE", "GB", "BH", "TN", "TR", "FR", "BM", "CL", "CO", "JM", "PA", "CA", "CR", "MX", "BR", "PE", "AR", "VE", "US", "LK", "PH", "VN", "LA", "TH", "NZ", "SG", "PK", "ID", "MN", "JP", "AU", "HK", "TW", "BD", "KR", "IN", "MY", "CN"]

export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [dates, socket] = useSubscribe('market/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN

  // country select
  const [country, setCountry] = useState('HK')

  // time slider
  const indices = dates ? getIndices(dates) : null
  const [timeIndex, setTimeIndex] = useState(null)

  const stockskKey = timeIndex ? indices.filter(ind => ind.value === timeIndex)[0] : null

  // if (timeIndex) {
  //   console.log(timeIndex, stockskKey)
  // }

  if (!timeIndex && indices) {
    setTimeIndex(indices[0].value)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          <ListItemText className={styles.listHeaderText} primary={country + ' stock indices'} />
          <Select className={styles.select}
            MenuProps={{ className: styles.menu }}
            inputProps={{ className: styles.selectInput }}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
            }}
            input={<OutlinedInput name="country" id="country" />}
          >
            {countries.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </Select>
        </ListItem>
      </List>
      {(!dates || !active) && <LinearProgress />}
    </AppBar>
    {indices && <AppBar className={styles.timeHeader} position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.timeHeaderContent}>
          {timeIndex && <Slider
            value={timeIndex}
            onChangeCommitted={(_e, v) => setTimeIndex(getClosestIndex(v, indices))}
            className={styles.slider}
            getAriaValueText={(_v, i) => indices[i].label}
            aria-labelledby="time-slider"
            valueLabelDisplay="off"
            marks={indices}
            min={indices[indices.length - 1].value}
            max={indices[0].value}
          />}
        </ListItem>
      </List>
    </AppBar>}
    {stockskKey && <Stocks authorize={authorize} date={stockskKey.index} country={country} />}
  </Paper>
}