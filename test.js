const login = require('./login')
const { addPending, cancelPending } = require('./pendingTransactions')
const transaction=require('./transaction')

// transaction.getTransId('akash',(transid)=>
// {
//     console.log('this is transid '+transid)
// })

// getUserDetails('akash',(result)=>{
//     result.forEach(element => {
//     console.log(element.role);
//     });
// })

// login.getBillerId("akash",(result)=>{
//     console.log(result)
// })

// console.log(Date.now());

addPending(1234,1,5)
addPending(1234,2,5)
addPending(1234,3,5)
addPending(1234,4,5)
addPending(1234,5,5)

// cancelPending(1234)