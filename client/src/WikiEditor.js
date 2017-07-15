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

export default class WikiEditor extends Component {

  constructor(props) {
    super(props);
    this.state = {
      question: "",
      editorState: EditorState.createEmpty(),
      previewOpen: false,
      previewingContent: null,
    };
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

  saveDraft() {
    var contentState = this.state.editorState.getCurrentContent();
    var answerInText = contentState.getPlainText();
    axios.post('/api/save_draft', {
      q: this.state.question,
      a: answerInText,
    })
      .then((r) => {
        alert('saved!');
      });
  }

  submit() {
    var contentState = this.state.editorState.getCurrentContent();
    var answerInText = contentState.getPlainText();
    axios.post('/api/add_wiki', {
      q: this.state.question,
      a: answerInText,
    })
      .then((r) => {
        window.location.href = "/";
      });
  }

  render() {
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
        <h4 id="answer-tag">Answer</h4>
        <div className="RichEditor-root">

        <div className="RichEditor-editor">
        <Editor editorState={this.state.editorState} onChange={this.onAnswerChange.bind(this)} />
        </div>
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
