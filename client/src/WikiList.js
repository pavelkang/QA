import React, {Component} from 'react';
import Accordion from 'grommet/components/Accordion';
import AccordionPanel from 'grommet/components/AccordionPanel';
import Timestamp from 'grommet/components/Timestamp';
import Box from 'grommet/components/Box';
import Anchor from 'grommet/components/Anchor';
import EditIcon from 'grommet/components/icons/base/Edit';
import TrashIcon from 'grommet/components/icons/base/Trash';
import Spinning from 'grommet/components/icons/Spinning';
import RenderedContent from './RenderedContent';
import axios from 'axios';
import MoreIcon from 'grommet/components/icons/base/More';
import Menu from 'grommet/components/Menu';

var md = require('markdown-it')(),
    mk = require('markdown-it-katex');
md.use(mk);

var getTitleDOM = function(titleStr, id, ts_published) {
  var x = md.render(titleStr);
  x = x.substring(3, x.length - 5); // remove <p></p>
  x = "(" + id + ") " + x;
  return (
      <div dangerouslySetInnerHTML={{__html: x}}></div>
  );
}

export default class WikiList extends Component {

  deleteWiki(id) {
    var api_addr;
    if (this.props.isDrafts) {
      api_addr = "/api/delete_draft/" + id;
    } else {
      api_addr = "/api/delete_wiki/" + id;
    }
    axios.post(api_addr, {})
      .then((r) => {
        if (this.props.isDrafts) {
          alert("Deleted draft!");
          window.location.replace("/");
        } else {
          alert("Deleted wiki!");
          window.location.replace("/profile");
        }
      });
  }

  render() {
    console.log(this.props.data);
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
        <Accordion active={[]}>
        {
          this.props.data.map((qa, ind) => {
            return (
                <AccordionPanel heading={getTitleDOM(qa.q, qa.id, qa.ts_published)} key={ind}>

                <div className="list-body">

                <div className="actions-menu">
                <Menu icon={<MoreIcon />}
              dropAlign={{"left": "left"}}>
                <Anchor icon={<EditIcon />}
              path={this.props.isDrafts ? ("/editor/2/"+qa.id) : ("/editor/1/"+qa.id)}> edit </Anchor>
                <Anchor icon={<TrashIcon />} onClick={this.deleteWiki.bind(this, qa.id)} > delete </Anchor>
                </Menu>
                </div>

                <div className="list-content">
                <center>
                <RenderedContent content={qa.a} showPlaceHolder={true}/>
                </center>
                </div>

                </div>

                </AccordionPanel>
            );
          })
        }
      </Accordion>
        </Box>
    );
  }
}
