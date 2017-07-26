import React, {Component} from 'react';
import Form from 'grommet/components/Form';
import Heading from 'grommet/components/Heading';
import FormField from 'grommet/components/FormField';
import Button from 'grommet/components/Button';
import TextInput from 'grommet/components/TextInput';
import axios from 'axios';
import App from 'grommet/components/App';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import Paragraph from 'grommet/components/Paragraph';
import FormNextIcon from 'grommet/components/icons/base/FormNextLink';
import BookIcon from 'grommet/components/icons/base/Book';


export default class LoginPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
    };
  }

  submit() {
    axios.post('api/log_in?username='+this.state.username+'&password='+this.state.password)
      .then((r) => {
        if (r.data.error) {
          alert(r.data.error);
        } else {
          window.location.replace('/');
        }
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
        <App>
        <Box responsive={true}>
        <div className="center-content">
        <Form compact={true}>
        <center>
        <BookIcon />
        <Heading tag='h1' strong={true}>
        My Wiki
      </Heading>
        <Paragraph>Organize your notes</Paragraph>
        </center>
        <FormField label="username">
        <TextInput onDOMChange={this.changeUsername.bind(this)} value={this.state.username}/>
        </FormField>
        <FormField label="password" type="password">
        <TextInput onDOMChange={this.changePassword.bind(this)} value={this.state.password} type="password"/>
        </FormField>
        <div className="login-button">
        <Button label='Log in'
      fill={true}
      primary={true}
      onClick={this.submit.bind(this)} />
        </div>
        </Form>
        <div className="login-text">
        <Anchor icon={<FormNextIcon />} label="Or Register" path='/register'/>
        </div>
        </div>
        </Box>
        </App>
    );
  }
}
