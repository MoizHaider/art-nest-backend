const { buildSchema } = require("graphql");



module.exports = buildSchema(`



input userDataInput{
  _id: ID!
  name: String!
  profilePicUrl: String!
  backgroundImgUrl: String!
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
  user: userData!
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
  followersCount: Int!
  followingCount: Int!
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
  _id: ID!
  token: String!
}
type postsQuery {
  posts: [Post]
}

type RootMutation{
  signup(email: String!, password: String!, confirmPassword: String!): signupData!
  likePost(postId: ID!, userData: userDataInput!): String!
}
type RootQuery{
  homeLoadQuery(userId,page: Int, limit: Int): HomeInitial

  profileLoadQuery(userId: ID!, page: Int, limit: Int): ProfileLoad
  login(email: String!, password: String!): loginData
  isLoggedIn(token: String!, _id: ID!): loginData!
  
  getProfilePosts(userId: ID!, page: Int, limit: Int): postsQuery
  getHomePosts(userId: ID, page: Int, limit: Int): postsQuery
}
  schema{
    query: RootQuery
    mutation: RootMutation
  }
`);
