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
} from '@material-ui/core';
import { Link } from 'react-router-dom';

export default class CreateRoomPage extends Component {
  defaultVotes = 2;
  constructor(props) {
    super(props); // calls constructor of parent
    this.state = {
      guest_can_pause: true,
      votes_to_skip: this.defaultVotes,
    };

    // binding gives access to "this" keyword for methods called in the DOM
    this.handleRoomButtonPress = this.handleRoomButtonPress.bind(this);
    this.handleVotesChange = this.handleVotesChange.bind(this);
    this.handlePauseChange = this.handlePauseChange.bind(this);
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

  handleRoomButtonPress() {
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
  render() {
    return (
      <Grid container spacing={1} align='center'>
        <Grid item xs={12}>
          <Typography component='h4' variant='h4'>
            Create A Room
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <FormControl component='fieldset'>
            <FormHelperText component='div'>
              <div align='center'>Guest Control of Playback State</div>
            </FormHelperText>
            <RadioGroup
              row
              defaultValue='true'
              onChange={this.handlePauseChange}
            >
              <FormControlLabel
                value='true'
                control={<Radio color='primary' />}
                label='Play/Pause'
                labelPlacement='bottom'
              ></FormControlLabel>
              <FormControlLabel
                value='fasle'
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
              defaultValue={this.defaultVotes}
              inputProps={{ min: 1, style: { textAlign: 'center' } }}
              onChange={this.handleVotesChange}
            />
            <FormHelperText component='div'>
              <div>Votes Required to Skip Song</div>
            </FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button
            color='primary'
            variant='contained'
            onClick={this.handleRoomButtonPress}
          >
            Create A Room
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
