import React, { Component } from 'react';
import Title from 'grommet/components/Title';

export default class TopicCard extends Component {
  render() {
    return (
      <div className="topic-card shadow">
        <Title className="topic-card-title">
          {this.props.title}
        </Title>
      </div>
    );
  }
}
