import React from 'react'

// HELPERS
import getSavedMovies from '../helpers/getSavedMovies'
import saveNominations from '../helpers/saveNominations'

// CSS


// TYPES
import type {Dispatch, State, Movie} from '../types'

type NominationsProps = {
    state: State
    dispatch: Dispatch
    history: any
}

export default function Nominations({state, dispatch, history}: NominationsProps) {
    return (<div className='nominations'>
                <h1 style={state.nominations.length > 0 ? {
                    color: 'var(--purple)',
                    border: '1px solid var(--purple)',
                    maxWidth: '495px',
                    margin: '20px auto',
                    padding: '.2em'
                } : {color: 'lightGray'}}>nominations</h1>
                {!state.nominations.length && <h2 style={{color: 'var(--purple)'}}>..add your favourite films to the list!</h2>}
                <ul>
                    {state.nominations.map((movie: Movie, i: number) => 
                    <li key={i} className='nomination' style={{
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        maxWidth: '500px', 
                        padding: '2px', 
                        margin: 'auto'}}>
                        <span style={{display: 'inline-block'}}>{`${movie.Title}, ${movie.Year}`}</span>
                        <button 
                        disabled={state.saved === 'saved'} 
                        onClick={e => {
                            e.currentTarget.blur()
                            dispatch({type: 'REMOVE_NOMINATION', data: movie})
                        }}>remove</button>
                    </li>
                    )}
                </ul>
                {state.nominations.length === 5 && <div className='nominations-banner'>
                    {state.saved === 'saved' && <>
                        <span style={{display: 'inline-block', paddingTop: '3px'}}>Your nominations are saved, click to edit: </span>
                        <button onClick={() => {
                                dispatch({type: 'SET_MODE', data: 'edit'})
                            }}>edit</button>
                        </>}
                    {!state.loggedIn && state.saved !== 'saved' && <>
                        <span style={{display: 'inline-block', textAlign: 'left'}}>You're not logged in. Would you like to save these nominations? </span>
                        <button onClick={() => history.push('/login?save=new')}>save new</button>

                    </>}
                    {state.loggedIn && state.saved !== 'saved' && <>
                        <span style={{display: 'inline-block'}}>Click to save your edits: </span>
                        <button onClick={async () => {
                        const token = localStorage.getItem('token')!
                            try {
                                const results = await saveNominations(state.nominations, token)
                                const nominations = await getSavedMovies(results.nominations)
                                dispatch({type: 'SET_NOMINATIONS', data: nominations})
                                localStorage.setItem('nominations', JSON.stringify(state.nominations))
                                dispatch({type: 'SET_MODE', data: 'saved'})
                            } catch (error) {
                                throw new Error(error)
                            }
                        }}>save</button>
                    </>}
                </div>}
            </div>)
}