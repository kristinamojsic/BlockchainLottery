import React from 'react';
import Home from './Home';

import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';
import './App.css';

function App() {
  return(
    <BrowserRouter>
    <div >
      <nav className='navbar'>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          
        </ul>
      </nav>

      <Routes>
        
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App;