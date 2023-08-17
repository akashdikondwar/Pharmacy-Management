const signupPanel=document.getElementById('signUp-panel');
const usersTable=document.getElementById('usersTable');
const usersTableBody=document.getElementById('usersTableBody');
const showUsersButton=document.getElementById('showUsers');
const addUserButton=document.getElementById('addUser');
const removeBillerButton=document.getElementById('removeBiller');
const updateStockButton=document.getElementById('updateStock');
const searchInput=document.getElementById('searchInput');
const transactionHistoryButton=document.getElementById('transactionHistory');
const medTable=document.getElementById('medTable');
const medTableBody=document.getElementById('medTableBody');
const medUpdatePanel=document.getElementById('medUpdatePanel');
const signupForm=document.getElementById('signupForm')
const confirmSignupPass=document.getElementById('confirmSignupPass');
const signupPass=document.getElementById('signupPass');
const signupSubmitButton=document.getElementById('signupSubmitButton')
const medUpdateForm=document.getElementById('medUpdateForm')

const medid=document.getElementById('medid')
const newQty=document.getElementById('newQty')
const newPrice=document.getElementById('newPrice')
let newExpiry=document.getElementById('newExpiry')


let counter=1;
let filteredResults=[];

medUpdateForm.addEventListener('submit',async event=>{
    event.preventDefault()
    await fetch(`http://localhost:3000/updateMed?medid=${medid.value}&qty=${newQty.value}&price=${newPrice.value}&expiry=${newExpiry.value}`)
    
    medTableBody.innerHTML='';
    const searchTerm=searchInput.value;
    if(searchTerm!=''){
        await searchMedicine(searchTerm);
        filteredResults.forEach(item => {
            addMedRow(item);
            counter++;
        })
    }
})


confirmSignupPass.addEventListener('input',event=>{
    if(confirmSignupPass.value !== signupPass.value){
      confirmSignupPass.style.border='red solid'
    }
    else
    confirmSignupPass.style.border='green solid'
})

signupForm.addEventListener('submit',event=>{
    if(confirmSignupPass.value!==signupPass.value)
        event.preventDefault();
})

showUsersButton.addEventListener('click',async event=>{
    counter=1;
    const response=await fetch('http://localhost:3000/getAllUsers');
    const data=await response.json();//the result comes in the form of array which contains json object. these json objects can be used using foreach.
    hideAll();
    usersTable.style.display='block';
    await data.forEach(item => {
        addUserRow(item)
        counter++;
    });
})

addUserButton.addEventListener('click',event=>{
    hideAll();
    signupPanel.style.display='block';
})

updateStockButton.addEventListener('click',event=>{
    hideAll();
    medTable.style.display='block';
    searchInput.focus();
})

document.getElementById('medUpdateCancelButton').addEventListener('click',event=>{
    medUpdatePanel.style.display='none'
})

searchInput.addEventListener('input',async event=>{
    medTableBody.innerHTML='';
    counter=1;
    const searchTerm=searchInput.value;
    if(searchTerm!=''){
        await searchMedicine(searchTerm);
        filteredResults.forEach(item => {
            addMedRow(item);
            counter++;
        })
    }
})


async function addMedRow(data){
    const tr=document.createElement('tr');
    tr.setAttribute('class','newRows')
    medTableBody.appendChild(tr);
    const srno=document.createElement('td')
    srno.innerHTML=counter;
    tr.appendChild(srno);
        Object.keys(data).forEach(key=>{
            const td=document.createElement('td');
            td.innerHTML=data[key];
            tr.appendChild(td);
        })
            tr.addEventListener('click',event=>{
                const index=(tr.getElementsByTagName('td')[0].innerHTML)
                showMedUpdatePanel(index)
            })

            tr.getElementsByTagName('td')[6].innerHTML=tr.getElementsByTagName('td')[6].innerHTML.split('T')[0];
            console.log(tr.getElementsByTagName('td')[6].innerHTML);
            var currDate=new Date();
            var expiryDate=new Date(data.expiry);

            if(currDate.getTime() > expiryDate.getTime()){
                tr.style.borderTop='brown solid'
                tr.style.borderBottom='brown solid'
                tr.style.fontWeight='700'
            }
}
        


function showMedUpdatePanel(index){
    medUpdatePanel.style.display='block';
    const data=filteredResults[parseInt(index-1)]
    document.getElementById('medid').value=data.id;
    document.getElementById('medName').value=data.medicine_Name;
    document.getElementById('category').value=data.category;
}


function addUserRow(data){
    const tr=document.createElement('tr');
    usersTableBody.appendChild(tr);
    const div=document.createElement('div')
    div.setAttribute('class','removeButtonDiv')

    const srno=document.createElement('td')
    const userid=document.createElement('td')
    const username=document.createElement('td')
    const role=document.createElement('td')
    const removeButton=document.createElement('button')

    removeButton.setAttribute('class','removeButton');
    removeButton.addEventListener('click',event=>{
        const id=tr.getElementsByTagName('td')[1].innerText;//earlier i did using removebutton.parentElement but we can also do using tr.since tr contains unique address and this tr variable points to that address which contains that td element.
        if(confirm('Do you really want to remove the user? This action cannot be undone.')){
            tr.remove();
            deleteUser(id);
        }
    })
    srno.innerHTML=counter;
    userid.innerHTML=data.userid;
    username.innerHTML=data.username;
    role.innerHTML=data.role;
    removeButton.innerHTML='Remove'
    tr.appendChild(srno)
    tr.appendChild(userid)
    tr.appendChild(username)
    tr.appendChild(role)
    tr.appendChild(div)
    div.appendChild(removeButton)
}


function hideAll(){
    signupPanel.style.display='none';
    usersTableBody.innerHTML='';
    usersTable.style.display='none';
    medTable.style.display='none';
    medUpdatePanel.style.display='none'
    medTable.style.display='none';
}

async function deleteUser(id){
    await fetch(`http://localhost:3000/removeUser?id=${id}`);
}

async function searchMedicine(searchTerm){
    const response=await fetch(`http://localhost:3000/searchMeds/admin?keyword=${searchTerm}`)
    filteredResults=await response.json();
    

}