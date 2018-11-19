var express = require('express');
var http = require('http');
var mongoose = require('mongoose');
var app = express();
var CryptoJS = require('crypto-js');
var dbUrl = "mongodb://admin:admin_123@ds239703.mlab.com:39703/user_info";
var jwt    = require('jsonwebtoken');
var config = require('./common/config');

// const key = "2b7e151628aed2a6abf7158809cf4f3c"
app.use(express.static('./public'));
http.createServer(app).listen(4000);
console.log('Server listening at port 4000');
app.set('Secret', config.secret);

app.use(express.json());
app.use(express.urlencoded({extended: false}));

var UserInfo = mongoose.model('UserInfo', {
    first_name: String,
    last_name: String,
    email_id: String,
    password: String
});

mongoose.connect(dbUrl, { useNewUrlParser: true }, (err) => {
    console.log('mongo DB connection', err)
})

const  ProtectedRoutes = express.Router(); 
app.use('/api', ProtectedRoutes);

app.post('/login', function(req, res){
    console.log(`Requested METHOD:${req.method} URL:${req.url} BODY:${JSON.stringify(req.body)}`);
    
    UserInfo.find({email_id: req.body.email_id}, (err, userInfo) => {
        // res.send(userInfo)
        if(userInfo.length == 0) {
            res.status(401).send("User not found!! Please check your Email ID.");
        }
        console.log(userInfo);
        // console.log("password:",req.body.password);
        // decryptedPassword = CryptoJS.AES.decrypt(req.body.password, key).toString(CryptoJS.enc.Utf8);
        userInfo.forEach(function(user){
            if (user.password === req.body.password){
                console.log(`User Authentication Successfull for user:${req.body.email_id}`);
                let token = jwt.sign(req.body, app.get('Secret'), {
                    expiresIn: '1h' // expires in 1 hour
                });
                res.status(200).json({
                    first_name: user.first_name,
                    last_name:  user.last_name,
                    email_id: user.email_id,
                    access_token: token
                });
            } else{
                console.log(`Authentication failed for user:${req.body.email_id}`);
                res.status(401).send("Authentication failed!!");
            }
        });
    });

});

app.post('/register', function(req, res){
    console.log(`Requested METHOD:${req.method} URL:${req.url} BODY:${req.body}`);
    UserInfo.find({email_id: req.body.email_id}, (err, userInfo) => {
        console.log(`User already exist:${userInfo}`);
        if (userInfo.length === 0){
            var userInfo = new UserInfo(req.body)
            userInfo.save( (err) => {
                if (err) {
                    res.sendStatus(500);
                } else{
                    console.log("User registered successfully!!")
                    res.sendStatus(200)
                }
            }) 
        } else{
            res.status(400).send("User already exist!!");
        }
    });       
});

ProtectedRoutes.use((req, res, next) =>{
    // check header or url parameters or post parameters for token
    var token = req.headers['access-token'];
  
    // decode token
    if (token) {
      // verifies secret and checks exp
      jwt.verify(token, app.get('Secret'), (err, decoded) =>{      
        if (err) {
          return res.json({ success: false, message: 'Failed to authenticate token.' });    
        } else {
          // if everything is good, save to request for use in other routes    
          next();
        }
      });
    } else {
      // if there is no token
      // return an error
      return res.status(403).send({ 
          message: 'Access token not found!!' 
      });
  
    }
});

ProtectedRoutes.get('/getAllUsers',(req,res)=>{
    UserInfo.find({}, (err, users) => {
        if (users.length == 0){
            res.status(200).send("No Users Found");
        }
        var infoUsers = [];
        users.forEach(function(user){
            let info = {};
            info.first_name = user.first_name;
            info.last_name = user.last_name;
            infoUsers.push(info);
        });
        res.status(200).send(infoUsers);

    });
});

ProtectedRoutes.get('/getXML', (req, res)=>{
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.body));
    xml_res = '<accountLookupResults> \
<status>success</status> \
<variables> \
    <variable name="IsMatch" value="N"/> \
    <variable name="DigitalIDStatus" value="12345678:active,87654321:barred"/> \
    <variable name="DigitalIDCount" value="2"/> \
    <variable name="ActiveDigitalIDCount" value="1"/> \
    <variable name="WSResult" value="success"/> \
</variables> \
</accountLookupResults>'

    res.set('Content-Type', 'text/xml');
    res.send(xml_res);
    res.status(200).send();
});

ProtectedRoutes.get('getJson', (req, res)=>{

})

app.get('/getXml', (req, res)=>{
    console.log(JSON.stringify(req.headers));
    console.log(JSON.stringify(req.body));
    xml_res = '<accountLookupResults> \
<status>success</status> \
<variables> \
    <variable name="IsMatch" value="N"/> \
    <variable name="DigitalIDStatus" value="12345678:active,87654321:barred"/> \
    <variable name="DigitalIDCount" value="2"/> \
    <variable name="ActiveDigitalIDCount" value="1"/> \
    <variable name="WSResult" value="success"/> \
</variables> \
</accountLookupResults>'

    res.set('Content-Type', 'application/xml');
    res.send(xml_res);
    res.status(200).send();
})