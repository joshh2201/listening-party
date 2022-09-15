import React, { Component } from 'react';
import {
  TextField,
  Button,
  Grid,
  Typography,
  FormHelperText,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  Collapse,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Link } from 'react-router-dom';

export default class CreateRoomPage extends Component {
  // if one of these props aren't passed, defaultProps are used
  static defaultProps = {
    guest_can_pause: true,
    votes_to_skip: 2,
    update: false,
    roomCode: null,
    updateCallback: () => {},
  };

  constructor(props) {
    super(props); // calls constructor of parent
    this.state = {
      guest_can_pause: this.props.guest_can_pause,
      votes_to_skip: this.props.votes_to_skip,
      errorMsg: '',
      successMsg: '',
    };

    // binding gives access to "this" keyword for methods called in the DOM
    this.createButtonPressed = this.createButtonPressed.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handlePauseChange = this.handlePauseChange.bind(this);
    this.updateButtonPressed = this.updateButtonPressed.bind(this);
  }

  handleVotesChange(e) {
    this.setState({
      votes_to_skip: e.target.value,
    });
  }

  handlePauseChange(e) {
    this.setState({
      guest_can_pause: e.target.value === 'true' ? true : false,
    });
  }

  createButtonPressed() {
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        guest_can_pause: this.state.guest_can_pause,
      }),
    };
    // send request to /api/create endpoint with requestOptions payload
    // after response is received, convert to json
    // grab the code from json and redirect user to correct room url
    fetch('/api/create', requestOptions)
      .then((response) => response.json())
      .then((data) => this.props.history.push('/room/' + data.code));
  }

  updateButtonPressed() {
    const requestOptions = {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        votes_to_skip: this.state.votes_to_skip,
        guest_can_pause: this.state.guest_can_pause,
        code: this.props.roomCode,
      }),
    };

    fetch('/api/update-room', requestOptions).then((response) => {
      if (response.ok) {
        this.setState({
          successMsg: 'Room Updated Succesfully!',
        });
      } else {
        this.setState({
          successMsg: 'Could Not Update Room',
        });
      }
      this.props.updateCallback();
    });
  }

  renderCreateButtons() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={this.createButtonPressed}
          >
            Create a Room
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

  renderUpdateButtons() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={this.updateButtonPressed}
          >
            Update Room
          </Button>
        </Grid>
      </Grid>
    );
  }

  render() {
    const title = this.props.update ? 'Settings' : 'Create a Room';
    const buttonText = this.props.update ? 'Update Room' : 'Create a Room';
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Collapse
            in={this.state.errorMsg != '' || this.state.successMsg != ''}
          >
            {this.state.successMsg != '' ? (
              <Alert
                severity='success'
                onClose={() => {
                  this.setState({ successMsg: '' });
                }}
              >
                {this.state.successMsg}
              </Alert>
            ) : (
              <Alert
                severity='error'
                onClose={() => {
                  this.setState({ errorMsg: '' });
                }}
              >
                {this.state.errorMsg}
              </Alert>
            )}
          </Collapse>
        </Grid>
        <Grid item xs={12}>
          <Typography component='h4' variant='h4'>
            {title}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl component='fieldset'>
            <FormHelperText component='div'>
              <div align='center'>Guest Control of Playback State</div>
            </FormHelperText>
            <RadioGroup
              row
              defaultValue={this.props.guest_can_pause.toString()}
              onChange={this.handlePauseChange}
            >
              <FormControlLabel
                value='true'
                control={<Radio color='primary' />}
                label='Play/Pause'
                labelPlacement='bottom'
              ></FormControlLabel>
              <FormControlLabel
                value='false'
                control={<Radio color='secondary' />}
                label='No Control'
                labelPlacement='bottom'
              ></FormControlLabel>
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <FormControl>
            <TextField
              required={true}
              type='number'
              defaultValue={this.state.votes_to_skip}
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
              onChange={this.handleVotesChange}
            />
            <FormHelperText component='div'>
              <div>Votes Required to Skip Song</div>
            </FormHelperText>
          </FormControl>
        </Grid>

        {this.props.update
          ? this.renderUpdateButtons()
          : this.renderCreateButtons()}
      </Grid>
    );
  }
}
