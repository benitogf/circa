import React, { useState } from 'react'
import { Route, Link, Redirect, Switch, withRouter } from 'react-router-dom'
import { useSubscribe } from './api'
import moment from 'moment'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import Toolbar from '@material-ui/core/Toolbar'
import Paper from '@material-ui/core/Paper'
import Breadcrumbs from '@material-ui/core/Breadcrumbs'
import LinearProgress from '@material-ui/core/LinearProgress'
import Hidden from '@material-ui/core/Hidden'
import Divider from '@material-ui/core/Divider'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Icon from '@material-ui/core/Icon'
import IconButton from '@material-ui/core/IconButton'
import CircularProgress from '@material-ui/core/CircularProgress'
import Boxes from './boxes/Boxes'
import Box from './boxes/Box'
import Thing from './things/Thing'
import Posts from './posts/Posts'
import Post from './posts/Post'
import Mails from './mails/Mails'
import Mail from './mails/Mail'
import Users from './users/Users'
import User from './users/User'
import Locks from './Locks'
import Settings from './Settings'
import R404 from './404'
import AllThings from './things/AllThings'

const drawerWidth = 240;

const toolbarStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    background: (props) => props.lights ? '#d5e4f1' : '#383838',
    height: 65,
    minHeight: 65,
    paddingTop: 67,
    position: 'sticky',
    top: 0,
    zIndex: 2
  },
  drawer: {
    [theme.breakpoints.up('sm')]: {
      width: drawerWidth,
      flexShrink: 0,
    },
  },
  drawerPaper: {
    width: drawerWidth,
    marginTop: 67
  },
  menuContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  menuButton: {
    [theme.breakpoints.up('sm')]: {
      display: 'none',
    },
    background: 'transparent !important',
    color: (props) => props.lights ? 'black' : 'white'
  },
  date: {
    fontSize: '0.9em',
    maxWidth: '10em',
    textAlign: 'end',
    color: (props) => props.lights ? 'black' : 'white',
  },
  breadcrumbs: {
    background: (props) => props.lights ? '#f5faff' : '#4c4c4c',
    padding: '5px 10px',
    borderRadius: 5
  },
  breadcrumb: {
    color: theme.palette.primary.main,
    fontSize: '0.9em'
  }
}))

const appStyles = makeStyles((theme) => ({
  root: {
    [theme.breakpoints.up('sm')]: {
      marginLeft: drawerWidth,
    },
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    overflowY: 'auto'
  },
  loader: {
    marginTop: 67
  },
  route: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '10px 20px',
    boxShadow: 'none',
    borderRadius: 0
  },
  menu: {
    padding: 0
  }
}))

const DateDisplay = ({ time }) => (moment.unix(time / 1000000000).format('dddd, MMMM Do Y LTS'))

export default withRouter(({ location, status, authorize, dispatch }) => {
  const [time, socket] = useSubscribe(null, authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const [mobileOpen, setMobileOpen] = useState(false)
  const role = window.localStorage.getItem('role')
  const lights = window.localStorage.getItem('lights') === 'on'
  const toolbar = toolbarStyles({
    mobile: useMediaQuery(useTheme().breakpoints.down('xs')),
    location,
    lights
  })
  const app = appStyles()
  const pathname = location.pathname.split('/')
  const isBox = pathname.length > 3 && pathname[2] === 'box'
  const isPost = pathname.length > 3 && pathname[2] === 'post'
  const isThing = pathname.length > 4 && pathname[4] === 'thing'
  const isMail = pathname.length > 3 && pathname[2] === 'mail'
  const showBreadcrumbs = isBox || isPost || isThing || isMail
  // const isBoxes = pathname.length > 2 && pathname[2] === 'boxes'
  // const activeLink = lights ? '#efefef' : 'rgb(88, 88, 88)'
  // https://reacttraining.com/react-router/web/api/NavLink
  // this trigers a re-render on each time tick
  // disabling for now
  // const activeStyle = {
  //   background: activeLink
  // }
  // const NavLinkRef = forwardRef((props, ref) => <NavLink {...props} innerRef={ref} />)

  if (status === 'unauthorized') {
    return (<Redirect to="/login" />)
  }

  const drawer = (
    <div>
      <Divider />
      <List className={app.menu}>
        <ListItem button
          key={'Dashboard'}
          component={Link}
          onClick={() => setMobileOpen(false)}
          {...{
            disableTouchRipple: true,
            // exact: true,
            // activeStyle,
            to: '/dashboard'
          }}>
          <ListItemIcon>{<Icon>dashboard</Icon>}</ListItemIcon>
          <ListItemText primary={'Dashboard'} />
        </ListItem>
        <Divider />
        <ListItem button
          key={'Boxes demo'}
          component={Link}
          onClick={() => setMobileOpen(false)}
          {...{
            disableTouchRipple: true,
            to: '/dashboard/boxes',
            // activeStyle,
            // isActive: () => isBox || isThing || isBoxes
          }}>
          <ListItemIcon>{<Icon>developer_board</Icon>}</ListItemIcon>
          <ListItemText primary={'Boxes demo'} />
        </ListItem>
        {role === 'root' && (
          <Divider />
        )}
        {role === 'root' && (
          <ListItem button
            key={'Things'}
            component={Link}
            onClick={() => setMobileOpen(false)}
            {...{
              disableTouchRipple: true,
              to: '/dashboard/things',
              // activeStyle
            }}>
            <ListItemIcon>{<Icon>inbox</Icon>}</ListItemIcon>
            <ListItemText primary={'Things'} />
          </ListItem>
        )}
        {(role === 'admin' || role === 'root') && (
          <Divider />
        )}
        {(role === 'admin' || role === 'root') && (
          <ListItem button
            key={'Posts'}
            component={Link}
            onClick={() => setMobileOpen(false)}
            {...{
              disableTouchRipple: true,
              to: '/dashboard/posts',
              // activeStyle
            }}>
            <ListItemIcon>{<Icon>library_books</Icon>}</ListItemIcon>
            <ListItemText primary={'Posts'} />
          </ListItem>
        )}
        {(role === 'admin' || role === 'root') && (
          <Divider />
        )}
        {(role === 'admin' || role === 'root') && (
          <ListItem button
            key={'Mails'}
            component={Link}
            onClick={() => setMobileOpen(false)}
            {...{
              disableTouchRipple: true,
              to: '/dashboard/mails',
              // activeStyle
            }}>
            <ListItemIcon>{<Icon>email</Icon>}</ListItemIcon>
            <ListItemText primary={'Mails'} />
          </ListItem>
        )}
        {role === 'root' && (
          <Divider />
        )}
        {role === 'root' && (
          <ListItem button
            key={'Users'}
            component={Link}
            onClick={() => setMobileOpen(false)}
            {...{
              disableTouchRipple: true,
              to: '/dashboard/users',
              // activeStyle
            }}>
            <ListItemIcon>{<Icon>group</Icon>}</ListItemIcon>
            <ListItemText primary={'Users'} />
          </ListItem>
        )}
        <Divider />
        <ListItem button
          key={'Settings'}
          component={Link}
          onClick={() => setMobileOpen(false)}
          {...{
            disableTouchRipple: true,
            to: '/dashboard/settings',
            // activeStyle
          }}>
          <ListItemIcon>{<Icon>settings</Icon>}</ListItemIcon>
          <ListItemText primary={'Settings'} />
        </ListItem>
      </List>
      <Divider />
    </div>
  )

  return (!time) ? (<LinearProgress className={app.loader} />) : (
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
          {showBreadcrumbs && <Breadcrumbs className={toolbar.breadcrumbs} aria-label="Breadcrumb">
            {isBox && (
              <Link className={toolbar.breadcrumb} to="/dashboard/boxes">Boxes</Link>
            )}
            {isPost && (
              <Link className={toolbar.breadcrumb} to="/dashboard/posts">Posts</Link>
            )}
            {isMail && (
              <Link className={toolbar.breadcrumb} to="/dashboard/mails">Mails</Link>
            )}
            {isThing && (
              <Link className={toolbar.breadcrumb}
                to={`/dashboard/box/${pathname[3]}`}>Box</Link>
            )}
          </Breadcrumbs>}
        </div>
        <div className={toolbar.date}>
          {(() => active ? <DateDisplay time={time} /> : <CircularProgress size={24} />)()}
        </div>
      </Toolbar>
      <nav className={toolbar.drawer} aria-label="Main menu">
        <Hidden smUp implementation="css">
          <Drawer
            variant="temporary"
            anchor={'left'}
            open={mobileOpen}
            onClose={() => setMobileOpen(!mobileOpen)}
            classes={{
              paper: toolbar.drawerPaper,
            }}
            ModalProps={{
              keepMounted: true,
            }}
          >
            {drawer}
          </Drawer>
        </Hidden>
        <Hidden xsDown implementation="css">
          <Drawer
            classes={{
              paper: toolbar.drawerPaper,
            }}
            variant="permanent"
            open
          >
            {drawer}
          </Drawer>
        </Hidden>
      </nav>
      <Switch>
        <Route
          exact
          path="/dashboard"
          render={() => <Paper className={app.route}>
            <Locks />
          </Paper>}
        />
        <Route exact path="/dashboard/boxes" render={() =>
          <Boxes authorize={authorize} />
        } />
        <Route exact path="/dashboard/settings" render={() => <Paper className={app.route}>
          <Settings dispatch={dispatch} />
        </Paper>} />
        {role === 'root' && (
          <Route exact path="/dashboard/things" render={() =>
            <AllThings authorize={authorize} />
          } />
        )}
        {(role === 'admin' || role === 'root') && (
          <Route exact path="/dashboard/post/:id" render={({ match }) =>
            <Post match={match} authorize={authorize} />
          } />
        )}
        {(role === 'admin' || role === 'root') && (
          <Route exact path="/dashboard/posts" render={() =>
            <Posts authorize={authorize} />
          } />
        )}
        {(role === 'admin' || role === 'root') && (
          <Route exact path="/dashboard/mails" render={() =>
            <Mails authorize={authorize} />
          } />
        )}
        {role === 'root' && (
          <Route exact path="/dashboard/users/:id" render={({ match }) =>
            <User match={match} authorize={authorize} />
          } />
        )}
        {role === 'root' && (
          <Route exact path="/dashboard/users" render={() =>
            <Users authorize={authorize} />
          } />
        )}
        {(role === 'admin' || role === 'root') && (
          <Route path="/dashboard/mail/:id" render={({ match }) =>
            <Mail match={match} authorize={authorize} />
          } />
        )}
        <Route path="/dashboard/box/:boxId/thing/:id" render={({ match }) =>
          <Thing match={match} authorize={authorize} />
        } />
        <Route path="/dashboard/box/:id" render={({ match }) =>
          <Box match={match} authorize={authorize} />
        } />
        <Route component={R404} />
      </Switch>
    </div>
  )
})
