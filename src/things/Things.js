import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import { Link } from 'react-router-dom'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    background: 'transparent',
    // transform: props => props.loaded ? 'none' : 'transform: translateX(-103%)',
    // transition: props => props.loaded ? '' : 'all 130ms ease-in',
    // willChange: 'transform'
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    transition: 'background-color 0.5s ease',
    background: props => props.active ? props.lights ? '#dadada' : '#717171' : '#f1932c'
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

export default ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [things, socket] = useSubscribe('/mo/things/' + match.params.id + '/' + account, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const loaded = things !== null

  const styles = rootStyles({ active, loaded, lights })

  return <Paper className={styles.root} elevation={0}>
    <List className={styles.list} component="nav">
      <ListItem className={styles.listHeader}>
        {active ? 'Things' : 'offline'}
      </ListItem>
      {!things ? (<LinearProgress />) : things.length !== 0 ? things.map((thing) => [
        <ListItem disableTouchRipple
          {...{ to: '/dashboard/box/' + match.params.id + '/thing/' + thing.index }}
          component={Link}
          key={thing.index + 'list'}
          button>
          <ListItemText className={styles.text}
            primary={thing.data.name} />
        </ListItem>,
        <Divider key={thing.index + 'divider'} />
      ]
      ) : <ListItem>There are no things on this box yet</ListItem>}
    </List>
  </Paper>
}