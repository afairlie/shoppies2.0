# Shoppies 2.0

## Description

Shoppies 2.0 is an app where users can vote for their favourite films. The app uses a debounced search to query the [OMDB API](http://www.omdbapi.com/). 

All users can search films, nominate or remove nominations from films. Users receive an alert when they have nominated the maximum 5 films, or an error message is they try to nominate more than 5 films. 

Anonymous users can register, or save new nominations if they have an existing user profile. 

At login, user nominations will be retrieved from the [Shoppies API](https://shoppy-awards-api.herokuapp.com/). Users can edit and save their nominations.

Authorization is handled using JWT tokens with a 5 minute expiration time (no refresh). Saved nominations and the JWT token are persisted in local storage.
## Tech Stack
- Typescript
- React
- React Router
- Post CSS
- Material UI
- Material Icons

This project was bootstrapped with Create React App.
## To Setup and Run This Project Locally

 Download or clone the repository:

 https://github.com/afairlie/shoppies2.0

 `git clone git@github.com:afairlie/shoppies2.0.git <project_name>`
 
 `cd <project_name>`

 Install project dependencies:

 `yarn install`

 Setup environment variables:

 `cp .env.copy .env`
 
 `rm .env.copy`

 In your .env file, replace `<api_key>` with your key from [OMDB API](http://www.omdbapi.com/apikey.aspx)

 ⚠️ make sure .env is included in your .gitignore before proceeding ⚠️

 In the project directory, run:
 
 `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) in your favourite browser and enjoy the shoppies!

## Shoppies 2.0 is Deployed on Netlify

https://shoppies-reloaded.netlify.app/

## About Shoppies API

Shoppies API is built with Ruby on Rails, Postgres and the JWT gem, and deployed on Heroku. You can learn more about it by visiting the repo:

https://github.com/afairlie/shoppies_api

## A Note About Previous Shoppies Iterations

Shoppies 1.0 and Shoppies API were created for the winter internship application.
For this summer internship application, Shoppies API was refactored, and Shoppies 2.0 was built from scratch.

New features of Shoppies 2.0 and the Shoppies API include:

Frontend:

- Correct implementation of debounced search.
- Client side routing
- Better architecture / component structure and single purpose helper functions.
- Persisted state
- Reducer in lieu of State hook for declarative state updates.
- Simplified and refined styling using Post CSS CRA infrastructure and leveraging Material UI animations and icons

Backend:

- JWT auth implemented using rails filter before_action
- Ability to create/update nominations.
- Documentation of routes and responses

If you'd like to see the evolution:

[Shoppies API Repo - first-iteration branch](https://github.com/afairlie/shoppies_api/tree/shoppies_api.first-iteration])

[Shoppies 1.0 Repo](https://github.com/afairlie/shoppies)

[Shoppies 1.0 on Netlify](https://shoppy-awards.netlify.app/)

## Screenshots