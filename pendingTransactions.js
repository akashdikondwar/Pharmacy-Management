const con=require('./dbConnection');

class pendingTransactions{
    constructor(billerId,medId,qty)
    {
        this._billerId=billerId;
        this._medId=medId;
        this._qty=qty;
    }

        addPending(callback)
        {
            const query=`insert into pending_transactions (billerid,med_id,qty) values (${this._billerId},${this._medId},${this._qty})`;

            con.query(query,(error,result)=>{
                if(error)
                throw error;

                callback(true);
            })
        }


        static getAllPending(billerId,callback){
            const query=`select * from pending_transactions where billerid=${billerId}`

            con.query(query,(error,result)=>{
                if (error)
                throw error;

                if(result.length===0)
                callback(false,null)
                else
                callback(true,result)
                
            })
        }
}

module.exports=pendingTransactions;