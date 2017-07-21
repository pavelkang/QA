import React, {Component} from 'react';

import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import MyFooter from './MyFooter';
import ViewIcon from 'grommet/components/icons/base/View';
import NotesIcon from 'grommet/components/icons/base/Notes';
import AddIcon from 'grommet/components/icons/base/AddChapter';
import SaveIcon from 'grommet/components/icons/base/Save';
import TextInput from 'grommet/components/TextInput';
import Layer from 'grommet/components/Layer';
import {Editor, EditorState, ContentState} from 'draft-js';
import axios from 'axios';
import RenderedContent from './RenderedContent';
import Spinning from 'grommet/components/icons/Spinning';
import Select from 'grommet/components/Select';

// optimize this
var prepareOptions = function(options) {
  if (!options) {
    return [{'label': <Spinning />, 'value': null}];
  }
  var result = [];
  for (var i = 0; i < options.length; i++) {
    result.push({
      'label': options[i].name,
      'value': options[i],
    });
  }
  return result;
}

var displayTags = function(tags) {
  if (tags.length === 0) {
    return "No tags";
  }
  var result = tags[0];
  for (var i = 1; i < tags.length; i++) {
    result.concat(', ' + tags[i]);
  }
  return result;
}

const CREATE_FROM_SCRATCH = 0;
const EDIT_WIKI = 1;
const EDIT_DRAFT = 2;

var button_text_from_status = function(status) {
  switch (status.mode){
  case CREATE_FROM_SCRATCH:
    return 'Add New Wiki';
  case EDIT_WIKI:
    return 'Update This Wiki';
  case EDIT_DRAFT:
    return 'Publish This Draft';
  }
}


export default class WikiEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      question: "",
      editorState: EditorState.createEmpty(),
      previewOpen: false,
      previewingContent: null,
      tagOptions: null,
      tags: [],
      ready: parseInt(this.props.match.params.mode) === CREATE_FROM_SCRATCH,
    };
    if (!this.props.match.params.mode) {
      this.state.status = {
        mode: CREATE_FROM_SCRATCH,
        obj_id: 0,
      }
      this.state.ready = true;
    } else {
      this.state.status = {
        mode: parseInt(this.props.match.params.mode),
        obj_id: parseInt(this.props.match.params.obj_id),
      }
      axios.get('/api/get_editor_data/'+this.state.status.mode+'/'+this.state.status.obj_id)
        .then((r) => {
          this.setState({
            ready: true,
            tagOptions: r.data.tags,
            question: r.data.content.question,
            editorState: EditorState.createWithContent(ContentState.createFromText(r.data.content.raw_a)),
          });
        });
    }
  }

  changeTags(o) {
    this.setState({
      tags: o.value,
    });
  }

  onQuestionChange(e) {
    this.setState({
      question: e.target.value,
    })
  }

  onAnswerChange(editorState) {
    this.setState({
      editorState: editorState,
    });
  }

  preview() {
    this.setState({
      previewOpen: true,
      previewingContent: null,
    });
    axios.post('/api/preview', {
      'content': this.state.editorState.getCurrentContent().getPlainText(),
    })
      .then((r) => {
        this.setState({
          previewingContent: r.data['content'],
        });
      });
  }

  closePreview() {
    this.setState({
      previewOpen: false,
    });
  }

  getContent() {
    var contentState = this.state.editorState.getCurrentContent();
    var answerInText = contentState.getPlainText();
    var tagIds = this.state.tags.map((o) => {
      return o.value.id;
    });
    return {
      q: this.state.question,
      a: answerInText,
      tagIds: tagIds,
    };
  }

  saveDraft() {

    axios.post('/api/save_draft', this.getContent())
      .then((r) => {
        alert('saved as draft!');
        var newStatus = {
          mode: EDIT_DRAFT,
          obj_id: r.data.draft_id,
        };
        this.setState({
          status: newStatus,
        });
      });
  }

  submit() {

    switch (this.state.status.mode) {
    case CREATE_FROM_SCRATCH:
      axios.post('/api/add_wiki', this.getContent())
        .then((r) => {
          window.location.href = "/";
        });
      break;
    case EDIT_WIKI:
      axios.post('/api/update_wiki', {
        'content': this.getContent(),
        'wiki_id': this.state.status.obj_id,
      })
        .then((r) => {
          window.location.href = "/";
        })
      break;
    case EDIT_DRAFT:
      axios.post('/api/publish_draft', {
        'content': this.getContent(),
        'draft_id': this.state.status.obj_id,
      })
        .then((r) => {
          window.location.href = "/";
        })
      break;
    }


  }

  render() {
    return (
        <App>

        {
          ((this.state.status.mode !== CREATE_FROM_SCRATCH) && this.state.ready === false) ? <Spinning /> :
            <div>
            <Header>
            <Title>
            <NotesIcon />
            Editor
          </Title>
            <Box flex={true}
          justify='end'
          direction='row'
          responsive={false}>
            </Box>
            <Button icon={<SaveIcon />}
          label='Save as draft'
          onClick={this.saveDraft.bind(this)}
          secondary={true}></Button>
            <Button icon={<ViewIcon />}
          label='Preview'
          onClick={this.preview.bind(this)}
          secondary={true}></Button>
            </Header>

            <Section className="content">
            <TextInput
          placeHolder="Question"
          value={this.state.question}
          onDOMChange={this.onQuestionChange.bind(this)}/>
            <br />

            <div className="RichEditor-root">
            <h4 id="answer-tag">Answer</h4>
            <div className="RichEditor-editor">
            <Editor editorState={this.state.editorState} onChange={this.onAnswerChange.bind(this)} />
            </div>
            </div>
            <div id="tag-selector">
            <Select multiple={true} options={prepareOptions(this.state.tagOptions)} onChange={this.changeTags.bind(this)} value={this.state.tags}/>
            </div>
            <Box align="center" pad='medium'>
            <Button icon={<AddIcon />}
          label={button_text_from_status(this.state.status)}
          onClick={this.submit.bind(this)}
          primary={true}></Button>
            </Box>
            <Layer onClose={this.closePreview.bind(this)} hidden={!this.state.previewOpen} closer={true}>
            {
                <Box align="center" justify="center" pad="medium" margin="medium">
                {this.state.previewingContent ? <RenderedContent content={this.state.previewingContent}/> : <Spinning/>}
              </Box>
            }
          </Layer>
            </Section>
            </div>
        }
        <MyFooter/>
        </App>
    )
  }
}
