import React, {useState, Component} from 'react'
import {LoginType, Dispatch} from '../types'
import {login} from '../helpers/authentication'

type LoginProps = {
    dispatch: Dispatch,
    history: any
}

export default function Login({dispatch, history}: LoginProps) {
    const [form, setForm] = useState<LoginType>({
        email: '',
        password: ''
    })

    const onFormChange = (e:any, type: string) => {
    const {value: nextValue} = e.target
    setForm(prev => ({...prev, [type]: nextValue}))
    }

    return (
    <div className='login'>
        <h1>login</h1>
        <form onSubmit={e => login(e, form, setForm, dispatch, history)}>
            <input type='email' value={form.email} onChange={e => onFormChange(e, 'email')} placeholder='email'/>
            <input type='password' value={form.password} onChange={e => onFormChange(e, 'password')} placeholder='password'/>
            <button type='submit'>Submit</button>
        </form>
        <div style={{backgroundColor: 'lightgrey', maxWidth: '350px', padding: '20px', margin: 'auto', marginTop: '20px'}}>
            <h2>use for testing</h2>
            <p>email: test@email.com</p>
            <p>password: fakepassword</p>
        </div>
    </div>
  )
} 