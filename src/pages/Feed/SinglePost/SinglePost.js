import React, { Component } from 'react';

import Image from '../../../components/Image/Image';
import './SinglePost.css';

class SinglePost extends Component {
  state = {
    title: '',
    author: '',
    date: '',
    image: '',
    content: ''
  };

  componentDidMount() {
    const postId = this.props.match.params.postId;
    console.log(postId);
    const graphqlQuery = {
      query: `
        query{
          getPost(postId: "${postId}"){
            _id
            title
            content
            imageUrl
            creator{
              name
            }
            createdAt
          }
        }
      `
    };
    fetch(`http://localhost:8080/graphql`, {
      headers: {
        Authorization: 'Bearer ' + this.props.token,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(graphqlQuery)
    })
      .then(res => {
        console.log(res.status);
        return res.json();
      })
      .then(resData => {
        if (resData.errors && resData.errors.length > 0) {
          if(resData.errors[0].status === 422 ){
            throw new Error('Validation failed.');
          }
          if(resData.errors[0].status === 401 || resData.errors[0].status === 404){
            throw new Error('Authentication failed.');
          }
          else {
            throw new Error('Internal Error in retreiving a single post.')
          };
        }
        this.setState({
          title: resData.data.getPost.title,
          author: resData.data.getPost.creator.name,
          date: new Date(resData.data.getPost.createdAt).toLocaleDateString('en-US'),
          content: resData.data.getPost.content,
          image: `http://localhost:8080/${resData.data.getPost.imageUrl}`,
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  render() {
    return (
      <section className="single-post">
        <h1>{this.state.title}</h1>
        <h2>
          Created by {this.state.author} on {this.state.date}
        </h2>
        <div className="single-post__image">
          <Image contain imageUrl={this.state.image} />
        </div>
        <p>{this.state.content}</p>
      </section>
    );
  }
}

export default SinglePost;
