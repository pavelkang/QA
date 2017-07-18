import React, {Component} from 'react';

import App from 'grommet/components/App';
import Title from 'grommet/components/Title';
import Header from 'grommet/components/Header';
import Section from 'grommet/components/Section';
import Box from 'grommet/components/Box';
import Button from 'grommet/components/Button';
import MyFooter from './MyFooter';
import ViewIcon from 'grommet/components/icons/base/View';
import AddIcon from 'grommet/components/icons/base/AddChapter';
import SaveIcon from 'grommet/components/icons/base/Save';
import TextInput from 'grommet/components/TextInput';
import Layer from 'grommet/components/Layer';
import {Editor, EditorState} from 'draft-js';
import axios from 'axios';
import RenderedContent from './RenderedContent';
import Spinning from 'grommet/components/icons/Spinning';
import Select from 'grommet/components/Select';

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
  console.log(result);
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
    };
    axios.get('/api/get_tags')
      .then((r) => {
        this.setState({
          tagOptions: r.data.tags,
        });
      })
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
        alert('saved!');
        window.location.href = "/";
      });
  }

  submit() {
    axios.post('/api/add_wiki', this.getContent())
      .then((r) => {
        window.location.href = "/";
      });
  }

  render() {
    console.log(this.props.match);
    console.log(this.props.location);
    return (
        <App>
        <Header>
        <Title>Editor</Title>
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
      label='Add'
      onClick={this.submit.bind(this)}
      primary={true}></Button>
        </Box>
        <Layer onClose={this.closePreview.bind(this)} hidden={!this.state.previewOpen} closer={true}>
        {
          this.state.previewingContent ?
            <RenderedContent content={this.state.previewingContent}/>
            :
            <Box align="center" justify="center" pad="large" margin="large">
            <Spinning/>
            </Box>
        }
      </Layer>
        </Section>
        <MyFooter/>
        </App>
    )
  }
}
