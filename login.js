const con=require('./dbConnection')
const dbCommands=require('./dbCommands');
const { query } = require('express');

class Login {


    constructor(userid,password)
        {
            this.db=new dbCommands();

            this._userId=userid;
            this._password=password;
            
        }

    getUserId(){
        return this._userId;
    }
    setUserId(userid){
        if(userid!=null)
        this._userId=userid;
    }
    getPassword(){
        return this._password;
    }
    setPassword(password){
        if(Password!=null)
        this._password=password;
    }


    checkIdPass(callback)     //checking from database...
    {
        this.db.checkIdPass(this.getUserId(),this.getPassword(),(reply,billerid,transid)=>
        {
            callback(reply,billerid,transid);
        })
    }

    addNewLogin(callback)
    {
        this.db.checkifUserExist(this.getUserId(),(reply)=>{
        if(reply===true)
        {
                callback("username already in use") ;//dada: check whats enum in java
        }

        else if (reply===false)
        {
            this.db.addNewUser(this.getUserId(),this.getPassword(),(reply)=>{
                if(reply==true)
                callback("user added successfully");
            })

        }
        })
    }

    changePass(newPassword, callback)//layer of security in api//learn autheticator videos. gaya bhaii switch off
    {
        query=`update login set password="${newPassword}" where username="${this.getUserId()} and password="${this.getPassword()}"`

        con.query(query,(error,result)=>{
            if(error || result.length>1)
            {
                console.log("*****error in change pass query")
                throw error
            }
            else{
                callback('password changed successfully')
            }

        })
    }

    static updateTransaction(username){
        const query=`update login set transactions=transactions+1 where username='${username}'`
        con.query(query,(error,result)=>{
            if(error)
            throw error;

            console.log('transaction updated!!')
        })
    }


    static getUserDetails(username,callback){
        const query=`select * from login where username='${username}'`
        con.query(query,(error,result)=>{
            if(error)
            throw error;

            callback(result)//here directly sending result.verified...
        })
    }

    static getBillerId(username,callback){
        Login.getUserDetails(username,result=>{//here this.getuserdetails nhi chalega. since when we use it in other file, it won't recognise it.
            result.forEach(element => {
                callback(element.userid)
            });
        })
    }


    static getTransactionNo(username,callback)
    {
        Login.getUserDetails(username,result=>{
            result.forEach(element => {
                callback(element.transactions)
            });
        })
    }


}

module.exports=Login;