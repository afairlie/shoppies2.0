import type {Dispatch, Login} from '../App'
import getSavedMovies from './getSavedMovies'

const LOGIN = `http://localhost:3001/login`
const NOMINATIONS = `http://localhost:3001/nominations`

async function apiLogin({email, password}: {email: string, password: string}) {
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

export async function login(e: any, form: Login, setForm: React.Dispatch<React.SetStateAction<Login>>, dispatch: Dispatch, history: any) {
    e.preventDefault();
    try {
        const result = await apiLogin(form)
        localStorage.setItem('token', result.token)
        if (result.nominations) {
        getSavedMovies(result, dispatch)
        dispatch({type: 'SET_SAVED', data: 'saved'})
        }
        dispatch({type: 'SET_LOGIN', data: result.username})
        setForm({email: '', password: ''})
        history.push('/')
    } catch (error) {
        dispatch({type: 'SET_ERROR', data: error.message.error})
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