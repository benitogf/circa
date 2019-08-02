import React from 'react'
import { Link, withRouter } from 'react-router-dom'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const navStyles = makeStyles(theme => ({
  root: {
    zIndex: props => props.mobile ? 1301 : '',
    boxShadow: 'none'
  },
  titleContainer: {
    width: '176px',
    padding: '18px 0'
  },
  title: {
    fontStyle: 'italic',
    fontWeight: '100',
    fontVariant: 'small-caps',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  signUp: {
    marginRight: props => props.location.pathname !== '/login' ? '6px' : '0',
    textTransform: 'unset'
  },
  logIn: {
    background: theme.palette.grey[400],
    textTransform: 'unset'
  },
  link: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
  },
  subtitle: {
    fontWeight: '500',
    fontSize: '0.88em'
  }
}));

export default withRouter(({ location, status }) => {
  const mobile = useTheme().breakpoints.down('xs')
  const styles = navStyles({
    mobile,
    location
  })

  return (<AppBar className={styles.root}
    color="default">
    <Toolbar>
      <div className={styles.titleContainer}>
        <Typography className={styles.title} variant="h5" component="h3">
          <Link className={styles.link} to={'/'}>circa</Link>
        </Typography>
        {status !== 'authorized' && <Typography className={styles.subtitle} component="p">Data engeneering</Typography>}
      </div>
      <Grid direction="row"
        justify="flex-end"
        alignItems="center"
        container
        spacing={4}>
        <Grid item>
          {location.pathname !== '/signup' && status === 'unauthorized' && (<Button variant="contained"
            className={styles.signUp}
            component={Link}
            {...{ to: '/signup' }} color="secondary">
            Sign up
            </Button>)}
          {location.pathname !== '/login' && status === 'unauthorized' && (<Button variant="contained"
            component={Link}
            className={styles.logIn}
            {...{ to: '/login' }}>
            Log in
            </Button>)}
        </Grid>
      </Grid>
    </Toolbar>
  </AppBar>)
})