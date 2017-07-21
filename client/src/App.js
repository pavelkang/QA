import React, {Component} from 'react';

import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Search from 'grommet/components/Search';
import Button from 'grommet/components/Button';
import WikiEditor from './WikiEditor';
import WikiList from './WikiList';
import MyFooter from './MyFooter';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import EditIcon from 'grommet/components/icons/base/Edit';
import BookIcon from 'grommet/components/icons/base/Book';
import data from './data.json';
import UserSettings from './UserSettings';
import axios from 'axios';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import AboutPage from './AboutPage';
import ProfilePage from './ProfilePage';

export default () => (
    <Router>
    <div>
    <Route path="/" exact component={Page} />
    <Route path="/editor/:mode?/:obj_id?" component={WikiEditor} />
    <Route path="/login" component={LoginPage} />
    <Route path="/register" component={RegisterPage} />
    <Route path="/about" component={AboutPage} />
    <Route path="/profile" component={ProfilePage} />
  </div>
    </Router>
);

var getLastSlashInd = function(slug) {
  var lastSlashInd = -1;
  for (var i = slug.length - 1; i >= 0; i--) {
    if (slug[i] === '/') {
      lastSlashInd = i;
      break;
    }
  }
  return lastSlashInd;
}

class Page extends Component {

  constructor(props) {
    super(props);
    // TODO: make ajax

    axios.get('/api/get_wiki')
    .then(
      (r) => {
        this.setState({
          wikis: r.data,
        });
      }
    )

    this.state = {
      wikis: [
      {
        a: [{content: "test content", type: "md"}],
        author_id: 3,
        id: 15,
        q: "test question",
        question: "test question",
        ts_published: "123",
      }
    ],
    };

  }

  onClickEdit() {
    return ;
  }

  render() {
    return (
    <App>
    <Header>
    <Title>
      <BookIcon />
      MyWiki
    </Title>
    <Box flex={true}
      justify='end'
      direction='row'
      responsive={false}>
    <Search inline={true}
      fill={true}
      size='medium'
      responsive={true}
      iconAlign={'start'}
      placeHolder='Search: Not Implemented Yet'
      dropAlign={{"right": "right"}} />
    </Box>

      <Link to={'/editor'} replace>
      <Button icon={<EditIcon />}
      onClick={this.onClickEdit.bind(this)}
      accent={false}
      critical={false}
      plain={false}
      secondary={false} />
      </Link>
      <UserSettings />
    </Header>
    <div className="content">
      <WikiList data={this.state.wikis} />
    </div>
    <MyFooter />
    </App>
    )
  }
}
