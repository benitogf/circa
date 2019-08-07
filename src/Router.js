
import React, { memo } from 'react'
import { Route, Switch } from 'react-router-dom'
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

export default memo(({ dispatch, authorize }) => {
  const role = window.localStorage.getItem('role')
  return <Switch>
    <Route
      exact
      path="/dashboard"
      render={() => <Locks />}
    />
    <Route exact path="/dashboard/boxes" render={() =>
      <Boxes authorize={authorize} />
    } />
    <Route exact path="/dashboard/settings" render={() =>
      <Settings dispatch={dispatch} />
    } />
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
      <Route exact path="/dashboard/user/:id" render={({ match }) =>
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
})