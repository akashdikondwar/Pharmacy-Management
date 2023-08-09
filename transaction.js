const { query } = require('express')
const con=require('./dbConnection')
const pendingTransactions=require('./pendingTransactions')
class transaction
{

    static finalCheckout(transId,customerId,billerid,callback){
        pendingTransactions.getAllPending(billerid,async (result)=>{
        if(result.length!==0){
                result.forEach(element => {
                    const medid=element.id;
                    const qty=element.qty;
                    const query=`insert into transactions (transid,billerid,customerid,medid,qty,date) values (${transId},${billerid},${customerId},${medid},${qty},now())`
                    con.query(query,(error,result)=>{
                        if(error)
                        throw error;
                    })
                })
                pendingTransactions.removeAllPending(billerid,(reply)=>{
                callback(reply);
                })
            } 
            else callback(false);
        });
    }


    static updateSequence(){

    }


    static async getTransIdSequence(date,callback){

        //first check date
        const dateQuery=`select date from transid where date=${date}`//here exists statement ka bhi use kar sakte. try once.
        const sequenceResetQuery=`update transid set date=${date}, sequence=1`;
        const updateQuery=`update transid set sequence=sequence+5;`
        const query=`select sequence from transid`;
        
        con.query(dateQuery,(error,result)=>{
            if (error) throw error;

            if(result.length!==1){
                con.query(sequenceResetQuery,(error,result)=>{
                    if (error) throw error;
                })
            }

            con.query(query,(error,result)=>{
                if (error) throw error;{
                    callback(result[0].sequence);
                }
                con.query(updateQuery,(error,result)=>{
                    if(error) throw error;
                })
            })   
        })
      

        
    }
}

module.exports=transaction;