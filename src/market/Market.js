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
import { countries } from '../constants'
import MobileStepper from '@material-ui/core/MobileStepper'
import Button from '@material-ui/core/Button'
import Hidden from '@material-ui/core/Hidden'

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
    left: '0px !important'
  },
  timeHeader: {
    top: 55
  },
  timeHeaderContent: {
    background: props => props.lights ? '#bcdcf9' : '#303030'
  },
  timeSteps: {
    flexGrow: 1,
  },
  hiddenContainer: {
    display: 'flex',
    flex: 1
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
      date: current.data.date
    })
  }
  return result
}, [])

export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const [dates, socket] = useSubscribe('market/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN

  // country select
  const localCountry = window.localStorage.getItem('market:country')
  const [country, setCountry] = useState(!localCountry ? 'HK' : localCountry)

  // time slider
  const indices = dates ? getIndices(dates) : null
  const [timeIndex, setTimeIndex] = useState(null)

  // mobile step
  const [activeStep, setActiveStep] = useState(0)
  function handleNext() {
    setActiveStep(prevActiveStep => {
      setTimeIndex(indices[indices.length - (prevActiveStep + 2)].value)
      return prevActiveStep + 1
    })
  }
  function handleBack() {
    setActiveStep(prevActiveStep => {
      setTimeIndex(indices[indices.length - prevActiveStep].value)
      return prevActiveStep - 1
    })
  }

  const date = timeIndex ? indices.filter(ind => ind.value === timeIndex)[0].date : null

  if (!timeIndex && indices) {
    setTimeIndex(indices[0].value)
    setActiveStep(indices.length - 1)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          {timeIndex &&
            <ListItemText className={styles.listHeaderText}
              primary={country + ' stock indices (' + indices[indices.length - 1 - activeStep].label + ')'} />}
          <Select className={styles.select}
            MenuProps={{ className: styles.menu }}
            inputProps={{ className: styles.selectInput }}
            value={country}
            onChange={(e) => {
              setCountry(e.target.value)
              window.localStorage.setItem('market:country', e.target.value)
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
          <Hidden className={styles.hiddenContainer} mdDown>
            {timeIndex && <Slider
              value={timeIndex}
              onChangeCommitted={(_e, v) => {
                setTimeIndex(v)
                setActiveStep(indices.length - 1 - indices.findIndex(iv => iv.value === v))
              }}
              className={styles.slider}
              getAriaValueText={(_v, i) => indices[i].label}
              aria-labelledby="time-slider"
              valueLabelDisplay="off"
              marks={indices}
              step={null}
              min={indices[indices.length - 1].value}
              max={indices[0].value}
            />}
          </Hidden>
          <Hidden className={styles.hiddenContainer} lgUp>
            {timeIndex && <MobileStepper
              variant="progress"
              steps={indices.length}
              position="static"
              activeStep={activeStep}
              className={styles.timeSteps}
              nextButton={
                <Button size="small" onClick={handleNext} disabled={activeStep === indices.length - 1}>
                  Next
                </Button>
              }
              backButton={
                <Button size="small" onClick={handleBack} disabled={activeStep === 0}>
                  Back
                </Button>
              }
            />}
          </Hidden>
        </ListItem>
      </List>
    </AppBar>}
    {date && <Stocks authorize={authorize} date={date} country={country} />}
  </Paper>
}