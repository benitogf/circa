import React, { useState } from 'react'
import moment from 'moment'
import { useSubscribe, usePublish } from '../api'
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
import Table from '../table'
import PostForm from './PostForm'

const TabContainer = ({ children, dir, className }) => (<Typography component="div"
  className={className}
  dir={dir}>
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
  postsList: {
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflow: 'auto'
  },
  tabRoot: {
    display: 'flex',
    flex: '1 1'
  },
  tabContainerForm: {
    display: 'flex',
    height: '100%',
  },
  tabContainerList: {},
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listItem: {
    display: 'grid',
    padding: 0,
  },
  listHeader: {
    background: theme.palette.primary.main
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  empty: {
    padding: '1em'
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

const mapPosts = (posts) => posts.map(post => ({
  name: post.data.name,
  created: moment.unix(post.created / 1000000000).format('DD/MM/YY'),
  updated: post.updated ? moment.unix(post.updated / 1000000000).format('DD/MM/YY') : '',
  index: post.index
}))


export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  // socket
  const [posts, socket] = useSubscribe('posts/*', authorize)
  const publish = usePublish('posts/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN

  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('xs'))
  // const tablet = useMediaQuery(theme.breakpoints.between('s', 'md'))
  // const laptop = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const styles = rootStyles({ lights })

  // tabs
  const [tab, setTab] = useState(0)
  function changeTab(index) {
    setTab(index)
  }

  // table
  const hiddenFields = ['index']
  const hiddenMobileFields = ['created', 'updated']

  const postsMap = posts ? mapPosts(posts) : null

  return <Paper className={styles.root} elevation={0}>
    <div className={styles.root}>
      <AppBar position="sticky" color="default">
        <Tabs
          value={tab}
          onChange={(_e, index) => changeTab(index)}
          indicatorColor="primary"
          textColor="primary"
          variant={mobile ? 'fullWidth' : 'standard'}
        >
          <Tab disableTouchRipple label="Posts" />
          <Tab disableTouchRipple label="New post" />
        </Tabs>
        <List className={styles.list}
          component="nav">
          <ListItem className={styles.listHeader}>
            {(() => tab === 0 ?
              <ListItemText className={styles.listHeaderText} primary={'Available posts'} /> :
              <ListItemText className={styles.listHeaderText} primary={'Post details'} />)()}
          </ListItem>
        </List>
        {(!posts || !active) && <LinearProgress />}
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
        <TabContainer className={styles.tabContainerList} dir={theme.direction}>
          {postsMap && <Table rows={postsMap}
            link={(row) => '/dashboard/post/' + row['index']}
            pagination
            hiddenFields={hiddenFields}
            hiddenMobileFields={hiddenMobileFields} />}
        </TabContainer>
        <TabContainer className={styles.tabContainerForm} dir={theme.direction}>
          <PostForm publish={publish} afterCreate={() => setTab(0)} />
        </TabContainer>
      </SwipeableViews>
    </div>
  </Paper>
}