import React from 'react'
import moment from 'moment'
import { Redirect } from 'react-router-dom'
import { useSubscribe, usePublish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import PostForm from './PostForm'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const Header = ({ post, active, styles }) => (<List className={styles.list}
  component="nav">
  <ListItem className={styles.listHeader}>
    {(() => active && post && post.data ? post.data.name : <CircularProgress size={24} />)()}
  </ListItem>
  {post && post.created && <ListItem className={styles.listDate}>
    Created on: <DateDisplay time={post.created} />
  </ListItem>}
  {post && post.updated !== 0 && <ListItem className={styles.listDate}>
    Updated on: <DateDisplay time={post.updated} />
  </ListItem>}
</List>)

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    background: 'transparent',
    overflow: 'auto',
    flex: 1
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    transition: 'background-color 0.5s ease',
    background: props => props.active ? theme.palette.primary.main : theme.palette.background.divider
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
  }
}))

export default ({ match, authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const [post, socket] = useSubscribe('posts/' + match.params.id, authorize)
  const publish = usePublish('posts/' + match.params.id, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const theme = useTheme()
  const mobile = useMediaQuery(theme.breakpoints.down('md'))
  const styles = rootStyles({ active, lights, mobile })

  // this is not a post
  if (post && post.index === '') {
    return (<Redirect to={"/dashboard/posts"} />)
  }

  return <Paper className={styles.root} elevation={1}>
    <Header active={active} post={post} styles={styles} />
    {!post ? <LinearProgress /> : <PostForm publish={publish} post={post} authorize={authorize} />}
  </Paper>
}