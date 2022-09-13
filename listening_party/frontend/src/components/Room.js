import React, { Component } from 'react';
import { Grid, Button, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votes_to_skip: 2,
      guest_can_pause: false,
      is_host: false,
    };
    this.roomCode = this.props.match.params.roomCode;
    this.getRoomDetails();
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
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

  getRoomDetails() {
    fetch('/api/get-room?code=' + this.roomCode)
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
      });
  }
  render() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Typography variant='h4' component='h4'>
            Code : {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h6' component='h6'>
            Votes to Skip Song : {this.state.votes_to_skip}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h6' component='h6'>
            Guests can Pause : {this.state.guest_can_pause.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant='h6' component='h6'>
            Host : {this.state.is_host.toString()}
          </Typography>
        </Grid>
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
