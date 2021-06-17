import React from 'react'
import SnackbarContent from '@material-ui/core/SnackbarContent'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Icon from '@material-ui/core/Icon'
import { Link } from 'react-router-dom'

const notFound = () => (<Paper className="paper-container" elevation={1}>
<SnackbarContent
  style={{
    backgroundColor: '#f1932c',
    maxWidth: 'unset'
  }}
  action={[
    <IconButton
      key="close"
      aria-label="Close"
      color="inherit"
      {...{ to: '/' }}
      component={Link}>
      <Icon>cancel</Icon>
    </IconButton>
  ]}
  message={(
    <Typography component="p" style={{ color: 'white' }}>
      <Icon style={{ verticalAlign: "bottom", color: "#f0cf81" }}>warning</Icon> Could not find this path {window.location.pathname}.
    </Typography>
  )}
/></Paper>)

export default notFound