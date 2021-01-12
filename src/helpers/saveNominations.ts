import type {Dispatch, Movie} from '../types'
// import getSavedMovies from './getSavedMovies'

export default async function saveNominations(nominations: Movie[], token: string, dispatch: Dispatch) {
    const formattedNoms: any = {}
    nominations.forEach((m, i) => formattedNoms[`${i+1}`] = m.imdbID)
    try {
      let results = await fetch('https://shoppy-awards-api.herokuapp.com/nominations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formattedNoms)
      })
      results = await results.json()
      dispatch({type: 'SET_SAVED', data: 'saved'})
      return results
    } catch (error) {
      return new Error(error.status)
    }
}