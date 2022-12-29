const { response } = require('express');
var express = require('express');
var router = express.Router();

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next()
  } else {
    res.redirect('/user/user-login')
  }
}

const { userLanding, userLoginLoad, userLogin, userHome, redirect, usersignup, userSignUp, userLogout, seeMore, allproducts,
  alldark, allwhite, allMilk, cart, otpPage, orderProd, addToCart, otpNoCheck, otpEntrPge, confirmOtp, ChangeProductQuantity,
  DeleteProduct, checkOut, placeorder, orderplaced, orders, verifyPayment, accountInfo, addAdressbtn, addAddress, deleteAddress,
  wishlist, addToWish, DeleteProductWish ,cancelOrder,getAddressDetails,wishtoCart,postCouponApply} = require('../controller/user')
/* GET users listing. */
router.get('/', userLanding);
//user login
router.get('/login', userLoginLoad)
//user login
router.post('/user-login', userLogin)
//user home
router.get('/user/home', userHome);
//redirect
router.get('/user/user-login', redirect)
//user signup
router.get('/signup', usersignup)
//user sign up
router.post('/user-signup', userSignUp)
//user logout
router.get('/user-logout', userLogout)
//seemore
router.get('/seemore', seeMore)

router.get('/account', verifyLogin, accountInfo)
router.get('/add-add', verifyLogin, addAdressbtn)
router.post('/add-address', verifyLogin, addAddress)
router.post('/removeaddress', verifyLogin, deleteAddress)
router.get('/getAddress', getAddressDetails);
//see all products
router.get('/AllProducts/:id', allproducts);
//see all dark chocolates
router.get('/AllDarks/:id', alldark);
//see all white
router.get('/AllWhite/:id', allwhite);
//see all milk
router.get('/AllMilk/:id', allMilk);
//cart management
router.get('/cart', verifyLogin, cart)
//add to cart
router.get('/add-to-cart/:id', addToCart)

router.post('/changeProductQuantity', ChangeProductQuantity)
router.post('/deleteFromCart', DeleteProduct)
//otp 
router.get('/otplogin', otpPage)
router.post('/otp-log', otpNoCheck)
router.get('/otp-login', otpEntrPge)
router.post('/confirmotp', confirmOtp)
//checkout
router.get('/checkout', verifyLogin, checkOut)
router.post('/place-order', verifyLogin, placeorder)
router.get('/orderPlaced', orderplaced)
router.get('/viewOrders', verifyLogin, orders)
router.get('/view-order-products', verifyLogin, orderProd)

router.get('/cancelorder', verifyLogin,cancelOrder)
router.post('/verify-payment', verifyPayment)
//wihlist
router.get('/wishList', verifyLogin, wishlist)
router.get('/add-to-wish/:id', addToWish)
router.post('/deleteFromWish', DeleteProductWish)
router.post('/addToCartWishlist',wishtoCart)



router.post('/applyCoupon',verifyLogin,postCouponApply)
module.exports = router;
