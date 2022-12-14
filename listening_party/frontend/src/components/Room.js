import React, { Component } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import CreateRoomPage from './CreateRoomPage';
import MusicPlayer from './MusicPlayer';

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votes_to_skip: 2,
      guest_can_pause: false,
      is_host: false,
      show_settings: false,
      spotify_authenticated: false,
      song: {},
    };
    this.roomCode = this.props.match.params.roomCode;
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
    this.getRoomDetails();
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    };
    fetch('/api/leave-room', requestOptions).then((response) => {
      this.props.leaveRoomCallback();
      this.props.history.push('/');
    });
  }

  // polling current song
  componentDidMount() {
    this.interval = setInterval(this.getCurrentSong, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    return fetch('/api/get-room?code=' + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push('/');
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votes_to_skip: data.votes_to_skip,
          guest_can_pause: data.guest_can_pause,
          is_host: data.is_host,
        });
        if (this.state.is_host) {
          this.authenticateSpotify();
        }
      });
  }

  updateShowSettings(value) {
    this.setState({
      show_settings: value,
    });
  }

  renderSettings() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <CreateRoomPage
            update={true}
            votes_to_skip={this.state.votes_to_skip}
            guest_can_pause={this.state.guest_can_pause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            variant='contained'
            color='secondary'
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12}>
        <Button
          variant='contained'
          color='primary'
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  getCurrentSong() {
    fetch('/spotify/current-song')
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({
          song: data,
        });
        console.log(data);
      });
  }

  authenticateSpotify() {
    fetch('/spotify/is-authenticated')
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          spotify_authenticated: data.status,
        });
        if (!data.status) {
          fetch('/spotify/get-auth-url')
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  render() {
    if (this.state.show_settings) {
      return this.renderSettings();
    }
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Typography variant='h4' component='h4'>
            Code : {this.roomCode}
          </Typography>
        </Grid>
        <MusicPlayer {...this.state.song} />
        {/* {this.state.song} */}
        {this.state.is_host ? this.renderSettingsButton() : null}
        <Grid item xs={12}>
          <Button
            color='secondary'
            variant='contained'
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>
    );
  }
}
