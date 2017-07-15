import React, {Component} from 'react';
import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';

export default class UserSettings extends Component {
  render() {
    return (
      <Menu icon={<UserSettingsIcon />}
        dropAlign={{"right": "right"}}>
        <Anchor path='/profile'>
          Profile
        </Anchor>
      </Menu>
    )
  }
}
