import React, { useState } from 'react'
import { useSubscribe, usePublish } from '../api'
import { Link } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import SwipeableViews from 'react-swipeable-views'
import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import Divider from '@material-ui/core/Divider'
import BoxForm from './BoxForm'

const TabContainer = ({ children, dir }) => (<Typography component="div" dir={dir}>
  {children}
</Typography>)

const BoxesList = ({ active, boxes, styles }) =>
  <List className={styles.list}
    component="nav">
    <ListItem className={styles.listHeader}>
      {(() => active ? 'Available boxes' : 'offline')()}
    </ListItem>
    {!boxes ? <LinearProgress /> : boxes.length === 0 ? <Typography className={styles.empty} component="h2">
      There are no boxes yet.
      </Typography> : boxes.map((box) => [
        <ListItem disableTouchRipple
          {...{ to: '/dashboard/box/' + box.index }}
          component={Link}
          key={box.index + 'list'}
          button>
          <ListItemText className={styles.text}
            primary={box.data.name} />
        </ListItem>,
        <Divider key={box.index + 'divider'} />
      ]
      )}
  </List>

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    background: 'transparent',
    overflowY: 'auto',
  },
  tabRoot: {
    display: 'flex',
    flex: '1 1'
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    transition: 'background-color 0.5s ease',
    background: props => props.active ? theme.palette.primary.main : '#f1932c'
  },
  empty: {
    padding: '1em'
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

const tabsContainerStyle = {
  flex: '1 1 0%'
}

export default ({ authorize }) => {
  const role = window.localStorage.getItem('role')
  const lights = window.localStorage.getItem('lights') === 'on'
  // socket
  const [boxes, socket] = useSubscribe('boxes/*', authorize)
  const publish = usePublish('boxes/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN

  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('sm'))
  const styles = rootStyles({ active, lights })

  // tabs
  const [tab, setTab] = useState(0)

  function changeTab(index) {
    setTab(index)
  }

  return <Paper className={styles.root} elevation={0}>
    {(() => role === 'admin' || role === 'root' ? [
      <AppBar key="boxesTabsHeader" position="sticky" color="default">
        <Tabs
          value={tab}
          onChange={(_e, index) => changeTab(index)}
          indicatorColor="primary"
          textColor="primary"
          variant={mobile ? 'fullWidth' : 'standard'}
        >
          <Tab disableTouchRipple label="Boxes" />
          <Tab disableTouchRipple label="New box" />
        </Tabs>
      </AppBar>,
      <SwipeableViews key="boxesTabs"
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={tab}
        onChangeIndex={changeTab}
        containerStyle={tabsContainerStyle}
        className={styles.tabRoot}
      >
        <TabContainer dir={theme.direction}>
          <BoxesList active={active} boxes={boxes} styles={styles} />
        </TabContainer>
        <TabContainer dir={theme.direction}>
          <List className={styles.list}
            component="nav">
            <ListItem className={styles.listHeader}>
              {(() => active ? 'Box details' : 'offline')()}
            </ListItem>
          </List>
          <BoxForm publish={publish} afterCreate={() => setTab(0)} />
        </TabContainer>
      </SwipeableViews>
    ] : <BoxesList active={active} boxes={boxes} styles={styles} />)()}
  </Paper>
}