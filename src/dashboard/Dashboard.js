import React, { useState } from 'react'
import { Link, Redirect, withRouter } from 'react-router-dom'
import { useSubscribe } from '../api'
import moment from 'moment'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Toolbar from '@material-ui/core/Toolbar'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import LinearProgress from '@material-ui/core/LinearProgress'
import Hidden from '@material-ui/core/Hidden'
import Drawer from '@material-ui/core/Drawer'
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import Typography from '@material-ui/core/Typography'
import CircularProgress from '@material-ui/core/CircularProgress'
import Router from './Router'
import Menu from './Menu'

const drawerWidth = 240;

const toolbarStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    background: (props) => props.lights ? '#f1f1f1' : '#383838',
    height: 65,
    minHeight: 65,
    paddingTop: 0,
    position: 'sticky',
    top: 0,
    zIndex: 2
  },
  title: {
    fontStyle: 'italic',
    fontWeight: '100',
    fontVariant: 'small-caps',
    flex: 1,
    padding: '0.37em 0',
    color: theme.palette.text.primary,
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth
  },
  menuContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  menuButton: {
    marginRight: 10,
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
    background: 'transparent !important',
    color: (props) => props.lights ? 'black' : 'white'
  },
  date: {
    fontSize: '0.9em',
    maxWidth: '13em',
    textAlign: 'end',
    color: (props) => props.lights ? 'black' : 'white',
  },
  breadcrumbBar: {
    background: (props) => props.lights ? 'white' : 'rgb(90, 90, 90)',
  },
  breadcrumbs: {
    background: (props) => props.lights ? '#e6e6e6' : '#4c4c4c',
    padding: '5px 10px',
    borderRadius: 5
  },
  breadcrumb: {
    color: theme.palette.primary.main,
    fontSize: '0.9em'
  },
  breadcrumbOff: {
    color: theme.palette.text.primary,
    textDecoration: 'none',
    pointerEvents: 'none',
    fontSize: '0.9em',
  }
}))

const appStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1'
  }
}))

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

export default withRouter(({ location, status, authorize, dispatch }) => {
  const [time, socket] = useSubscribe(null, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const [mobileOpen, setMobileOpen] = useState(false)
  const lights = window.localStorage.getItem('lights') === 'on'
  const toolbar = toolbarStyles({
    mobile: useMediaQuery(useTheme().breakpoints.down('xs')),
    location,
    lights
  })
  const app = appStyles()
  const pathname = location.pathname.split('/')
  const isDashboard = pathname.length === 2
  // first leve
  const isBoxes = pathname.length > 2 && pathname[2] === 'boxes'
  const isThings = pathname.length > 2 && pathname[2] === 'things'
  const isPosts = pathname.length > 2 && pathname[2] === 'posts'
  const isUsers = pathname.length > 2 && pathname[2] === 'users'
  const isMails = pathname.length > 2 && pathname[2] === 'mails'
  const isSettings = pathname.length > 2 && pathname[2] === 'settings'
  // second level
  const isBox = pathname.length > 3 && pathname[2] === 'box'
  const isPost = pathname.length > 3 && pathname[2] === 'post'
  const isUser = pathname.length > 3 && pathname[2] === 'user'
  const isMail = pathname.length > 3 && pathname[2] === 'mail'
  // third level
  const isThing = pathname.length > 4 && pathname[4] === 'thing'


  if (status === 'unauthorized') {
    return (<Redirect to="/login" />)
  }

  return (!time) ? (<LinearProgress />) : (
    <div className={app.root}>
      <Toolbar className={toolbar.root}>
        <div className={toolbar.menuContainer}>
          <IconButton disableRipple
            color="inherit"
            aria-label="Open drawer"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            className={toolbar.menuButton}
          >
            <Icon>menu</Icon>
          </IconButton>
        </div>
        <Hidden smUp>
          <Typography className={toolbar.title} variant="h5" component="h3">
            circa
          </Typography>
        </Hidden>
        <div className={toolbar.date}>
          {(() => active ? <DateDisplay time={time} /> : <CircularProgress size={24} />)()}
        </div>
      </Toolbar>
      <Toolbar className={toolbar.breadcrumbBar}>
        <Breadcrumbs className={toolbar.breadcrumbs} aria-label="Breadcrumb">
          {isDashboard && (
            <span className={toolbar.breadcrumbOff}>Dashboard</span>
          )}
          {isBoxes && (
            <span className={toolbar.breadcrumbOff}>Boxes</span>
          )}
          {isThings && (
            <span className={toolbar.breadcrumbOff}>Things</span>
          )}
          {isPosts && (
            <span className={toolbar.breadcrumbOff}>Posts</span>
          )}
          {isUsers && (
            <span className={toolbar.breadcrumbOff}>Users</span>
          )}
          {isMails && (
            <span className={toolbar.breadcrumbOff}>Mails</span>
          )}
          {isSettings && (
            <span className={toolbar.breadcrumbOff}>Settings</span>
          )}
          {isBox && (
            <Link className={toolbar.breadcrumb} to="/dashboard/boxes">Boxes</Link>
          )}
          {(isBox && !isThing) && (
            <span className={toolbar.breadcrumbOff}>Box</span>
          )}
          {isThing && (
            <Link className={toolbar.breadcrumb} to={`/dashboard/box/${pathname[3]}`}>Box</Link>
          )}
          {isThing && (
            <span className={toolbar.breadcrumbOff}>Thing</span>
          )}
          {isPost && (
            <Link className={toolbar.breadcrumb} to="/dashboard/posts">Posts</Link>
          )}
          {isPost && (
            <span className={toolbar.breadcrumbOff}>Post</span>
          )}
          {isUser && (
            <Link className={toolbar.breadcrumb} to="/dashboard/users">Users</Link>
          )}
          {isUser && (
            <span className={toolbar.breadcrumbOff}>User</span>
          )}
          {isMail && (
            <Link className={toolbar.breadcrumb} to="/dashboard/mails">Mails</Link>
          )}
          {isMail && (
            <span className={toolbar.breadcrumbOff}>Mail</span>
          )}
        </Breadcrumbs>
      </Toolbar>
      <nav className={toolbar.drawer} aria-label="Main menu">
        <Hidden smUp implementation="css">
          <SwipeableDrawer
            variant="temporary"
            anchor={'left'}
            open={mobileOpen}
            onOpen={() => setMobileOpen(true)}
            onClose={() => setMobileOpen(false)}
            classes={{
              paper: toolbar.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            <Menu location={location} setMobileOpen={setMobileOpen} />
          </SwipeableDrawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: toolbar.drawerPaper,
            }}
            variant="permanent"
            open
          >
            <Menu location={location} setMobileOpen={setMobileOpen} />
          </Drawer>
        </Hidden>
      </nav>
      <Router dispatch={dispatch} authorize={authorize} />
    </div>
  )
})
