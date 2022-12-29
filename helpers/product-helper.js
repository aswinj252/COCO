var db=require('../config/connection')
var collections=require('../config/collections')
var objectId=require('mongodb').ObjectId


module.exports={
    addProduct:(product)=>{
        console.log(product);
return new Promise((resolve, reject) => {
        db.get().collection('product').insertOne(product).then((data)=>{
        //   console.log(data);  
      resolve();
        })
        
})
    },

    getAllProducts: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).find().sort({_id:-1}).toArray()  // toArray- convert into an array
            resolve(products)
        })

    },
    
    getAllDark: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).find({"Category":"Dark Chocolate"}).toArray()  // toArray- convert into an array
            resolve(products)
        })

    }, getAllMilk: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).find({"Category":"Milk Chocolate"}).toArray()  // toArray- convert into an array
            resolve(products)
        })

    },getAllWhite: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let products =await db.get().collection(collections.PRODUCT_COLLECTION).find({"Category":"White Chocolate"}).toArray()  // toArray- convert into an array
            resolve(products)
        })
    },
    deleteProducts:(prodId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                console.log(response);
                resolve(response)
            })

        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        console.log(proId,proDetails);
        return new Promise((resolve,reject)=>{
            db.get().collection(collections.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Brand:proDetails.Brand,
                    Description:proDetails.Description,
                    Price:proDetails.Price,
                    Category:proDetails.Category,
                    image: proDetails.image,
                    image1: proDetails.image1,
                    image2: proDetails.image2,
                    image3: proDetails.image3
                
                }
            }).then((response)=>{
                resolve()
            })
        })
    }
    ,
    fetchImage1: (proID) => {
        console.log(proID,'hi img 1');
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image: true } })
            resolve(detail.image)
        })
    },
    fetchImage2: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image1: true } })
            resolve(detail.image1)
        })
    },
    fetchImage3: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image2: true } })
            resolve(detail.image2)
        })
    },
    fetchImage4: (proID) => {
        return new Promise(async (resolve, reject) => {
            let detail = await db.get().collection(collections.PRODUCT_COLLECTION).findOne({ _id: objectId(proID) }, { projection: { image3: true } })
            resolve(detail.image3)
        })
    },

//   doSignuP:(userData)=>{   // userData- storing data 

//     return new Promise(async (resolve, reject) => {                   // async --bcrypt have await
//        // here in this condition we check the email is already used or not
//        // if used it return resolve statue as false else it will create user and send status true
//         let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
//         if (user) {
//             resolve({ status: false })
//         } else {
//       userData.Password = await bcrypt.hash(userData.Password, 10) // change password to bcrypt format-bcrypt have a call back so made it  await
//             db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
//                 resolve({ status: true })  // to view data obj id in console
//             })

//         }

//     })
//   },
  getcategoryDetails:(proId)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.PRODUCT_COLLECTION).find({Category:(proId)}).then((product)=>{
            resolve(product)
        })
    })
},
updatestock:(proId,proDetails)=>{
    console.log(proId,proDetails);
    return new Promise((resolve,reject)=>{
        db.get().collection(collections.PRODUCT_COLLECTION)
        .updateOne({_id:objectId(proId)},{
            $set:{
              Stock:proDetails.Stock
               
            }
        }).then((response)=>{
            resolve()
        })
    })
}
}