import React, {Component} from 'react';

import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Box from 'grommet/components/Box';
import Search from 'grommet/components/Search';
import Button from 'grommet/components/Button';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
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
    <Route path="/editor" component={WikiEditor} />
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

var getCurrTopic = function(slug) {
  if (slug === "/") {
    return "MyQA";
  }
  var lastSlashInd = getLastSlashInd(slug);
  if (lastSlashInd === -1) {
    console.warn('no!');
    return '';
  }
  if (lastSlashInd === 0) {
    var key = "/";
  } else {
    var key = slug.substring(0, lastSlashInd);
  }
  var topics = data[key];
  var name = "";
  var thisCode = slug.substring(lastSlashInd+1, slug.length);
  for (var i = 0; i < topics.length; i++) {
    var topic = topics[i];
    if (topic.code === thisCode) {
      return topic.name;
    }
  }
  return "";
}

var getSlug = function(url) {
  var ind = url.indexOf('@');
  if (ind === -1) {
    return url;
  }
  return url.substring(0, ind-1); // -1 is to remove '/'
}

var shouldRenderTopic = function(url, slug) {

  if (url !== slug) {
    return false;
  }

  var l = data[slug];
  if (l.length === 0) {
    return false; // leaf page
  }
  var item = l[0];
  if (item['code']) {
    return true;
  } else {
    return false;
  }
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
      wikis: null,
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

var activePanels = function(d, url, qas) {
  var pound_pos = -1;
  for (var i = 0; i < url.length; i++) {
    if (url[i] === '@') {
      pound_pos = i;
      break;
    }
  }

  if (pound_pos === -1) {
    return [0];
  }

  var to_id = url.substr(pound_pos+1, url.length-1);

  for (var i = 0; i < qas.length; i++) {
    if (qas[i].id === to_id) {
      return [i];
    }
  }
  return [0];
}

/*
console.log(data);

    <AccordionPanel heading={getTitleDOM('What are __regression__ and __classification__ problems?')}>
    <Paragraph className='answers' dangerouslySetInnerHTML={{__html: result}}>
    </Paragraph>
    </AccordionPanel>

    <AccordionPanel heading='What is Linear Regression'>
    <Paragraph className='answers' dangerouslySetInnerHTML={{__html: result}}>
    </Paragraph>
    </AccordionPanel>

export default () => (

);
*/
