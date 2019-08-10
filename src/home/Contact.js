import React, { useState } from 'react'
import { publish } from '../api'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Icon from '@material-ui/core/Icon'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import CircularProgress from '@material-ui/core/CircularProgress'

const bodyStyles = makeStyles(theme => ({
  root: {
    marginTop: props => props.mobile ? 0 : '1em'
  },
  title: {
    marginTop: props => props.mobile ? '1em' : '2em',
    marginBottom: '2em',
    textAlign: 'center',
    fontSize: '1.4em',
    fontWeight: '100'
  },
  paper: {
    padding: theme.spacing(2),
    textAlign: 'center',
    background: theme.palette.primary.offset,
    borderRadius: '4px 4px 0 0'
  },
  card: {
    maxWidth: 940,
    margin: '20px auto'
  },
  cardTitle: {
    background: theme.palette.secondary.main
  },
  cardTitleText: {
    fontSize: props => props.mobile ? '1em' : '1.4em'
  },
  warning: {
    backgroundColor: '#f1932c',
    maxWidth: 'unset',
    marginBottom: 22
  },
  warningText: {
    color: 'white',
    fontSize: '0.96em',
    lineHeight: 2,
    fontWeight: 100
  },
  warningIcon: {
    verticalAlign: "bottom",
    color: "#f0cf81"
  },
  formField: {
    maxWidth: 347,
    display: 'block'
  },
  formSubmit: {
    marginTop: 20,
    width: props => props.mobile ? '100%' : '',
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
  icon: {
    fontSize: '4em',
    color: theme.palette.primary.main,
    animation: 'skew 3s infinite'
  },
}))

export default () => {
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [sent, setSent] = useState('')
  const [loading, setLoading] = useState(false)

  const body = bodyStyles({ mobile: useMediaQuery(useTheme().breakpoints.down('xs')) })

  const send = async () => {
    let error = false
    if (email === '' || email.length < 5) {
      error = true
      setEmail('')
    }
    if (phone === '' || phone.length < 5) {
      error = true
      setPhone('')
    }
    if (message === '' || message.length < 2) {
      error = true
      setMessage('')
    }
    if (error) {
      setError('You are missing something there, please check your contact information and be sure to say at least "hi" in your message :)')
      return
    }

    try {
      setLoading(true)
      await publish('mails/*', {
        email,
        phone,
        message
      })
      setError('')
      setSent(`we appreciate your interest and will get back to you prompty through ${email} or ${phone}`)
      setLoading(false)
    } catch (e) {
      console.log('nope', e)
      setError('Our server could be offline or your connection failing, please try again')
      setLoading(false)
    }
  }

  return (sent ? (
    <Typography className={body.title} component="h2">
      <b>Thanks!</b> {sent}
    </Typography>
  ) : (<div className={body.root}>
    <Card className={body.card}>
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar className={body.cardTitle} variant="dense">
          <Typography className={body.cardTitleText} component="h4">
            <b>contact</b> us, how can we <b>help</b> you?
          </Typography>
        </Toolbar>
      </AppBar>
      <CardContent>
        {error && !loading && (
          <SnackbarContent className={body.warning}
            message={(
              <Typography component="p" className={body.warningText}>
                <Icon className={body.warningIcon}>warning</Icon> {error}
              </Typography>
            )}
          />
        )}
        <form onSubmit={(e) => { e.preventDefault() }}
          noValidate
          autoComplete="off">
          <TextField
            className={body.formField}
            required
            margin="dense"
            id="email"
            name="email"
            label="email"
            type="text"
            fullWidth
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            disabled={loading}
            error={email === '' && error !== ''}
          />
          <TextField
            className={body.formField}
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
            error={phone === '' && error !== ''}
          />
          <TextField
            required
            multiline
            rows="5"
            rowsMax="20"
            margin="dense"
            id="message"
            label="message"
            type="text"
            fullWidth
            variant="outlined"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            disabled={loading}
            error={message === '' && error !== ''}
          />
          <div className={body.formButtonWrapper}>
            <Button className={body.formSubmit}
              variant="contained"
              type="submit"
              color="primary"
              disabled={loading}
              onClick={send}>
              Send
                </Button>
            {loading && <CircularProgress size={24} className={body.formProgress} />}
          </div>
        </form>
      </CardContent>
    </Card>
  </div>))
}