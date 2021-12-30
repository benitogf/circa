import React, { useState } from 'react'
import moment from 'moment'
import { useSubscribe, usePublish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import SwipeableViews from 'react-swipeable-views'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import BoxForm from './BoxForm'
import Table from '../table'

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
    background: theme.palette.primary.main
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  listItem: {
    display: 'grid',
    padding: 0,
  },
  empty: {
    padding: '1em',
    fontSize: '0.8em'
  }
}))

const Boxes = ({ authorize }) => {
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

  const boxesMap = boxes ? boxes.map(box => ({
    name: box.data.name,
    created: moment.unix(box.created / 1000000000).format('DD/MM/YY'),
    updated: box.updated ? moment.unix(box.updated / 1000000000).format('DD/MM/YY') : '',
    index: box.index
  })) : null

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
        <List className={styles.list}
          component="nav">
          <ListItem className={styles.listHeader}>
            {(() => tab === 0 ?
              <ListItemText className={styles.listHeaderText} primary={'Available boxes'} /> :
              <ListItemText className={styles.listHeaderText} primary={'Box details'} />)()}
          </ListItem>
        </List>
        {(!boxes || !active) && <LinearProgress />}
      </AppBar>,
      <SwipeableViews key="boxesTabs"
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
          {(boxesMap && boxesMap.length > 0) && <Table rows={boxesMap}
            pagination
            hiddenMobileFields={['created', 'updated']}
            hiddenFields={['index']}
            link={(row) => '/dashboard/box/' + row['index']} />}
          {(boxesMap && boxesMap.length === 0) && <Typography className={styles.empty} component="p">There are no boxes yet</Typography>}
        </TabContainer>
        <TabContainer dir={theme.direction}>
          <BoxForm publish={publish} afterCreate={() => setTab(0)} />
        </TabContainer>
      </SwipeableViews>
    ] : [(boxesMap && boxesMap.length > 0) && <Table key="boxesTable"
      rows={boxesMap}
      pagination
      hiddenMobileFields={['created', 'updated']}
      hiddenFields={['index']}
      link={(row) => '/dashboard/box/' + row['index']} />,
    (boxesMap && boxesMap.length === 0) && <Typography key="boxesEmpty" className={styles.empty} component="p">There are no boxes yet</Typography>
      ])()}
  </Paper>
}

export default Boxes