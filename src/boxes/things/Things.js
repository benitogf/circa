import React from 'react'
import { useSubscribe } from '../../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Table from '../../table'

const rootStyles = makeStyles((theme) => ({
  empty: {
    padding: '1em',
    fontSize: '0.8em',
    background: (props) => props.lights ? '#fffffff0' : '#1f1f1fd6'
  }
}))

const Things = ({ match, authorize }) => {
  const account = window.localStorage.getItem('account')
  const lights = window.localStorage.getItem('lights') === 'on'
  const [things, socket] = useSubscribe('things/' + match.params.id + '/' + account + '/*', authorize)
  const active = socket && socket.readyState === WebSocket.OPEN
  const styles = rootStyles({ active, lights })

  return [(!things || !active) && (<LinearProgress key="loadingThings" />),
  (things && things.length > 0) && <Table key="thingsTable"
    pagination
    rows={things.map(thing => ({
      name: thing.data.name,
      created: thing.created,
      updated: thing.updated,
      index: thing.index
    }))}
    hiddenMobileFields={['created', 'updated']}
    link={(row) => '/dashboard/box/' + match.params.id + '/thing/' + row.index}
    hiddenFields={['index']} />,
  (things && things.length === 0) && <Typography className={styles.empty} key="emptyThings">There are no things on this box yet</Typography>]
}

export default Things