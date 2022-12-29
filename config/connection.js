var mongoClient = require('mongodb').MongoClient  // import-mongoClient 

const state={    // creating an object for database state==null
    db:null
}

// function for connecting data base..................
module.exports.connect = function (done) {    
    const url = 'mongodb://127.0.0.1:27017'
    const dbname = 'coco'                //shopping name

    mongoClient.connect(url,(err,data)=>{    // connection creation
        if(err)
         {return done(err)  }           // if error return err 
        else{
            state.db=data.db(dbname)            //if not error assign data base to state.db object
        done()}
    })
    
}
// to get data base ......................
module.exports.get=function(){
    return state.db             // return connected db through 'state.db' 
}