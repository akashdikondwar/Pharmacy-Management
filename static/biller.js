
const searchInput = document.querySelector(".search-input");
const quantityInput = document.getElementById("qty");
const searchResults = document.getElementById("searchResults");
const table_body=document.getElementById('table_body');
const checkoutButton=document.getElementById('checkoutButton');
const finalCheckout=document.getElementById('finalCheckout')
const transid=document.getElementById('transid');
const discard=document.getElementById('discard');
const totalAmount=document.getElementById('totalAmount');



const customerName=document.getElementById('name')
const address=document.getElementById('address')
const phone=document.getElementById('phone')

let transIdsequence=null;
let trasactionIncrementor=0;
let selectedIndex = -1;
let filteredResults = [];
let serialNo=0;

discard.addEventListener('click',async event=>{
  await fetch('http://localhost:3000/cancelPending');//to cancel pending transaction from database.
  table_body.innerHTML='';//to clear medicine table.
  totalAmount.innerHTML=0.00;
})


checkoutButton.addEventListener('click',event=>{
  if(table_body.rows.length==0){//if whole table row calculated then it will show length=1 since it will consider header row also. here only tableBody rows are calculated
    alert('The table is empty!! ')
  }
  else
  showFloatingForm();
});

finalCheckout.addEventListener('click',async event=>{
  const phone=document.getElementById('phone').value;
  const result= await fetch(`http://localhost:3000/getCustomerId?phone=${phone}`);
  const customerid= await result.json();

  if(customerid!==false){
    await fetch(`http://localhost:3000/finalCheckout?customerid=${customerid}&transid=${String(transid.innerText)}`)
    hideFloatingForm();  
    table_body.innerHTML='';//to clear medicine table
    totalAmount.innerHTML=0.00;
    serialNo=0;
    transid.innerHTML=await getTransactionId()
    alert('Transaction Successful!!');
  }
  else
  {
    //showing newCustomerPanel because phone no. not found in database.
    document.getElementById('newPhone').value=document.getElementById('phone').value;
    document.getElementById('newCustomerPanel').style.display='block';
    document.getElementById('checkCustomerPanel').style.display='none';
  }


})

document.getElementById('addNewCustomerAndCheckout').addEventListener('click',async event=>{
  const response=await fetch(`http://localhost:3000/addNewCustomer?name=${customerName.value}&phone=${phone.value}&address=${address.value}`);
  const data=await response.json();
  console.log('response= '+data);
  const customerid=data;
  await fetch(`http://localhost:3000/finalCheckout?customerid=${customerid}&transid=${String(transid.innerText)}`)
    hideFloatingForm();  
    customerName.value='';
    address.value='';
    phone.value='';
    table_body.innerHTML='';//to clear medicine table
    totalAmount.innerHTML=0.00;
    serialNo=0;
    transid.innerHTML=await getTransactionId()
    alert('Transaction Successful!!');

})

document.addEventListener("DOMContentLoaded", async function() {
  const response= await fetch('http://localhost:3000/continuePending')//data always comes in raw format from server. to extract json, we must apply .json() method
  var data=await response.json();
  await getTransIdSequence();
  transid.innerHTML=await getTransactionId();//sometimes the value is not returned form the method while printing on webpage. hence we have to use await before calling the function while printing the output on webpage.
  if(data.length!=0) {
    if(confirm('Pending Transaction Found. Press OK to continue.')){
      data.forEach(element=>{
        addNewRow(element,element.qty);
      });
    }
    else await fetch('http://localhost:3000/cancelpending');
  }
})


//  this will prevent form to get submitted when we select a result from result list
searchInput.addEventListener("keypress", (event) => {
  if (event.keyCode === 13) event.preventDefault();
});

//  this will prevent user to enter the number less than 1
quantityInput.addEventListener("input", (event) => {
  if (parseInt(quantityInput.value) < 1) {
    quantityInput.value = "";
  }
  if(parseInt(quantityInput.value) > filteredResults[selectedIndex].available_qty){
    quantityInput.style.border='red solid';
    document.getElementById('qtyExceed').innerHTML='Quantity should be less than '+filteredResults[selectedIndex].available_qty;
    document.getElementById('qtyExceed').style.display='block';
  }
  else {
    document.getElementById('qtyExceed').style.display='none';
    quantityInput.style.border='green solid'
  }
}); 

quantityInput.addEventListener('keypress',async event=>{
  if(event.keyCode===13){      
    event.preventDefault();
    if( parseInt(quantityInput.value) <= filteredResults[selectedIndex].available_qty){

    const qty=await quantityInput.value;
    const result=await filteredResults[selectedIndex];
    await addPending(result.id,qty);//adding new row data to database pending table.
    addNewRow(result,qty);
    searchInput.value='';
    quantityInput.value='';
    searchInput.focus();
    }
  }
})


async function addNewRow(result,qty){
  const tr=document.createElement('tr');//each time new row is created
  table_body.appendChild(tr);//and appending new row in table body
  tr.setAttribute('medid',result.id);//each row will get custom attribute medid. this medid will be catched by delete button to delete that med from db.
  totalAmount.innerHTML=parseInt(totalAmount.innerHTML)+(parseInt(result.price)*parseInt(qty));

  //here we are only saving medid in parent row element. we'll send this id to delete row from pending table while deleting a row. but if tere are 
  //two rows of same id and different qty, then there will be problem. hence update the qty here itself, dont create two rows of same id.
  const srno =document.createElement('td')
  const med=document.createElement('td')
  const cat=document.createElement('td')
  const exp=document.createElement('td')
  const pric=document.createElement('td')
  const quant=document.createElement('td')
  const amount=document.createElement('td')
  const button=document.createElement('button')
  button.setAttribute('type','button')
  button.setAttribute('class','btn btn-danger');
  button.style.float='right';
  button.textContent='delete';

  button.addEventListener('click',async (event)=>{
    const medid=button.parentElement.getAttribute('medid');
    await deletePendingFromDB(medid,qty);//function to delete a medicine from db.
    button.parentElement.remove();//to remove the row
    totalAmount.innerHTML=parseInt(totalAmount.innerHTML)-parseInt(button.parentElement.getElementsByTagName('td')[6].innerText);//update the total amount on deleting a medicine.
  })

  srno.textContent=++serialNo;
  med.textContent=result.medicine_Name;
  cat.textContent=result.category;
  exp.textContent=result.expiry.split('T')[0];
  pric.textContent=result.price;
  quant.textContent=qty;
  amount.textContent=parseInt(result.price)*parseInt(qty)

//append all td(table data created in row. these will automatically be added to corresponding column)
  tr.appendChild(srno)
  tr.appendChild(med)
  tr.appendChild(cat)
  tr.appendChild(exp)
  tr.appendChild(pric)
  tr.appendChild(quant)
  tr.appendChild(amount)
  tr.appendChild(button)
}


function showResults() {
  searchResults.innerHTML = '';
  filteredResults.forEach((result, index) => {
      const item = document.createElement('div');//har result ke liye ek division create kiya hain;
      item.classList.add('search-item');
      item.textContent = result.medicine_Name +" --- "+ result.available_qty;
      item.setAttribute('data-index', index);//as searchresult comes, new div will be created and each div will get index in data-index attribute.
      item.addEventListener('keypress', (event) => {
          if (event.keyCode === 13)
          selectResult(index);
      }); 
      item.addEventListener('click',event=>{
        selectedIndex=item.getAttribute('data-index');
        selectResult(selectedIndex);
      })                          // removed this because whats its use??
      searchResults.appendChild(item);
  });
  if (filteredResults.length > 0)
    searchResults.style.display = 'block';      //block means dikhega
  else 
    searchResults.style.display = 'none';
}

async function  getTransIdSequence(){

  //first check date
  const date=getNewDate();
  const data=await fetch (`http://localhost:3000/gettransidsequence?date=${date}`);
  transIdsequence=await data.json();
  console.log('transIdsequence='+transIdsequence)
}

function getNewDate(){
  const date=new Date();
  const currDate=String(date.getFullYear())  + String(date.getMonth()+1).padStart(2,'0') + String(date.getDate()).padStart(2,'0');
  return currDate;
}

async function logout(){
const data=await fetch('http://localhost:3000/logout',{method:'post',});
}

async function getTransactionId(){
  var transId=getNewDate();
  console.log(transId)
  transId = transId + String(transIdsequence + trasactionIncrementor).padStart(5, '0');//padstart function makes sure the string length is 5. by adding zeroes at start if the string length<5
  trasactionIncrementor++;
  if(trasactionIncrementor==5){
    trasactionIncrementor=0;
    getTransIdSequence();
  }
  return transId;
}

function hideResults() {
  searchResults.style.display = 'none';
}

async function addPending(medid,qty){
  await fetch(`http://localhost:3000/addPending?medid=${medid}&qty=${qty}`);
}

async function deletePendingFromDB(medid,qty){
  await fetch(`http://localhost:3000/removeOnePending?medid=${medid}&qty=${qty}`)//we'll send medid here to find in pending table and then delete
}

function selectResult(index) {
  if (index >= 0 && index < filteredResults.length) {
      searchInput.value = filteredResults[index].medicine_Name + " [Avl=" +filteredResults[index].available_qty+"]";
      hideResults();
      quantityInput.focus();
  }
}

async function filterResults(searchTerm) {// here filterresults ko async banaya toh sabhi filterresults ke saamne await lagana padega
  searchTerm = searchTerm.toLowerCase();
  const response= await fetch(`http://localhost:3000/searchmeds/biller?keyword=${searchTerm}`)
  const data= await response.json();        //to extract json data from response.
  filteredResults=data;
}

async function search(event) {
  const key = event.key;
  const searchTerm = searchInput.value.trim();

  if (searchTerm === '') {
      filteredResults = [];
      hideResults();
      return;
  }

  if (key === 'ArrowDown') {
      selectedIndex = Math.min(selectedIndex + 1, filteredResults.length - 1);
      highlightSelected();
  } else if (key === 'ArrowUp') {
      selectedIndex = Math.max(selectedIndex - 1, -1);
      highlightSelected();
  } else if (key === 'Enter') {
      selectResult(selectedIndex);
  } else {
      selectedIndex = -1;
      await filterResults(searchTerm);
      showResults();
  }
}

function highlightSelected() {
  const searchItems = searchResults.querySelectorAll('.search-item');
  searchItems.forEach((item, index) => {
      if (index === selectedIndex) {
          item.classList.add('selected');
          item.scrollIntoView({ block: 'nearest' });
      } else {
          item.classList.remove('selected');
      }
  });
}

searchInput.addEventListener('blur', () => {
  // Delay hiding the results to allow click events to fire
  setTimeout(hideResults, 200);
});

function showFloatingForm(){
  document.getElementById('checkCustomerPanel').style.display='block';
  document.getElementById('mainBody').style.display='none';
  document.getElementById('newCustomerPanel').style.display='none';
}

function hideFloatingForm(){
  document.getElementById('checkCustomerPanel').style.display='none';
  document.getElementById('mainBody').style.display='block';
  document.getElementById('newCustomerPanel').style.display='none';
}
