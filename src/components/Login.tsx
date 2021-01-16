import React, { useState } from 'react'
import {useLocation} from 'react-router-dom'

// HELPERS
import { apiLogin } from '../helpers/authentication'
import saveNominations from '../helpers/saveNominations'
import getSavedMovies from '../helpers/getSavedMovies'

// COMPONENTS
import Progress from './Progress'

// TYPES
import type { Dispatch, State, Movie } from '../types'
import type { LoadStatus } from './Progress'

type LoginProps = {
    dispatch: Dispatch,
    history: any
    state: State
    children: any
}

export type LoginFormState = {
    email: string
    password: string
}

export default function Login({dispatch, history, state, children}: LoginProps) {
    let query = new URLSearchParams(useLocation().search)
    const [loading, setLoading] = useState<LoadStatus>('')
    const [form, setForm] = useState<LoginFormState>({
        email: '',
        password: ''
    })

    async function login(e: React.FormEvent<EventTarget>){
        e.preventDefault();
        setLoading('logging in')
        let nominations: Movie[];
        try {
            const response = await apiLogin(form)
            localStorage.setItem('token', response.token)
            if (query.get('save') === 'new') {
                setLoading('saving nominations')
                nominations = await saveNominations(state.nominations, response.token)
            } else {
                setLoading('retrieving nominations')
                nominations = await getSavedMovies(response.nominations)
                dispatch({type: 'SET_NOMINATIONS', data: nominations})
            }
            localStorage.setItem('nominations', JSON.stringify(nominations))
            dispatch({type: 'SET_SAVED', data: 'saved'})
            dispatch({type: 'SET_LOGIN', data: response.username})
            setForm({email: '', password: ''})
            setLoading('')
            history.push('/')
        } catch (error) {
            dispatch({type: 'SET_ERROR', data: error.data.error})
            setForm({email: '', password: ''})
            setLoading('')
        }
    }

    const onFormChange = (e:any, type: 'email' | 'password') => {
        const {value: nextValue} = e.target
        setForm(prev => ({...prev, [type]: nextValue}))
    }

    return (
    <div className='login'>
        <h1 className='title'>Login</h1>
        {children}
        {!!loading && <Progress loading={loading}/>}
        {!loading && <>
            <form onSubmit={login}>
                <input type='email' value={form.email} onChange={e => onFormChange(e, 'email')} placeholder='email'/>
                <input type='password' value={form.password} onChange={e => onFormChange(e, 'password')} placeholder='password'/>
                <button type='submit' className='submit' onClick={e => e.currentTarget.blur()}>Submit</button>
            </form>
            <div className='credentials' style={{ margin: '5vh auto 0', borderRadius: '10px', color: 'gray'}}>
                <h2>use for testing</h2>
                <p>email: test@email.com</p>
                <p>password: fakepassword</p>
            </div>
        </>}
    </div>
  )
} 