const addBtn = document.querySelector(".add-btn");
const removeBtn = document.querySelector(".remove-btn");
const modal = document.querySelector(".modal-cont");
const mainCont = document.querySelector(".main-cont");
const textAreaContainer = document.querySelector(".textarea-cont");
const priorityColor = document.querySelectorAll(".priority-color");
const toolBoxColors = document.querySelectorAll(".color");
const saveButton = document.querySelector(".save");



const colors = ["lightpink", "lightblue", "lightgreen", "black"];
let activeColor = colors[colors.length-1];


let addFlag = false;

let lockClass = "fa-lock";
let unlockClass = "fa-lock-open";

let ticketsArr = [];

if(localStorage.getItem("jira_ticket")){
    // Retrieve the data from DB
    ticketsArr = JSON.parse(localStorage.getItem("jira_ticket"));
    ticketsArr.forEach((ticketObj)=>{
        createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
    });
}


for(let i = 0; i < toolBoxColors.length; i++){
    toolBoxColors[i].addEventListener("click",(e)=>{
        let currentToolBoxColor = toolBoxColors[i].classList[0];

        let filteredTicket =  ticketsArr.filter((ticketObj)=>{
            return currentToolBoxColor == ticketObj.ticketColor;
        });

        // Remove all tickets
        let allTicketCont = document.querySelectorAll(".ticket-cont");
        for(let i = 0; i < allTicketCont.length; i++){
            allTicketCont[i].remove();
        }

        // Append only filtered tickets
        filteredTicket.forEach((ticketObj)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    });

    toolBoxColors[i].addEventListener("dblclick",(e)=>{
         // Remove all tickets
         let allTicketCont = document.querySelectorAll(".ticket-cont");
         for(let i = 0; i < allTicketCont.length; i++){
             allTicketCont[i].remove();
         }

         ticketsArr.forEach((ticketObj)=>{
            createTicket(ticketObj.ticketColor, ticketObj.ticketTask, ticketObj.ticketId);
        })
    })
}

// Listener for modal coloring
priorityColor.forEach((colorElem,idx) => {
    colorElem.addEventListener("click",(e)=>{
        priorityColor.forEach((allColorEle,idx)=>{
            allColorEle.classList.remove("border");
        });
        colorElem.classList.add("border");

        activeColor = colorElem.classList[0];
    });
});

// Display a Modal to fill details for our ticket.
addBtn.addEventListener("click",(e) => {
    // addFlag = true => Display Modal
    // addFlag = false => Remove Modal
    addFlag = !addFlag;

    if(addFlag){
        modal.style.display = "flex";
    }
    else{
        modal.style.display = "none";
    }
});

saveButton.addEventListener("click",(e)=>{
    createTicket(activeColor, textAreaContainer.value);
    setModalToDefault();
    addFlag = !addFlag;
});


// Generating the ticket dynamically. 
/*
    @param : ticketColor -> color choosen by user according to priority
             ticketTask-> content of ticket
             ticketId -> A random Id generated by shortid()
             
             shortid() : https://www.npmjs.com/package/shortid-dist?activeTab=readme
*/
function createTicket(ticketColor, ticketTask, ticketId){

    let id = ticketId || shortid();
    let ticketCont = document.createElement("div");
    ticketCont.setAttribute("class", "ticket-cont");

    // Inner Html of each Ticket
    ticketCont.innerHTML = `
        <div class="task-color ${ticketColor}"></div>
        <div class="task-id">#${id}</div>
        <div class="task-content">${ticketTask}</div>
        <div class="ticket-lock">
            <i class="fas fa-lock"></i>
            <i class="fas fa-trash-alt"></i>
        </div>
    `
    // Append this generated ticket in our main-container
    mainCont.appendChild(ticketCont);

    if(!ticketId){
        ticketsArr.push({ticketColor,ticketTask,ticketId: id});
        localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
    }

    handleRemoval(ticketCont, id); // Handles the deletion of ticket.
    handleLock(ticketCont , id);  // Handles Lock for enable editing. 
    handleColor(ticketCont,id); // Handles the ticket color change feature
}

// Function to delete a ticket
function handleRemoval(ticket, id){
    // deleteTicket.
    let deleteTicketEle = ticket.querySelector(".ticket-lock");
    let deleteTicket  = deleteTicketEle.children[1];

    deleteTicket.addEventListener("click", (e) => {
        // DB Removal
        let ticketIdx = getTicketIdx(id);
        ticketsArr.splice(ticketIdx,1);
        localStorage.setItem("jira_ticket",JSON.stringify(ticketsArr));

        // UI Removal
        ticket.remove();
    });
}


function handleLock(ticket, id){
    let ticketLockEle = ticket.querySelector(".ticket-lock");
    let ticketLock = ticketLockEle.children[0];
    let ticketTaskArea = ticket.querySelector(".task-content");

    ticketLock.addEventListener("click", (e)=>{

        let ticketIdx = getTicketIdx(id);

        if(ticketLock.classList.contains(lockClass)){
            ticketLock.classList.remove(lockClass);
            ticketLock.classList.add(unlockClass);
            ticketTaskArea.setAttribute("contenteditable","true");
        }
        else{
            ticketLock.classList.remove(unlockClass);
            ticketLock.classList.add(lockClass);
            ticketTaskArea.setAttribute("contenteditable","false");
        }

        // Modify content in localStorage
        ticketsArr[ticketIdx].ticketTask = ticketTaskArea.innerText;
        localStorage.setItem("jira_ticket",JSON.stringify(ticketsArr));
    });
}

function handleColor(ticket, id){
    let ticketColor = ticket.querySelector(".task-color");

    ticketColor.addEventListener("click",(e)=>{

        let ticketIdx = getTicketIdx(id);

        let currentTicketColor = ticketColor.classList[1];

        let currentTicketColorIdx = colors.findIndex((color)=>{
            return currentTicketColor === color;
        });

        currentTicketColorIdx++;
        let newTicketColorIdx = currentTicketColorIdx%colors.length;

        let newTicketColor = colors[newTicketColorIdx];

        ticketColor.classList.remove(currentTicketColor);
        ticketColor.classList.add(newTicketColor);

        // Modify data in local storage (change in priority color)
        ticketsArr[ticketIdx].ticketColor = newTicketColor;
        localStorage.setItem("jira_ticket", JSON.stringify(ticketsArr));
    });
}


function getTicketIdx(id){
    let ticketIdx = ticketsArr.findIndex((ticketObj)=>{
        return ticketObj.ticketId === id;
    });
    return ticketIdx;
}

function setModalToDefault(){
    modal.style.display = "none";
    textAreaContainer.value = "";
    activeColor = colors[priorityColor.length-1];
    
    priorityColor.forEach((allColorEle,idx)=>{
        allColorEle.classList.remove("border");
    });
  
    priorityColor[priorityColor.length-1].classList.add("border");
}