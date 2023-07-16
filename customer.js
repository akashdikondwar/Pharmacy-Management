const { query } = require("express")
const con=require("./dbConnection")


class Customer
{
    constructor(name,phone)
    {
        this.name=name
        this.phone=phone
    }
    
    checkIfCustomerExist(callback)
    {
        query=`select * from customer where phone= ${this.phone}`
        con.query(query,(error,result)=>
        {
            if(error){
                console.log('*****error in checkIfCustomerExist query:')
                throw error
            }
            else if(result.length===1)//error can be triple equal also
            callback(true,result.customerid)//here directly written result.customerid. errormight occur
            else
            callback(false)
        })
    }

    addNewCustomer(callback)
    {
        this.checkIfCustomerExist((reply)=>{
            if(reply===false)
            {
                query=`insert into customer (name,phone) values ("${this.name}",${this.phone})`
                con.query(query,(error,result)=>{
                    if(error)
                    {
                        console.log('******error in addNewCustomer query: ');
                        throw error;
                    }
                    else
                    {
                        const newCustomerId=result.customerid;
                        callback(true,newCustomerId)
                    }
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