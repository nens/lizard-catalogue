import React from 'react';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import store from './store'
import RasterList from './components/RasterList';


function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Route exact path='/catalogue' component={ RasterList }/>
        <Route exact path='/' render={() => <Redirect to='/catalogue' />} />
      </div>
    </Provider>
  );
}

export default App;
