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
  const styles = rootStyles({ lights })
  const [keys, setKeys] = useState(null)
  const [fetched, setFetched] = useState(null)

  const getKeys = async () => {
    if (!fetched) {
      setFetched(true)
      try {
        const response = await fetch('', authorize)
        setTimeout(() => {
          setKeys(response.keys)
        }, 400)
      } catch (e) {
        console.error(e)
      }
    }
  }

  getKeys()


  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          Things
      </ListItem>
      </List>
    </AppBar>

    <List className={styles.list} component="nav">
      {!keys ? (<LinearProgress />) : keys.length !== 0 ? keys.map((key) => [
        <ListItem {...{ to: '/dashboard/storage/' + key.replace(/\//gi, ':') }}
          component={Link}
          button
          key={key + 'list'}>
          <ListItemText className={styles.text}
            primary={key} />
        </ListItem>,
        <Divider key={key + 'divider'} />
      ]
      ) : <ListItem>There are no keys on any box yet</ListItem>}
    </List>
  </Paper>
}