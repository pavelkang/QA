import React, {Component} from 'react';
import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import axios from 'axios';

export default class UserSettings extends Component {

  logout() {
    axios.get('/api/log_out')
      .then((r) => {
        alert("Logged out!");
        window.location.replace("/login");
      });
  }

  render() {
    return (
        <Menu icon={<UserSettingsIcon />}
      dropAlign={{"right": "right"}}>
        <Anchor path='/profile'>
        Profile
      </Anchor>
        <Anchor onClick={this.logout.bind(this)}>
        Log out
      </Anchor>
        </Menu>
    )
  }
}
