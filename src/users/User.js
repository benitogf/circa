import React, { useState } from 'react'
import { Redirect } from 'react-router-dom'
import { fetch, usePublish, unpublish } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import LinearProgress from '@material-ui/core/LinearProgress'
import Paper from '@material-ui/core/Paper'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Icon from '@material-ui/core/Icon'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import AppBar from '@material-ui/core/AppBar'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemText from '@material-ui/core/ListItemText'
import { validate, regex, clear, update } from '../forms'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  formContainer: {
    margin: '0 auto',
    maxWidth: 728
  },
  fail: {
    backgroundColor: 'brown',
    maxWidth: 'unset',
    marginBottom: 10,
    margin: '1em'
  },
  warning: {
    backgroundColor: '#f1932c',
    maxWidth: 'unset',
    marginBottom: 10,
    margin: '1em'
  },
  warningText: {
    color: 'white',
    fontSize: '0.96em',
    lineHeight: 2,
    fontWeight: 100
  },
  warningIcon: {
    verticalAlign: 'bottom',
    color: '#f0cf81'
  },
  form: {
    padding: '1em',
    maxWidth: 700,
    margin: '0 auto'
  },
  formSubmit: {
    marginTop: 20,
    marginLeft: 10
  },
  formDelete: {
    marginTop: 20,
    background: theme.palette.error.main
  },
  formButtonWrapper: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  formProgress: {
    position: 'absolute',
    top: '67%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  },
  text: {
    overflowWrap: 'break-word',
    padding: '2em'
  },
  list: {
    padding: 0,
  },
  listHeader: {
    background: theme.palette.primary.main,
    minHeight: 50,
  },
  listHeaderText: {
    overflowWrap: 'break-word'
  },
}))

const User = ({ match, authorize }) => {
  const [fetched, setFetched] = useState(null)
  const [empty, setEmpty] = useState(false)
  const publish = usePublish('user/' + match.params.id, authorize)

  const [account, setAccount] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('')

  const [confirm, setConfirm] = useState(false)
  const [fail, setFail] = useState('')
  const [loading, setLoading] = useState(false)
  const lights = window.localStorage.getItem('lights') === 'on'
  const styles = rootStyles({ lights })
  const fields = {
    account: {
      error: () => false,
      value: account,
      set: setAccount
    },
    name: {
      error: () => name.trim().length === 0,
      message: 'name cannot be empty',
      value: name,
      set: setName
    },
    role: {
      error: () => role.trim().length === 0,
      message: 'role cannot be empty',
      value: role,
      set: setRole
    },
    email: {
      error: () => !regex.email.test(email),
      message: 'invalid email address',
      value: email,
      set: setEmail
    },
    phone: {
      error: () => !regex.phone.test(phone),
      message: 'phone cannot contain special characters and character count must be between 6 and 15',
      value: phone,
      set: setPhone
    }
  }

  const validation = validate(fields)

  const getUsers = async () => {
    if (!fetched) {
      setFetched(true)
      try {
        const data = await fetch('user/' + match.params.id, authorize)
        setTimeout(() => {
          update(fields, [], { data })
        }, 400)
      } catch (e) {
        console.error(e)
        setEmpty(true)
      }
    }
  }

  const send = async () => {
    if (!validation.error) {
      try {
        setLoading(true)
        await publish({
          name: name.trim(),
          email,
          role: role.trim(),
          phone
        })
        clear(fields)
        setFetched(false)
        setLoading(false)
      } catch (e) {
        setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
        setLoading(false)
      }
    }
  }
  const remove = async () => {
    try {
      setLoading(true)
      await unpublish('user/' + match.params.id, authorize)
      setEmpty(true)
    } catch (e) {
      setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
      setLoading(false)
    }
  }

  getUsers()

  if (empty) {
    return (<Redirect to="/dashboard/users" />)
  }

  return [
    <Dialog
      key="dialog"
      open={confirm}
      onClose={() => setConfirm(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Do you want to delete the user <b>{name}</b>?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setConfirm(false)} color="primary">
          No
          </Button>
        <Button onClick={remove}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>,
    <Paper key="form" className={styles.root} elevation={0}>
      <AppBar position="sticky" color="default">
        <List className={styles.list} component="nav">
          <ListItem className={styles.listHeader}>
            {(() => account ?
              <ListItemText className={styles.listHeaderText} primary={account} /> :
              <CircularProgress color="inherit" size={24} />)()}
          </ListItem>
        </List>
      </AppBar>
      {(!account) ? (<LinearProgress />) :
        <div className={styles.formContainer}>
          {fail && !loading && (
            <SnackbarContent className={styles.fail}
              message={(
                <Typography component="p" className={styles.warningText}>
                  <Icon className={styles.warningIcon}>warning</Icon> {fail}
                </Typography>
              )}
            />
          )}
          {validation.error && (
            <SnackbarContent className={styles.warning}
              message={(Object.keys(validation.errors).map((error, key) => validation.errors[error] !== '' ? (
                <Typography key={key} component="p" className={styles.warningText}>
                  <Icon className={styles.warningIcon}>warning</Icon> {validation.errors[error]}
                </Typography>) : null)
              )}
            />
          )}
          <form className={styles.form}
            noValidate
            onSubmit={(e) => { e.preventDefault() }}
            autoComplete="off">
            <TextField
              required
              margin="dense"
              id="name"
              label="fullname"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) => setName(e.target.value)}
              value={name}
              disabled={loading}
              error={fields.name.error()}
            />
            <TextField
              required
              margin="dense"
              id="role"
              label="role"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) => setRole(e.target.value)}
              value={role}
              disabled={loading || account === 'root'}
              error={fields.role.error()}
            />
            <TextField
              required
              margin="dense"
              id="email"
              label="email"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              disabled={loading}
              error={fields.email.error()}
            />
            <TextField
              required
              margin="dense"
              id="phone"
              label="phone"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) => setPhone(e.target.value)}
              value={phone}
              disabled={loading}
              error={fields.phone.error()}
            />
            <div className={styles.formButtonWrapper}>
              {account !== 'root' && <Button className={styles.formDelete}
                variant="contained"
                type="submit"
                color="primary"
                disabled={loading}
                onClick={() => setConfirm(true)}>
                Delete
              </Button>}
              <Button className={styles.formSubmit}
                variant="contained"
                type="submit"
                color="primary"
                disabled={loading}
                onClick={send}>
                Update
            </Button>
              {loading && <CircularProgress size={24} className={styles.formProgress} />}
            </div>
          </form>
        </div>}
    </Paper>
  ]
}

export default User