import React, { Component } from 'react';
import { render } from 'react-dom';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';
import HomePage from './Homepage';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path='/' component={HomePage} />
          <Route path='/join' component={RoomJoinPage} />
          <Route path='/create' component={CreateRoomPage} />
          {/* colon denotes a url parameter */}
          <Route path='/room/:roomCode' component={Room} />
        </Switch>
      </Router>
    );
  }
}

const appDiv = document.getElementById('app');
render(<App />, appDiv);
