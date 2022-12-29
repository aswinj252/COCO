const { Router } = require('express');
var express = require('express');
const { Admin } = require('mongodb');
var router = express.Router();
const multer = require('multer')
const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/prodImages");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
})
const uploadMultiple = multer({ storage: multerStorage }).fields([{ name: 'image', maxCount: 1 }, { name: 'image1', maxCount: 1 }, { name: 'image2', maxCount: 1 }, { name: 'image3', maxCount: 1 }])


const { getAdminlogin, adminLogin, adminHome, viewAllProducts, viewAllUsers, loadAddUser, addUser, allUsers, loadAddProducts, addProducts, allProducts,
  deleteProducts, editProduct, updateProducts, editUser, blockUser, unblockUser, allCategory, loadAddcategory, addCategory, deleteCategory, editCategoryLoad,
  editCategory, inventory, editStockLoad, editStock, banner, bannerAddload, banneradd, deleteBanner, adminLogout, orderPage, showCouponsPage,addCoupons,postCoupons,
  getEditCouponPage,updateCoupon,admindeleteCoupon, orderedProducts,changeProductStatus } = require('../controller/admin')

const verifyAdmin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    // next(); 
    res.redirect('/admin');
  }
}

/* GET home page. */
router.get('/', getAdminlogin)
//admin login
router.post('/admin-home', adminLogin)
//admin home
router.get('/admin-home', verifyAdmin, adminHome);
//view products
router.get('/view-products', verifyAdmin, viewAllProducts);
//view users
router.get('/view-users', verifyAdmin, viewAllUsers);
//add user
router.get('/add-user', verifyAdmin, loadAddUser);
//add user
router.post('/adduser', verifyAdmin, addUser)
//all users
router.get('/all-users', verifyAdmin, allUsers);
//add products
router.get('/add-product', verifyAdmin, loadAddProducts);
//add products
router.post('/addproduct', uploadMultiple, addProducts)
//all products
router.get('/all-products', verifyAdmin, verifyAdmin, allProducts);
//delete products
router.get('/delete-product/:id', verifyAdmin, deleteProducts)
//edit products
router.get('/edit-product', verifyAdmin, editProduct);
//update product
router.post('/edit-product', verifyAdmin, uploadMultiple, updateProducts)
//edit user
router.get('/edit-user', verifyAdmin, editUser);
//block user
router.get('/block-user', verifyAdmin, blockUser);
//unblock user
router.get('/unblock-user', verifyAdmin, unblockUser);
//category management
router.get('/category', verifyAdmin, allCategory);
//add category load
router.get('/add-category', verifyAdmin, loadAddcategory);
//add category
router.post('/addcategory', addCategory)
//delete category
router.get('/delete-category/:id', verifyAdmin, deleteCategory)
//edit category
router.get('/edit-category', verifyAdmin, editCategoryLoad);
//edit category
router.post('/editcategory', verifyAdmin, editCategory)
//inventory management
router.get('/inventory', verifyAdmin, inventory);
//edit stockload
router.get('/edit-stock', verifyAdmin, editStockLoad)
//edit stock
router.post('/editstock', verifyAdmin, editStock)
//banner management
router.get('/banner', verifyAdmin, banner);
//add banner load
router.get('/add-banner', bannerAddload);
//add banner
router.post('/addbanner', verifyAdmin, banneradd)
//deleteBanner
router.get('/delete-banner/:id', verifyAdmin, deleteBanner)
router.get('/order', orderPage)
router.get('/view-order-product', verifyAdmin, orderedProducts)
router.post('/product-status',changeProductStatus)
//coupon
router.get('/viewCoupons',showCouponsPage)
router.get('/addCoupons',addCoupons)
router.post('/admin-addCoupon',postCoupons)

router.get('/editCoupon',getEditCouponPage)
router.post('/admin-updateCoupon/:id',updateCoupon)
router.get('/deleteCoupon/:id',admindeleteCoupon)
//logout
router.get('/logout', adminLogout);

module.exports = router;
