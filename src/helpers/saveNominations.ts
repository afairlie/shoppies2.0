import type { Movie } from '../types'

export default async function saveNominations(nominations: Movie[], token: string) {
    const formattedNoms:any = {}
    console.log(nominations)
    nominations.forEach((m, i) => formattedNoms[`${i+1}`] = m.imdbID)
    try {
      let results:any = await fetch('https://shoppy-awards-api.herokuapp.com/nominations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(formattedNoms)
      })
      return await results.json()
    } catch (error) {
      return error
    }
}