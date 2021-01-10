export async function login({email, password}: {email: string, password: string}) {

    const url = `http://localhost:3001/login`
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email, password})
    })
    const message = await response.json()
    // get token back or error status
    return response.status === 200 ? Promise.resolve(message) 
      : Promise.reject({status: response.status, message})
}