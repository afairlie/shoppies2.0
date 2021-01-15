import React from 'react'
import {NavLink, Link} from 'react-router-dom'
import type {Dispatch, State} from '../types'
import {logout} from '../helpers/authentication'

import './Nav.css'

type NavType = {
    dispatch: Dispatch
    state: State
}

export default function Nav({dispatch, state}: NavType){
    return (<nav className='nav'>
            <div className='links-left'>
                <Link to='/' className='logo' onClick={e => e.currentTarget.blur()}>Shoppies 2.0</Link>
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