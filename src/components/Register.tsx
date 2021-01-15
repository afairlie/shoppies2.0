import React, {useState} from 'react'

// HELPERS
import { apiRegister } from '../helpers/authentication'

// TYPES
import type { Dispatch } from '../types'

type RegisterProps = {
    dispatch: Dispatch,
    history: any
}

export type RegisterFormState = {
    email: string
    password: string
    name: string
}

export default function Register({dispatch, history}: RegisterProps) {
    const [form, setForm] = useState<RegisterFormState>({
        email: '',
        password: '',
        name: ''
    })

    async function register(e: React.FormEvent<EventTarget>) {
        e.preventDefault();
        try {
            const result = await apiRegister(form)
            localStorage.setItem('token', result.token)
            dispatch({type: 'SET_LOGIN', data: result.username})
            setForm({email: '', password: '', name: ''})
            history.push('/')
        } catch (error) {
            dispatch({type: 'SET_ERROR', data: error.data.error})
        }
    }

    const onFormChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'email' | 'password' | 'name') => {
        const {value: nextValue} = e.target
        setForm(prev => ({...prev, [type]: nextValue}))
    }

    return (
    <div className='register'>
        <h1 className='title'>Register</h1>
        <form onSubmit={register}>
            <input type='username' value={form.name} onChange={e => onFormChange(e, 'name')} placeholder='username'/>
            <input type='email' value={form.email} onChange={e => onFormChange(e, 'email')} placeholder='email'/>
            <input type='password' value={form.password} onChange={e => onFormChange(e, 'password')} placeholder='password'/>
            <button type='submit' className='submit'>Submit</button>
        </form>
    </div>
  )
} 