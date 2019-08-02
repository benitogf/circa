import React, { useState } from 'react'
import { fetch } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Paper from '@material-ui/core/Paper'
import Divider from '@material-ui/core/Divider'
import { Link } from 'react-router-dom'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0
  },
  list: {
    padding: 0,
  },
  text: {
    overflowWrap: 'break-word',
    padding: '1em'
  }
}))

export default ({ authorize }) => {
  const styles = rootStyles()
  const [users, setUsers] = useState(null)

  const getUsers = async () => {
    if (!users) {
      try {
        const response = await fetch('users', authorize)
        setUsers(response)
      } catch (e) {
        console.error(e)
      }
    }
  }

  getUsers()

  return (!users) ? (<LinearProgress />) : (
    <Paper className={styles.root} elevation={0}>
      {(() => users.length !== 0 ? (
        <List className={styles.list} component="nav">
          {users.map((user) => [
            <ListItem key={user.account + 'list'}
              {...{ to: '/dashboard/users/' + user.account }}
              component={Link}
              button>
              <ListItemText className={styles.text}
                primary={user.account + ' - ' + user.name + ' - ' + user.role} />
            </ListItem>,
            <Divider key={user.account + 'divider'} />
          ]
          )}
        </List>
      ) : (
          <Typography className={styles.text} component="h2">
            There are no users yet.
          </Typography>
        ))()}
    </Paper>
  )
}