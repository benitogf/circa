import React from 'react'
import moment from 'moment'
import { Navigate, useMatch } from 'react-router-dom'
import { useSubscribe, usePublish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import AppBar from '@material-ui/core/AppBar'
import Icon from '@material-ui/core/Icon'
import PostForm from './PostForm'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    overflow: 'auto',
    flex: 1,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  list: {
    padding: 0,
  },
  listHeader: {
    background: theme.palette.primary.main,
    display: 'grid',
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  listDate: {
    fontSize: '0.8em',
    margin: '0 auto',
    maxWidth: 960,
    paddingLeft: props => props.mobile ? '' : 5
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  },
  blogPreviewLink: {
    position: 'absolute',
    right: 16,
    top: 12,
    textDecoration: 'none',
    color: 'inherit'
  }
}))

const Post = ({ authorize }) => {
  const match = useMatch('/dashboard/post/:id')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [post, socket] = useSubscribe('posts/' + match.params.id, authorize)
  const publish = usePublish('posts/' + match.params.id, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const styles = rootStyles({ active, lights, mobile })

  // this is not a post
  if (post && post.index === '') {
    return (<Navigate to={"/dashboard/posts"} />)
  }

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          {!post && <CircularProgress color="inherit" size={24} />}
          {(post && post.data) &&
            <ListItemText className={styles.listHeaderText} primary={post.data.name} />}
          <a className={styles.blogPreviewLink} title="blog preview" href="/blog" target="_blank"><Icon>art_track</Icon></a>
        </ListItem>
      </List>
    </AppBar>
    <List className={styles.list}
      component="nav">
      {post && post.created && <ListItem className={styles.listDate}>
        Created on: <DateDisplay time={post.created} />
      </ListItem>}
      {post && post.updated !== 0 && <ListItem className={styles.listDate}>
        Updated on: <DateDisplay time={post.updated} />
      </ListItem>}
    </List>
    {!post ? <LinearProgress /> : <PostForm publish={publish} post={post} authorize={authorize} />}
  </Paper>
}

export default Post