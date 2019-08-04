import { useReducer, useEffect } from 'react'
import { domain, ssl } from './config'
import { Base64 } from 'js-base64'
import ky from 'ky'
import Samo from 'samo-js-client'
import tus from 'tus-js-client'

const protocol = ssl ? 'https://' : 'http://'
const prefixUrl = protocol + domain

export const api = ky.extend({ prefixUrl })

export const upload = async (fileUrl) =>
  new Promise((resolve, reject) => {
    window.fetch(fileUrl)
      .then(res => res.blob())
      .then(file => {
        const upload = new tus.Upload(file, {
          endpoint: "https://tusd.minut.us/files/",
          retryDelays: [0, 3000, 5000, 10000, 20000],
          metadata: {
            filename: file.name,
            filetype: file.type
          },
          onError: function (error) {
            // console.log("Failed because: " + error)
            reject(error)
          },
          // onProgress: function (bytesUploaded, bytesTotal) {
          //   var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          //   console.log(bytesUploaded, bytesTotal, percentage + "%")
          // },
          onSuccess: function () {
            // console.log("Download %s from %s", upload.file.name, upload.url)
            resolve(upload.url)
          }
        })

        // Start the upload
        upload.start()
      })
      .catch(reject)
  })

export const fetch = async (url, authorize) => {
  try {
    const token = window.localStorage.getItem('token')
    return await api.get(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    }).json()
  } catch (e) {
    console.error(e)
    if (e && e.response && e.response.status === 401) {
      try {
        await authorize(e)
        const refreshToken = window.localStorage.getItem('token')
        return await api.get(url, {
          headers: {
            'Authorization': 'Bearer ' + refreshToken
          }
        }).json()
      } catch (e) {
        throw e
      }
    } else {
      throw e
    }
  }
}

export const unpublish = async (url, authorize) => {
  try {
    const token = window.localStorage.getItem('token')
    return await api.delete(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      }
    })
  } catch (e) {
    console.error(e)
    if (e && e.response && e.response.status === 401) {
      try {
        await authorize(e)
        const refreshToken = window.localStorage.getItem('token')
        return await api.delete(url, {
          headers: {
            'Authorization': 'Bearer ' + refreshToken
          }
        })
      } catch (e) {
        throw e
      }
    } else {
      throw e
    }
  }
}

export const publish = async (url, data, authorize) => {
  try {
    const token = window.localStorage.getItem('token')
    await api.post(url, {
      headers: {
        'Authorization': 'Bearer ' + token
      },
      json: url.indexOf('user/') !== 0 ? {
        data: Base64.encode(JSON.stringify(data))
      } : data
    }).json()
  } catch (e) {
    console.error(e)
    if (e && e.response && e.response.status === 401) {
      try {
        await authorize(e)
        const refreshToken = window.localStorage.getItem('token')
        await api.post(url, {
          headers: {
            'Authorization': 'Bearer ' + refreshToken
          },
          json: url.indexOf('user/') !== 0 ? {
            data: Base64.encode(JSON.stringify(data))
          } : data
        }).json()
      } catch (e) {
        throw e
      }
    } else {
      throw e
    }
  }
}

export const usePublish = (url, authorize) => (data) => publish(url, data, authorize)

const subscribeReducer = (state, action) => {
  switch (action.type) {
    case 'open':
      return {
        ...state,
        socket: action.data
      }
    case 'freeze':
      return {
        ...state,
        frozen: true
      }
    case 'resume':
      return {
        ...state,
        frozen: false
      }
    case 'close':
      return {
        ...state,
        socket: null
      }
    case 'data':
      return {
        ...state,
        data: action.data
      }
    default:
      throw new Error()
  }
}

export const subscribe = (url, socket, authorize, dispatch) => () => {
  // https://github.com/facebook/react/issues/14326#issuecomment-472043812
  let unmounted = false
  const token = window.localStorage.getItem('token')
  if (!socket) {
    // console.log('mount', url)
    dispatch({
      type: 'open',
      data: Samo(
        domain + (url ? '/' + url : ''),
        ssl,
        ['bearer', token]
      )
    })
  } else {
    socket.onerror = async (e) => {
      console.error(url, e)
      // there's no propagation of the response
      // so close, refresh token and remount is done
      // to any error
      socket.close()
      if (!unmounted) {
        if (!socket.frozen) {
          await authorize()
          if (!unmounted) {
            dispatch({ type: 'close' })
          }
        }
      }
    }
    socket.onmessage = (data) => {
      if (!unmounted) {
        dispatch({
          type: 'data',
          data
        })
      }
    }
    socket.onfrozen = () => {
      if (!unmounted) {
        dispatch({ type: 'freeze' })
      }
    }
    socket.onresume = () => {
      if (!unmounted) {
        dispatch({ type: 'resume' })
      }
    }
  }

  return () => {
    unmounted = true
    if (socket) {
      // console.log('unmount', url)
      socket.close()
    }
  }
}

export const useSubscribe = (url, authorize) => {
  const [state, dispatch] = useReducer(subscribeReducer, {
    socket: null,
    data: null
  })
  useEffect(subscribe(url, state.socket, authorize, dispatch), [state.socket])
  return [state.data, state.socket]
}

export const authorize = async (dispatch, context) => {
  const token = window.localStorage.getItem('token')
  const account = window.localStorage.getItem('account')
  const role = window.localStorage.getItem('role')
  const mock = new Blob(["unauthorized"])
  const fail = {
    response: new Response(mock, {
      status: 401
    })
  }

  if (!token || !account || !role) {
    dispatch({ type: "status", data: 'unauthorized' })
    throw fail
  }

  // try to get the profile
  try {
    if (context) {
      throw context
    }
    const profileRefresh = await api.get('profile',
      {
        headers: {
          'Authorization': 'Bearer ' + token
        }
      }).json()
    window.localStorage.setItem('account', profileRefresh.account)
    window.localStorage.setItem('role', profileRefresh.role)
  } catch (e) {
    if (e && e.response && e.response.status === 401) {
      try {
        // try to refresh the token
        const refreshResponse = await api.put('authorize',
          {
            json: {
              account,
              token
            }
          }).json()
        // retry to get the profile with the new token
        const profileRefresh = await api.get('profile',
          {
            headers: {
              'Authorization': 'Bearer ' + refreshResponse.token
            }
          }).json()
        window.localStorage.setItem('account', profileRefresh.account)
        window.localStorage.setItem('token', refreshResponse.token)
        window.localStorage.setItem('role', profileRefresh.role)
      } catch (e) {
        if (e && e.response && e.response.status !== 304) {
          // refresh token failed, clear everything
          window.localStorage.setItem('account', '')
          window.localStorage.setItem('token', '')
          window.localStorage.setItem('role', '')
          dispatch({ type: "status", data: "unauthorized" })
        }
        throw e
      }
    }
  }

  if (window.localStorage.getItem('account') === '') {
    dispatch({ type: "status", data: "unauthorized" })
    throw fail
  }
  dispatch({ type: "status", data: "authorized" })
}

export const useAuthorize = (dispatch) => (context) => authorize(dispatch, context)