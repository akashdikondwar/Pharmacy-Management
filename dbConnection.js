const mysql=require('mysql2')

const con=mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Akash@123',
    database:'pharmadb'
})

con.connect((error)=>
{
    if(error)
    throw error;

    console.log('connection successful')
})

module.exports=con