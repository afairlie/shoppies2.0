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

//   TO DO: set type for nominations: {'1': 'imdbID', ...}
export default async function getSavedMovies(nominations: any) {
    try {
        const m1 = await getMovie(nominations['1'])
        const m2 = await getMovie(nominations['2'])
        const m3 = await getMovie(nominations['3'])
        const m4 = await getMovie(nominations['4'])
        const m5 = await getMovie(nominations['5'])
        const data = [m1, m2, m3, m4, m5]
        console.log(data)
        return data
      } catch (error) {
        return error
      }
} 