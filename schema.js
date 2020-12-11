const _ = require('lodash');

const { GraphQLJSON, GraphQLJSONObject } = require('graphql-type-json');
//const GraphQLDecimal =require('graphql-type-decimal');
const Authors = require('./data/authors');
const Posts = require('./data/posts');

let {
    GraphQLString,
    GraphQLList,
    GraphQLObjectType,
    GraphQLNonNull,
    GraphQLSchema,
    GraphQLFloat,
    GraphQLFieldMap,
    GraphQLInt,
    GraphQLScalarType
} = require('graphql');


const {getRefObj,createQuery,createQueryTabular,createQueryCat} = require('./schFunk');
const {errorName} = require('../constants')


const PartnerType = new GraphQLObjectType({
    name: "Partner",
    description: "This represent Partner",
    extensions:{
        otk:{
            keyF:'ref',
            tbl:'cat',
            class_name:'cat.partners'
        }
    },
    fields: () =>{ 
        //const {getRefObj} = require('./schFunk');
        return ({
        _id: { type: GraphQLString},
        ref: {type: GraphQLString,resolve:(obj)=>{return getRefObj(obj)}},
        name: { type: GraphQLString}
        })
    }
});
const DeprtmentType = new GraphQLObjectType({
    name: "Depatment",
    description: "This represent Department",
    extensions:{
        otk:{
            keyF:'ref',
            tbl:'cat',
            class_name:'cat.branches'
        }
    },
    fields: () =>{ 
        return ({
        _id: { type: GraphQLString},
        ref: {type: GraphQLString,resolve:(obj)=>{return getRefObj(obj)}},
        name: { type: GraphQLString}
        })
    }
});

const NomType = new GraphQLObjectType({
    name: "Nom",
    description: "This represent Nomenclature",
    extensions:{
        otk:{
            keyF:'ref',
            tbl:'cat',
            class_name:'cat.nom'
        }
    },
    fields: () =>{ 
        return ({
        _id: { type: GraphQLString},
        ref: {type: GraphQLString,resolve:(obj)=>{return getRefObj(obj)}},
        name: { type: GraphQLString},
        name_full: { type: GraphQLString},
        })
    },
});




const OrganizationType = new GraphQLObjectType({
    name: "Organisation",
    description: "This represent Organization",
    extensions:{
        otk:{
            keyF:'ref',
            tbl:'cat',
            class_name:'cat.organizations'
        }
    },
    fields: () =>{ 
        return ({
        _id: { type: GraphQLString},
        ref: {type: GraphQLString, resolve:(obj)=>{return getRefObj(obj)}},
        name: { type: GraphQLString}
        })
    }
});

const ServiceLineBuyersOrderType = new GraphQLObjectType({
    name: "ServiceLineBuyerOrder",
    description: "This represent ServiceLineBuyerOrder",
    fields: () =>{ 
        return ({
        nom: { type: NomType},
        price: { type: GraphQLFloat}
        })
    }
});

const BuyersOrderType = new GraphQLObjectType({
    name: "BuyersOrder",
    description: "This represent Buyers Order",
    args: {
        ref : {
            type:GraphQLString
        }
    },
    fields: () => ({
        _id:{type:GraphQLString},
        organization:{type: OrganizationType},
        doc_amount:{type:GraphQLFloat},
        number_doc:{type:GraphQLString},
        date: { type: GraphQLString},
        partner:{type:PartnerType},
        department:{type:DeprtmentType},
        services:{  type:new GraphQLList(ServiceLineBuyersOrderType),
                    resolve: async (obj,arg,cont,info)=>{
                        var qq = createQueryTabular(obj,info,'services','buyers_order',ServiceLineBuyersOrderType,10)
                        const dbf = require('./db')
                        res = await dbf.query(qq,[])
                        return res.rows.map((e)=>{return e.jsb})
                    }    
                }    
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
                },
                limit : {
                    type:GraphQLInt
                }
            },
            resolve: async function(par,args,cont,info){
                var qq = createQuery(args,info,'buyers_order',BuyersOrderType)
//                throw  new Error(errorName.USER_ALREADY_EXISTS)
                const dbf = require('./db')
                res = await dbf.query(qq,[])
                return res.rows.map((e)=>{return e.jsb})
            }
        },
        partners:{
            name:'partners',
            type: new GraphQLList(PartnerType),
            args: {
                ref : {
                    type:GraphQLString
                },
                limit : {
                    type:GraphQLInt
                },
                lookup:{type:GraphQLString}
            },
            resolve: async function(par,args,cont,info){
                var qq = createQueryCat(args,info,'partners',PartnerType,50,{lookup:args.lookup})
                const dbf = require('./db')
                console.log(qq)
                res = await dbf.query(qq,[])
                return res.rows.map((e)=>{return e.jsb})
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