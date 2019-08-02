import React from 'react'
import { useSubscribe } from '../api'
import { makeStyles } from '@material-ui/core/styles'
import LinearProgress from '@material-ui/core/LinearProgress'
import Typography from '@material-ui/core/Typography'
import Paper from '@material-ui/core/Paper'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0
  },
  text: {
    overflowWrap: 'break-word',
    padding: '2em'
  }
}))

export default ({ match, authorize }) => {
  const [mail] = useSubscribe('/sa/mails/' + match.params.id, authorize)
  const styles = rootStyles()

  return (!mail) ? (<LinearProgress />) : (
    <Paper className={styles.root} elevation={1}>
      <Typography className={styles.text} component="h2">
        {JSON.stringify(mail)}
      </Typography>
    </Paper>
  )
}