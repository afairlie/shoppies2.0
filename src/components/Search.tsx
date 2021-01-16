import React, {useCallback, useRef} from 'react'

// HELPERS
import debounce from '../helpers/debounce'

// COMPONENTS
// import HighlightOffRoundedIcon from '@material-ui/icons/HighlightOffRounded';
import CloseIcon from '@material-ui/icons/Close';

// CSS
import './Search.css'
import { makeStyles } from '@material-ui/core/styles';

// TYPES
import type {Dispatch, Movie} from '../types'

type SearchProps = {
  dispatch: Dispatch
  results: Movie[]
  searchTerm: string
}

const useStyles = makeStyles(() => ({
  root: {
    fontSize: '2rem',
    color: 'var(--light-purple)',
    position: 'absolute',
    right: 5,
    paddingTop: '3px',
    '&:hover': {
      cursor: 'pointer',
      color: 'var(--purple)'
    },
  }
}))

export default function Search({dispatch, results, searchTerm}: SearchProps) {
    const classes = useStyles()
    const inputEl = useRef<HTMLInputElement>(null)
    // QUERY OMDB API
    async function search(term: string) {
      const key = process.env.REACT_APP_OMDB;
      if (!term) {
        dispatch({type: 'SET_RESULTS', data: []})
      }
      try {
        const result: any = await fetch(`https://www.omdbapi.com/?apikey=${key}&s=${term.trim()}&type=movie`)
        const parsed = await result.json()
        dispatch({type: 'SET_RESULTS', data: parsed.Search || []})
      } catch (error) {
        dispatch({type: 'SET_ERROR', data: 'Omdb API error'})
      }
    }

    // DEBOUNCED SEARCH - https://divyanshu013.dev/blog/react-debounce-throttle-hooks/
    // eslint-disable-next-line
    const debouncedSearch = useCallback(debounce((searchTerm:string) => search(searchTerm), 500), [])

    const handleChange = (e:any) => {
        const {value: nextSearchTerm} = e.target
        dispatch({type: 'SET_SEARCH', data: nextSearchTerm})
        debouncedSearch(nextSearchTerm)
    }

    return (
      <div className='search'>
        <div className='input-container'>
          <input 
            ref={inputEl}
            className='search-input' 
            value={searchTerm} 
            onChange={handleChange} 
            placeholder='search a film' 
            autoFocus={true}/>
            <CloseIcon classes={classes} onClick={e => {
                e.currentTarget.blur()
                inputEl.current?.focus()
                dispatch({type: 'SET_SEARCH', data: ''})
                dispatch({type: 'SET_RESULTS', data: []})
              }}/>
        </div>
        <div className='results'>
          {results.length > 0 && <ul>
            {results.map((movie: Movie, i: number) => 
              <li key={i} className='result'>
                <span>{`${movie.Title}, ${movie.Year}`}</span>
                <button 
                  disabled={movie.nominated} 
                  onClick={e => {
                    e.currentTarget.blur()
                    dispatch({type: 'ADD_NOMINATION', data: movie})
                  }}>nominate</button>
              </li>
            )}
          </ul>}
        </div>
    </div>
    )
}