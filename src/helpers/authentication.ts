import type {Dispatch, LoginType, RegisterType, Movie} from '../types'
import getSavedMovies from './getSavedMovies'
import saveNominations from './saveNominations'

const LOGIN = `https://shoppy-awards-api.herokuapp.com/login`
const NOMINATIONS = `https://shoppy-awards-api.herokuapp.com/nominations`
const REGISTER = `https://shoppy-awards-api.herokuapp.com/users`

async function apiLogin({email, password}: LoginType) {
    const response = await fetch(LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password})
    })
    const data = await response.json()
    // get token back or error status
    return response.status === 200 ? Promise.resolve(data) 
      : Promise.reject({status: response.status, data})
}

export async function login(e: any, form: LoginType, setForm: React.Dispatch<React.SetStateAction<LoginType>>, dispatch: Dispatch, history: any, newNoms?: Movie[]) {
    e.preventDefault();
    try {
        const result = await apiLogin(form)
        localStorage.setItem('token', result.token)
        if (newNoms) {
            saveNominations(newNoms, result.token, dispatch)
        } else if (result.nominations) {
            getSavedMovies(result, dispatch)
            dispatch({type: 'SET_SAVED', data: 'saved'})
        }
        dispatch({type: 'SET_LOGIN', data: result.username})
        setForm({email: '', password: ''})
        history.push('/')
    } catch (error) {
        dispatch({type: 'SET_ERROR', data: error.data.error})
    }
}

async function apiRegister({email, password, name}: RegisterType) {
    const response = await fetch(REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password, name})
    })
    const data = await response.json()
    // get token back or error status
    return response.status === 200 ? Promise.resolve(data) 
      : Promise.reject({status: response.status, data})
}

export async function register(e: any, form: RegisterType, setForm: React.Dispatch<React.SetStateAction<RegisterType>>, dispatch: Dispatch, history: any) {
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

export async function decodeToken(token: string) {
    // decode token - https://thinkster.io/tutorials/angularjs-jwt-auth/decoding-jwt-payloads
    const base64Url = token.split('.')[1]
    var base64 = base64Url.replace('-', '+').replace('_', '/')
    const user = await JSON.parse(atob(base64))

    return Promise.resolve(user)
}

export function logout(dispatch: Dispatch) {
    localStorage.removeItem('nominations')
    localStorage.removeItem('token')
    dispatch({type: 'SET_BANNER', data: ''})
    dispatch({type: 'SET_LOGIN', data: null})
    dispatch({type: 'SET_SAVED', data: ''})
    dispatch({type: 'REPLACE_NOMINATIONS', data: []})
}