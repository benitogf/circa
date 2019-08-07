import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import Icon from '@material-ui/core/Icon'

const rootStyles = makeStyles((theme) => ({
  paper: {
    borderRadius: 0
  },
  admin: {
    backgroundColor: 'rgb(11, 181, 0)',
    maxWidth: 'unset',
    borderRadius: 0,
  },
  user: {
    backgroundColor: 'rgb(36, 109, 171)',
    maxWidth: 'unset',
    borderRadius: 0,
  },
  text: {
    color: 'white'
  },
  icon: {
    verticalAlign: "bottom",
    color: "#f0cf81"
  }
}))

export default () => {
  const styles = rootStyles()
  const account = window.localStorage.getItem('account')
  const role = window.localStorage.getItem('role')
  return (<Paper className={styles.paper} elevation={1}>
    {(() => role === 'admin' ? (<SnackbarContent className={styles.admin}
      message={(
        <Typography component="p" className={styles.text}>
          <Icon className={styles.icon}>lock_open</Icon> Welcome {account}.
      </Typography>
      )}
    />) : (<SnackbarContent className={styles.user}
      message={(
        <Typography component="p" className={styles.text}>
          <Icon className={styles.icon}>lock_open</Icon> Welcome {account}.
      </Typography>
      )}
    />))()}
  </Paper>)
}