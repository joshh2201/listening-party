import React, { Component } from 'react';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { Link } from 'react-router-dom';

export default class RoomJoinPage extends Component {
  constructor(props) {
    super(props); // calls constructor of parent
    this.state = {
      roomCode: '',
      error: false,
      helperText: '',
    };
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.joinButtonPressed = this.joinButtonPressed.bind(this);
  }

  handleTextFieldChange(e) {
    this.setState({
      roomCode: e.target.value,
    });
  }

  joinButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: this.state.roomCode,
      }),
    };

    fetch('/api/join-room', requestOptions)
      .then((response) => {
        if (response.ok) {
          this.props.history.push(`/room/${this.state.roomCode}`);
        } else {
          this.setState({ error: true, helperText: 'Room Not Found' });
        }
      })
      .catch((error) => console.log(error));
  }

  render() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Typography variant='h4' component='h4'>
            Join a Room
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <TextField
            error={this.state.error}
            label='Code'
            placeholder='Enter a Room Code'
            value={this.state.roomCode}
            helperText={this.state.helperText}
            variant='outlined'
            onChange={this.handleTextFieldChange}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={this.joinButtonPressed}
          >
            Join Room
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button color='secondary' variant='contained' to='/' component={Link}>
            Back
          </Button>
        </Grid>
      </Grid>
    );
  }
}
