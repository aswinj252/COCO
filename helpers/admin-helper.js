var db=require('../config/connection')
var collections=require('../config/collections');
const { response } = require('express');
var objectId=require('mongodb').ObjectId


module.exports={
    getYearlySalesGraph: () => {
        return new Promise(async (resolve, reject) => {
            let sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
                {
                    $project: { date: 1, totalAmount: 1 }
                },

                {
                    $group: {
                        _id: { $dateToString: { format: "%Y", date: "$date" } },
                        totalAmount: { $sum: '$totalAmount' },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: {
                        _id: 1
                    }
                },
                {
                    $limit: 7
                }
            ]).toArray()
            resolve(sales)
        })
    },
getMonthlySalesGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $project: { date: 1, totalAmount: 1 }
            },

            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $limit: 7
            }
        ]).toArray()
        resolve(sales)
       })
    },getDailySalesGraph: () => {
    return new Promise(async (resolve, reject) => {
        let sales = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $project: { date: 1, totalAmount: 1 }
            },

            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    totalAmount: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    _id: 1
                }
            },
            {
                $limit: 7
            }
        ]).toArray()
        resolve(sales)
       })
    },

getTotalOrders: () => {
    return new Promise(async (resolve, reject) => {
        let orderCount = await db.get().collection(collections.ORDER_COLLECTION).find().count()
        resolve(orderCount)
       })
    },
getAllProductCount: () => {
    return new Promise(async (resolve, reject) => {
        let productCount = await db.get().collection(collections.PRODUCT_COLLECTION).find().count()
        resolve(productCount)
      })

    },
getAllSales: () => {
    return new Promise(async (resolve, reject) => {
        let salesData = await db.get().collection(collections.ORDER_COLLECTION).aggregate([
            {
                $project: { date: 1, totalAmount: 1 }
            },
            {
                $group: {
                    _id: { day: { $dayOfYear: { $toDate: "$date" } } },
                    totalAmount: { $sum: '$totalAmount' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: -1 }
            },
            {
                $limit: 5
            }
        ]).toArray()
        console.log(salesData, 'qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq');
        console.log()
        resolve(salesData[0].totalAmount)
       })
    },getTotalUsers: () => {
    return new Promise(async (resolve, reject) => {
        let totalUsers = await db.get().collection(collections.USER_COLLECTION).aggregate([
            {
                $match: {
                    "block": false
                }
            },
            {
                $project: {
                    user: { _id: 1 }
                }
            },
            {
                $count: 'user'
            }
        ]).toArray()
        resolve(totalUsers[0]?.user)
       })
    },
addCouponsIn:(data)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collections.COUPON_COLLECTION).insertOne(data).then(()=>{
        resolve()
      })
    })
  },
  getAllCoupons:()=>{
    return new Promise(async(resolve,reject)=>{
     let coupons=await db.get().collection(collections.COUPON_COLLECTION).find().toArray()
     resolve(coupons)
    })
   },
   deleteCoupon:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
      db.get().collection(collections.COUPON_COLLECTION).deleteOne({_id:objectId(couponId)}).then((response)=>{
        resolve(response)
      })
    })
  },
  
  updateCouponIn:(couponId,data)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(collections.COUPON_COLLECTION).updateOne({_id:objectId(couponId)},{
      $set:{
          couponName:data.couponName,
        couponId:data.couponId,
        maxdiscount:data.maxdiscount,
        minAmount:data.minAmount,
        expDate:data.expDate,
        couponPercentage:data.couponPercentage
      }
      }).then((response)=>{
        resolve();
      })
    })
  },
   getCouponDetails:(couponId)=>{
    return new Promise(async(resolve,reject)=>{
      let couponDetails=await db.get().collection(collections.COUPON_COLLECTION).findOne({_id:objectId(couponId)})
      resolve(couponDetails)
    })
  },
 
}