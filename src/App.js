import React from 'react';
import { Provider } from 'react-redux';
// import { Route } from 'react-router-dom';
import store from './store'


function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <h1>Lizard Catalogue</h1>
      </div>
    </Provider>
  );
}

export default App;
