import React, { useState } from 'react'
import { fetch } from '../api'
// import { useNavigate, withRouter } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import Paper from '@material-ui/core/Paper'
import AppBar from '@material-ui/core/AppBar'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Table from '../table'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    overflow: 'auto',
    background: 'transparent',
    flex: 1,
    marginBottom: 57
  },
  list: {
    padding: 0
  },
  listHeader: {
    background: (props) => props.lights ? '#ececec' : '#3e3e3e',
    justifyContent: 'space-between'
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
  searchInput: {
    marginBottom: 4,
    marginTop: 4,
    marginRight: 20
  },
  searchInputRoot: {
    padding: '14px 12px 10px',
  },
  searchInputLabel: {
    transform: 'translate(14px, 14px) scale(1)',
  },
  empty: {
    padding: '1em',
    fontSize: '0.8em',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  }
}))

function glob(pattern, input) {
  var re = new RegExp(pattern.replace(/([.?+^$[\]\\(){}|/-])/g, "\\$1").replace(/\*/g, '.*'))
  return re.test(input)
}

const Storage = ({ authorize }) => {
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

  // table
  const storedSearch = window.localStorage.getItem('storage:search')
  const [search, setSearch] = useState(!storedSearch ? '' : storedSearch)
  const filteredKeys = keys ? keys.filter(key => glob(search, key)) : null

  return <Paper className={styles.root} elevation={0}>
    <AppBar position="sticky" color="default">
      <List className={styles.list} component="nav">
        <ListItem className={styles.listHeader}>
          <TextField
            id="search"
            label="Search"
            className={styles.searchInput}
            value={search}
            margin="normal"
            fullWidth
            autoFocus
            InputLabelProps={{
              classes: {
                outlined: styles.searchInputLabel
              }
            }}
            InputProps={{
              classes: {
                input: styles.searchInputRoot
              }
            }}
            onChange={(e) => {
              setSearch(e.target.value)
              window.localStorage.setItem('storage:search', e.target.value)
            }}
            variant="outlined"
          />
        </ListItem>
      </List>
      {!keys && (<LinearProgress />)}
    </AppBar>
    {(filteredKeys && filteredKeys.length > 0) && <Table top={67}
      pagination
      link={(row) => '/dashboard/storage/' + row['key'].replace(/\//gi, ':')}
      rows={filteredKeys.map(key => ({ key }))} />}
    {(filteredKeys && filteredKeys.length === 0) && <Typography className={styles.empty} component="p">...</Typography>}
  </Paper>
}

export default Storage