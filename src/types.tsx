// TYPES
export type SearchResult = {
    Poster: string
    Title: string
    Type: string
    Year: string
    imdbID: string
  }
  
  export type LoginType = {
    email: string
    password: string
  }
  
  export type Movie = SearchResult & {
    nominated: boolean
  }
  
  export type RegisterType = LoginType & {
    name: string
  }
  
  export type State = {
    results: Movie[]
    nominations: Movie[]
    error: string
    banner: string
    loggedIn: string | null
    saved: 'saved' | 'editing' | null
  }
  
  export type ActionType = 'SET_RESULTS' | 'REFRESH_RESULTS' | 'ADD_NOMINATION' | 'REMOVE_NOMINATION' | 'REPLACE_NOMINATIONS' | 
  'SET_SAVED' | 'SET_LOGIN' | 'SET_BANNER' | 'SET_ERROR'
  
  export type Dispatch =  React.Dispatch<{
    type: ActionType;
    data?: any;
  }>