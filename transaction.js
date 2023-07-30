const { query } = require('express')
const con=require('./dbConnection')
const pendingTransactions=require('./pendingTransactions')
class transaction
{
    constructor(){
        this._transId
        this._billerId
        this._date
        this._medId
        this._customerId
    }




    static getTransId(username,callback)
    {
        const query=`select * from login where username='${username}'`

        con.query(query,(error,result)=>{
            if(error)
                throw error;
            const transId=`${result[0].userid}${result[0].transactions}`
            callback(transId);
        })
    }

    static finalCheckout(transId,customerId,billerid,callback)
    {
        //after adding pending transactions into final table;
        pendingTransactions.getAllPending(billerid,(result)=>{
            if(result.length!==0){

                    result.forEach(element => {
                        const medid=element.id;
                        const qty=element.qty;
                        const query=`insert into transactions (transid,billerid,customerid,medid,qty) values (${transId},${billerid},${customerId},${medid},${qty})`

                            con.query(query,(error,result)=>{
                                if(error)
                                throw error;
                            })
                        })
                        callback(true);
            } 
            
            else callback(false);
        });
        
        
        callback(true)
    }
}

module.exports=transaction;