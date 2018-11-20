const { GraphQLServer } = require("graphql-yoga");
const { Prisma } = require("prisma-binding");

let idCount = 0;
const posts = [];

const resolvers = {
  Query: {
    description: () => `This is the API for a simple blogging application`,
    posts: () => posts,
    post: (parent, args) => posts.find(post => post.id === args.id)
  },
  Mutation: {
    createDraft: (parent, args) => {
      const post = {
        id: `post_${idCount++}`,
        title: args.title,
        content: args.content,
        published: false
      };
      posts.push(post);
      return post;
    },
    deletePost: (parent, args) => {
      const postIndex = posts.findIndex(post => post.id === args.id);
      if (postIndex > -1) {
        const deleted = posts.splice(postIndex, 1);
        return deleted[0];
      }
      return null;
    },
    publish: (parent, args) => {
      const postIndex = posts.findIndex(post => post.id === args.id);
      posts[postIndex].published = true;
      return posts[postIndex];
    }
  }
};

const server = new GraphQLServer({
  typeDefs: "./src/schema.graphql",
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: "src/generated/prisma.graphql", // the generated Prisma DB schema
      endpoint: "https://us1.prisma.sh/will-holcombe-7a9316/database/dev", // the endpoint of the Prisma DB service
      secret: "mysecret123", // specified in database/prisma.yml
      debug: false // log all GraphQL queries & mutations
    })
  })
});

server.start(
  {
    cors: {
      credentials: true,
      origin: "http://localhost:3000"
    }
  },
  deets => {
    console.log(`Server is now running on port http://localhost:${deets.port}`);
  }
);
