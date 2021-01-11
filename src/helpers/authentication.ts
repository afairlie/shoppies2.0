const LOGIN = `http://localhost:3001/login`
const NOMINATIONS = `http://localhost:3001/nominations`

export async function login({email, password}: {email: string, password: string}) {
    const response = await fetch(LOGIN, {
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

export async function refreshLogin(token: string) {
    const response = await fetch(NOMINATIONS, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token
        }
    })

    const data = await response.json()
    return response.status === 200 ? Promise.resolve(data)
        : Promise.reject({status: response.status, data})
}

export async function decodeToken(token: string) {
    // decode token - https://thinkster.io/tutorials/angularjs-jwt-auth/decoding-jwt-payloads
    const base64Url = token.split('.')[1]
    var base64 = base64Url.replace('-', '+').replace('_', '/')
    const user = await JSON.parse(atob(base64))

    return Promise.resolve(user)
}