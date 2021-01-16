import React from 'react'
import {NavLink, Link} from 'react-router-dom'

// HELPERS
import {logout} from '../helpers/authentication'

// COMPONENTS
import GitHubIcon from '@material-ui/icons/GitHub'

// CSS
import './Nav.css'
import { makeStyles } from '@material-ui/core'

// TYPES
import type {Dispatch, State} from '../types'
type NavType = {
    dispatch: Dispatch
    state: State
    inputRef: any
}

const useStyles = makeStyles(() => ({
    root: {
        color: 'var(--purple)',
      }
}))

export default function Nav({dispatch, state, inputRef}: NavType){
    const classes = useStyles()
    return (<nav className='nav'>
            <div className='links-left'>
                <Link to='/' className='logo' onClick={e => e.currentTarget.blur()}>Shoppies 2.0</Link>
                <a href='https://github.com/afairlie/shoppies2.0' target='_blank' rel='noreferrer' onClick={e => e.currentTarget.blur()}>
                    <GitHubIcon classes={{root: classes.root}}/>
                </a>
            </div>
            <div className='links-right'>
                {state.loggedIn ?
                <>
                <div>
                    <span className='username'>@{state.loggedIn}</span>
                </div>
                <div>
                    <button onClick={e => {
                        e.currentTarget.blur()
                        inputRef.current?.focus()
                        logout(dispatch)
                    }}>Logout</button>
                </div>
                </>
                : <>
                <NavLink to='/login' onClick={e => e.currentTarget.blur()}>Login</NavLink>
                <NavLink to='/register' onClick={e => e.currentTarget.blur()}>Register</NavLink>
                </>}
            </div>
        </nav>)
}