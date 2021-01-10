import type {Movie} from '../App'

export default function updateResults(currentNoms: Movie[], results: Movie[]): Movie[] {
    return results.map((movie: Movie) => {
      // update results to reflect current nominations
      return {...movie, nominated: currentNoms.find(m => m.imdbID === movie.imdbID) ? true : false}
    })
}