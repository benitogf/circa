import { makeStyles } from '@material-ui/core/styles'

const rootStyles = makeStyles((theme) => ({
  root: {
    borderRadius: 0,
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1',
    background: 'transparent',
    overflowY: 'auto',
    marginTop: props => props.status === 'authorized' ? 0 : 88
  },
  container: {
    [theme.breakpoints.up('sm')]: {
      margin: '0 auto',
    },
    maxWidth: 960,
    borderRadius: 0,
    background: 'transparent',
  },
  postTitle: {
    margin: '15px 12px',
    paddingTop: 10,
    textTransform: 'capitalize',
  },
  empty: {
    padding: 15,
    background: theme.palette.background.paper,
    borderRadius: 5
  }
}))

export default rootStyles;
