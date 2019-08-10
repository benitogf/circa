import React, { useState } from 'react'
import moment from 'moment'
import { useSubscribe, unpublish } from '../api'
import { Redirect } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Icon from '@material-ui/core/Icon'

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0
  },
  formButtonWrapper: {
    display: 'flex',
    position: 'sticky',
    justifyContent: 'flex-end',
    bottom: 0,
    paddingBottom: 6,
    background: '#d0d1d2',
    paddingRight: 6,
    border: '1px solid',
    borderColor: '#ccc'
  },
  listItem: {
    display: 'grid',
  },
  formDelete: {
    marginTop: 6,
    background: theme.palette.error.main
  },
  text: {
    overflowWrap: 'break-word',
    padding: '2em'
  }
}))

export default ({ match, authorize }) => {
  const id = match.params.id.replace(/:/gi, '/')
  const [key] = useSubscribe(id, authorize)
  const styles = rootStyles()
  const [confirm, setConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fail, setFail] = useState('')

  const remove = async () => {
    try {
      setLoading(true)
      await unpublish(id, authorize)
    } catch (e) {
      setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
      setLoading(false)
    }
  }

  if (!key) {
    return <LinearProgress />
  }

  if (key.created === 0) {
    return <Redirect to={"/dashboard/storage"} />
  }

  return (!key) ? (<LinearProgress />) : (
    <Paper className={styles.root} elevation={0}>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Do you want to delete <b>{id}</b>?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setConfirm(false)} color="primary">
            No
          </Button>
          <Button onClick={remove}>
            Yes
        </Button>
        </DialogActions>
      </Dialog>
      {fail && !loading && (<div className={styles.warningContainer}>
        <SnackbarContent className={styles.fail}
          message={(
            <Typography component="p" className={styles.warningText}>
              <Icon className={styles.warningIcon}>warning</Icon> {fail}
            </Typography>
          )}
        />
      </div>)}
      <List className={styles.listDates}
        component="nav">
        {key.created && <ListItem className={styles.listDate}>
          Created on: <DateDisplay time={key.created} />
        </ListItem>}
        {key.updated !== 0 && <ListItem className={styles.listDate}>
          Updated on: <DateDisplay time={key.updated} />
        </ListItem>}
      </List>
      <ListItem className={styles.listItem}>
        <ListItemText className={styles.text}
          primary={<code>{JSON.stringify(key.data)}</code>} />
      </ListItem>
      <div className={styles.formButtonWrapper}>
        <Button className={styles.formDelete}
          variant="contained"
          type="submit"
          color="primary"
          disabled={loading}
          onClick={() => setConfirm(true)}>
          Delete
        </Button>
      </div>
    </Paper>
  )
}