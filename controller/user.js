// const { response, query } = require('express');
var express = require('express');
var router = express.Router();
var productHelper = require('../helpers/product-helper');
var userHelpers = require('../helpers/user-helper')
var bannerHelper = require('../helpers/banner-helper')
const categoryHelpers = require('../helpers/category-helper');
const cartHelper = require('../helpers/cart-helper');
const addressHelper = require('../helpers/address-helper')
const Otp = require('../config/twilio');
const userHelper = require('../helpers/user-helper');
const Client = require('twilio')(Otp.accoundSid, Otp.authToken)
// const e = require('express');

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/user/user-login')
  }
}
let signupData;
var paypal = require('paypal-rest-sdk');

module.exports = {
  //LANDING PAGE
  userLanding: async (req, res, next) => {
    let user = req.session.user

    const AllProducts = await productHelper.getAllProducts()
    const AllDarks = await productHelper.getAllDark()
    const AllMilk = await productHelper.getAllMilk()
    const AllWhite = await productHelper.getAllWhite()
    const Banner = await bannerHelper.getAllBanner()

    console.log(AllProducts);
    console.log(AllDarks);
    res.render('user/home', { AllProducts, user, AllDarks, AllMilk, AllWhite, Banner });


  },
  //login load
  userLoginLoad: (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/user/home')
    } else {

      res.render('user/user-login', { "loginErr": req.session.loginErr })
      req.session.loginErr = false
    }


  },
  //user login
  userLogin: (req, res) => {
    userHelpers.doLogin(req.body).then((response) => {

      if (response.blocked) {
        req.session.blockerr = true
        res.render('user/user-login')
      }

      if (response.status) {

        req.session.loggedIn = true
        req.session.user = response.user
        res.redirect('/user/home')

      }

      else {
        req.session.loginErr = true
        res.redirect('/user/user-login')
      }
    })



  },
  //user home
  userHome: async (req, res) => {

    let user = req.session.user

    console.log(user);
    let cartCount = null
    let wishCount = null
    if (req.session.user) {
      cartCount = await userHelpers.getCartCount(req.session.user._id)
      wishCount = await userHelpers.getWishCount(req.session.user._id)
      console.log(cartCount);
    }
    const AllProducts = await productHelper.getAllProducts()
    const AllDarks = await productHelper.getAllDark()
    const AllMilk = await productHelper.getAllMilk()
    const AllWhite = await productHelper.getAllWhite()
    const Banner = await bannerHelper.getAllBanner()
    console.log(AllProducts);
    console.log(AllDarks);
    res.render('user/home', { AllProducts, user, AllDarks, AllMilk, AllWhite, user, Banner, cartCount, wishCount});


  },

  redirect: (req, res) => {
    res.render('user/user-login')
  },
  //user signup load
  usersignup: (req, res) => {
    res.render('user/user-signup')
  },
  //user signup
  userSignUp: (req, res) => {
    userHelpers.doSignuP(req.body).then((response) => {
      console.log(response);
    })

    res.redirect('/user/user-login')
  },

  //user logout
  userLogout: (req, res) => {
    req.session.user = false
    req.session.loggedIn = false
    res.redirect('/user/home')
  },
  seeMore: (req, res) => {
    productHelper.getAllProducts().then((products) => {
      res.render('user/seemore', { products })
    })

  },
  //all products
  allproducts: async (req, res) => {
    try {


      let OnePrId = req.params.id

      console.log(OnePrId, 'gggggggggggggggggggggggggggggggg');
      let product = await productHelper.getProductDetails(OnePrId)


      console.log(product);

      res.render('user/prod', { product });
    }
    catch (err) {
      console.log(err);
      res.render('user/404')
    }

  },
  //all darks
  alldark: async (req, res) => {
    try{

    
    let OnePrId = req.params.id

    console.log(OnePrId, 'gggggggggggggggggggggggggggggggg');
    let product = await productHelper.getProductDetails(OnePrId)

    const AllDarks = await productHelper.getAllDark()
    console.log(product);

    res.render('user/blackc', { product, AllDarks });}
    catch(err){
      console.log(err);
      res.render('user/404') 
    }
  },
  // all white 
  allwhite: async (req, res) => {
    let OnePrId = req.params.id

    console.log(OnePrId, 'gggggggggggggggggggggggggggggggg');
    let product = await productHelper.getProductDetails(OnePrId)
    const AllWhite = await productHelper.getAllWhite()

    console.log(product);

    res.render('user/white', { product, AllWhite });
  },

  //all milk
  allMilk: async (req, res) => {
    let OnePrId = req.params.id

    console.log(OnePrId, 'gggggggggggggggggggggggggggggggg');
    let product = await productHelper.getProductDetails(OnePrId)
    const AllMilk = await productHelper.getAllMilk()

    console.log(product);

    res.render('user/milk', { product, AllMilk });
  },

  cart: async (req, res) => {
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    console.log(products);
    res.render('user/cart', { products,total, user: req.session.user })
  },
  addToCart: (req, res) => {
    let id = req.params.id
    console.log(id, 'sdk;fms;dkf');
    userHelpers.addToCart(req.params.id, req.session.user._id).then(() => {
      res.json({ status: true })


    })
  },
  ChangeProductQuantity: (req, res, next) => {
    console.log(req.body);
    userHelpers.changeProductQuantityIn(req.body).then(async (response) => {
      response.total = await userHelpers.getTotalAmount(req.body.user);
      console.log(response.total);
      res.json(response)
    })
  },

  DeleteProduct: (req, res, next) => {

    userHelpers.delFromCart(req.body).then((response) => {
      res.json({ response })
    })
  },

  // otp functions
  otpPage: (req, res) => {
    res.render('user/otp')
  },
  otpNoCheck: (req, res) => {

    userHelpers.doOTP(req.body).then((response) => {
      if (response.status) {
        signupData = response.user;
        console.log(signupData, 'uyghihiji')
        res.redirect('/otp-login')

      }
      else {
        res.redirect('/otplogin')
      }
    })



  },
  otpEntrPge: (req, res) => {
    res.render('user/otp-login')
  },
  confirmOtp: (req, res) => {
    console.log(signupData);
    console.log(req.body)
    userHelpers.doOTPConfirm(req.body, signupData).then((response) => {
      if (response.status) {


        req.session.loggedIn = true;
        req.session.user = signupData;


        res.redirect('/user/home')
      } else {
        res.redirect('/otp-login')
      }
    })

  },
  checkOut: async (req, res) => {
    let total = await userHelpers.getTotalAmount(req.session.user._id)
    let products = await userHelpers.getCartProducts(req.session.user._id)
    let address=await addressHelper.AllAddress(req.session.user._id)
    console.log(address,"aswein");
    
    res.render('user/checkout', { total, products, user: req.session.user,address })
  },
  placeorder: async (req, res) => {
    console.log(req.body);
    let products = await userHelpers.getCartProducts(req.body.userId)
    let total = await userHelpers.getTotalAmount(req.body.userId)
    console.log(products);
    console.log(total,"/////////////////////////////////////////");
    userHelpers.placeOrder(req.body, products, total).then((orderId)=>{
      console.log(req.body, "sugaam")
      if (req.body['payment-method'] === 'COD') {
        res.json({ codSuccess: true })
      }
      else if (req.body['payment-method']==='ONLINE'){
        userHelpers.generateRazorPay(orderId, total).then((response)=>{
          response.razorPay=true
        
            res.json(response)
        })
     }
     else if(req.body['payment-method']==='PAYPAL'){
      var payment = {
          "intent": "sale",
          "payer": {
              "payment_method": "paypal"
          },
          "redirect_urls": {
              "return_url": "http://localhost:3000/orderPlaced",
              "cancel_url": "http://localhost:3000"
          },
          "transactions": [{
              "amount": {
                  "currency": "USD",
                  "total": total
              },
              "description": orderId
          }]
      };
 
      // else {
      //   userHelpers.generateRazorPay(orderId, total).then((response) => {
      //     res.json(response)
      //   })
      // }
        

        userHelpers.createPay(payment).then((transaction)=>{
          var id = transaction.id;
          var links = transaction.links;
          var counter = links.length;
      while(counter--){
          if(links[counter].rel=='approval_url'){
              transaction.pay = true
              transaction.linkto = links[counter].href
              transaction.orderId = orderId
              userHelpers.changePaymentStatus(orderId).then(()=>{
                  res.json(transaction)

                 })
             }
         }
     })
    }
 })
 

console.log(req.body)



        
  
  
    // console.log(req.body)

  },
  orderplaced: (req, res) => {
    res.render('user/orderPlaced', { user: req.session.user })
  },

  orders: async (req, res) => {
    let order = await userHelpers.getUserOrders(req.session.user._id)
    console.log(order, 'iyugygygiygigig');

    res.render('user/ordersPage', { user: req.session.user, order })
  },

  orderProd: async (req, res) => {
    let products = await userHelpers.getOrderProd(req.query.id)
    console.log(products,'jiijijijijijijijijijijijijijijijijijiji');
    res.render('user/view-order-prod', { user: req.session.user, products })
  },
  cancelOrder:async(req,res)=>{
 
    console.log("hiaiuhguhggigfgufvghjvjvhgbuytiuybgtybytiyyinhjhjhjhjhjhjhjhjhjhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh");

      userHelpers.cancelOrder(req.query.id)
      let order = await userHelpers.getUserOrders(req.session.user._id)
       res.render('user/ordersPage', { user: req.session.user, order })
  },
  verifyPayment: (req, res) => {
    console.log(req.body);
    userHelpers.verifyPayment(req.body).then(() => {
      console.log("verify");
      userHelpers.changePaymentStatus(req.body['order[receipt]']).then(() => {
        console.log('success pay');
        res.json({ status: true })
      })
    }).catch((err) => {
      console.log(err);
      res.json({ status: false, errMsg: '' })
    })
  },
  accountInfo: (req, res) => {
    user = req.session.user
    addressHelper.AllAddress(user._id).then((address, address1) => {
      console.log(address, address1, 'zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz');
      res.render('user/account', { address, address1 ,user})
    })
  },
  addAdressbtn: (req, res) => {
    user = req.session.user
    console.log(user, 'ygffgfghjfgffkdee');
    res.render('user/addAddress', { user })

  },

  addAddress: (req, res) => {
    user = req.session.user
    console.log(user, 'ygffgfghjfgffkdee');

    addressHelper.addAddress(req.body, user._id).then(() => {
      res.redirect('/account')
    })

  }, deleteAddress: async (req, res, next) => {
    const deleteAddress = await addressHelper.deleteAddress( req.body.addressId,req.session.user._id)
    res.json({response})
},
getAddressDetails: async (req, res, next) => {
  let addressId = req.query.addressId
  if (addressId != "Select") {
      let getOneAddress = await  addressHelper.getOneAddressById(req.session.user._id, addressId)
      console.log(getOneAddress);
      let response = getOneAddress.Address
      response.status = true
      res.json(response)
  } else {
      res.json({ status: false })
  }
},
wishlist:async(req,res)=>{
  let products = await userHelpers.getWishProducts(req.session.user._id)
  let total = await userHelpers.getTotalWishAmount(req.session.user._id)
  res.render('user/wishlist',{products,total})
},
addToWish: (req, res) => {

  console.log("hi wish");
  let id = req.params.id
  console.log(id, 'sdk;fms;dkf');
  userHelpers.addTowish(req.params.id, req.session.user._id).then(() => {
    res.json({ status: true })


  })
},

DeleteProductWish: (req, res, next) => {
console.log('inside jss');
  userHelpers.delFromWish(req.body).then((response) => {
    res.json({ response })
  })
},
wishtoCart:(req,res)=>{
  let proId = req.body.proId
 
      userHelpers.addToCart(proId, req.session.user._id).then(async () => {
         
          wishlistHelper.deleteWishList(req.body).then(async (response) => {
              res.json({ status: true })
          })
      })
  },
  postCouponApply:async(req,res)=>{
    let user=req.session.user._id;
    const date=new Date();
    let totalAmount= await userHelper.getTotalAmount(user)
    let Total=totalAmount;

    if(req.body.coupon == ''){
        res.json({noCoupon:true,Total})
    }
    else
    { 
        let couponres=await userHelper.applyCoupon(req.body,user,date,totalAmount)
        if (couponres.verify) {

        let discountAmount=(totalAmount * parseInt(couponres.couponData.couponPercentage))/100;
        let amount = totalAmount - discountAmount
        couponres.discountAmount = Math.round(discountAmount)
        couponres.amount = Math.round(amount);
        res.json(couponres)

    }else{
        
        couponres.Total=totalAmount;
        res.json(couponres)

    }
    
    }
   
    
 },



}