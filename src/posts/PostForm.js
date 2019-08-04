import React, { useState } from 'react'
import { unpublish, upload } from '../api'
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
import Quill from '../quill'
import _ from 'lodash'
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
    maxWidth: 960,
    margin: '0 auto',
    width: '-webkit-fill-available'
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

export default ({ publish, post, afterCreate, authorize }) => {
  const lights = window.localStorage.getItem('lights') === 'on'
  // fields
  const [name, setName] = useState('')
  const [content, setContent] = useState({ ops: [] })

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
      isEqual: (value) => value === post.data.name,
      value: name,
      set: setName,
      message: 'name must have have at least 5 characters'
    },
    content: {
      error: () => false,
      isEqual: (value) => _.isEqual(value.ops, post.data.content.ops),
      value: content,
      set: setContent,
      message: ''
    }
  }
  const validation = validate(fields)

  if (!afterCreate && post.updated !== updated) {
    update(fields, editing, post)
    if (editing.length === 0) {
      setUpdated(post.updated)
      setLoading(false)
    }
  }
  const onFocus = (key) => !afterCreate ? setEditing([...editing, key]) : null
  const onBlur = (e, key) => !afterCreate && fields[key].isEqual(e.target.value) ?
    setEditing(editing.filter((field) => field !== key)) : null

  const remove = async () => {
    try {
      setLoading(true)
      await unpublish('posts/' + post.index, authorize)
    } catch (e) {
      setFail(`Something went wrong (${e && e.response ? await e.response.text() : 'unable to connect to the server'})`)
      setLoading(false)
    }
  }

  const uploadImages = async op => {
    if (!op.insert || !op.insert.image || op.insert.image.indexOf('data:') === -1) {
      return op
    }
    const image = await upload(op.insert.image)
    return {
      ...op,
      insert: { image }
    }
  }

  const send = async () => {
    setSubmitted(true)
    if (!validation.error) {
      try {
        setLoading(true)
        const ops = await Promise.all(content.ops.map(uploadImages))
        await publish({
          name: name.trim(),
          content: {
            ops
          }
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
      <Quill
        value={content}
        disabled={loading}
        editing={editing.indexOf('content') !== -1}
        onFocus={() => onFocus('content')}
        onBlur={(e) => onBlur(e, 'content')}
        onChange={(value) => setContent(oldContent => Object.assign(oldContent, value))}
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