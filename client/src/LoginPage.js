import React, {Component} from 'react';
import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Anchor from 'grommet/components/Anchor';
import LoginForm from 'grommet/components/LoginForm';
import BookIcon from 'grommet/components/icons/base/Book';
import FormNextIcon from 'grommet/components/icons/base/FormNextLink';

export default class LoginPage extends Component {

  submit() {

  }


  render() {
    return (
        <App>
        <div className="content">
        <LoginForm onSubmit={this.submit.bind(this)}
      logo={<BookIcon />}
      title='My Wiki'
      secondaryText='Organize your notes'
      usernameType='text' />
        <div id="register-text">
        <Anchor icon={<FormNextIcon />} label="Or Register" path='/register'/>
        </div>
        </div>
        </App>
    );
  }
}
