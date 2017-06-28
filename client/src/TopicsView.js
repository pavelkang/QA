import React, { Component } from 'react';
import Tiles from 'grommet/components/Tiles';
import Tile from 'grommet/components/Tile';
import TopicCard from './TopicCard';
import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

export default class TopicsView extends Component {

  render() {
    return (
      <Tiles fill={true} >
        {this.props.topics.map((topic, ind) => {
          var linkUrl;
          if (this.props.currUrl === "/") {
            linkUrl = `/${topic.code}`;
          } else {
            linkUrl = `${this.props.currUrl}/${topic.code}`;
          }
          return (
            <Link to={linkUrl} key={ind}>
            <Tile >
                <TopicCard title={topic.name}></TopicCard>
            </Tile>
            </Link>
          )
        })}
      </Tiles>
    );
  }
}
