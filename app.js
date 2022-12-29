var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var adminRouter = require('./routes/admin');
var userRouter = require('./routes/user');
var hbs = require('express-handlebars')

var app = express();

app.use((req,res,next)=>{
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next()
})
var db=require('./config/connection')
var session=require('express-session')
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.engine('hbs', hbs.engine({ extname: 'hbs', defaultLayout: 'layout', layoutsDir: __dirname + '/views/layout/', partialsDir: __dirname + '/views/partials',
helpers: {
  isEqual: (status, value, options) => {
    if (status == value) {
      return options.fn(this)
    }
    return options.inverse(this)
  }
  },
  math: function (lvalue, operator, rvalue) {
    lvalue = parseFloat(lvalue);
    rvalue = parseFloat(rvalue);
    return {
      "+": lvalue + rvalue,
      "-": lvalue - rvalue,
      "*": lvalue * rvalue,
      "/": lvalue / rvalue,
      "%": lvalue % rvalue
    }[operator];
    }




}))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({secret:"key",cookie:{maxAge:60000}})) 
db.connect((err) => {   // when app start , first we need to connect with db (6)
  if (err) console.log("Connection error" + err); 
  else console.log("Data-base connected to port 27017");
}) 
app.use('/', userRouter);
app.use('/admin', adminRouter);
// app.get("*",(req,res)=>{
//   res.render('user/404')
// })
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
