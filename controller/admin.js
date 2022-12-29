const { Router } = require('express');
var express = require('express');
const { Admin } = require('mongodb');
var router = express.Router();

var adminHelper= require('../helpers/admin-helper')
var productHelper = require('../helpers/product-helper'); // add a helper function (9)
const userHelpers = require('../helpers/user-helper');
const categoryHelpers = require('../helpers/category-helper');
// const { CATEGORY_COLLECTION } = require('../config/collections');
const inventoryHelper = require('../helpers/inventory-helper');
const bannerHelper = require('../helpers/banner-helper');
const cartHelper=require('../helpers/cart-helper')
const passworddb = "789";
const emaildb = "admin@gmail.com";
const  orderHelper=require('../helpers/order-helper')
module.exports={

  //admin login page load
  getAdminlogin: (req, res, next) => {
    res.render('admin/admin-login', { layout: 'admin-layout',login:true });
  },
  //admin login
  adminLogin: (req, res) => {
    const userData = { email, password } = req.body  // collecing data from user email pw
    if (email === emaildb && password === passworddb) {

      //req.session.loggedInA = true
      req.session.admin = userData
      res.redirect('/admin/admin-home')
    } else {
      res.redirect('/admin/admin-login') // if pw failed remains to login err message
    }

  },
  //admin home
  adminHome:async (req, res) => {
    let totalOrders=await adminHelper.getTotalOrders()
    let totalProducts=await adminHelper.getAllProductCount()
    let salesData=await adminHelper.getAllSales()
    let TotalUsers= await adminHelper.getTotalUsers()
    let yearly=await adminHelper.getYearlySalesGraph();
        let monthly=await adminHelper.getMonthlySalesGraph();
        let daily=await adminHelper.getDailySalesGraph();
        console.log(daily);
    res.render('admin/admin-home', { layout: 'admin-layout',yearly,monthly,daily,totalOrders,totalProducts,salesData,TotalUsers });
  },
  //load all products
  viewAllProducts: (req, res) => {
    productHelper.getAllProducts().then((products) => {
      console.log(products);
      res.render('admin/all-products', { layout: 'admin-layout', products });
    })


  },
  // load all users
  viewAllUsers: (req, res) => {
    userHelpers.getAllUsers().then((user) => {
      console.log(user);
      res.render('admin/all-users', { layout: 'admin-layout', user });
    })

  },
  //load add user
  loadAddUser: (req, res) => {
    res.render('admin/add-user', { layout: 'admin-layout' });
  },
  //add user
  addUser: (req, res) => {
    userHelpers.doSignuP(req.body).then((response) => {
      console.log(response);
    })

    res.redirect('/admin/view-users')
  },
  //all user
  allUsers: (req, res) => {
    res.render('admin/all-users', { layout: 'admin-layout' });
  },
  //load all prodicts
  loadAddProducts: (req, res) => {
    categoryHelpers.getAllCategory().then((category) => {
      console.log(category);

      res.render('admin/add-products', { layout: 'admin-layout', category });
    })
  },
  //add product
  addProducts: async(req, res) => {
    console.log(req.body);
 
      req.body.image = req.files.image[0].filename
      req.body.image1 = req.files.image1[0].filename
      req.body.image2= req.files.image2[0].filename
      req.body.image3 = req.files.image3[0].filename
  
     await productHelper.addProduct(req.body)
  res.redirect('/admin/view-products')
  },
  //all products
  allProducts: (req, res) => {
    res.render('admin/all-products', { layout: 'admin-layout' });
  },
  //delete products
  deleteProducts: (req, res) => {
    let prodId = req.params.id
    console.log(prodId);
    productHelper.deleteProducts(prodId).then((response) => {
      res.redirect('/admin/view-products')
    })
  },
  //edit products load
  editProduct: async (req, res) => {
    let proid = req.query.id
    console.log(proid, 'gggggggggggggggggggggggggggggggg');
    let product = await productHelper.getProductDetails(proid)
    let category = await categoryHelpers.getAllCategory()


    console.log(product);
    console.log(category);

    res.render('admin/edit-product', { layout: 'admin-layout', product, category });
  },
  //update products
  updateProducts:async (req, res) => {
    let editid = req.query.id
    if (req.files.image == null) {
      Image1 = await productHelper.fetchImage1(editid)
  } else {
      Image1 = req.files.image[0].filename
  }
  if (req.files.image1 == null) {
      Image2 = await productHelper.fetchImage2(editid)
  } else {
      Image2 = req.files.image1[0].filename
  }
  if (req.files.image2 == null) {
      Image3 = await productHelper.fetchImage3(editid)
  } else {
      Image3 = req.files.image2[0].filename
  }
  if (req.files.image3 == null) {
      Image4 = await productHelper.fetchImage4(editid)
  } else {
      Image4 = req.files.image3[0].filename
  }
  req.body.image = Image1
  req.body.image1 = Image2
  req.body.image2 = Image3
  req.body.image3 = Image4

    console.log(editid,'dsagfhjkdgfkhgHJLKFGHGhjkfgASGB');
    productHelper.updateProduct(editid, req.body).then(() => {
      res.redirect('/admin/view-products')
     
    })
  },

  editUser: async (req, res) => {
    let userid = req.query.id
    console.log(userid, 'gkkkkkggggggggggggggggggggg');
    let user = await userHelpers.getUserDetails(userid)


    console.log(user);

    res.render('admin/edit-user', { layout: 'admin-layout', user });
  },

  blockUser: (req, res) => {
    let block = req.query.id
    console.log(block, 'ygbbhbhbhbbjb');
    userHelpers.blockUpdate(block)
    console.log('blocked @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    res.redirect('/admin/view-users')
  },

  unblockUser: (req, res) => {
    let unblock = req.query.id
    console.log(unblock, 'sijnadjnfjanjnj');
    userHelpers.unBlockUpdate(unblock)
    console.log('unblocked @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@');
    res.redirect('/admin/view-users')

  },

  allCategory: (req, res) => {
    categoryHelpers.getAllCategory().then((category) => {
      console.log(category);
      res.render('admin/category', { layout: 'admin-layout', category });
    })
  },

  loadAddcategory: (req, res) => {
    res.render('admin/add-category', { layout: 'admin-layout' });
  },

  addCategory: (req, res) => {
    console.log(req.body);
    categoryHelpers.addCategory(req.body, (id) => {

      console.log(id);
      res.redirect('/admin/category')


    })
  },
  deleteCategory: (req, res) => {
    let catId = req.params.id
    console.log(catId);
    categoryHelpers.deleteCategory(catId).then((response) => {
      res.redirect('/admin/category')
    })
  },
  editCategoryLoad: async (req, res) => {
    let catid = req.query.id
    console.log(catid, 'gggggggggggggggggggggggggggggggg');
    let category = await categoryHelpers.getCategoryDetails(catid)


    console.log(category);

    res.render('admin/edit-category', { layout: 'admin-layout', category });
  },
  editCategory: (req, res) => {
    let editid = req.query.id

    console.log(editid);
    categoryHelpers.updateCategory(editid, req.body).then(() => {
      res.redirect('/admin/category')

    })
  },
  inventory: (req, res) => {
    productHelper.getAllProducts().then((products) => {
      console.log(products);
      res.render('admin/inventory', { layout: 'admin-layout', products });
    })
  },
  //edit stock load
  editStockLoad: (req, res) => {
    let editid = req.query.id

    console.log(editid);
    productHelper.getProductDetails(editid, req.body).then((product) => {
      console.log(product);
      res.render('admin/stock-update', { layout: 'admin-layout', product })
    })

  },
  //edit stock
  editStock: (req, res) => {
    let editid = req.query.id

    console.log(editid);
    productHelper.updatestock(editid, req.body).then(() => {
      res.redirect('/admin/inventory')

    })
  },

  //banner load
  banner: (req, res) => {
    bannerHelper.getAllBanner().then((products) => {
      console.log(products);
      res.render('admin/banner', { layout: 'admin-layout', products });
    })
  },

  //load banner add
  bannerAddload: (req, res) => {
    res.render('admin/add-banner', { layout: 'admin-layout' });
  },
  //add banner
  banneradd: (req, res) => {
    console.log(req.body);
    console.log(req.files.image);

    bannerHelper.addBanner(req.body, (id) => {
      let image = req.files.image
      let image1 = req.files.image1
      let image2 = req.files.image2
      let image3 = req.files.image3
      console.log(id);
      image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
        image1.mv('./public/product-images1/' + id + '.jpg', (err, done) => {
          image2.mv('./public/product-images2/' + id + '.jpg', (err, done) => {
            image3.mv('./public/product-images3/' + id + '.jpg', (err, done) => {
              if (!err) {
                res.redirect('/admin/banner')
              } else {
                console.log(err);
              }
            })
          })
        })

      })

    })
  },
  //delete banner
  deleteBanner: (req, res) => {
    let prodId = req.params.id
    console.log(prodId);
    bannerHelper.deleteBanner(prodId).then((response) => {
      res.redirect('/admin/banner')
    })
  },
  orderPage:(req,res)=>{
    orderHelper.getAllOrders().then((orders) => {

      console.log(orders,'jasdfkj;');
res.render('admin/orders',{ layout: 'admin-layout',orders })
    })

  },
orderedProducts:async(req,res)=>{
    let products=await orderHelper.getOrderProd(req.query.id)
    console.log(products,'osajfljaiosji;ojaifdjiopaj');
    res.render('admin/ordered_products',{layout: 'admin-layout',products})
  },
  changeProductStatus:(req,res)=>{
    console.log('dtaaaaaaaaaaaaaaaa');
    let data=req.body
  
    console.log(data,'dataffffffffffffffaaaaaaaaaaaaa')
  
        userHelpers.changeProductStatus(data).then((response)=>{
          res.json(response)
        })
  
  },
  showCouponsPage:async(req,res)=>{
    let coupons=await adminHelper.getAllCoupons()
    res.render('admin/showCoupons',{layout:'admin-layout',coupons})
  },
  addCoupons:(req,res)=>{
  
   
    res.render('admin/admin-addCoupons',{layout:'admin-layout'})
 
  },
  postCoupons:(req,res)=>{
    adminHelper.addCouponsIn(req.body).then(()=>{
       console.log(req.body,"HEY THIS IS THE COUPON DAATA")
       res.redirect('/admin/addCoupons')
    })
  },
 

  //logout
  adminLogout: (req, res) => {
    res.render('admin/admin-login', { layout: 'admin-layout' });
  },
  
  admindeleteCoupon:(req,res)=>{
    let couponId=req.params.id;
    adminHelper.deleteCoupon(couponId).then((response)=>{
       res.redirect('/admin/viewCoupons');
    })
  },
 

  getEditCouponPage:async(req,res)=>{
 
    let coupons=await adminHelper.getCouponDetails(req.query.id);
 
     res.render('admin/admin-editCoupon',{layout:'admin-layout',coupons})
  },
 
  updateCoupon:async(req,res)=>{
   
    adminHelper.updateCouponIn(req.params.id,req.body).then(()=>{
       res.redirect('/admin/viewCoupons');
    })
  }



}

