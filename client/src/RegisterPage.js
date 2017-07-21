import React, {Component} from 'react';
import Form from 'grommet/components/Form';
import Header from 'grommet/components/Header';
import Heading from 'grommet/components/Heading';
import FormField from 'grommet/components/FormField';
import Button from 'grommet/components/Button';
import TextInput from 'grommet/components/TextInput';
import axios from 'axios';

export default class RegisterPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  submit() {
    axios.post('/api/register', {
      'username': this.state.username,
      'password': this.state.password,
    });
  }

  changeUsername(e) {
    this.setState({
      username: e.target.value,
    });
  }

  changePassword(e) {
    this.setState({
      password: e.target.value,
    });
  }

  render() {
    return (
        <div>
        <Form compact={true}>
        <Header>
        <Heading>
        Register
      </Heading>
        </Header>
        <FormField label="username">
        <TextInput onDOMChange={this.changeUsername.bind(this)} value={this.state.username}/>
        </FormField>
        <FormField label="password" >
        <TextInput onDOMChange={this.changePassword.bind(this)} value={this.state.password}/>
        </FormField>
        <Button label='Submit'
      fill={true}
      primary={true}
      onClick={this.submit.bind(this)} />
        </Form>
        </div>
    );
  }
}
