const { query } = require('express');
const con=require('./dbConnection');
const Login=require('./login');
const transaction = require('./transaction');

class dbCommands
{

    queryExecutor(query,params=[],callback)//this way array is initilized
    {
        con.query(query,params,(error,result)=>{
            if(error)
            callback(error,null)

           else 
           callback(null,result)

        })
    }

    checkIdPass(username,password,callback)
    {
        console.log(username, password)
        const query=`select * from login where username="${username}" and password="${password}"`            

        con.query(query,(error,result)=>{       //we dont need to show query errors to user, so we wont take error as callback, we'll only show it on console.
            if(error)
            throw error;

            if(result.length===1){
                var userid=null;
                var role=null;
                result.forEach(element => {
                    userid=element.userid;
                    role=element.role;
                });
                callback(true,role,userid)//also send transaction id.
            }

            else
            callback(false)
        })
    }




    checkifUserExist(username,callback)
    {
        const query=`select * from login where username= "${username}"`;
        //before i was returning directly queryexector function. inside the callback function, i was returning error and true and false; but that wasnt working.

        con.query(query,(error,result)=>{ 
            if(error)
            throw error;

            else{
                if(result.length!==0)
                callback(true)
                else 
                callback(false)
            }
        })        
    }




    addNewUser(username,Password,callback)
    {
        const query=`insert into login (username,password) values (?,?)`
        const params=[username, Password]

        con.query(query,params,(error,result)=>{
            if(error){
                console.log("error in addNewUser method in dbcommands: ")
                throw error;
            }
            else 
                callback(true);
        })
    }

    }

    module.exports=dbCommands;