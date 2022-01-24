import { Provider } from 'react-redux';
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
          <MainContainer />
          <Snackbar />
        </div>
      </QueryClientProvider>
    </Provider>
  );
};

export default App;
