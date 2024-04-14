const { buildSchema } = require("graphql");



module.exports = buildSchema(`

input userDataInput{
  _id: ID!
  name: String!
  profilePicUrl: String!
  backgroundImgUrl: String!
}

input newComments{
  commentId
}


type userData {
  _id: ID!
  email: String!
  name: String!
  profilePicUrl: String!
}
type Like{
  userData: userData
}

type Comment{
  text: String!
  userData: userData!
}

type Post{
  _id: ID!
  urls: [String]
  creationDate: String
  likesCount: Int!
  commentsCount: Int!
  saveCount: Int!
  title: String
  description: String
  likes: [Like!]!
  comments: [Comment]!
  user: userData
  liked: Boolean #This field is added run time in backend it represents weather the current frontend user has liked this post
}

type Event{
  _id: ID!
  imgUrl: String!
}

type HomeInitial{
  events: [Event]!
  posts: [Post]!
}

type UserProfile{
  _id: ID!
  name: String!
  title: String!
  email: String!
  profilePicUrl: String!
  backgroundImgUrl: String!
  about: String!
  badges: [String]
  events: [String]
  posts: [ID]!
  savedPosts: [Post]
  followers: [ID]!
  following: [ID]!
}

type ProfileLoad{
  userData: UserProfile!
  posts: [Post]!
}

type signupData{
  _id: ID!
  email: String!
}
type loginData{
  userData: userData!
  token: String!

}
type postsQuery {
  posts: [Post]
}

type RootMutation{
  signup(email: String!, password: String!, confirmPassword: String!): signupData!
  likePost(liked: Boolean, postId: ID!, userId: ID): String!
  addComment(postId: ID, userId: ID, text: String): ID!
  delComment(postId: ID, userId: ID): String!
}
type RootQuery{
  homeLoadQuery(userId: ID, page: Int, limit: Int): HomeInitial

  profileLoadQuery(userId: ID!, page: Int, limit: Int): ProfileLoad
  login(email: String!, password: String!): loginData
  isLoggedIn(token: String!, _id: ID!): loginData!
  
  getProfilePosts(userId: ID!, page: Int, limit: Int): postsQuery
  getHomePosts(userId: ID, page: Int, limit: Int): postsQuery

  getComments(postId: ID, userId: ID, page: Int, newComments: []): [Comment]
}
  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
