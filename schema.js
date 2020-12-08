const _ = require('lodash');

const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');

const Authors = require('./data/authors');
const Posts = require('./data/posts');

let {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLFieldMap,
    GraphQLInt
} = require('graphql');



const PartnerType = new GraphQLObjectType({
    name: "Partner",
    description: "This represent Partner",
    extensions:{
        otk:{
            key:'_id',
            tbl:'cat'
        }
    },
    fields: () =>{ console.log(this);return ({
        _id: { type: GraphQLString},
        ref: {type: GraphQLString},
        name: { type: GraphQLString}
        })
    }
});

const BuyersOrderType = new GraphQLObjectType({
    name: "BuyersOrder",
    description: "This represent Buyers Order",
    fields: () => ({
            _id:{type:GraphQLString,resolve:(obj,args,cont)=>{
                              return obj.jsb._id}},
            jsb: {type:GraphQLJSONObject},   
            number_doc:{type:GraphQLString},
            partner:{type:PartnerType},       
    })
});


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
        buyers_orders:{
            name:'buyers_order',
            type: new GraphQLList(BuyersOrderType),
            args: {
                ref : {
                    type:GraphQLString
                }
            },
            resolve: async function(par,arg,cont,info){
//                console.log(rInfo.fieldNodes[0].selectionSet.selections)
//const { fieldsList, fieldsMap,fieldsProjection } = require('graphql-fields-list');
//console.log(fieldsList(info, { withDirectives: true }));       // [ 'id', 'firstName', 'lastName' ]
//console.log(fieldsMap(info, { withDirectives: true }));        // { id: false, firstName: false, lastName: false }
const fields = BuyersOrderType
console.log(fields.getFields())
//.map(f=>console.log(f.type))
       
                const dbf = require('./db')
                res = await dbf.query("SELECT * FROM doc d  limit 10 ",[])
                //, (err, res) => {
                //         if (err) {
                //           console.log(err)
                //         }
                //         console.log(res.rows)
                //         res.fields.map((val)=>{console.log(val.name)})
                //       })
                return res.rows
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
            resolve: (obj,args)=>{
                
                console.log(obj,args)
                    const dbf = require('./db');
                    
                    const couch = dbf.couch.use('otk_2_doc');
                
                    couch.changesReader.start({since:0,includeDocs:true})
                        .on('batch',b=>{
                            b.map(rec=>{
                                if(!rec.doc._id || !rec.doc.class_name) return
                                var ref = rec.doc._id.split('|')[1]
                                var tbl_name = ''        
                                switch (rec.doc.class_name.split('.')[0]){
                                    case 'doc':{
                                        tbl_name = 'doc'
                                        break        
                                    }
                                    case 'cat':{
                                        tbl_name = 'cat'
                                        break        
                                    }
                                
                                default: break    
                                        
                                }

                            if (tbl_name !== '')    
                            dbf.query('INSERT INTO '+tbl_name+' (id,class_name,ref,jsb) VALUES($1,$2,$3,$4) ON CONFLICT (id) do UPDATE SET class_name = EXCLUDED.class_name,ref=EXCLUDED.ref,jsb=EXCLUDED.jsb',
                                [rec.doc._id,rec.doc.class_name,ref,rec.doc], 
                                (err, res) => {
                                 if (err) {
                                   console.log(err)
                                 }
                                 //console.log(res)
                                })

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