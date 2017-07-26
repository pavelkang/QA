import React, {Component} from 'react';
import Footer from 'grommet/components/Footer';
import Title from 'grommet/components/Title';
import Box from 'grommet/components/Box';
import {
  Link
} from 'react-router-dom';
import Menu from 'grommet/components/Menu';
import Paragraph from 'grommet/components/Paragraph';
import Anchor from 'grommet/components/Anchor';

export default class MyFooter extends Component {
  render() {
    return (
        <Footer justify='between' className="footer" primary={true}>
  <Title>
    <Link to="/" id="nounder">MyWiki</Link>
  </Title>
  <Box direction='row'
    align='center'
    pad={{"between": "medium"}}>
    <Paragraph margin='none'>
      © 2017 Kang, Kai
    </Paragraph>
    <Menu direction='row'
      size='small'
      dropAlign={{"right": "right"}}>
      <Anchor href='#'>
        Contact
      </Anchor>
      <Anchor path='/about'>
        About
      </Anchor>
    </Menu>
  </Box>
</Footer>
    );
  }
}
