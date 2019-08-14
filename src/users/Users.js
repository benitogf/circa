import React, { useState } from 'react'
import { fetch } from '../api'
import { Link } from 'react-router-dom'
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
  },
  list: {
    padding: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6',
  },
  listHeader: {
    background: theme.palette.primary.main,
  },
  listHeaderText: {
    overflowWrap: 'break-word',
  },
  listItem: {
    display: 'grid',
    padding: 0,
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em',
  }
}))

export default ({ authorize }) => {
  const [users, setUsers] = useState(null)
  const [fetched, setFetched] = useState(null)
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })

  const getUsers = async () => {
    if (!fetched) {
      setFetched(true)
      try {
        const response = await fetch('users', authorize)
        setTimeout(() => {
          setUsers(response)
        }, 400)
      } catch (e) {
        console.error(e)
      }
    }
  }

  getUsers()

  return (
    <Paper className={styles.root} elevation={0}>
      <AppBar position="sticky" color="default">
        <List className={styles.list} component="nav">
          <ListItem className={styles.listHeader}>
            <ListItemText className={styles.listHeaderText} primary={'Users'} />
          </ListItem>
        </List>
      </AppBar>
      {(!users) ? (<LinearProgress />) : users.length !== 0 &&
        <List className={styles.list} component="nav">
          {users.map((user) => [
            <ListItem className={styles.listItem}
              key={user.account + 'list'}
              {...{ to: '/dashboard/user/' + user.account }}
              component={Link}
              button>
              <ListItemText className={styles.text}
                primary={user.account + ' - ' + user.name + ' - ' + user.role} />
            </ListItem>,
            <Divider key={user.account + 'divider'} />
          ]
          )}
        </List>}
    </Paper>
  )
}