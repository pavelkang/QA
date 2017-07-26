import React, {Component} from 'react';

import Paragraph from 'grommet/components/Paragraph';
import Prism from 'prismjs/prism.js';

var md = require('markdown-it')(),
    mk = require('markdown-it-katex');
md.use(mk);

var getMDHTMLString = function(s) {
  var x = md.render(s);
  return x;
}

export default class RenderedContent extends Component {
  render() {
    var content = this.props.content;
    var html_string = "";
    if (this.props.showPlaceHolder &&
        (content.length === 0 || (content.length === 1 && content[0].content === "\n"))) {
      content.push({
        "content": "\n\n### Nothing to show yet. Please edit.",
        "type": "md",
      });
    }
    for (var i = 0; i < content.length; i++) {
      if (content[i].type === "code") {
        var code = Prism.highlight(content[i].content, Prism.languages['python']);
        html_string = html_string.concat('<pre class="language-python mypre"><code class="language-python">' + code + '</code></pre>'  );
      } else {
        html_string = html_string.concat(getMDHTMLString(content[i].content));
      }
    }
    return (
        <Paragraph align="start" margin="none" size="large" dangerouslySetInnerHTML={{__html:html_string}}>
        </Paragraph>
    );
  }
}
