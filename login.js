const con=require('./dbConnection')
const dbCommands=require('./dbCommands');
const { query } = require('express');
const { checkIfAvailable } = require('./stock');

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
        this.db.checkIdPass(this.getUserId(),this.getPassword(),(reply,role,userid)=>
        {
            callback(reply,role,userid);
        })
    }

    static addNewUser(username,Password,role,callback)
    {
        const query=`insert into login (username,password,role) values (?,?,?)`
        const params=[username, Password,role]

        con.query(query,params,(error,result)=>{
            if(error){
                console.log("error in addNewUser method in dbcommands: ")
                throw error;
            }
            else 
                callback(true);
        })
    }



    static addNewLogin(username,password,role,callback)
    {   console.log('this is from addnewlogin method'+username,password,role)
        dbCommands.checkifUserExist(username,(reply)=>{
            if(reply===true)
                    callback(false) ;//dada: check whats enum in java

            else if (reply===false){
                Login.addNewUser(username,password,role,(reply)=>{
                    callback(reply);
                })
            }
        })
    }



    changePass(newPassword, callback)//layer of security in api//learn autheticator videos. gaya bhaii switch off
    {
        query=`update login set password="${newPassword}" where username="${this.getUserId()} and password="${this.getPassword()}"`
        con.query(query,(error,result)=>{
            if(error || result.length>1){
                console.log("*****error in change pass query")
                throw error
            }
            else
                callback('password changed successfully')
        })
    }


    // static updateTransaction(username){
    //     const query=`update login set transactions=transactions+1 where username='${username}'`
    //     con.query(query,(error,result)=>{
    //         if(error)
    //         throw error;

    //         console.log('transaction updated!!')
    //     })
    // }


    static getUserDetails(username,callback){
        const query=`select * from login where username='${username}'`
        con.query(query,(error,result)=>{
            if(error)
            throw error;

            callback(result)//here directly sending result.verified...
        })
    }

    static getUserid(username,callback){
        Login.getUserDetails(username,result=>{//here this.getuserdetails nhi chalega. since when we use it in other file, it won't recognise it.
            result.forEach(element => {
                callback(element.userid)
            });
        })
    }

}

module.exports=Login;