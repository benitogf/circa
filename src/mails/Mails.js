import React from 'react'
import { useSubscribe } from '../api'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
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
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

export default ({ authorize }) => {
  const [mails] = useSubscribe('mails/*', authorize)

  const styles = rootStyles()

  return (
    <Paper className={styles.root} elevation={0}>
      <AppBar position="sticky" color="default">
        <List className={styles.list} component="nav">
          <ListItem className={styles.listHeader}>
            <ListItemText className={styles.listHeaderText} primary={'Mails'} />
          </ListItem>
        </List>
      </AppBar>
      {(!mails) ? (<LinearProgress />) : (() => mails.length !== 0 ? (
        <List className={styles.list} component="nav">
          {mails.map((mail) => [
            <ListItem
              {...{ to: '/dashboard/mail/' + mail.index }}
              component={Link}
              key={mail.index + 'list'}
              button>
              <ListItemText className={styles.text}
                primary={mail.data.email + ':' + mail.data.phone + ':' + mail.data.message} />
            </ListItem>,
            <Divider key={mail.index + 'divider'} />
          ]
          )}
        </List>
      ) : (
          <Typography className={styles.text} component="h2">
            There are no mails yet.
          </Typography>
        ))()}
    </Paper>
  )
}