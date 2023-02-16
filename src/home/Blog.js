import React from 'react'
import { useSubscribe } from '../api'
import Paper from '@material-ui/core/Paper'
import LinearProgress from '@material-ui/core/LinearProgress'
import Quill from '../quill'
import rootStyles from '../styles/Blog';


const RenderLineProgress = ({post, active}) => {
  return (!post || !active) && <LinearProgress />;
};


const RenderMessage = ({posts, styles}) => {
  const isPosts = posts && posts.length === 0;
  const CONTENT_MESSAGE = "There's no content available yet";
  return isPosts && <p className={styles.empty}>{CONTENT_MESSAGE}</p>
};


const RenderView = ({posts, styles}) => {
  const isPosts = posts && posts.length !== 0;
  
  return (
    isPosts && posts.map((post, index) => {
      return <Paper key={index} elevation={0}>
        <h4 className={styles.postTitle}>{post.data.name}</h4>
        <Quill value={post.data.content} readOnly={true} disabled={true} />
      </Paper>
    })
  )
};


const Blog = ({ status }) => {
  const [posts, socket] = useSubscribe('blog')
  const active = socket && socket.readyState === WebSocket.OPEN
  const styles = rootStyles({ status })

  return (
    <Paper className={styles.root} elevation={0}>
      <RenderLineProgress {...posts} {...active} />
      <Paper className={styles.container} elevation={0}>
        <RenderMessage {...posts} {...styles} />
        <RenderView {...posts} {...styles} />
      </Paper>
    </Paper>
  );
};

export default Blog;
