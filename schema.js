const _ = require('lodash');

const Authors = require('./data/authors');
const Posts = require('./data/posts');

let {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLInt
} = require('graphql');

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represent an author",
    fields: () => ({
        id: { type: new GraphQLNonNull(GraphQLString)},
        name: { type: new GraphQLNonNull(GraphQLString)},
        twitterHandler: {type: GraphQLString}
    })
});

const PostType = new GraphQLObjectType({
    name: "s",
    description: "This represent a s",
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLString)},
        title: {type: new GraphQLNonNull(GraphQLString)},
        body: {type: GraphQLString},
        category:{type: GraphQLString},
        author: {
            type: AuthorType,
            resolve: function(post) {
                return _.find(Authors, a => a.id == post.author_id);
            }
        }
    })
});

const BlogQueryRootType = new GraphQLObjectType({
    name: "BlogAppSchema",
    description: "Blog Application Schema Query Root",
    fields:  {
        authors: {
            type: new GraphQLList(AuthorType),
            description: "List of all Authors",
            resolve: function() {
                return Authors
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            description: "List of all Posts",
            resolve: function() {
                return Posts
            }
        },
        tst:{
            name:'fff',
            type:GraphQLString,
            args: {
                 id : {
                     type:GraphQLString
                 }
            },
            resolve:(obj,args)=>{
                
                console.log(obj,args)
                    const dbf = require('./db');
                    
                    const couch = dbf.couch.use('otk_2_doc_0001');
                
                    couch.changesReader.start({})
                        .on('batch',b=>{
                            b.map(rec=>{
                                console.log(rec)
                            })
                        })
                        .on('error',(e)=>{console.log('Error::',e)});
                         
                    // db.query('SELECT * FROM doc ',[], (err, res) => {
                    //     if (err) {
                    //       console.log(err)
                    //     }
                    //     console.log(res.rows)
                    //     res.fields.map((val)=>{console.log(val.name)})
                    //   })
                    
                    return( "this  test 2" )
                
            }
        }
    }    
});

const BlogAppSchema = new GraphQLSchema({
    query: BlogQueryRootType
    /* 
       mutation: BlogMutationRootType
    */
});

module.exports = BlogAppSchema;