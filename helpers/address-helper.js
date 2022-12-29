var db=require('../config/connection')
var collections=require('../config/collections');
const { response } = require('express');
var objectId=require('mongodb').ObjectId


module.exports={

    addAddress:(address,userId)=>{
        console.log(address,userId,'jhdsafhlkjshjdlfhaolshdjjjjjjjjjjjjjjjjjjj');
        return new Promise((resolve,reject)=>{
            address.addressId = new Date().valueOf()
      db.get().collection(collections.USER_COLLECTION).updateOne({_id:objectId(userId)},{$push:{Address:address}})
        resolve()
        })
   
 },AllAddress:(userId)=>{
    return new Promise(async(resolve,reject)=>{
        let address =await db.get().collection(collections.USER_COLLECTION).aggregate([
            {
                $match: { _id: objectId(userId) }
            },
            {
                $unwind: '$Address'
            }, {
                $project: {
                   _id:0,
                   Address:'$Address'
                }
            }
            
          
        ]).toArray() // toArray- convert into an array
        resolve(address)
    })
 },deleteAddress: (addressId,userId ) => {
    console.log(addressId,userId ,'in delete');
    return new Promise(async (resolve, reject) => {
        db.get().collection(collections.USER_COLLECTION)       //parseInt is for form data in the from of string
            .updateOne({ _id: objectId(userId) }, { $pull: { Address: { addressId: parseInt(addressId) } } })
        resolve()
    })
}, getOneAddressById: (userId, address) => {
    console.log(userId, address);
    let addressId = parseInt(address)
    console.log(typeof (addressId));

    return new Promise(async (resolve, reject) => {
        const address = await db.get().collection(collections.USER_COLLECTION)
            .aggregate([
                {
                    $match: {
                        _id: objectId(userId)
                    }
                },
                {
                    $unwind: '$Address'
                },
                {
                    $match: { 'Address.addressId': addressId }
                },
                {
                    $project: {
                        Address: 1
                    }
                }
            ]).toArray()
        resolve(address[0])
    })
},


}
