import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import store from './store';
import MainContainer from './catalogue/MainApp';
import Snackbar from './catalogue/components/Snackbar';

function App() {
  return (
    <Provider store={store}>
      <div className="App" id="catalogue">
        <Route exact={true} path='/catalogue' component={MainContainer} />
        <Route exact={true} path='/' render={() => <Redirect to='/catalogue' />} />
        <Route exact={true} path='/catalog' render={() => <Redirect to='/catalogue' />} />
        <Snackbar />
      </div>
    </Provider>
  );
};

export default App;
