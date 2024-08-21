import './App.css';
import {
  ApolloClient, 
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';

import Navbar from './components/Navbar';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { StoreProvider } from './utils/GlobalState';
import { Container } from 'react-bootstrap';

import SearchBooks from './pages/SearchBooks';
import SavedBooks from './pages/SavedBooks';
import Login from './pages/Login';

import Signup from './pages/Signup';
import NoMatch from './pages/NoMatch';
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
      <Router>
        <StoreProvider>
          <Navbar />
          <Outlet />
          <Container>
            <Switch>
              <Route exact path="/" component={SearchBooks} />
              <Route exact path="/saved" component={SavedBooks} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <Route component={NoMatch} />
            </Switch>
          </Container>
        </StoreProvider>
      </Router>
    </ApolloProvider>
  );
}

export default App;
