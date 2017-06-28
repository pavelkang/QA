import React, {Component} from 'react';

import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';
import Search from 'grommet/components/Search';
import Accordion from 'grommet/components/Accordion';
import Paragraph from 'grommet/components/Paragraph';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Button from 'grommet/components/Button';
import Latex from 'react-latex';
import Footer from 'grommet/components/Footer';
import Menu from 'grommet/components/Menu';
import Anchor from 'grommet/components/Anchor';
import TopicsView from './TopicsView';
import Prism from 'prismjs/prism.js'
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';
import UserSettingsIcon from 'grommet/components/icons/base/UserSettings';
import EditIcon from 'grommet/components/icons/base/Edit';
import data from './data.json';

export default () => (
  <Router>
    <Route path="*" component={Page} />
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

  onCreateNewWiki() {
    return ;
  }

  render() {
    var content;
    var slug = getSlug(this.props.match.url);
    if (shouldRenderTopic(this.props.match.url, slug)) {
      content = <TopicsView topics={data[slug]} currUrl={slug}/>
    } else {
      content = <QAView qas={data[slug]} url={this.props.match.url} />
    }
    return (
    <App>
    <Header>
    <Title>{getCurrTopic(this.props.match.url)}</Title>
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
<Button icon={<EditIcon />}
  onClick={this.onCreateNewWiki.bind(this)}
  accent={false}
  critical={false}
  plain={false}
  secondary={false} />
<Menu icon={<UserSettingsIcon />}
  dropAlign={{"right": "right"}}>
  <Anchor href='#'>
    Profile
  </Anchor>
</Menu>
    </Header>

    {content}

<Footer justify='between' primary={false} className="footer">
  <Title>
    <Link to="/" id="nounder">MyQA</Link>
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
      <Anchor href='#'>
        About
      </Anchor>
    </Menu>
  </Box>
</Footer>
    </App>
    )
  }
}

var md = require('markdown-it')(),
    mk = require('markdown-it-katex');
md.use(mk);

var getTitleDOM = function(titleStr, id) {
  var x = md.render(titleStr);
  x = x.substring(3, x.length - 5); // remove <p></p>
  x = "(" + id + ") " + x;
  return <div dangerouslySetInnerHTML={{__html: x}}></div>;
}

var getMDHTMLString = function(s) {
  var x = md.render(s);
  return x;
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


class QAView extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
    <Section>

    <Accordion active={activePanels(data, this.props.url, this.props.qas)}>

      {
        this.props.qas.map((qa, ind) => {

          var html_string = "";
          for (var i = 0; i < qa.a.length; i++) {
            if (qa.a[i].type === "code") {
              var code = Prism.highlight(qa.a[i].content, Prism.languages['python']);
              html_string = html_string.concat('<pre class="language-python mypre"><code class="language-python">' + code + '</code></pre>'  );
            } else {
              html_string = html_string.concat(getMDHTMLString(qa.a[i].content));
            }
          }
          return (
            <AccordionPanel heading={getTitleDOM(qa.q, qa.id)} key={ind}>
              <Paragraph className='answers' align="start" margin="none" size="large" dangerouslySetInnerHTML={{__html:html_string}}>
              </Paragraph>
            </AccordionPanel>
          );
        })
      }

    </Accordion>
    </Section>
    );
  }
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
