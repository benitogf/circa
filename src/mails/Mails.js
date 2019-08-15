import React from 'react'
import moment from 'moment'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Table from '../table'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  list: {
    padding: 0,
  },
  listHeader: {
    background: theme.palette.primary.main
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  empty: {
    padding: '1em',
    fontSize: '0.8em'
  }
}))

export default ({ authorize }) => {
  const [mails, socket] = useSubscribe('mails/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          <ListItemText className={styles.listHeaderText} primary={'Mails'} />
        </ListItem>
      </List>
      {(!mails || !active) && (<LinearProgress />)}
    </AppBar>
    {(mails && mails.length > 0) && <Table rows={mails.map(mail => ({
      email: mail.data.email,
      date: moment.unix(mail.created / 1000000000).format('DD/MM/YY'),
      index: mail.index
    }))}
      pagination
      hiddenFields={['index']}
      link={(row) => '/dashboard/mail/' + row['index']}
    />}
    {(mails && mails.length === 0) && <Typography className={styles.empty} component="p">The mail inbox is empty!</Typography>}
  </Paper>
}