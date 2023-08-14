const { query } = require("express")
const con=require("./dbConnection")


class Customer
{
    constructor(name,phone)
    {
        this.name=name
        this.phone=phone
    }
    


    static checkIfCustomerExist(phone,callback)
    {
        const query=`select * from customer where Phone= ${phone}`
        con.query(query,(error,result)=>
        {
            if(error){
                console.log('*****error in checkIfCustomerExist query:')
                throw error
            }
            else if(result.length===1)//error can be triple equal also
            callback(true,result[0].customerid)//here directly written result.customerid. errormight occur
            else
            callback(false)
        })
    }



    static addNewCustomer(phone,name,address,callback)//adds name and phone and again uses checkIfCustomerExist which returns customerid.
    {
                const query=`insert into customer (name,phone,Address) values ("${name}",${phone},"${address}")`
                con.query(query,(error,result)=>{
                    if(error){
                        throw error;
                    }
                    else{
                        Customer.checkIfCustomerExist(phone,(reply,customerid)=>{
                        callback(reply,customerid)

                        })
                    }
                })
    }



    static fetchCustomer(phone,callback)
    {
        query=`select * from customer where phone = ${phone}`

        con.query(query,(error,result)=>{
            if(error){
            console.log('error in fetchCustomer method in customer.js')
            throw error;
        }
        
        callback(result);//this will return customer row.
        })
    }
}

module.exports=Customer;