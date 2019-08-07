import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import AppBar from '@material-ui/core/AppBar'

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
    background: theme.palette.primary.main
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

export default ({ authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  const [things, socket] = useSubscribe('things/*/*/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const loaded = things !== null

  const styles = rootStyles({ active, loaded, lights })

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          Things
      </ListItem>
      </List>
    </AppBar>

    <List className={styles.list} component="nav">
      {!things ? (<LinearProgress />) : things.length !== 0 ? things.map((thing) => [
        <ListItem key={thing.index + 'list'}>
          <ListItemText className={styles.text}
            primary={thing.data.name} />
        </ListItem>,
        <Divider key={thing.index + 'divider'} />
      ]
      ) : <ListItem>There are no things on any box yet</ListItem>}
    </List>
  </Paper>
}