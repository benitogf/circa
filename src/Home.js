import React from 'react'
import { Redirect, Link } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'
import Icon from '@material-ui/core/Icon'
import Button from '@material-ui/core/Button'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay } from 'react-swipeable-views-utils'
import Contact from './Contact'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)

const containerStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flex: '1 1',
    flexDirection: 'column'
  },
}))

const headerStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3, 2),
    margin: 0,
    borderRadius: 0,
    background: "url('/bg.webp') 10%",
    backgroundSize: 'cover',
    height: '25em',
    animation: 'gradient-wave 101s ease infinite'
  },
  title: {
    color: 'white',
    fontSize: props => props.mobile ? '1.4em' : '1.7em',
    padding: props => props.mobile ? '4em 1em 1em' : '3em 3em 1em',
  },
  titleContainer: {
    background: theme.palette.primary.main,
    margin: '0 auto',
    maxWidth: 960
  },
  button: {
    fontSize: 'inherit',
    color: '#ffa000',
    background: 'white',
    marginTop: 0,
    textTransform: 'unset',
    marginBottom: '2em',
    marginLeft: '5em'
  }
}))

const bodyStyles = makeStyles(theme => ({
  minroot: {
    display: 'flex',
    // display: props => props.mobile ? 'none' : 'flex',
    padding: '1em',
    flexDirection: 'column',
    flexGrow: 1,
    position: 'relative',
    // marginTop: '-22em',
    maxWidth: 850,
    margin: '0 auto'
  },
  root: {
    padding: theme.spacing(3, 2),
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    borderRadius: 0,
    // background: '#b29c8e',
    backgroundSize: 'cover !important'
  },
  grid: {
    // display: props => props.mobile ? 'none' : '',
  },
  tabs: {
    padding: 0,
  },
  tab: {
    height: '10em',
    padding: '3em',
    background: '#eee'
  },
  tabTitle: {
    color: theme.palette.primary.main,
    fontSize: props => props.mobile ? '1.4em' : '1.7em',
    margin: '0 auto',
    maxWidth: 960,
    paddingTop: '1em'
  },
  tabContent: {
    color: theme.palette.primary.main,
    fontSize: props => props.mobile ? '1em' : '1.2em',
    margin: '0 auto',
    maxWidth: 960,
    paddingTop: '0.7em'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    background: theme.palette.grey[200],
    borderRadius: '4px 4px 0 0'
  },
  icon: {
    fontSize: '3em',
    color: theme.palette.primary.main,
    animation: 'skew 3s infinite'
  },
  paperTitle: {
    padding: theme.spacing(2),
    textAlign: 'center',
    fontSize: '0.9em',
    fontWeight: '100',
    background: theme.palette.primary.main,
    color: 'white',
    borderRadius: '0'
  },
  paperContent: {
    padding: theme.spacing(2),
    textAlign: 'center',
    fontSize: '1em',
    fontWeight: '100',
    borderRadius: '0 0 4px 4px'
  },
}))

const footerStyles = makeStyles((theme) => ({
  root: {
    // display: props => props.mobile ? 'none' : 'flex',
    display: 'flex',
    background: "url('/bg.webp') 10%",
    backgroundSize: 'cover',
    margin: 0,
    borderRadius: 0,
    animation: 'gradient-wave-inverse 101s ease infinite',
    height: '20em',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  copy: {
    fontStyle: 'italic',
    paddingTop: 0,
    color: 'white',
    fontWeight: '100',
    padding: '1em'
  },
  icon: {
    verticalAlign: 'bottom'
  },
  content: {
    margin: '0 auto',
    width: '-webkit-fill-available',
    maxWidth: 960,
    display: 'flex',
    flexDirection: 'row-reverse'
  },
  title: {
    // marginRight: props => props.mobile ? '-2.4em' : '-20em',
    color: 'white',
    marginTop: 0,
    // fontSize: '1.7em',
    // maxWidth: '17em',
    padding: '1em',
    background: theme.palette.primary.main,
    height: '-webkit-fill-available',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    fontSize: '0.4em',
    maxWidth: '41em'
  }
}))

export default ({ status }) => {
  if (status === 'authorized') {
    return <Redirect to="/dashboard" />
  }

  const container = containerStyles()
  const header = headerStyles({ mobile: useMediaQuery(useTheme().breakpoints.down('sm')) })
  const body = bodyStyles({ mobile: useMediaQuery(useTheme().breakpoints.down('xs')) })
  const footer = footerStyles({ mobile: useMediaQuery(useTheme().breakpoints.down('xs')) })

  return (<div className={container.root}>
    <Paper className={header.root}>
      <div className={header.titleContainer}>
        <Typography component="p"
          className={header.title}>Paper can be used as a surface to write, we provide a similar service.
        </Typography>
        <Button className={header.button}
          variant="contained"
          component={Link}
          {...{ to: '/signup' }} color="primary">Get started</Button>
      </div>
    </Paper>
    <Paper className={body.root} elevation={0}>
      <Paper className={body.minroot} elevation={1}>
        <Grid className={body.grid} container spacing={3}>
          <Grid item xs={12} sm>
            <Paper className={body.paper}><Icon className={body.icon}>settings_input_composite</Icon></Paper>
            <Paper className={body.paperTitle}>Restful API</Paper>
            <Paper className={body.paperContent}>Create, read, update or delete through HTTP services optimized for high availability and performance</Paper>
          </Grid>
          <Grid item xs={12} sm>
            <Paper className={body.paper}><Icon className={body.icon}>360</Icon></Paper>
            <Paper className={body.paperTitle}>Realtime subscriptions</Paper>
            <Paper className={body.paperContent}>Observe your data as it changes through secured Websockets connections</Paper>
          </Grid>
          <Grid item xs={12} sm>
            <Paper className={body.paper}><Icon className={body.icon}>insert_chart</Icon></Paper>
            <Paper className={body.paperTitle}>Custom dashboard</Paper>
            <Paper className={body.paperContent}>Charts, tables and forms to fit your business requirements, monitor your account activity from any device</Paper>
          </Grid>
        </Grid>
      </Paper>
    </Paper>
    <Paper className={body.tabs} elevation={0}>
      <AutoPlaySwipeableViews enableMouseEvents
        interval={3500}
        resistance
        slideStyle={{
          margin: '0',
        }}>
        <div className={body.tab}>
          <Typography component="p"
            className={body.tabTitle}>Secured streams and endpoints</Typography>
          <Typography component="p"
            className={body.tabContent}>Use JWT authentication to control access conditions</Typography>
        </div>
        <div className={body.tab}>
          <Typography component="p"
            className={body.tabTitle}>One way data flow</Typography>
          <Typography component="p"
            className={body.tabContent}>Maintain the state of your application with ease</Typography>
        </div>
        <div className={body.tab}>
          <Typography component="p"
            className={body.tabTitle}>Delta updates</Typography>
          <Typography component="p"
            className={body.tabContent}>Receive incremental updates to reduce network footprint</Typography>
        </div>
      </AutoPlaySwipeableViews>
    </Paper>
    <Paper className={body.root} elevation={0}>
      <Contact />
    </Paper>
    <Paper className={footer.root} elevation={0}>
      <div className={footer.content}>
        <div className={footer.title}>
          <Typography component="p" className={footer.copy}>
            <Icon className={footer.icon}>copyright</Icon> circa - All rights reserved</Typography>
          <Typography component="p" className={footer.copy}>
            <Icon className={footer.icon}>place</Icon> Wan Chai, Hong Kong</Typography>
          <Typography component="p" className={footer.copy}>
            <Icon className={footer.icon}>phone</Icon> +852-92930797</Typography>
        </div>
      </div>
    </Paper>
  </div>)
}