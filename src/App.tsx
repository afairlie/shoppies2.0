import React, {
  useReducer, 
  useEffect,
  useRef} from 'react';
import {
  Switch,
  Route,
  useHistory
} from "react-router-dom";

// HELPERS
import checkResultsAndNoms from './helpers/checkResultsAndNoms'
import {checkLogin, decodeToken} from './helpers/authentication'
import getSavedMovies from './helpers/getSavedMovies'

// COMPONENTS
import Nav from './components/Nav'
import Login from './components/Login'
import Register from './components/Register'
import Search from './components/Search'
import Nominations from './components/Nominations'

// CSS
import './App.css'
import './forms.css'

// TYPES
import {
  Movie,
  State,
  ActionType
} from './types'

function reducer(state: State, action: {type: ActionType, data?: any}): State {
  switch(action.type) {
    case 'SET_SEARCH': {
      return {...state, searchTerm: action.data}
    }
    case 'SET_RESULTS': {
      const formattedResults = checkResultsAndNoms(state.nominations, action.data)
      return {...state, results: formattedResults}
    }
    case 'REFRESH_RESULTS': {
      const formattedResults = checkResultsAndNoms(state.nominations, state.results)
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
    case 'SET_NOMINATIONS': {
      return {...state, nominations: action.data}
    }
    case 'SET_MODE': {
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
  saved: null,
  searchTerm: ''
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  let history = useHistory()
  const searchInput = useRef<HTMLInputElement>(null)

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
    const mode = localStorage.getItem('mode')
    if (token) {
      checkLogin(token)
      .then(async response => {
        const decoded = decodeToken(token)
        dispatch({type: 'SET_LOGIN', data: decoded.username})
        dispatch({type: 'SET_MODE', data: mode })
        if (response.nominations) {
          try {
            const nominations: Movie[] = await getSavedMovies(response.nominations)
            dispatch({type: 'SET_NOMINATIONS', data: nominations})
            localStorage.setItem('nominations', JSON.stringify(nominations))
          } catch (error) {
            dispatch({type: 'SET_ERROR', data: error.data.error})
          }
        }
      })
      .catch(e => {
          if (e.data.error === 'Expired Token') {
            localStorage.removeItem('token')
          }
          // make this conditional only if token expired within last 30 mins?
          dispatch({type: 'SET_ERROR', data: e.data.error})
      })
    }
  }, [])
  
  return (<>
      <Nav state={state} dispatch={dispatch} inputRef={searchInput}/>
      <main className="app">
        <Switch>
          <Route path='/login'>
            <Login dispatch={dispatch} history={history} state={state}>
              <div className='alert'>
                {state.error && <p style={{color: 'red'}}>{state.error}</p>}
              </div>
            </Login>
          </Route>
          <Route path='/register'>
            <Register dispatch={dispatch} history={history}>
              <div className='alert'>
                {state.error && <p style={{color: 'red'}}>{state.error}</p>}
              </div>
            </Register>
          </Route>
          <Route path='/'>
              <div className='alert'>
                {state.error && <p style={{color: 'red'}}>{state.error}</p>}
                {state.banner && !state.error && <p style={{color: 'green'}}>{state.banner}</p>}
              </div>
              <Search dispatch={dispatch} results={state.results} searchTerm={state.searchTerm} inputRef={searchInput}/>
              <Nominations state={state} dispatch={dispatch} history={history}/>
          </Route>
        </Switch>
      </main>
    </>
  );
}

export default App;
