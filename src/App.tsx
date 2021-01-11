import React, {useState, useCallback, useReducer, useEffect} from 'react';
import {
  Switch,
  Route,
  NavLink,
  useHistory
} from "react-router-dom";

// HELPERS
import debounce from './helpers/debounce'
import updateResults from './helpers/updateResults'
import {login, checkLogin, decodeToken, logout} from './helpers/authentication'
import getSavedMovies from './helpers/getSavedMovies'

import './App.css';

// TYPES
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

export type Login = {
  email: string
  password: string
}

export type Register = Login & {
  username: string
}

export type State = {
  results: Movie[]
  nominations: Movie[]
  error: string
  banner: string
  loggedIn: string | null
  saved: 'saved' | 'editing' | null
}

export type ActionType = 'SET_RESULTS' | 'REFRESH_RESULTS' | 'ADD_NOMINATION' | 'REMOVE_NOMINATION' | 'REPLACE_NOMINATIONS' | 'SET_SAVED' | 'SET_LOGIN' | 'SET_BANNER' | 'SET_ERROR'

export type Dispatch =  React.Dispatch<{
  type: ActionType;
  data?: any;
}>

function reducer(state: State, action: {type: ActionType, data?: any}): State {
  switch(action.type) {
    case 'SET_RESULTS': {
      const formattedResults = updateResults(state.nominations, action.data)
      return {...state, results: formattedResults}
    }
    case 'REFRESH_RESULTS': {
      const formattedResults = updateResults(state.nominations, state.results)
      return {...state, results: formattedResults}
    }
    case 'ADD_NOMINATION': {
      if (state.nominations.length < 5) {
        return {...state, nominations: [...state.nominations, {...action.data, nominated: true}]}
      }
      return {...state, error: "Sorry, you can only add 5 films."}
    }
    case 'REMOVE_NOMINATION': {
      let newState = state;
      if (state.nominations.length === 5) {
        newState.banner = ''
      }
      return {...newState, nominations: state.nominations.filter((m: Movie) => m.imdbID !== action.data.imdbID)}
    }
    case 'REPLACE_NOMINATIONS': {
      return {...state, nominations: action.data}
    }
    case 'SET_SAVED': {
      localStorage.setItem('mode', action.data)
      return {...state, saved: action.data}
    }
    case 'SET_LOGIN': {
      return {...state, loggedIn: action.data}
    }
    case 'SET_BANNER': {
      return {...state, banner: action.data}
    }
    case 'SET_ERROR': {
      return {...state, error: action.data}
    }
    default:
      throw new Error('reducer action undefined')
  }
}

const initialState: State = {
  results: [],
  nominations: [],
  error: '',
  banner: '',
  loggedIn: '',
  saved: null
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
      dispatch({type: 'SET_RESULTS', data: parsed.Search || []})
    } catch (error) {
      dispatch({type: 'SET_ERROR', data: error})
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

  // CLEAR ERROR AFTER 2 SECONDS
  useEffect(() => {
    if (state.error) {
      setTimeout(() => {
        dispatch({type: 'SET_ERROR', data: ''})
      }, 2000)
    }
  }, [state.error])

  useEffect(() => {
    if (state.nominations.length === 5) {
      dispatch({type: 'SET_BANNER', data: "Congratulations! You've nominated 5 films!"})
      if (state.saved === 'saved') {
        // show edit button, disable all remove
      }
    }
    dispatch({type: 'REFRESH_RESULTS'})
  }, [state.nominations, state.saved])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      checkLogin(token)
      .then(async result => {
        const decoded = await decodeToken(token)
        dispatch({type: 'SET_LOGIN', data: decoded.username})
        dispatch({type: 'SET_SAVED', data: localStorage.getItem('mode')})
        if (result.nominations) {
          getSavedMovies(result, dispatch)
        }
      })
      .catch(e => {
          if (e.data.error === 'Expired Token') {
            localStorage.removeItem('token')
          }
          dispatch({type: 'SET_ERROR', data: e.data.error})
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
            <button onClick={() => {logout(dispatch)}}>Logout</button>
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
        </Route>
        <Route path='/register'>
          <div className='register'>
            <h1>register</h1>
          </div>
        </Route>
        <Route path='/'>
            {state.banner && <p style={{color: 'green'}}>{state.banner}</p>}
            <div className='search' style={{textAlign: 'center'}}>
              <h1>search</h1>
              <input value={value} onChange={handleChange} placeholder='search a film' style={{width: '100%', maxWidth: '500px', margin: '0 5px'}} />
            </div>
            <div className='results'>
              <h1>results</h1>
              {state.results.length > 0 && <ul>
                {state.results.map((movie: Movie, i: number) => 
                  <li key={i} style={{display: 'flex', justifyContent: 'space-between', maxWidth: '500px', padding: '2px', margin: 'auto'}}>
                    <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                    <button disabled={movie.nominated} onClick={() => dispatch({type: 'ADD_NOMINATION', data: movie})}>nominate</button>
                  </li>
                )}
              </ul>}
              {/* {state.results.length === 0 && value.length > 0 && <p>no results for "{value}"</p>} */}
            </div>
            <div className='nominations'>
              <h1>nominations</h1>
              <ul>
                {state.nominations.map((movie: Movie, i: number) => 
                  <li key={i} style={{display: 'flex', justifyContent: 'space-between', maxWidth: '500px', padding: '2px', margin: 'auto'}}>
                    <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                    <button disabled={state.saved === 'saved'} onClick={() => dispatch({type: 'REMOVE_NOMINATION', data: movie})}>remove</button>
                  </li>
                )}
              </ul>
              <div style={{display: 'flex', justifyContent: 'space-between', maxWidth: '500px', margin: 'auto'}}>
              {state.saved === 'saved' && 
                  <>
                  <span style={{display: 'inline-block'}}>Your nominations are saved, click to edit: </span>
                  <button onClick={() => dispatch({type: 'SET_SAVED', data: 'edit'})}>edit</button>
                  </>
              }
              {!state.loggedIn && state.saved !== 'saved' && state.nominations.length === 5 && 
                <>
                  {/* login & save these noms - OR - login and retrieve old noms */}
                  <span style={{display: 'inline-block'}}>Login to save your nominations </span>
                  <div>
                    <button style={{margin: '0 10px'}}>save these noms</button>
                    <button  style={{marginLeft: '10px'}}>retrieve previous</button>
                  </div>
                </>}
              {state.loggedIn && state.saved !== 'saved' && state.nominations.length === 5 &&  
                <>
                  <span style={{display: 'inline-block'}}>Click to save your nominations: </span>
                  <button onClick={async () => {
                      const token = localStorage.getItem('token')
                      const formattedNoms: any = {}
                      state.nominations.forEach((m, i) => formattedNoms[`${i+1}`] = m.imdbID)
                      try {
                        let results = await fetch('http://localhost:3001/nominations', {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                              'Authorization': 'Bearer ' + token
                          },
                          body: JSON.stringify(formattedNoms)
                        })
                        results = await results.json()
                        dispatch({type: 'SET_SAVED', data: 'saved'})
                        getSavedMovies(results, dispatch)
                      } catch (error) {
                        throw new Error(error.status)
                      }
                  }}>save</button>
                </>
              }
              </div>
            </div>
        </Route>
      </Switch>
    </main>
  );
}

export default App;
