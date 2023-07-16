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

    newTransaction()
    {
        const query=`insert into transaction ()`
    }



    static getTransId(username,callback)
    {
        const query=`select * from login where username='${username}'`

        con.query(query,(error,result)=>{
            if(error){
                console.log('error in getTransId method in transaction.js')
                throw error;
            }

                const transId=`${result[0].userid}${result[0].transactions}`
                callback(transId);
          
        })
    }

    static finalCheckout(transId,customerId,billerid,callback)
    {
        //after adding pending transactions into final table;
        pendingTransactions.getAllPending(billerid,(reply,result)=>{
            if(reply){
                    result.forEach(element => {
                        const medid=element.med_id;
                        const qty=element.qty;
                        const query=`insert into transaction (transid,billerid,customerid,medid,qty) values (${transId},${billerid},${customerId},${medid},${qty})`

                            con.query(query,(error,result)=>{
                                if(error)
                                throw error;

                                else callback(true);
                            })
                    })
            } 
            
            else callback(false);
        });
        
        
        callback(true)
    }
}

module.exports=transaction;