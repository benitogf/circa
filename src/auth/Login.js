import React, { useState } from 'react'
import { Redirect, Link } from 'react-router-dom'
import { api } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Typography from '@material-ui/core/Typography'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Icon from '@material-ui/core/Icon'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Hidden from '@material-ui/core/Hidden'
import CircularProgress from '@material-ui/core/CircularProgress'

const loginStyles = makeStyles((theme) => ({
  container: {
    flex: 1,
    width: 'inherit',
    margin: 0,
    padding: 0,
    background: 'transparent'
  },
  card: {
    maxWidth: '400px',
    margin: '84px auto'
  },
  warning: {
    backgroundColor: '#f1932c',
    maxWidth: 'unset',
    marginBottom: 10
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
  formButton: {
    marginTop: "20px"
  },
  formButtonWrapper: {
    position: 'relative',
  },
  formProgress: {
    position: 'absolute',
    top: '67%',
    left: '50%',
    marginTop: -12,
    marginLeft: -12,
  }
}))

export default ({ status, authorize }) => {
  const styles = loginStyles()

  const [account, setAccount] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const login = async () => {
    if (account !== '' && password !== '') {
      setLoading(true)
      try {
        const response = await api.post('authorize', {
          json: {
            account,
            password
          }
        }).json()
        window.localStorage.setItem('account', account)
        window.localStorage.setItem('token', response.token)
        window.localStorage.setItem('role', response.role)
        await authorize()
      } catch (e) {
        console.error('nope', e)
        setPassword('')
        setError('Unable to authorize')
        setLoading(false)
      }
    } else {
      setPassword('')
      setError('Unable to authorize')
    }
  }

  if (status === 'authorized') {
    return (<Redirect to="/dashboard" />)
  }

  return (<Grid className={styles.container} container spacing={4}>
    <Hidden xsDown>
      <Grid item sm={6}>
      </Grid>
    </Hidden>
    <Grid item xs={12} sm={6}>
      <Card className={styles.card}>
        <AppBar position="static" color="default" elevation={0}>
          <Toolbar variant="dense">
            <Typography component="h4">
              Log in
            </Typography>
          </Toolbar>
        </AppBar>
        <CardContent>
          {error && !loading && (
            <SnackbarContent className={styles.warning}
              message={(
                <Typography component="p" className={styles.warningText}>
                  <Icon className={styles.warningIcon}>warning</Icon> {error}
                </Typography>
              )}
            />
          )}
          <form onSubmit={(e) => { e.preventDefault() }}
            noValidate
            autoComplete="off">
            <TextField
              required
              autoFocus
              margin="dense"
              id="account"
              label="username"
              type="text"
              fullWidth
              variant="outlined"
              onChange={(e) => setAccount(e.target.value)}
              value={account}
              disabled={loading}
              error={account === '' && error !== ''}
            />
            <TextField
              required
              margin="dense"
              id="password"
              label="password"
              type="password"
              fullWidth
              variant="outlined"
              onChange={(e) => setPassword(e.target.value)}
              value={password}
              disabled={loading}
              error={password === '' && error !== ''}
            />
            <div className={styles.formButtonWrapper}>
              <Button className={styles.formButton}
                variant="contained"
                fullWidth
                type="submit"
                color="primary"
                disabled={loading}
                onClick={login}>
                Log in
              </Button>
              {loading && <CircularProgress size={24} className={styles.formProgress} />}
            </div>
          </form>
          <Button className={styles.formButton}
            variant="contained"
            fullWidth
            component={Link}
            disabled={loading}
            {...{ to: '/signup' }}>
            Don't have an account (Sign up)
          </Button>
        </CardContent>
      </Card>
    </Grid>
  </Grid>)
}