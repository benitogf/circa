import React, { useReducer } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useAuthorize } from './api'

import Home from './home/Home'
import Blog from './home/Blog'
import Login from './auth/Login'
import Signup from './auth/Signup'
import Dashboard from './dashboard/Dashboard'
import R404 from './404'
import Nav from './home/Nav'
import { MuiThemeProvider, createTheme } from '@material-ui/core/styles'
import lightBlue from '@material-ui/core/colors/lightBlue'
import LinearProgress from '@material-ui/core/LinearProgress'
import Logout from './auth/Logout'

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

const App = () => {
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

  const theme = createTheme({
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
    <Routes>
      <Route exact path="/" element={<Home status={status} />} />
      <Route exact path="/blog" element={<Blog status={status} />} />
      <Route exact path="/logout" element={<Logout dispatch={dispatch}/>} />
      <Route exact path="/login" element={<Login status={status} authorize={authorize} />} />
      <Route exact path="/signup" element={<Signup status={status} authorize={authorize} />} />
      <Route path="/dashboard/*" element={<Dashboard status={status} authorize={authorize} dispatch={dispatch} />} />
      <Route component={R404} />
    </Routes></Router></MuiThemeProvider>)
}

export default App
