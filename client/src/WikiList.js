import React, {Component} from 'react';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Timestamp from 'grommet/components/Timestamp';
import Box from 'grommet/components/Box';
import Columns from 'grommet/components/Columns';
import Anchor from 'grommet/components/Anchor';
import EditIcon from 'grommet/components/icons/base/Edit';
import TrashIcon from 'grommet/components/icons/base/Trash';
import Spinning from 'grommet/components/icons/Spinning';
import RenderedContent from './RenderedContent';

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

export default class WikiList extends Component {
  render() {
    if (!this.props.data) {
      return (
        <Box align="center" justify="center" primary={true} flex="grow" pad="large">
          <Spinning size="large" />
        </Box>
      );
    }
    if (this.props.data.length === 0) {
      return (
        <h1>nothing.</h1>
      );
    }
    return (
      <Box pad="small">
      <Accordion active={[]} animate={false}>
      {
        this.props.data.map((qa, ind) => {

          return (
              <AccordionPanel heading={getTitleDOM(qa.q, qa.id)} key={ind}>
              <RenderedContent content={qa.a} />
                <Anchor icon={<EditIcon />}> </Anchor>
                <Anchor icon={<TrashIcon />}> </Anchor>
                <Timestamp value='2017-07-09T05:44:44.957Z' />

            </AccordionPanel>
          );
        })
      }
      </Accordion>
      </Box>
    );
  }
}
