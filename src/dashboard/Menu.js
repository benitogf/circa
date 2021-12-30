import React, { memo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { makeStyles } from '@material-ui/core/styles'
import Divider from '@material-ui/core/Divider'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import ListItemText from '@material-ui/core/ListItemText'
import Icon from '@material-ui/core/Icon'
import Typography from '@material-ui/core/Typography'

const rootStyles = makeStyles((theme) => ({
  menu: {
    padding: 0
  },
  title: {
    fontStyle: 'italic',
    fontWeight: '100',
    fontVariant: 'small-caps',
    flex: 1,
    padding: '0.37em 0',
    color: theme.palette.text.primary,
  },
  logo: {
    height: 20,
    verticalAlign: 'middle',
    marginRight: 34,
    marginLeft: 1,
    filter: (props) => props.lights ? 'brightness(0.5)' : 'none',
  }
}))

export default memo(({ setMobileOpen }) => {
  const location = useLocation()
  const root = rootStyles()
  const lights = window.localStorage.getItem('lights') === 'on'
  const role = window.localStorage.getItem('role')
  const pathname = location.pathname.split('/')
  const isBox = pathname.length > 3 && pathname[2] === 'box'
  const isThing = pathname.length > 4 && pathname[4] === 'thing'
  const isBoxes = pathname.length > 2 && pathname[2] === 'boxes'
  const isPost = pathname.length > 3 && pathname[2] === 'post'
  const isPosts = pathname.length > 2 && pathname[2] === 'posts'
  const isMails = pathname.length > 2 && pathname[2] === 'mails'
  const isStorage = pathname.length > 2 && pathname[2] === 'storage'
  const isUsers = pathname.length > 2 && pathname[2] === 'users'
  const isSettings = pathname.length > 2 && pathname[2] === 'settings'
  const activeLink = lights ? '#efefef' : 'rgb(88, 88, 88)'
  // https://reacttraining.com/react-router/web/api/NavLink
  // this trigers a re-render on each time tick
  // disabling for now
  const activestyle = {
    background: activeLink
  }
  return <List className={root.menu}>
    <ListItem>
      <Typography className={root.title} variant="h5" component="h3">
        <img alt="circa, data engeneering" className={root.logo} src="/logo.png"></img>circa
        </Typography>
    </ListItem>
    <Divider />
    <ListItem button
      key={'Dashboard'}
      component={NavLink}
      onClick={() => setMobileOpen(false)}
      {...{
        disableTouchRipple: true,
        activestyle,
        to: '/dashboard',
        selected: pathname.length === 2
      }}>
      <ListItemIcon>{<Icon>dashboard</Icon>}</ListItemIcon>
      <ListItemText primary={'Dashboard'} />
    </ListItem>
    <Divider />
    <ListItem button
      key={'Boxes demo'}
      component={NavLink}
      onClick={() => setMobileOpen(false)}
      {...{
        disableTouchRipple: true,
        to: '/dashboard/boxes',
        activestyle,
        selected: isBox || isThing || isBoxes
      }}>
      <ListItemIcon>{<Icon>developer_board</Icon>}</ListItemIcon>
      <ListItemText primary={'Boxes demo'} />
    </ListItem>
    {(role === 'admin' || role === 'root') && (
      <Divider />
    )}
    {(role === 'admin' || role === 'root') && (
      <ListItem button
        key={'Posts'}
        component={NavLink}
        onClick={() => setMobileOpen(false)}
        {...{
          disableTouchRipple: true,
          to: '/dashboard/posts',
          activestyle,
          selected: isPosts || isPost
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
        component={NavLink}
        onClick={() => setMobileOpen(false)}
        {...{
          disableTouchRipple: true,
          to: '/dashboard/mails',
          activestyle,
          selected: isMails
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
        component={NavLink}
        onClick={() => setMobileOpen(false)}
        {...{
          disableTouchRipple: true,
          to: '/dashboard/users',
          activestyle,
          selected: isUsers
        }}>
        <ListItemIcon>{<Icon>group</Icon>}</ListItemIcon>
        <ListItemText primary={'Users'} />
      </ListItem>
    )}
    {role === 'root' && (
      <Divider />
    )}
    {role === 'root' && (
      <ListItem button
        key={'Storage'}
        component={NavLink}
        onClick={() => setMobileOpen(false)}
        {...{
          disableTouchRipple: true,
          to: '/dashboard/storage',
          activestyle,
          selected: isStorage
        }}>
        <ListItemIcon>{<Icon>storage</Icon>}</ListItemIcon>
        <ListItemText primary={'Storage'} />
      </ListItem>
    )}
    <Divider />
    <ListItem button
      key={'Settings'}
      component={NavLink}
      onClick={() => setMobileOpen(false)}
      {...{
        disableTouchRipple: true,
        to: '/dashboard/settings',
        activestyle,
        selected: isSettings
      }}>
      <ListItemIcon>{<Icon>settings</Icon>}</ListItemIcon>
      <ListItemText primary={'Settings'} />
    </ListItem>
    <Divider />
  </List>
})