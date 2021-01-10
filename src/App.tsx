import React, {useState, useCallback, useReducer, useEffect} from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import debounce from './helpers/debounce'
import updateResults from './helpers/updateResults'

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
  error: ''
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)
  // SEARCH INPUT
  const [value, setValue] = useState<string>('')
  
  // QUERY API
  async function search(term: string) {
    // FETCH
    try {
      const result: any = await fetch(`https://www.omdbapi.com/?apikey=${process.env.REACT_APP_OMDB}&s=${term}&type=movie`)
      const parsed = await result.json()
      dispatch({type: 'SET_RESULTS', results: parsed.Search || []})
    } catch (error) {
      throw new Error(error)
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
  
  return (
    <main className="App">
      <div className='nav'>nav</div>
      {state.error && <p style={{color: 'red'}}>{state.error}</p>}
      <Switch>
        <Route path='/login'>
          <div className='login'>login</div>
        </Route>
        <Route path='/'>
            <div className='search'>
              <h1>search</h1>
              <input value={value} onChange={handleChange} placeholder='search a film'/>
            </div>
            <div className='results'>
              <h1>results</h1>
              <ul>
                {state.results.map((movie: Movie, i: number) => 
                  <li key={i}>
                    {`${movie.Title}, ${movie.Year}`}
                    <button disabled={!!movie.nominated} onClick={() => dispatch({type: 'ADD_NOMINATION', nomination: movie})}>nominate</button>
                  </li>
                )}
              </ul>
            </div>
            <div className='nominations'>
              <h1>nominations</h1>
              <ul>
                {state.nominations.map((movie: Movie, i: number) => 
                  <li key={i}>
                    {movie.Title}
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
