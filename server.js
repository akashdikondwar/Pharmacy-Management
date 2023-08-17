const express=require('express')
const cors=require('cors')
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken')
const bcrypt=require('bcrypt')
const hashingRounds=5;
const port=3000;

const Login = require('./Server/login');
const Stock = require('./Server/stock');
const transaction = require('./Server/transaction');
const pendingTransactions = require('./Server/pendingTransactions');
const Customer = require('./Server/customer');
const app=express();

app.use(cors())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use(express.static('static'));//allows you to serve static files (such as HTML, CSS, JavaScript, images, and other resources) which are needed to be accessed to view html page properly.

const secretKey='akash'

//create a middleware to authenticate and authorize token

function jwtAuthenticator(req,res,next){
  const token=req.cookies.token;

  if(token==undefined || token=='null'){
    res.sendFile(__dirname+'/index.html');
  }
  else{
    jwt.verify(token,secretKey,(error,decoded)=>{
      if(error)
      res.status(401).send('Invalid Token')
      else
        req.decodedData=decoded;
        next();
    })
  }
}

app.get('/',jwtAuthenticator,(req,res)=>{
    payload=req.decodedData;
    const role=payload.role;
  
    if(role=='biller')
    res.sendFile(__dirname+'/static/biller.html')
    else if(role=='admin')
    res.sendFile(__dirname+'/static/admin.html');
  
})



app.get("/logout",(req,res)=>{
res.cookie('token','null')
res.sendFile(__dirname+'/index.html')
})


app.post("/login",(req,res)=>
{
    const username=req.body.username;
    const password=req.body.password;
    
    Login.getHashedPass(username,async (reply,role,userid,hashedPass)=>{
      if(reply==true){
        if (await bcrypt.compare(password,hashedPass)){
          token=jwt.sign({username: username, userid: userid, role: role },secretKey)
          res.cookie('token',token)
          if(role==="biller")
          res.sendFile(__dirname+'/static/biller.html');

        else if (role==="admin")
        res.sendFile(__dirname+'/static/admin.html')
        }
        else
          res.send('incorrect Password</h4>')
      }
      else
      res.send('<h4>User Not Found</h4>')
    })
})



app.get('/continuePending',jwtAuthenticator, async (req,res)=>{
 
    payload=req.decodedData;
    const userid=payload.userid;
    pendingTransactions.getAllPending(userid,(result)=>{
    res.send(result);// directly sending result here because first tried to send null. but one new thing learned. i was directly comparing the fetched response with null. but we first have to extract its json data. even if we sent data using res.send() still the data will go in json format. so apply json() method on fetched response and then compare it with null. otherwise directly send text 'null' using res.send().
    })
})



app.get('/cancelPending',jwtAuthenticator,(req,res)=>{
 
    const payload=req.decodedData
    const userid=payload.userid;
    pendingTransactions.removeAllPending(userid,reply=>{
      res.send(reply);
    })
})


app.get('/removeOnePending',jwtAuthenticator,(req,res)=>{

  const payload=req.decodedData;
    const userid=payload.userid;
    const medid=req.query.medid;
    const qty=req.query.qty;
  
    pendingTransactions.cancelOnePending(userid,medid,qty,(reply)=>{
      res.send(reply);
    })
  
  })

  app.get('/updateMed',jwtAuthenticator, async (req,res)=>{

    const payload=req.decodedData;
    if(payload.role=='admin'){
      const medid=req.query.medid;
      const qty=req.query.qty;
      const price=req.query.price;
      const expiry=req.query.expiry;//if we want to update date in db, if date is saperated with -(hyphens) then send the date in inverted 
      // commas in query. ie'yyyy-mm-dd' and if it is in direct number without hyphen ie yyyymmdd then we can send it directly.
      // console.log(await Stock.updateMed(medid,qty,price,expiry))// static function should be async to make its call await.
      await Stock.updateMed(medid,qty,price,expiry,(error,response)=>{//callback se true return hora but simple await se nhi hora. undefined return aa raha
            if(error)
            res.status(500).send('internal server error');
            else 
            res.send(response);
          })
    }
    else 
      res.send('Sorry, only admin can update medicines')
  })
    
    

app.get('/getTransIdSequence',jwtAuthenticator,(req,res)=>{
  const date=req.query.date;
  transaction.getTransIdSequence(date,(sequence)=>{
    res.send(String(sequence));
  })
  
})


app.post("/addnewuser",jwtAuthenticator, async (req,res)=>{

  const payload=req.decodedData;
  if(payload.role=='admin'){
        const username=req.body.username;
        const password=req.body.password;
    
        const hashedPass=await bcrypt.hash(password,hashingRounds);
        const role=req.body.role;
    
        Login.addNewLogin(username,hashedPass,role,(reply)=>{
          if(reply)
          res.send(`<h2>User:${username} with role: ${role} added successfully</h2>`);
          else
          res.send(`<h2>username=${username} already exists. use different username`)
      })
  }
  else
    res.send('Not allowed')
})

app.get('/removeUser',jwtAuthenticator,async (req,res)=>{
  const payload=req.decodedData;

  if(payload.role=='admin'){
    const deleteId=req.query.id;
    const token=req.cookies.token;
    const userid=payload.userid;
    const role=payload.role;

    if(role==='admin'){
      Login.removeUser(deleteId,()=>{
        res.send();
      })
    }
  }
  else
  res.send('not allowed')
})


app.get('/addPending',jwtAuthenticator,(req,res)=>{

  payload=req.decodedData;
  const userid=payload.userid;
  const medId=req.query.medid;
  const qty=req.query.qty;

    pendingTransactions.addPending(userid,medId,qty,(reply)=>{
      res.send(reply);
    })
})


app.get('/finalCheckout',jwtAuthenticator,(req,res)=>{
  payload=req.decodedData;
  const transid=req.query.transid;
  const customerid=req.query.customerid;

  const token=req.cookies.token;
  const billerid=payload.userid;

    transaction.finalCheckout(transid,customerid,billerid,(reply)=>{
      res.send(reply);
    })
})

//when we send search data, one of them will be selected then qty will be entered. then as we press enter, choose
// that medid from sent data to fill the html table and send that medid and qty to server also to add in pending transaction table;
//after pressing checkout button, dont send the html page data here, use pendingTransaction table to add into transaction history;

app.post('/changePass',jwtAuthenticator,(req,res)=>{ //even if logged in take id, pass, and newpass again
  payload=req.decodedData;
  const userid=payload.userid;

    const password=req.body.password;
    const newPassword=req.body.newPassword;

    const newUser=new Login(userid,password);
    newUser.changePass(newPassword,(msg)=>{
      res.send(msg);
    })
})

app.get("/searchMeds/biller",(req,res)=>{
  var keyword=req.query.keyword;
  Stock.similarMed(keyword,(result)=>{
    res.send(result);
  })
})

app.get("/searchMeds/admin",(req,res)=>{
  var keyword=req.query.keyword;
  Stock.similarMedAdmin(keyword,(result)=>{
    res.send(result);
  })
})


app.get('/getCustomerId',jwtAuthenticator,(req,res)=>{
  const phone=req.query.phone;

  Customer.checkIfCustomerExist(phone,(reply,customerid)=>{
    if(reply)
      res.send(String(customerid))// here if we directly send the customerid variable without stringifying, then it will interpret as a status code. and error will arise saying, use status code instead of using res.send()
    else
      res.send('false');//here directly used 0000. see if status or something can be used. here sending string still webpage considering it boolean.
  })
})

app.get('/getAllUsers',jwtAuthenticator,(req,res)=>{
  const payload=req.decodedData;
  if(payload.role=='admin'){
    Login.getAllUsers(result=>{
      res.send(result);
    })
  }
  else
  res.send('Not Allowed')
})

app.get('/addNewCustomer',jwtAuthenticator,(req,res)=>{
  const phone=req.query.phone;
  const name=req.query.name;
  const Address=req.query.address;

  Customer.addNewCustomer(phone,name,Address,(reply,customerid)=>{
    if(reply)
    res.send(String(customerid));
  })
})



app.listen(port, ()=>
{
    console.log(`listening on port ${port}`)
})
