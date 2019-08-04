import React, { useState } from 'react'
import { unpublish } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Icon from '@material-ui/core/Icon'
import CircularProgress from '@material-ui/core/CircularProgress'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import { validate, clear, update } from '../forms'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  },
  warningContainer: {
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
    minWidth: 'unset',
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
    padding: '1em'
  }
}))

export default ({ boxId, publish, thing, afterCreate, authorize }) => {
  const account = window.localStorage.getItem('account')
  const lights = window.localStorage.getItem('lights') === 'on'
  // fields
  const [name, setName] = useState('')
  const [temperature, setTemperature] = useState('')

  // field flags
  const [editing, setEditing] = useState([])
  const [submitted, setSubmitted] = useState(false)

  // form flags
  const [fail, setFail] = useState('')
  const [loading, setLoading] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [updated, setUpdated] = useState(-1)
  const styles = rootStyles({ lights })

  const fields = {
    name: {
      error: () => name.trim().length < 5,
      value: name,
      set: setName,
      message: 'name must have have at least 5 characters'
    },
    temperature: {
      error: () => Number.isNaN(Number(temperature)) || temperature === '',
      value: temperature,
      set: setTemperature,
      message: 'temperature must be a number'
    }
  }
  const validation = validate(fields)

  if (!afterCreate && thing.updated !== updated) {
    update(fields, editing, thing)
    if (editing.length === 0) {
      setUpdated(thing.updated)
      setLoading(false)
    }
  }
  const onFocus = (key) => !afterCreate ? setEditing([...editing, key]) : null
  const onBlur = (e, key) => !afterCreate && (e.target.value === thing.data[key]) ? setEditing(editing.filter((field) => field !== key)) : null

  const remove = async () => {
    try {
      setLoading(true)
      await unpublish(`things/${boxId}/${account}/${thing.index}`, authorize)
    } catch (e) {
      setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
      setLoading(false)
    }
  }

  const send = async () => {
    setSubmitted(true)
    if (!validation.error) {
      try {
        setLoading(true)
        await publish({
          name: name.trim(),
          temperature: Number(temperature)
        })
        if (afterCreate) {
          clear(fields)
          setSubmitted(false)
          afterCreate()
          setLoading(false)
        } else {
          setEditing([])
        }
        setFail('')
      } catch (e) {
        setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
        setLoading(false)
      }
    }
  }

  return (<div className={styles.root}>
    <Dialog
      open={confirm}
      onClose={() => setConfirm(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Do you want to delete <b>{name}</b>?</DialogTitle>
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
    {(!afterCreate || submitted) && validation.error && (<div className={styles.warningContainer}>
      <SnackbarContent className={styles.warning}
        message={(Object.keys(validation.errors).map((error, key) => validation.errors[error] !== '' ? (
          <Typography key={key} component="p" className={styles.warningText}>
            <Icon className={styles.warningIcon}>warning</Icon> {validation.errors[error]}
          </Typography>) : null)
        )}
      />
    </div>)}
    <form className={styles.form}
      noValidate
      onSubmit={(e) => { e.preventDefault() }}
      autoComplete="off">
      <TextField
        required
        margin="dense"
        id="name"
        name="name"
        label="name"
        type="text"
        fullWidth
        variant="outlined"
        onFocus={() => onFocus('name')}
        onBlur={(e) => onBlur(e, 'name')}
        onChange={(e) => setName(e.target.value)}
        value={name}
        disabled={loading}
        error={(!afterCreate || submitted) && fields.name.error()}
      />
      <TextField
        required
        margin="dense"
        id="temperature"
        name="temperature"
        label="temperature"
        type="text"
        fullWidth
        variant="outlined"
        onFocus={() => onFocus('temperature')}
        onBlur={(e) => onBlur(e, 'temperature')}
        onChange={(e) => setTemperature(e.target.value)}
        value={temperature}
        disabled={loading}
        error={(!afterCreate || submitted) && fields.temperature.error()}
      />
      <div className={styles.formButtonWrapper}>
        {afterCreate && <Button className={styles.formSubmit}
          variant="contained"
          type="submit"
          color="primary"
          disabled={loading}
          onClick={send}>
          Create
        </Button>}
        {!afterCreate && <Button className={styles.formDelete}
          variant="contained"
          type="submit"
          color="primary"
          disabled={loading}
          onClick={() => setConfirm(true)}>
          Delete
        </Button>}
        {!afterCreate && <Button className={styles.formSubmit}
          variant="contained"
          type="submit"
          color="primary"
          disabled={loading}
          onClick={send}>
          Update
        </Button>}
        {loading && <CircularProgress size={24} className={styles.formProgress} />}
      </div>
    </form>
  </div>)
}