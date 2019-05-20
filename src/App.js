import React from 'react';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import store from './store';
import RasterContainer from './components/RasterContainer';


function App() {
  return (
    <Provider store={store}>
      <div className="App">
        <Route exact path='/catalogue' component={ RasterContainer }/>
        <Route exact path='/' render={() => <Redirect to='/catalogue' />} />
      </div>
    </Provider>
  );
};

export default App;
