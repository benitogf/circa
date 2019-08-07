import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Divider from '@material-ui/core/Divider'
import { Link } from 'react-router-dom'

const rootStyles = makeStyles((theme) => ({
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  listHeader: {
    transition: 'background-color 0.5s ease',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    background: props => props.active ? theme.palette.secondary.main : theme.palette.divider
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

export default ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [things, socket] = useSubscribe('things/' + match.params.id + '/' + account + '/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const styles = rootStyles({ active, lights })

  return <List className={styles.list} component="nav">
    <ListItem className={styles.listHeader}>
      Things
    </ListItem>
    {(!things || !active) && (<LinearProgress />)}
    {(things && things.length !== 0) && things.map((thing) => [
      <ListItem disableTouchRipple
        {...{ to: '/dashboard/box/' + match.params.id + '/thing/' + thing.index }}
        component={Link}
        key={thing.index + 'list'}
        button>
        <ListItemText className={styles.text}
          primary={thing.data.name} />
      </ListItem>,
      <Divider key={thing.index + 'divider'} />
    ])}
    {(things && things.length === 0) && <ListItem>There are no things on this box yet</ListItem>}
  </List>
}