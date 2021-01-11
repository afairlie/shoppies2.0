import React, {useState, useCallback, useReducer, useEffect} from 'react';
import {
  Switch,
  Route,
  NavLink,
  useHistory
} from "react-router-dom";
import debounce from './helpers/debounce'
import updateResults from './helpers/updateResults'
import {login, refreshLogin, decodeToken} from './helpers/authentication'

import './App.css';

export type SearchResult = {
  Poster: string
  Title: string
  Type: string
  Year: string
  imdbID: string
}

export type Movie = SearchResult & {
  nominated: boolean
}

export type State = {
  results: Movie[]
  nominations: Movie[]
  error: string
  loggedIn: string | null
}

export type Login = {
  email: string
  password: string
}

export type Register = Login & {
  username: string
}

// TO DO: define action type
function reducer(state: State, action: any): State {
  switch(action.type) {
    case 'SET_RESULTS': {
      const formattedResults = updateResults(state.nominations, action.results)
      return {...state, results: formattedResults}
    }
    case 'REFRESH_RESULTS': {
      const formattedResults = updateResults(state.nominations, state.results)
      return {...state, results: formattedResults}
    }
    case 'ADD_NOMINATION': {
      if (state.nominations.length < 5) {
        return {...state, nominations: [...state.nominations, {...action.nomination, nominated: true}]}
      }
      return {...state, error: "error adding nomination"}
    }
    case 'REMOVE_NOMINATION': {
      return {...state, nominations: state.nominations.filter((m: Movie) => m.imdbID !== action.nomination.imdbID)}
    }
    case 'REPLACE_NOMINATIONS': {
      return {...state, nominations: action.nominations}
    }
    case 'SET_LOGIN': {
      return {...state, loggedIn: action.loggedIn}
    }
    case 'SET_ERROR': {
      return {...state, error: action.error}
    }
    case 'CLEAR_ERROR': {
      return {...state, error: ''}
    }
    default:
      throw new Error('reducer action undefined')
  }
}

const initialState: State = {
  results: [],
  nominations: [],
  error: '',
  loggedIn: ''
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  let history = useHistory()
  // SEARCH INPUT
  const [value, setValue] = useState<string>('')
  // LOGIN INPUTS
  const [form, setForm] = useState<Login>({
    email: '',
    password: ''
  })
  
  // QUERY API
  async function search(term: string) {
    // FETCH
    try {
      const result: any = await fetch(`https://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB}&s=${term}&type=movie`)
      const parsed = await result.json()
      dispatch({type: 'SET_RESULTS', results: parsed.Search || []})
    } catch (error) {
      dispatch({type: 'SET_ERROR', error})
    }
  }

  async function getMovie(id: string) {
    try {
      const result: any = await fetch(`https://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB}&i=${id}&type=movie`)
      const parsed = await result.json()
      return {
        Poster: parsed.Poster,
        Title: parsed.Title,
        Type: parsed.Type,
        Year: parsed.Year,
        imdbID: parsed.imdbID,
        nominated: true,
      }
    } catch (error) {
      return error
    }
  }

  // DEBOUNCED SEARCH - https://divyanshu013.dev/blog/react-debounce-throttle-hooks/
  // eslint-disable-next-line
  const debouncedSearch = useCallback(debounce((searchTerm:string) => search(searchTerm), 500), [])

  const handleChange = (e:any) => {
    const {value: nextValue} = e.target
    setValue(nextValue)
    debouncedSearch(nextValue)
  }

  useEffect(() => {
    if (state.error) {
      setTimeout(() => {
        dispatch({type: 'CLEAR_ERROR'})
      }, 2000)
    }
  }, [state.error])

  useEffect(() => {
    dispatch({type: 'REFRESH_RESULTS'})
  }, [state.nominations])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      refreshLogin(token)
      .then(async result => {
        const decoded = await decodeToken(token)
        dispatch({type: 'SET_LOGIN', loggedIn: decoded.username})

        if (result.nominations) {
          const m1 = await getMovie(result.nominations['1'])
          const m2 = await getMovie(result.nominations['2'])
          const m3 = await getMovie(result.nominations['3'])
          const m4 = await getMovie(result.nominations['4'])
          const m5 = await getMovie(result.nominations['5'])
          dispatch({type: 'REPLACE_NOMINATIONS', nominations: [m1, m2, m3, m4, m5]})
        }
      })
      .catch(e => {
          dispatch({type: 'SET_ERROR', error: e.data.error})
      })
    }
  }, [])
  
  // LOGIN FORM
  const onFormChange = (e:any, type: string) => {
    const {value: nextValue} = e.target
    setForm(prev => ({...prev, [type]: nextValue}))
  }
  
  return (
    <main className="App">
      <div className='nav' style={{display: 'flex', justifyContent: 'space-between', padding: '5px'}}>
        <div>
          <NavLink to='/'>Shoppies 2.0</NavLink>
        </div>
        <div>
          {state.loggedIn ?
          <>
            <span style={{verticalAlign: '-2px'}}>@{state.loggedIn}</span>
            &nbsp;
            <button onClick={() => {
              localStorage.removeItem('nominations')
              localStorage.removeItem('token')
              dispatch({type: 'SET_LOGIN', loggedIn: null})
              dispatch({type: 'REPLACE_NOMINATIONS', nominations: []})
            }}>Logout</button>
          </>
          : <>
            <NavLink to='/login' style={{display: 'inline-block'}}>Login</NavLink>
            &nbsp;
            <NavLink to='/register' style={{display: 'inline-block'}}>Register</NavLink>
          </>}
        </div>
      </div>
      {state.error && <p style={{color: 'red'}}>{state.error}</p>}
      <Switch>
        <Route path='/login'>
          <div className='login'>
            <h1>login</h1>
            <form onSubmit={async e => {
              e.preventDefault();
              try {
                const result = await login(form)
                localStorage.setItem('token', result.token)
                if (result.nominations) {
                  try {
                    const m1 = await getMovie(result.nominations['1'])
                    const m2 = await getMovie(result.nominations['2'])
                    const m3 = await getMovie(result.nominations['3'])
                    const m4 = await getMovie(result.nominations['4'])
                    const m5 = await getMovie(result.nominations['5'])
                    dispatch({type: 'REPLACE_NOMINATIONS', nominations: [m1, m2, m3, m4, m5]})
                  } catch (error) {
                    dispatch({type: 'SET_ERROR', error: error.Error})
                  }
                  localStorage.setItem('nominations', JSON.stringify(result.nominations))
                }
                dispatch({type: 'SET_LOGIN', loggedIn: result.username})
                setForm({email: '', password: ''})
                history.push('/')
              } catch (error) {
                dispatch({type: 'SET_ERROR', error: error.message.error})
              }
            }}>
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
        </Route>
        <Route path='/register'>
          <div className='register'>
            <h1>register</h1>
          </div>
        </Route>
        <Route path='/'>
            <div className='search' style={{textAlign: 'center'}}>
              <h1>search</h1>
              <input value={value} onChange={handleChange} placeholder='search a film' style={{width: '100%', maxWidth: '500px', margin: '0 5px'}} />
            </div>
            <div className='results'>
              <h1>results</h1>
              <ul>
                {state.results.map((movie: Movie, i: number) => 
                  <li key={i} style={{display: 'flex', justifyContent: 'space-between', maxWidth: '500px', padding: '2px', margin: 'auto'}}>
                    <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                    <button disabled={movie.nominated} onClick={() => dispatch({type: 'ADD_NOMINATION', nomination: movie})}>nominate</button>
                  </li>
                )}
              </ul>
            </div>
            <div className='nominations'>
              <h1>nominations</h1>
              <ul>
                {state.nominations.map((movie: Movie, i: number) => 
                  <li key={i} style={{display: 'flex', justifyContent: 'space-between', maxWidth: '500px', padding: '2px', margin: 'auto'}}>
                    <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                    <button onClick={() => dispatch({type: 'REMOVE_NOMINATION', nomination: movie})}>remove</button>
                  </li>
                )}
              </ul>
            </div>
        </Route>
      </Switch>
    </main>
  );
}

export default App;
