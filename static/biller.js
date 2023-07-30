const searchInput = document.querySelector(".search-input");
const quantityInput = document.getElementById("qty");
const searchResults = document.getElementById("searchResults");
const tableRow=document.getElementById('table_row');
const checkoutButton=document.getElementById('checkoutButton');

checkoutButton.addEventListener('click',event=>{
  console.log('testing checkoutbutton event listener')
  showFloatingForm();
  
  // if(!event.target.checkoutButton)
  // hideFloatingForm();
});

getCustomer.addEventListener('click',async event=>{
  const phone=document.getElementById('phone').value;
  const result= await fetch(`http://localhost:3000/getCustomerId?phone=${phone}`);
  const customerid= await result.json();
  
  if(customerid!=='0000'){
    await fetch(`http://localhost:3000/finalCheckout?customerid=${customerid}`)
  }

})

let selectedIndex = -1;
let filteredResults = [];
let serialNo=0;

document.addEventListener("DOMContentLoaded", async function() {
  const response= await fetch('http://localhost:3000/continuePending')//data always comes in raw format from server. to extract json, we must apply .json() method
  var data=await response.json();

  // console.log('response value:' + String(data))
  if(data.length!==0)
  {
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
}); 

quantityInput.addEventListener('keypress',async event=>{
  if(event.keyCode===13){      
    event.preventDefault();

    const qty=await quantityInput.value;
    const result=await filteredResults[selectedIndex];

    await addPending(result.id,qty);//adding new row data to database pending table.

      addNewRow(result,qty);
      searchInput.value='';
      quantityInput.value='';
      searchInput.focus();
  }
})

async function addNewRow(result,qty){
  const tr=document.createElement('tr');
  tr.setAttribute('medid',result.id);    //here we are only saving medid in parent row element. we'll send this id to delete row from pending table 
                                        //while deleting a row. but if tere are 
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
      await deletePendingFromDB(medid,qty);
      
      button.parentElement.remove();
  })

  srno.textContent=++serialNo;
  med.textContent=result.medicine_Name;
  cat.textContent=result.category;
  exp.textContent=result.expiry;
  pric.textContent=result.price;
  quant.textContent=qty;
  amount.textContent=parseInt(result.price)*parseInt(qty)

  tableRow.appendChild(tr);

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
      });                           // removed this because whats its use??
      searchResults.appendChild(item);
  });

  if (filteredResults.length > 0) {
      searchResults.style.display = 'block';      //block means dikhega
  } else {
      searchResults.style.display = 'none';
  }
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
  const response= await fetch(`http://localhost:3000/searchmeds?keyword=${searchTerm}`)
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
  document.getElementById('customerDetails').style.display='flex';
  document.getElementById('mainBody').style.display='none';
}

function hideFloatingForm(){
  document.getElementById('customerDetails').style.display='none';
  document.getElementById('mainBody').style.display='flex';
}
