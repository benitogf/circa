
import React, { memo } from 'react'
import { Route, Routes } from 'react-router-dom'
import Settings from './Settings'
import Boxes from '../boxes/Boxes'
import Box from '../boxes/Box'
import Thing from '../boxes/things/Thing'
import Posts from '../posts/Posts'
import Post from '../posts/Post'
import Mails from '../mails/Mails'
import Mail from '../mails/Mail'
import Users from '../users/Users'
import User from '../users/User'
import Storage from '../storage/Storage'
import Key from '../storage/Key'
import R404 from '../404'
import Market from '../market/Market'
import Stock from '../market/Stock'


export default memo(({ dispatch, authorize }) => {
  const role = window.localStorage.getItem('role')
  return <Routes>
    <Route path="/" element={<Market authorize={authorize} />} />
    <Route exact path="/boxes" element={<Boxes authorize={authorize} />} />
    <Route exact path="/settings" element={<Settings dispatch={dispatch} />} />
    <Route exact path="/stock/:id" element={<Stock authorize={authorize} />} />
    {(role === 'admin' || role === 'root') &&
      <Route exact path="/post/:id" element={<Post authorize={authorize} />} />}
    {(role === 'admin' || role === 'root') &&
      <Route exact path="/posts" element={<Posts authorize={authorize} />} />}
    {(role === 'admin' || role === 'root') &&
      <Route exact path="/mails" element={<Mails authorize={authorize} />} />}
    {role === 'root' &&
      <Route exact path="/user/:id" element={<User authorize={authorize} />} />}
    {role === 'root' &&
      <Route exact path="/users" element={<Users authorize={authorize} />} />}
    {role === 'root' &&
      <Route exact path="/storage" element={<Storage authorize={authorize} />} />}
    {(role === 'admin' || role === 'root') &&
      <Route path="/mail/:id" element={<Mail authorize={authorize} />} />}
    <Route path="/box/:boxId/thing/:id" element={<Thing  authorize={authorize} />} />
    <Route path="/box/:id" element={<Box authorize={authorize} />
    } />
    {role === 'root' &&
      <Route exact path="/storage/:id" element={<Key authorize={authorize} />} />}
    <Route element={<R404/>} />
  </Routes>
})