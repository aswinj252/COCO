var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId


module.exports={
    addBanner:(banner,callback)=>{
        console.log(banner);

        db.get().collection('banner').insertOne(banner).then((data)=>{
        //   console.log(data);  
        callback(data.insertedId)
        })
    },
      getAllBanner: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let products =await db.get().collection(collections.BANNER_COLLECTION).find().toArray()  // toArray- convert into an array
            resolve(products)
        })

    },deleteBanner:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.BANNER_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })

        })
    },
}