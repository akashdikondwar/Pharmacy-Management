const con=require('./dbConnection');

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

                callback(true);
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


        static removeAllPending(userid,callback)
        {
            const query=`delete from pending_transactions where billerid=${userid}`
            con.query(query,(error,result)=>{
                if(error)
                throw error

                callback(true);
            })
        }
};

module.exports=pendingTransactions