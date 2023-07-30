const express=require('express')
const cors=require('cors');
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken')

const Login = require('./login');
const Stock = require('./stock');
const transaction = require('./transaction');
const pendingTransactions = require('./pendingTransactions');
const Customer = require('./customer');
const app=express();

app.use(cors())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())
app.use(express.static('static'));//allows you to serve static files (such as HTML, CSS, JavaScript, images, and other resources) which are needed to be accessed to view html page properly.

const secretKey='akash'


app.get('/',(req,res)=>{
  res.sendFile(__dirname+'/index.html');
})

app.post("/logout",(req,res)=>{
res.cookie('token','')
res.send('logged out')
})



app.post("/login",(req,res)=>
{
  const username=req.body.username;
  const password=req.body.password;
  
  const newUser=new Login(username,password);//login object
  var token=null;
  newUser.checkIdPass((reply,role,userid)=>
  {
    if(reply==true){
      token=jwt.sign({username: username, userid: userid, role: role },secretKey)
      res.cookie('token',token)
      res.sendFile(__dirname+'/billerUI/biller.html');
    }
    else
    res.send('<h1>invalid Credentials.. login again</h1>')
  })
})

app.get('/continuePending', async (req,res)=>{
  const token=req.cookies.token;
  const payload=jwt.verify(token,secretKey)
  const userid=payload.userid;
  pendingTransactions.getAllPending(userid,(result)=>{
  res.send(result);// directly sending result here because first tried to send null. but one new thing learned. i was directly comparing the fetched response with null. but we first have to extract its json data. even if we sent data using res.send() still the data will go in json format. so apply json() method on fetched response and then compare it with null. otherwise directly send text 'null' using res.send().
})
})


app.get('/cancelPending',(req,res)=>{
  const token=req.cookies.token;
  const payload=jwt.verify(token,secretKey)
  const userid=payload.userid;

  pendingTransactions.removeAllPending(userid,reply=>{
    res.send(reply);
  })
})

app.post("/addnewuser", (req,res)=>{
    const username=req.body.username;
    const password=req.body.password;
    const role=req.body.role;

    console.log("printing in addnewuser api: "+username,password,role)

    Login.addNewLogin(username,password,role,(reply)=>{
      if(reply)
      res.send(`<h2>User:${username} with role: ${role} added successfully</h2>`);
      else
      res.send(`<h2>username=${username} already exists. use different username`)
})
})


  app.get('/addPending',(req,res)=>{

    const token=req.cookies.token;
  const payload=jwt.verify(token,secretKey)
  const userid=payload.userid;
    const medId=req.query.medid;
    const qty=req.query.qty;

    // console.log(medId, qty);
    // const token=req.cookies.token;
    // const payload=jwt.verify(token,secretKey)
    // console.log(payload)

    pendingTransactions.addPending(userid,medId,qty,(reply)=>{
      res.send(reply);
    })
  })


  app.get('/finalCheckout',(req,res)=>{
    const transid=12345678;
    const customerid=req.query.customerid;

    const token=req.cookies.token;
    const payload=jwt.verify(token,secretKey)

    const billerid=payload.userid;

    transaction.finalCheckout(transid,customerid,billerid,(reply)=>{
    if(reply){
      pendingTransactions.removeAllPending(billerid,reply=>{
        if(reply)
        res.send('<h1>pending transactions added to final transactions</h1>')
        else
        res.send('<h1>pending transactions might not have added</h1>')
      })
    }
      else
      res.send('<h1>final checkout sent false</h1>')
    })

  })
//when we send search data, one of them will be selected then qty will be entered. then as we press enter, choose
// that medid from sent data to fill the html table and send that medid and qty to server also to add in pending transaction table;
//after pressing checkout button, dont send the html page data here, use pendingTransaction table to add into transaction history;

app.post('/changePass',(req,res)=>//even if logged in take id, pass, and newpass again
{
  const token=req.cookies.token;
  const payload=jwt.verify(token,secretKey)

  const userid=payload.userid;

    const password=req.body.password;
    const newPassword=req.body.newPassword;

    const newUser=new Login(userid,password);
    newUser.changePass(newPassword,(msg)=>{
      res.send(msg);
    })
})

app.get('/removeOnePending',(req,res)=>{

  const token=req.cookies.token;
  const payload=jwt.verify(token,secretKey)
  const userid=payload.userid;

  const medid=req.query.medid;
  const qty=req.query.qty;

  pendingTransactions.cancelOnePending(userid,medid,qty,(reply)=>{
    res.send(reply);
  })
})

app.get("/searchMeds",(req,res)=>{
  var keyword=req.query.keyword;

  Stock.similarMed(keyword,(result)=>{
    res.send(result);
  })
})


app.get('/getCustomerId',(req,res)=>{
  const phone=req.query.phone;

  Customer.checkIfCustomerExist(phone,(reply,customerid)=>{
    if(reply)
    {
      console.log('checking customerid :--'+ customerid)
      res.send(String(customerid))// here if we directly send the customerid variable without stringifying, then it will interpret as a status code. and error will arise saying, use status code instead of using res.send()
    }

    else{
      res.send('0000');//here directly used 0000. see if status or something can be used.
    }
  })
})


app.post('/addNewCustomer',(req,res)=>{
  // const token=req.cookies.token;
  // const payload=jwt.verify(token,secretKey)
  // const userid=payload.userid;

  const phone=req.body.phone;
  const name=req.body.name;
  const customer=new Customer(name,phone)

  customer.addNewCustomer((reply,customerid)=>{
    if(reply)
    res.send(customerid);
  })
})

app.listen(3000, ()=>
{
    console.log('listening on port 3000')
})
