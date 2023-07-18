const con=require('./dbConnection');
const { updateStock } = require('./stock');

class pendingTransactions{
    constructor(billerId,medId,qty)
    {
        this._billerId=billerId;
        this._medId=medId;
        this._qty=qty;
    }

        static addPending(userid,medid,qty,callback){
            const query=`insert into pending_transactions (billerid,med_id,qty) values (${userid},${medid},${qty})`;
            con.query(query,(error,result)=>{
                if(error) throw error;

                else{
                    Stock.updateStock('Remove',medId,qty,(reply)=>{
                        if(reply)
                        callback(true)
                        else
                        callback(false);
                    })
                }            
            })
        }



        static getAllPending(userid,callback){
            const query=`select * from pending_transactions where billerid=${userid}`
            con.query(query,(error,result)=>{
                if (error)
                    throw error;

                if(result.length===0)
                    callback(false,null)
                else
                    callback(true,result)
            })
        }



        static  removeAllPending(userid,callback)
        {
            const query=`delete from pending_transactions where billerid=${userid}`
            con.query(query,(error,result)=>{
                if(error)
                throw error

                callback(true);
            })
        }



        static cancelPending(userid,callback)
        {
            const query=`select * from pending_transactions where billerid=${userid}`
            var medid=null;
            var qty=null;
            con.query(query,(error,result)=>{
                if(error)
                throw error;
                
                result.forEach(element => {
                    medid=element.med_id;
                    qty=element.qty;
                    updateStock('add',medid,qty,()=>{  })
                })

                pendingTransactions.removeAllPending(userid,()=>{callback(true)});
            })
        }



        static cancelOnePending(userid,medid,qty,callback) 
        {
            const query=`update stock set available_qty=available_qty+${qty} where id=${medid}`;
            con.query(query,(error,result)=>{
                if(error) throw error;
            })

            const query2=`delete from pending_transactions where billerid=${userid} and med_id=${medid} and qty=${qty} limit 1`
            con.query(query,(error,result)=>{
                if(error) throw error;
                
                callback(true)
            })
        }

        
};

module.exports=pendingTransactions