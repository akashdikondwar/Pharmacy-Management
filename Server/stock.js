const { query } = require("express")
const con=require("./dbConnection")
class Stock
{
    constructor(medName,qty,price)
    {
        this._medName=medName
        this._qty=qty
        this._price=price
    }

    getMedId(){
        return this._medId
    }
    getMedName(){
        return this._medId
    }
    getprice(){
        return this._price
    }

    static checkIfAvailable(medid,callback)
    {
        const query=`select * from stock where id='${medid}'`
        con.query(query,(error,result)=>{
            if(error){
                console.log('error in checkifAvailable method in stock.js:')
                throw error;
            }
            if(result.length===1 )
            {
                console.log(result.length)   
                console.log(result[0].Available_qty)         
                callback(true,result[0].Available_qty)// when we're not specifying string, write column name case sensitive
            }
            else
            callback(false,null)
        })
    }

    
    static updateStock(addRemove,medid,qty,callback)
    {
        var query=null;
                if(addRemove==="add")
                query=`update stock set available_qty=available_qty+${parseInt(qty)} where id=${medid}`            
                else if(addRemove=="Remove")
                query =`update stock set available_qty=available_qty-${qty} where id='${medid}'`            
                con.query(query,(error,result)=>{
                        if(error){
                            console.log('value is less than available')
                            throw error;
                        }
                        else
                        callback(true)
                    })
    }
                    

    static  similarMed(keyword,callback)
    {
        const query=`select * from stock where medicine_name like '${keyword}%' and expiry > current_date`
        con.query(query,(error,result)=>{
            if(error){
                console.log('error in similarMed method in stock.js')
                throw error;
            }
            callback(result); //isme object  banake nhi bhej sakte because, multiple results aa rahe hain...think we might send object also.
        })
    }
}

module.exports=Stock;