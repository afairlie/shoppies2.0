// TYPES
import type { Dispatch } from '../types'
import { LoginFormState } from '../components/Login'
import { RegisterFormState } from '../components/Register'

// ROUTES
const LOGIN = `https://shoppy-awards-api.herokuapp.com/login`
const NOMINATIONS = `https://shoppy-awards-api.herokuapp.com/nominations`
const REGISTER = `https://shoppy-awards-api.herokuapp.com/users`

export async function apiLogin({email, password}: LoginFormState) {
    const response = await fetch(LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password})
    })
    const data = await response.json()
    return response.status === 200 ? Promise.resolve(data) 
      : Promise.reject({status: response.status, data})
}

export async function apiRegister({email, password, name}: RegisterFormState) {
    const response = await fetch(REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password, name})
    })
    const data = await response.json()
    return response.status === 200 ? Promise.resolve(data) 
      : Promise.reject({status: response.status, data})
}

export async function checkLogin(token: string) {
    const response = await fetch(NOMINATIONS, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const data = await response.json()
    return response.status === 200 ? Promise.resolve(data)
        : Promise.reject({status: response.status, data})
}

export function decodeToken(token: string) {
    // decode token - https://thinkster.io/tutorials/angularjs-jwt-auth/decoding-jwt-payloads
    const base64Url = token.split('.')[1]
    var base64 = base64Url.replace('-', '+').replace('_', '/')
    return JSON.parse(atob(base64))
}

export function logout(dispatch: Dispatch) {
    localStorage.removeItem('nominations')
    localStorage.removeItem('token')
    localStorage.removeItem('mode')
    dispatch({type: 'SET_BANNER', data: ''})
    dispatch({type: 'SET_LOGIN', data: null})
    dispatch({type: 'SET_SAVED', data: ''})
    dispatch({type: 'SET_NOMINATIONS', data: []})
    dispatch({type: 'SET_SEARCH', data: ''})
}