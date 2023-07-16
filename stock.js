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

    checkIfAvailable(callback)
    {
        const query=`select * from stock where medicine_name='${this._medName}'`
        con.query(query,(error,result)=>{
            if(error){
                console.log('error in checkifAvailable method in stock.js:')
                throw error;
            }
            if(result.length!==0 )
            {
                console.log(result.length)   
                console.log(result[0].Available_qty)         
                callback(true,result[0].Available_qty)// when we're not specifying string, write column name case sensitive
            }
            else
            callback(false,null)
        })
    }

    updateStock(buySell,callback)
    {
        this.checkIfAvailable((reply,qty)=>{  
            if(reply)
            {   if(buySell=="buy")
                qty=qty+ parseInt(this._qty);//here i had to do use parse int to convert to number. otherwise it was adding as a string;
                else if(buySell=="sell")
                qty=qty- parseInt(this._qty);

                const query=`update stock set available_qty=${qty} where medicine_name='${this._medName}'`            
                con.query(query,(error,result)=>{
                    if(error){
                        console.log('error in Updatestock method:')
                        throw error;
                    }
                    else
                    callback(true)
                })
            }

            else callback(false)
        })
    }

    similarMed(keyword,callback)
    {
        const query=`select * from stock where medicine_name like '${keyword}%'`
        con.query(query,(error,result)=>{
            if(error){
                console.log('error in similarMed method in stock.js')
                throw error;
            }
            callback(result); //isme object  banake nhi bhej sakte because, multiple results aa rahe hain...think we might send object also.
        })
    }

    addToPending(id,qty,callback)
    {
        const query=`insert into pending set `
    }
}

module.exports=Stock;