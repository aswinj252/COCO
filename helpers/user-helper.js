var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectId
const Otp = require('../config/twilio')
const Client = require('twilio')(Otp.accoundSid, Otp.authToken)
const Razorpay = require('razorpay')

var instance = new Razorpay({
    key_id: 'rzp_test_Z6qSb9eRCZFMvV',
    key_secret: '77Wl0Xu8r7liV2LYEJLmYZlo',
});
var paypal = require('paypal-rest-sdk');
const collections = require('../config/collections')
paypal.configure({
    'mode': 'sandbox', //sandbox or live 
    'client_id': 'AXq_qZsdOeH_aZW0PCnkm87kzvXlc9T63OqXfVWe9npv1oMAiBVm-OJxGxT-CD7IX3ZmatX7m3FuajSC', // please provide your client id here 
    'client_secret': 'ENo9Q3HOtcbK6m27AJ1wkgrcWX-yrNPBHZC1JaDX5YDe1SQa64zYQgP0qFcyCXLlUXHNUMxB9VR7qJue' // provide your client secret here 
  });
module.exports = {
    doSignuP: (userData) => {   // userData- storing data 

        return new Promise(async (resolve, reject) => {                   // async --bcrypt have await
            // here in this condition we check the email is already used or not
            // if used it return resolve statue as false else it will create user and send status true
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (user) {
                resolve({ status: false })
            } else {
                userData.Password = await bcrypt.hash(userData.Password, 10) // change password to bcrypt format-bcrypt have a call back so made it  await
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                    resolve({ status: true })  // to view data obj id in console
                })

            }

        })
    },
    doLogin: (userData) => {
        console.log(userData);
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}

            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            console.log(user);
            if (user) {
                if (user.block == false) {

                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {
                            console.log("login success")
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log("login failed");
                            resolve({ status: false })
                        }
                    })
                }
                else {
                    console.log("login failed");
                    resolve({ blocked: true })
                }
            } else {
                console.log("login failed");
                resolve({ status: false })
            }
        })
    },
    getAllUsers: () => {  //we use promise here
        return new Promise(async (resolve, reject) => {   //getting data should write in await 
            let user = await db.get().collection(collection.USER_COLLECTION).find().toArray()  // toArray- convert into an array
            resolve(user)
        })

    },
    getUserDetails: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).findOne({ _id: objectId(userid) }).then((user) => {
                resolve(user)
            })
        })
    }, blockUpdate: (userid) => {
        console.log('hello inside block update');
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userid) }, {
                $set: {
                    block: true
                }
            })
            console.log('hello out side block update');
        })
    }, unBlockUpdate: (userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userid) }, {
                $set: {
                    block: false
                }
            })
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == proId)
                console.log(proExist);
                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION)
                        .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                            {
                                $inc: { 'products.$.quantity': 1 }
                            }
                        ).then(() => {
                            resolve()
                        })

                }
                else {



                    db.get().collection(collection.CART_COLLECTION).
                        updateOne({ user: objectId(userId) },
                            {

                                $push: { products: proObj }

                            }
                        ).then((response) => {
                            resolve()
                        })
                }
            }
            else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }

            ]).toArray()

            resolve(cartItems)

        })
    },
    getCartCount: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length

            }
            resolve(count)
            console.log(count);
        })
    },
    changeProductQuantityIn: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                    })
            }
            else {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                        {
                            $inc: { 'products.$.quantity': details.count }
                        }
                    ).then((response) => {
                        resolve({ status: true })
                    })
            }
        })
    },
    delFromCart: (details) => {

        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                })

        })
    },

    doOTP: (userData) => {
        console.log(userData);
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Phone: userData.phone })
            if (user) {

                response.status = true
                response.user = user
                Client.verify.services(Otp.serviceId)
                    .verifications
                    .create({ to: `+91${userData.phone}`, channel: 'sms' })
                    .then((data) => {


                    });
                resolve(response)
            }
            else {
                response.status = false;
                resolve(response)
            }
        })

    },
    doOTPConfirm: (confirmotp, userData) => {
        return new Promise((resolve, reject) => {

            console.log(userData)
            console.log(confirmotp);
            Client.verify.services(Otp.serviceId)
                .verificationChecks
                .create({
                    to: `+91${userData.Phone}`,
                    code: confirmotp.phone
                })
                .then((data) => {
                    if (data.status == 'approved') {

                        resolve({ status: true })
                    } else {
                        resolve({ status: false })
                    }
                })
        })
    },

    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
            
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }, {
                    $group: {
                        _id: null,
                        total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                    }
                }
            ]).toArray()
            

            resolve(total[0]?.total)

        })
    },

    placeOrder: (order, products, totalPrice) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, totalPrice);

            let status = order['payment-method'] === 'COD' ? 'placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    name: order.Fname,
                    email: order.email,
                    phoneNumber: order.phone,
                    address: order.address,
                    state: order.state,
                    postcode: order.pincode,
                    town: order.town,
                    state: order.state
                },
                userId: objectId(order.userId),
                paymentMethod: order['payment-method'],
                products: products,
                totalAmount: totalPrice,
                date: new Date(),
                status: status
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).deleteOne({ user: objectId(order.userId) })
                resolve(response.insertedId)
            })
        })
    },
    getUserOrders: (userId) => {
        return new Promise(async (resolve, reject) => {
            console.log(userId);
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(orders);
            resolve(orders)
        })
    },
    getOrderProd: (orderId) => {

        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                }, {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }

                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()

            console.log(orderItems, 'sdssdsdsdsds');
            resolve(orderItems)

        })

    }, 
    
    cancelOrder:(orderId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECTION).updateOne({ _id: objectId(orderId) }, {
                $set: {
                    
                  status:"canceled"
                }
            })

        })

    } ,
    generateRazorPay: (orderId, total) => {
        return new Promise((resolve, reject) => {
            console.log(total,"ughudahhfoladhofiho;aishdohgvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv");
            var options = {
                amount: total * 100,
                currency: "INR",
                receipt: "" + orderId
            };
            instance.orders.create(options, function (err, order) {
                if (err) {
                    console.log(err);
                } else {


                    console.log("gvcfhgfgjkfvjhvkv", order);
                    resolve(order)
                }
            })
        })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', '77Wl0Xu8r7liV2LYEJLmYZlo');


            hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]']);
            hmac = hmac.digest('hex')
            if (hmac == details['payment[razorpay_signature]']) {
                resolve();
            } else {
                reject();
            }
        });
    },
    changePaymentStatus: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'placed'
                        },
                    }
                ).then(() => {
                    resolve()
                })

        })
    }
    ,createPay: (payment) => {
        return new Promise((resolve, reject) => {
            paypal.payment.create(payment, function (err, payment) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(payment);
                }
            });
        })
    },
  addTowish: (proId, userId) => {
    console.log('inside userhelper');
    let proObj = {
        item: objectId(proId),
        quantity: 1
    }
    return new Promise(async (resolve, reject) => {
        let userWish = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
        if (userWish) {
            let proExist = userWish.products.findIndex(product => product.item == proId)
            console.log(proExist);
            if (proExist != -1) {
                db.get().collection(collection.WISH_COLLECTION)
                    .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })

            }
            else {



                db.get().collection(collection.WISH_COLLECTION).
                    updateOne({ user: objectId(userId) },
                        {

                            $push: { products: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
            }
        }
        else {
            let WishObj = {
                user: objectId(userId),
                products: [proObj]
            }
            db.get().collection(collection.WISH_COLLECTION).insertOne(WishObj).then((response) => {
                resolve()
            })
        }
    })
}, getWishProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
        let wishItems = await db.get().collection(collection.WISH_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }

            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }

        ]).toArray()

        resolve(wishItems)

    })
},
getTotalWishAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
        
        let total = await db.get().collection(collection.WISH_COLLECTION).aggregate([
            {
                $match: { user: objectId(userId) }
            },
            {
                $unwind: '$products'
            }, {
                $project: {
                    item: '$products.item',
                    quantity: '$products.quantity'
                }
            },
            {
                $lookup: {
                    from: collection.PRODUCT_COLLECTION,
                    localField: 'item',
                    foreignField: '_id',
                    as: 'product'
                }

            },
            {
                $project: {
                    item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                }
            }, {
                $group: {
                    _id: null,
                    total: { $sum: { $multiply: ['$quantity', '$product.Price'] } }
                }
            }
        ]).toArray()
        

        resolve(total[0]?.total)

    })
},
getWishCount: (userId) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
        let count = 0
        let wish = await db.get().collection(collection.WISH_COLLECTION).findOne({ user: objectId(userId) })
        if ( wish) {
            count =  wish.products.length

        }
        resolve(count)
        console.log(count);
    })
},
delFromWish: (details) => {
    console.log(details);

    return new Promise((resolve, reject) => {

        db.get().collection(collection.WISH_COLLECTION)
            .updateOne({ _id: objectId(details.cart) },
                {
                    $pull: { products: { item: objectId(details.product) } }
                }
            ).then((response) => {
                resolve({ removeProduct: true })
            })

    })
},
changeProductStatus: (data) => {

    console.log(data, 'dataaaaaaaaaaaaaaaaaa');
    let orderId = data.order
  
    let value = data.valueChange


    return new Promise((resolve, rejects) => {
        db.get().collection(collection.ORDER_COLLECTION)
            .updateOne({ _id: objectId(orderId) },
                {
                    $set: { "status": value }
                }
            ).then((response) => {
                resolve(response)
            })
     })


    },
wishToCart: (proId, userId) => {
    let proObj = {
        item: objectId(proId),
        quantity: 1
    }
    return new Promise(async (resolve, reject) => {
        let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
        if (userCart) {
            let proExist = userCart.products.findIndex(product => product.item == proId)
            console.log(proExist);
            if (proExist != -1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }
                    ).then(() => {
                        resolve()
                    })

            }
            else {



                db.get().collection(collection.CART_COLLECTION).
                    updateOne({ user: objectId(userId) },
                        {

                            $push: { products: proObj }

                        }
                    ).then((response) => {
                        resolve()
                    })
            }
        }
        else {
            let cartObj = {
                user: objectId(userId),
                products: [proObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                resolve()
            })
        }
    })
},

applyCoupon:(details, userId, date,totalAmount)=>{
    return new Promise(async(resolve,reject)=>{
      let response={};
      
      let coupon=await db.get().collection(collections.COUPON_COLLECTION).findOne({couponId:details.coupon});
      if(coupon){

        const expDate=new Date(coupon.expDate)
       
        response.couponData = coupon;
       

        let user=await db.get().collection(collections.COUPON_COLLECTION).findOne({couponId:details.coupon,Users:objectId(userId)})
         
        if(user){
          
          response.used="Coupon Already Applied"
          resolve(response)
         

        }else{

          if(date <=expDate){

              response.dateValid=true;
              resolve(response);

              let total=totalAmount;

              if(total >= coupon.minAmount){
                
                response.verifyMinAmount=true;
                resolve(response)

                if(total >= coupon.maxdiscount){

                  response.verifyMaxAmount=true;
                  resolve(response)
                }
                else{
                  response.maxAmountMsg="Your Maximum Purchase should be"+ coupon.maxdiscount;
                  response.maxAmount=true;
                  resolve(response)
                }
              }
              else{
                
                response.minAmountMsg="Your Minimum purchase should be"+coupon.minAmount;
                response.minAmount=true;
                resolve(response)
              }   

          }else{
            response.invalidDateMsg = 'Coupon Expired'
            response.invalidDate = true
            response.Coupenused = false

            resolve(response)
            console.log('invalid date');
          }
        }
        
      }else{
        response.invalidCoupon=true;
        response.invalidCouponMsg="Invalid Coupon";
        resolve(response)
      }

      if(response.dateValid && response.verifyMaxAmount && response.verifyMinAmount)
      {
        response.verify=true;
        db.get().collection(collections.CART_COLLECTION).updateOne({user:objectId(userId)},
        {
          $set:{
            coupon:objectId(coupon._id)
          }  
        })
        resolve(response)
      }
    })
  },
  
  couponVerify:(userId)=>{
    return new Promise(async(resolve,reject)=>{

      let userCart= await db.get().collection(collectionS.CART_COLLECTION).findOne({user:objectId(userId)})
     
      if(userCart.coupon){
          
        let couponData=await db.get().collection(collections.COUPON_COLLECTION).findOne({_id:objectId(userCart.coupon)});
       
        resolve(couponData)
      }
      resolve(userCart);
    

    })

  },


}//fghgfhgfjhfghfhg