import * as React from 'react';
import { Provider } from 'react-redux';
import { Route, Redirect } from 'react-router-dom';
import { QueryClientProvider } from 'react-query';
import { queryClient } from './hooks';
import store from './store';
import MainContainer from './home/MainApp';
import Snackbar from './components/Snackbar';

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <div className="App" id="catalogue">
          <Route exact={true} path='/catalogue' component={MainContainer} />
          <Route exact={true} path='/' render={() => <Redirect to='/catalogue' />} />
          <Route exact={true} path='/catalog' render={() => <Redirect to='/catalogue' />} />
          <Snackbar />
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
