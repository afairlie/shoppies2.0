import React, {useState} from 'react'
import {useLocation} from 'react-router-dom'
import {LoginType, Dispatch, State} from '../types'
import {login} from '../helpers/authentication'

type LoginProps = {
    dispatch: Dispatch,
    history: any,
    state: State
}

export default function Login({dispatch, history, state}: LoginProps) {
    let query = new URLSearchParams(useLocation().search)
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
        <h1 className='title'>Login</h1>
        <form onSubmit={e => {
                if (query.get('save') === 'new') {
                    login(e, form, setForm, dispatch, history, state.nominations)              
                } else {
                    login(e, form, setForm, dispatch, history)
                }
            }}>
            <input type='email' value={form.email} onChange={e => onFormChange(e, 'email')} placeholder='email'/>
            <input type='password' value={form.password} onChange={e => onFormChange(e, 'password')} placeholder='password'/>
            <button type='submit' style={{margin: '15px auto 0px'}}>Submit</button>
        </form>
        <div className='credentials' style={{ margin: '5vh auto 0', borderRadius: '10px', color: 'gray'}}>
            <h2>use for testing</h2>
            <p>email: test@email.com</p>
            <p>password: fakepassword</p>
        </div>
    </div>
  )
} 