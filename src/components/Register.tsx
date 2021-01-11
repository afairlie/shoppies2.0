import React, {useState} from 'react'
import {RegisterType, Dispatch} from '../types'
import {register} from '../helpers/authentication'

type RegisterProps = {
    dispatch: Dispatch,
    history: any
}

export default function Register({dispatch, history}: RegisterProps) {
    const [form, setForm] = useState<RegisterType>({
        email: '',
        password: '',
        name: ''
    })

    const onFormChange = (e:any, type: string) => {
    const {value: nextValue} = e.target
    setForm(prev => ({...prev, [type]: nextValue}))
    }

    return (
    <div className='register'>
        <h1>register</h1>
        <form onSubmit={e => register(e, form, setForm, dispatch, history)}>
            <input type='username' value={form.name} onChange={e => onFormChange(e, 'name')} placeholder='username'/>
            <input type='email' value={form.email} onChange={e => onFormChange(e, 'email')} placeholder='email'/>
            <input type='password' value={form.password} onChange={e => onFormChange(e, 'password')} placeholder='password'/>
            <button type='submit'>Submit</button>
        </form>
    </div>
  )
} 