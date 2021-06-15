import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
import { useSubscribe, usePublish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import BoxForm from './BoxForm'
import Things from './things/Things'
import ThingForm from './things/ThingForm'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const TabContainer = ({ children, dir }) => (<Typography component="div" dir={dir}>
  {children}
</Typography>)

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    background: 'transparent',
    overflowY: 'auto'
  },
  tabRoot: {
    display: 'flex',
    flex: '1 1',
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    background: theme.palette.primary.main,
    display: 'grid',
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  listDates: {
    padding: '15px 0 0',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listDate: {
    fontSize: '0.8em',
    margin: props => props.canEdit ? '0 auto' : '',
    maxWidth: props => props.canEdit ? 445 : 'unset'
  },
  formTab: {
    position: 'absolute',
    width: "100%"
  }
}))

const Box = ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const role = window.localStorage.getItem('role')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [box, socket] = useSubscribe('boxes/' + match.params.id, authorize)
  const publish = usePublish('boxes/' + match.params.id, authorize)
  const publishThing = usePublish('things/' + match.params.id + '/' + account + '/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const canEdit = role === 'admin' || role === 'root'

  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const styles = rootStyles({ active, canEdit, lights })

  // tabs
  const [tab, setTab] = useState(0)

  function changeTab(index) {
    setTab(index)
  }

  // this is not a box
  if (box && box.index === '') {
    return (<Redirect to="/dashboard/boxes" />)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <Tabs
        value={tab}
        onChange={(_e, index) => changeTab(index)}
        indicatorColor="primary"
        textColor="primary"
        variant={mobile ? 'fullWidth' : 'standard'}
      >
        <Tab disableTouchRipple label="Box" />
        <Tab disableTouchRipple label="New thing" />
      </Tabs>
      <List className={styles.list}
        component="nav">
        <ListItem className={styles.listHeader}>
          {(() => tab === 0 ? box && box.data ?
            <ListItemText className={styles.listHeaderText} primary={box.data.name} /> :
            <CircularProgress color="inherit" size={24} /> :
            <ListItemText className={styles.listHeaderText} primary={'Thing details'} />)()}
        </ListItem>
      </List>
      {(!box || !active) && <LinearProgress />}
    </AppBar>
    <SwipeableViews
      axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
      index={tab}
      onChangeIndex={changeTab}
      containerStyle={{
        flex: '1 1 0%',
        paddingBottom: tab === 0 ? 55 : 0
      }}
      className={styles.tabRoot}
    >
      <TabContainer dir={theme.direction}>
        {box && <List className={styles.listDates}
          component="nav">
          {box.created && <ListItem className={styles.listDate}>
            Created on: <DateDisplay time={box.created} />
          </ListItem>}
          {box.updated !== 0 && <ListItem className={styles.listDate}>
            Updated on: <DateDisplay time={box.updated} />
          </ListItem>}
        </List>}
        {box && canEdit && <BoxForm publish={publish} box={box} authorize={authorize} />}
        {box && <Things match={match} authorize={authorize} />}
      </TabContainer>
      <TabContainer dir={theme.direction}>
        <div className={styles.formTab}>
          {box && <ThingForm boxId={box.index}
            publish={publishThing}
            afterCreate={() => setTab(0)}
            authorize={authorize} />}
        </div>
      </TabContainer>
    </SwipeableViews>
  </Paper>
}

export default Box