import React, {
  useState, 
  useCallback, 
  useReducer, 
  useEffect} from 'react';
import {
  Switch,
  Route,
  NavLink,
  useHistory
} from "react-router-dom";

// HELPERS
import debounce from './helpers/debounce'
import updateResults from './helpers/updateResults'
import {checkLogin, decodeToken, logout} from './helpers/authentication'
import getSavedMovies from './helpers/getSavedMovies'
import saveNominations from './helpers/saveNominations'

// COMPONENTS
import Login from './components/Login'
import Register from './components/Register'

// TYPES
import {
  Movie,
  State,
  ActionType
} from './types'

import './App.css';

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
    }
    dispatch({type: 'REFRESH_RESULTS'})
  }, [state.nominations])

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
  
  return (
    <main className="App">
      <nav className='nav' style={{display: 'flex', justifyContent: 'space-between', padding: '5px'}}>
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
      </nav>
      {state.error && <p style={{color: 'red'}}>{state.error}</p>}
      <Switch>
        <Route path='/login'>
          <Login dispatch={dispatch} history={history} state={state}/>
        </Route>
        <Route path='/register'>
          <Register dispatch={dispatch} history={history}/>
        </Route>
        <Route path='/'>
            {state.banner && <p style={{color: 'green'}}>{state.banner}</p>}
            <div className='search' style={{
              textAlign: 'center',
              maxWidth: '500px',
              margin: 'auto'
              }}>
              <h1>search</h1>
              <input style={{
                width: 'calc(100% - 35px)', 
                margin: '0 5px',
                padding: '10px',
                border: '1px solid lightGrey',
                borderRadius: '20px'}} value={value} onChange={handleChange} placeholder='search a film'/>
            </div>
            <div className='results'>
              <h1>results</h1>
              {state.results.length > 0 && <ul>
                {state.results.map((movie: Movie, i: number) => 
                  <li key={i} style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    maxWidth: '500px', 
                    padding: '2px', 
                    margin: 'auto'}}>
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
                  <li key={i} style={{
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    maxWidth: '500px', 
                    padding: '2px', 
                    margin: 'auto'}}>
                    <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                    <button 
                      disabled={state.saved === 'saved'} 
                      onClick={() => dispatch({type: 'REMOVE_NOMINATION', data: movie})}>remove</button>
                  </li>
                )}
              </ul>
              {state.nominations.length === 5 && <div style={{
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  maxWidth: '500px',
                  margin: 'auto', 
                  backgroundColor: 'yellow', 
                  padding: '5px'}}>
                {state.saved === 'saved' && <>
                    <span style={{display: 'inline-block'}}>Your nominations are saved, click to edit: </span>
                    <button onClick={() => dispatch({type: 'SET_SAVED', data: 'edit'})}>edit</button>
                    </>}
                {!state.loggedIn && state.saved !== 'saved' && <>
                    <span style={{display: 'inline-block', textAlign: 'left'}}>You're not logged in. Would you like to save these nominations? </span>
                    <div>
                      <button onClick={() => history.push('/login?save=new')}>save new</button>
                    </div>
                  </>}
                {state.loggedIn && state.saved !== 'saved' && <>
                    <span style={{display: 'inline-block'}}>Click to save your nominations: </span>
                    <button onClick={async () => {
                      const token = localStorage.getItem('token')!
                      try {
                        const results = saveNominations(state.nominations, token, dispatch)
                        getSavedMovies(results, dispatch)
                      } catch (error) {
                        throw new Error(error)
                      }
                    }}>save</button>
                  </>}
              </div>}
            </div>
        </Route>
      </Switch>
    </main>
  );
}

export default App;
