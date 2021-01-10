import React from 'react';
import {
  Switch,
  Route
} from "react-router-dom";
import './App.css';

function App() {

  return (
    <div className="App">
      <div className='nav'>nav</div>
      <Switch>
        <Route path='/login'>
          <div className='login'>login</div>
        </Route>
        <Route path='/'>
            <div className='search'>search</div>
            <div className='results'>results</div>
            <div className='nominations'>nominations</div>
        </Route>
      </Switch>
    </div>
  );
}

export default App;
