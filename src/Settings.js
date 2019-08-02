import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogTitle from '@material-ui/core/DialogTitle'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Switch from '@material-ui/core/Switch'

const rootStyles = makeStyles((theme) => ({
  root: {
    maxWidth: 700,
    margin: '0 auto',
    width: '100%',
    flex: '1 1',
    display: 'flex',
    flexDirection: 'column'
  },
  paper: {
    margin: '10px 0'
  },
  logout: {
    margin: '10px 0',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  logoutButton: {
    background: '#e64236',
    color: 'white'
  },
  admin: {
    backgroundColor: 'rgb(11, 181, 0)',
    maxWidth: 'unset',
  },
  user: {
    backgroundColor: 'rgb(36, 109, 171)',
    maxWidth: 'unset'
  },
  text: {
    color: 'white'
  },
  icon: {
    verticalAlign: "bottom",
    color: "#f0cf81"
  }
}))

export default ({ dispatch }) => {
  const [open, setOpen] = useState(false)
  const [lights, setLights] = useState(window.localStorage.getItem('lights') === 'on')
  const account = window.localStorage.getItem('account')

  const styles = rootStyles()

  function handleChange(checked) {
    window.localStorage.setItem('lights', checked ? 'on' : 'off')
    dispatch({ type: 'lights', data: checked })
    setLights(checked)
  }

  return (<div className={styles.root}>
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Log out of <b>{account}</b> account?</DialogTitle>
      <DialogActions>
        <Button onClick={() => setOpen(false)} color="primary">
          No
          </Button>
        <Button variant="contained"
          component={Link}
          {...{ to: '/logout' }}>
          Yes
        </Button>
      </DialogActions>
    </Dialog>
    <Paper className={styles.paper} elevation={1}>
      <FormControlLabel
        value="Lights"
        control={<Switch
          checked={lights}
          onChange={(e) => handleChange(e.target.checked)}
          inputProps={{ 'aria-label': 'lights checkbox' }}
        />}
        label="Theme lights"
        labelPlacement="start"
      />
    </Paper>
    <Paper className={styles.logout} elevation={0}>
      <Button className={styles.logoutButton}
        variant="contained"
        onClick={() => setOpen(true)}>
        Logout
    </Button>
    </Paper></div>)
}