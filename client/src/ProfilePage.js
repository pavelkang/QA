import React, {Component} from 'react';
import Heading from 'grommet/components/Heading';
import axios from 'axios';
import Spinning from 'grommet/components/icons/Spinning';
import TextInput from 'grommet/components/TextInput';
import Button from 'grommet/components/Button';
import Value from 'grommet/components/Value';
import List from 'grommet/components/List';
import ListItem from 'grommet/components/ListItem';
import Box from 'grommet/components/Box';
import MyFooter from './MyFooter';

class InnerProfilePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      newTag: '',
    }
  }

  changeTag(e) {
    this.setState({
      newTag: e.target.value,
    });
  }

  addTag() {
    axios.post('/api/add_tag', {
      'tag': this.state.newTag,
    })
      .then((r) => {
        alert('Added a new tag');
        window.location.href = '/profile';
      });
  }


  render() {
    if (!this.props.data) {
      return <Spinning />;
    }
    var data = this.props.data;
    return (
        <div className="content">
        <Box basis='1/2' justify='center' margin='medium' pad='medium'>
        <Heading tag="h1">{data.username}</Heading>
        <hr/>
        <Value label='wikis' value={data.numWikis}/>
        <Value label='drafts' value={data.drafts.length}/>
        <Heading tag="h2">Tags:</Heading>
        <hr/>
        <Box pad='medium' margin='medium'>
        <List>
        {
          data.tags.map((tag) => {
            return (
                <ListItem justify='between' separator='horizontal'>
                <span>
                {tag.name}
              </span>
                </ListItem>
            );
          })
        }
      </List>
        </Box>
        <center>
        <TextInput value={this.state.newTag} onDOMChange={this.changeTag.bind(this)} placeHolder='new tag name'/>
        <br/>
        <Box pad='medium'>
        <Button onClick={this.addTag.bind(this)} label="Add a new tag"/>
        </Box>
        </center>
        <Heading tag="h2">Drafts:</Heading>
        <hr/>
        <Heading tag="h4">Not implemented</Heading>
        </Box>
        <MyFooter />
        </div>
    );
  }
}

export default class ProfilePage extends Component {

  constructor(props) {
    super(props);
    this.state = {
      data: {
        'username': 'test_kai',
        'tags': [{'name': 'ml'}, {'name': 'programming'}],
        'drafts': [{}, {}, {}, {}, {}],
        'numWikis': 14,
      },
    };
    axios.get('/api/get_profile')
      .then(
        (r) => {
          this.setState({
            data: r.data,
          });
        }
      )
  }

  render() {
    return (
        <InnerProfilePage data={this.state.data} />
    );
  }
}
