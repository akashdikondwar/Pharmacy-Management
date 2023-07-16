
const array=[1,2,3,4,5,6,7]

 function getArr(){
    setTimeout(() => {
        array.forEach((item) =>{
                awaitconsole.log("array items"+item)
                setTimeout(() => {
                    
                }, 500);
            
        })
        
    }, 500);
}

getArr();


// now if we have to first add new element and then only print the array. we can do like this.
// create addNewElement function as promise function. when its work is over, it'll return a promise. on this promise function,
// we can use then method which takes other function as parameter or callback function.
// if resolve() function is run, the  promise is sent, and if reject() function is run, promise is rejected with error. we can 
// catch this error by using .catch() after .then() method. both takes callbacks as argument.

array

// function getArr() {
//     setTimeout(()=>{
//         array.forEach(item)
//         {
//             console.log(item)
//         }

//     },3000)
    
//     }

//     function addElement(num){
//         array.push[8,9];

//     }

//     function addAfterTime(num){
//         setTimeout(()=>{

//         },3000)
//     }