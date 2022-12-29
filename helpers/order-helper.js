var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId

module.exports={

    getAllOrders: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let order=await db.get().collection(collections.ORDER_COLLECTION).find().toArray()  // toArray- convert into an array
            resolve(order)
        })

    },
    getOrderProd:(orderId)=>{
   
        return new Promise(async(resolve,reject)=>{
            let orderItems=await db.get().collection(collections.ORDER_COLLECTION).aggregate([
             {
                $match:{_id:objectId(orderId)}
             },
             {
                $unwind:'$products'
             },{
                $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                } 
             },
             {
                $lookup:{
                    from:collections.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'product'
                }
    
             },
             {
                $project:{
                    item:1,quantity:1,product:{$arrayElemAt:['$product',0]}
                }
             }
            ]).toArray()
             
            console.log(orderItems,'sdssdsdsdsds');
                resolve(orderItems)
            
        })  
    }

}
