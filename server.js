const express=require('express')
const cors=require('cors');
const con=require('./dbConnection')
const cookieParser=require('cookie-parser')
const jwt=require('jsonwebtoken')

const Login = require('./login');
const Stock = require('./stock');
const transaction = require('./transaction');
const pendingTransactions = require('./pendingTransactions');
const Customer = require('./customer');
const app=express();
const secretKey='jalksf9w983589f'
app.use(cors())
app.use(express.urlencoded({extended:true}));





app.post("/logout",(req,res)=>{


})



app.post("/addnewuser", (req,res)=>
{
    const userid=req.body.userid;
    const password=req.body.password;
    const newUser=new Login(userid,password);

    newUser.addNewLogin((reply)=>{
      res.send(reply);
    })

})



app.post("/login",(req,res)=>
  {
    const username=req.body.userid;
    const password=req.body.password;
    const newUser=new Login(username,password);//login object
    const token=null;
    newUser.checkIdPass((reply,billerid,transid)=>
    {
      if(reply==true)
      {
        token=jwt.sign({username:username, role: role},secretKey,{expiresIn: '1h'})
        res.cookie('token',token)
        // res.send({reply: true, billerid: billerid, username: username, transid: transid})
      }
      else
      res.send({reply:false})
    })

  })


  app.get('/login/getTransId',(req,res)=>{
    const username=req.query.username;
    
    transaction.getTransId(username,(transid)=>{
      res.send(transid);
    })
  })


  app.get('/addPending',(req,res)=>{
    const billerId=req.query.billerid;
    const medId=req.query.medid;
    const qty=req.query.qty;

    const pending=new pendingTransactions(billerId,medId,qty)

    pending.addPending(reply=>{
      if(reply)
      res.send(true)

      else
      res.send('there might be problem: addPending method returning false. see if latest transaction added in pending table');
    })

    
  })


  app.post('/finalCheckout',(req,res)=>{
    const billerid=req.body.billerid;
    const phone=req.body.phone;

    const customer=new customer()


    transaction.finalCheckout(null,(reply)=>{
      if(reply)
      Login.updateTransaction(username)
    })
    res.send('updated transaction')

  })
//when we send search data, one of them will be selected then qty will be entered. then as we press enter, choose
// that medid from sent data to fill the html table and send that medid and qty to server also to add in pending transaction table;
//after pressing checkout button, dont send the html page data here, use pendingTransaction table to add into transaction history;
app.post('/addInTable',(req,res)=>{
  medid=req.body.medid;
  qty=req.body.qty;

  

})

app.post('/changePass',(req,res)=>//even if logged in take id, pass, and newpass again
{

    const userid=req.body.userid;
    const password=req.body.password;
    const newPassword=req.body.newPassword;

    const newUser=new Login(userid,password);
    newUser.changePass(newPassword,(msg)=>{
      res.send(msg);
    })
})



app.get("/searchMeds",(req,res)=>{
  var keyword=req.query.keyword;
  var obj=new Stock();

  obj.similarMed(keyword,(result)=>{
    res.send(result);
  })

})


app.get('/updatestock/',(req,res)=>{
  var medName=req.query.medname;
  var qty=req.query.qty;

  const med=new Stock(medName,qty)

  med.updateStock('buy',(reply)=>{
    if(reply){
      res.send('ok')
    }

    else{
      res.send('medicine not found')
    }
  })
})


app.post('/checkout',(req,res)=>{
  const customerid=req.body.customerid;
  const billerid=req.body.billerid;
  const transid=req.body.transid;


})


app.post('/getCustomerId',(req,res)=>{
  const phone=req.body.phone;
  var name;
  const customer=new Customer(name,phone)

  customer.checkIfCustomerExist(reply,(customerid)=>{
    if(reply)
    res.send(true,customerid,customer.name)

    else{
      res.send(false)
    }
  })
})


app.post('/addNewCustomer',(req,res)=>{
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
