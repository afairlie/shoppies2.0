import React from 'react'

// COMPONENTS
import CircularProgress from '@material-ui/core/CircularProgress';

// CSS
import { makeStyles } from '@material-ui/core/styles';

// TYPES
export type LoadStatus = 'logging in' | 'waiting on heroku' | 'saving nominations' | 'retrieving nominations' | 'registering' | ''

type ProgressProps = {
    loading: LoadStatus
}

const useStyles = makeStyles(() => ({
    root: {
        color:'var(--yellow)',
        margin: '50px auto',
        position: 'relative',
        width: 'max-content',
    },
    label: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: "absolute",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 500,
        color: 'var(--purple)'
    }
  }))

export default function Progress(props: ProgressProps) {
    const classes = useStyles()

    return (
    <div className={classes.root}>
        <div className={classes.label}>{props.loading}</div>
        <CircularProgress color='inherit' size={150}/>
    </div>)
}