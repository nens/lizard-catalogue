import { Provider } from 'react-redux';
import { Route, Routes, Navigate } from 'react-router-dom';
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
          <Routes>
            <Route path='/catalogue/' element={<MainContainer />} />
            <Route path='/' element={<Navigate to='/catalogue/' />} />
            <Route path='/catalog' element={<Navigate to='/catalogue/' />} />
          </Routes>
          <Snackbar />
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
