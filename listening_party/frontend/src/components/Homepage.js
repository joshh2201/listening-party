import React, { Component } from 'react';
import { Button, Grid, Typography, ButtonGroup } from '@material-ui/core';
import RoomJoinPage from './RoomJoinPage';
import CreateRoomPage from './CreateRoomPage';
import Room from './Room';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect,
} from 'react-router-dom';

export default class HomePage extends Component {
  constructor(props) {
    super(props); // calls constructor of parent
    this.state = {
      roomCode: null,
    };
  }

  // lifecycle method, modify component behaviour before it loads (mounts)
  // program doesn't have to wait for async method to finish before doing other things
  async componentDidMount() {
    fetch('api/user-in-room')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }
  renderHomePage() {
    return (
      <Grid container spacing={3} align='center'>
        <Grid item xs={12}>
          <Typography variant='h3' compact='h3'>
            Listening Party
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ButtonGroup disableElevation variant='contained' color='primary'>
            <Button color='primary' to='/join' component={Link}>
              Join a Room
            </Button>
            <Button color='secondary' to='/create' component={Link}>
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
      </Grid>
    );
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route
            exact
            path='/'
            render={() =>
              this.state.roomCode ? (
                <Redirect to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              )
            }
          />
          <Route path='/join' component={RoomJoinPage} />
          <Route path='/create' component={CreateRoomPage} />
          {/* colon denotes a url parameter */}
          <Route path='/room/:roomCode' component={Room} />
        </Switch>
      </Router>
    );
  }
}
