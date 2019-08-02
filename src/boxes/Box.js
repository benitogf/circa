import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
import { useSubscribe, usePublish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import BoxForm from './BoxForm'
import Things from '../things/Things'
import ThingForm from '../things/ThingForm'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const Header = ({ box, active, styles }) => (<List className={styles.list}
  component="nav">
  <ListItem className={styles.listHeader}>
    {(() => active && box && box.data ? box.data.name : 'offline')()}
  </ListItem>
  {box && box.created && <ListItem className={styles.listDate}>
    Created on: <DateDisplay time={box.created} />
  </ListItem>}
  {box && box.updated !== 0 && <ListItem className={styles.listDate}>
    Updated on: <DateDisplay time={box.updated} />
  </ListItem>}
</List>)


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
  },
  boxesList: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto'
  },
  tabs: {
    top: 132
  },
  tabRoot: {
    display: 'flex',
    flex: '1 1',
    overflowY: 'auto',
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    transition: 'background-color 0.5s ease',
    background: props => props.active ? theme.palette.primary.main : '#f1932c'
  },
  listDate: {
    fontSize: '0.8em',
    margin: props => props.canEdit ? '0 auto' : '',
    maxWidth: props => props.canEdit ? 445 : 'unset'
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

const tabsContainerStyle = {
  marginTop: -180,
  paddingTop: 180,
  flex: '1 1 0%'
}

export default ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const role = window.localStorage.getItem('role')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [box, socket] = useSubscribe('/sa/boxes/' + match.params.id, authorize)
  const publish = usePublish('/sa/boxes/' + match.params.id, authorize)
  const publishThing = usePublish('/mo/things/' + match.params.id + '/' + account, authorize)
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

  return <Paper className={styles.root} elevation={1}>
    <div className={styles.root}>
      <AppBar className={styles.tabs} position="sticky" color="default">
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
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={tab}
        onChangeIndex={changeTab}
        containerStyle={tabsContainerStyle}
        className={styles.tabRoot}
      >
        <TabContainer dir={theme.direction}>
          <Header active={active} box={box} styles={styles} />
          {!box ? <LinearProgress /> : (<div>
            {canEdit &&
              <BoxForm publish={publish} box={box} authorize={authorize} />}
            <Things match={match} authorize={authorize} /></div>)}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          <List className={styles.list}
            component="nav">
            <ListItem className={styles.listHeader}>
              {(() => active ? 'Thing details' : 'offline')()}
            </ListItem>
          </List>
          {!box ? <LinearProgress /> :
            <ThingForm boxId={box.index} publish={publishThing} afterCreate={() => setTab(0)} authorize={authorize} />}
        </TabContainer>
      </SwipeableViews>
    </div>
  </Paper>
}