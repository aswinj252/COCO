var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId


module.exports={
    addCategory:(category,callback)=>{
        console.log(category);

        db.get().collection('category').insertOne(category).then((data)=>{
        //   console.log(data);  
        callback(data.insertedId)
        })
    },

    getAllCategory: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let category=await db.get().collection(collections.CATEGORY_COLLECTION).find().toArray()  // toArray- convert into an array
            resolve(category)
        })

    },
    deleteCategory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })

        })
    },getCategoryDetails:(cid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION).findOne({_id:objectId(cid)}).then((category)=>{
                resolve(category)
            })
        })
    },
    
    updateCategory:(catId,catDetails)=>{
        console.log(catId,catDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.CATEGORY_COLLECTION)
            .updateOne({_id:objectId(catId)},{
                $set:{
                    Brand:catDetails.Brand,
                    Description:catDetails.Description,
                    
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
    


 
 
}