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
      throw error
    }
  }

//   TO DO: set type for nominations: {'1': 'imdbID', ...}
export default async function getSavedMovies(nominations: any) {
    try {
        return await Promise.all([
          getMovie(nominations['1']),
          getMovie(nominations['2']),
          getMovie(nominations['3']),
          getMovie(nominations['4']),
          getMovie(nominations['5']),
        ])
      } catch (error) {
        throw error
      }
} 