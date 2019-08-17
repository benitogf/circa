import React from 'react'
import moment from 'moment'
import { Redirect } from 'react-router-dom'
import { useSubscribe, usePublish } from '../../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import CircularProgress from '@material-ui/core/CircularProgress'
import Paper from '@material-ui/core/Paper'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import ThingForm from './ThingForm'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    background: 'transparent'
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
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
    maxWidth: 445
  },
}))

export default ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [thing, socket] = useSubscribe('things/' + match.params.boxId + '/' + account + '/' + match.params.id, authorize)
  const publish = usePublish('things/' + match.params.boxId + '/' + account + '/' + match.params.id, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const styles = rootStyles({ active, lights })

  // this is not a box
  if (thing && thing.index === '') {
    return (<Redirect to={"/dashboard/box/" + match.params.boxId} />)
  }

  return <Paper className={styles.root} elevation={0}>
    <List className={styles.list}
      component="nav">
      <ListItem className={styles.listHeader}>
        {(() => thing && thing.data ?
          <ListItemText className={styles.listHeaderText} primary={thing.data.name} /> :
          <CircularProgress color="inherit" size={24} className={styles.formProgress} />)()}
      </ListItem>
      {(!thing || !active) && <LinearProgress />}
      {thing && thing.created && <ListItem className={styles.listDate}>
        Created on: <DateDisplay time={thing.created} />
      </ListItem>}
      {thing && thing.updated !== 0 && <ListItem className={styles.listDate}>
        Updated on: <DateDisplay time={thing.updated} />
      </ListItem>}
    </List>
    {thing && <ThingForm boxId={match.params.boxId} publish={publish} thing={thing} authorize={authorize} />}
  </Paper>
}