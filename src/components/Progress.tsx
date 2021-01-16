import React from 'react'

// COMPONENTS
import CircularProgress from '@material-ui/core/CircularProgress';

// CSS
import { makeStyles } from '@material-ui/core/styles';

// TYPES
export type LoadStatus = 'logging in' | 'waking up heroku' | 'saving nominations' | 'retrieving nominations' | 'registering' | ''

type ProgressProps = {
    loading: LoadStatus
}

const useStyles = makeStyles(() => ({
    container: {
        color:'var(--yellow)',
        margin: '50px auto',
        position: 'relative',
        width: 'max-content',
    },
    label: {
        top: 0,
        left: 0,
        color: 'var(--purple)',
        right: 0,
        bottom: 0,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        fontWeight: 500,
        justifyContent: 'center',
        width: '120px',
        margin: 'auto',
    }
  }))

export default function Progress(props: ProgressProps) {
    const classes = useStyles()

    return (
    <div className={classes.container}>
        <div className={classes.label}>{props.loading}</div>
        <CircularProgress color='inherit' size={150}/>
    </div>)
}