var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId


module.exports={
    addInventory:(inventory,callback)=>{
        console.log(inventory);

        db.get().collection('inventory').insertOne(inventory).then((data)=>{
        //   console.log(data);  
        callback(data.insertedId)
        })
    },

    getAllInventory: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let category=await db.get().collection(collections.INVENTORY_COLLECTION).find().toArray()  // toArray- convert into an array
            resolve(category)
        })

    },
    deleteInventory:(catId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.INVENTORY_COLLECTION).deleteOne({_id:objectId(catId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })

        })
    },getInventoryDetails:(cid)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.INVENTORY_COLLECTION).findOne({_id:objectId(cid)}).then((category)=>{
                resolve(category)
            })
        })
    },
    
    updateInventory:(catId,catDetails)=>{
        console.log(catId,catDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.INVENTORY_COLLECTION)
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