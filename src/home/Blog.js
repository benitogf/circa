import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import Quill from '../quill'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    background: 'transparent',
    overflowY: 'auto',
    marginTop: props => props.status === 'authorized' ? 0 : 88
  },
  container: {
    [theme.breakpoints.up('sm')]: {
      margin: '0 auto',
    },
    maxWidth: 960,
    borderRadius: 0,
    background: 'transparent',
  },
  postTitle: {
    margin: '15px 12px',
    paddingTop: 10,
    textTransform: 'capitalize',
  },
  empty: {
    padding: 15,
    background: theme.palette.background.paper,
    borderRadius: 5
  }
}))

const Blog = ({ status }) => {
  const [posts, socket] = useSubscribe('blog')
  const active = socket && socket.readyState === WebSocket.OPEN
  const styles = rootStyles({ status })

  return <Paper className={styles.root} elevation={0}>
    {(!posts || !active) && <LinearProgress />}
    <Paper className={styles.container} elevation={0}>
      {(posts && posts.length === 0) && <p className={styles.empty}>There's no content available yet</p>}
      {(posts && posts.length !== 0) && posts.map((post, index) => {
        return <Paper key={index} elevation={0}>
          <h4 className={styles.postTitle}>{post.data.name}</h4>
          <Quill
            value={post.data.content}
            readOnly={true}
            disabled={true}
          />
        </Paper>
      })}
    </Paper>
  </Paper>
}

export default Blog