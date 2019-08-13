import React, { useReducer } from 'react'
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom'
import { useAuthorize } from './api'

import Home from './home/Home'
import Login from './auth/Login'
import Signup from './auth/Signup'
import Dashboard from './dashboard/Dashboard'
import R404 from './404'
import Nav from './home/Nav'
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import LinearProgress from '@material-ui/core/LinearProgress'

const reducer = (state, action) => {
  switch (action.type) {
    case 'lights':
      return {
        ...state,
        lights: action.data
      }
    case 'status':
      return {
        ...state,
        status: action.data
      }
    default:
      throw new Error()
  }
}

export default () => {
  const account = window.localStorage.getItem('account')
  const role = window.localStorage.getItem('role')
  const [state, dispatch] = useReducer(reducer, {
    lights: window.localStorage.getItem('lights') === 'on',
    status: null
  })
  const authorize = useAuthorize(dispatch)
  const {
    lights,
    status
  } = state

  window.onstorage = async () => {
    const newLights = window.localStorage.getItem('lights') === 'on'
    const newAccount = window.localStorage.getItem('account')
    const newRole = window.localStorage.getItem('role')
    if (newLights !== lights) {
      dispatch({
        type: 'lights',
        data: newLights
      })
    }
    if (newAccount !== account || newRole !== role) {
      try {
        await authorize()
      } catch (e) {
        console.warn(e)
      }
    }
  }

  const theme = createMuiTheme({
    palette: {
      type: !lights && status === 'authorized' ? 'dark' : 'light',
      primary: {
        main: lightBlue[500]
      },
      secondary: {
        main: '#ffca28',
      },
    },
    breakpoints: {
      values: {
        xs: 0,
        s: 375,
        sm: 675,
        md: 960,
        lg: 1280,
        xl: 1920,
      }
    },
    typography: { useNextVariants: true },
  })

  if (!status) {
    (async () => {
      try {
        await authorize()
      } catch (e) {
        console.warn(e)
      }
    })()
  }

  if (!status && account !== '') {
    return (<MuiThemeProvider theme={theme}><LinearProgress /></MuiThemeProvider>)
  }

  return (<MuiThemeProvider theme={theme}><Router>
    {status !== "authorized" && <Nav />}
    <Switch>
      <Route exact path="/" render={(props) =>
        <Home {...props} status={status} />} />
      <Route exact path="/logout" render={() => {
        window.localStorage.setItem('account', '')
        window.localStorage.setItem('token', '')
        dispatch({ type: "status", data: 'unauthorized' })
        return <Redirect to="/" />
      }} />
      <Route exact path="/login" render={(props) =>
        <Login {...props} status={status} authorize={authorize} />} />
      <Route exact path="/signup" render={(props) =>
        <Signup {...props} status={status} authorize={authorize} />} />
      <Route path="/dashboard" render={(props) =>
        <Dashboard {...props} status={status} authorize={authorize} dispatch={dispatch} />} />
      <Route component={R404} />
    </Switch></Router></MuiThemeProvider>)
}
