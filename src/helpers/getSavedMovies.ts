import type {Dispatch} from '../App'

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

//   TO DO: set type for result
export default async function getSavedMovies(result:any, dispatch: Dispatch) {
    try {
        const m1 = await getMovie(result.nominations['1'])
        const m2 = await getMovie(result.nominations['2'])
        const m3 = await getMovie(result.nominations['3'])
        const m4 = await getMovie(result.nominations['4'])
        const m5 = await getMovie(result.nominations['5'])
        dispatch({type: 'REPLACE_NOMINATIONS', data: [m1, m2, m3, m4, m5]})
        localStorage.setItem('nominations', JSON.stringify(result.nominations))
      } catch (error) {
        dispatch({type: 'SET_ERROR', data: error.Error})
      }
} 