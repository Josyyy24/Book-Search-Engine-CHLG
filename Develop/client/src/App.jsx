import './App.css';
import {
  ApolloClient, 
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';

import 'https://www.apollographql.com/docs/react/get-started/';
import { setContext } from '@apollo/client/link/context';
import { Outlet, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';

import Signup from './pages/Signup';
import Auth from './utils/auth';

const httpLink = createHttpLink({
  uri: '/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div>
          <Navbar />
          <Outlet />
          <Route exact path="/" component={SearchBooks} />
          <Route exact path="/saved" component={SavedBooks} />
          <Route exact path="/signup" component={Signup} />
      </div>
    </ApolloProvider>
  );
}

export default App;