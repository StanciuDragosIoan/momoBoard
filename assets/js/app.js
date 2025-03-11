const modalBtn = document.querySelector(
  '.open-modal'
);
const closeBtn = document.querySelector(".close");

const tasks = localStorage.getItem("tasksBoard") ? JSON.parse(localStorage.getItem("tasksBoard")) : [];

closeBtn.addEventListener("click", closeModal);


modalBtn.addEventListener('click', openModal);

const addTaskBtn = document.querySelector(".input-add-btn");
addTaskBtn.addEventListener("click", addTask);

// Modal functions
function openModal() {
  document
    .querySelector('.modal')
    .classList.add('active');
 
}

function closeModal() {
  document
    .querySelector('.modal')
    .classList.remove('active');
 
}

function isUniqueTitle(title) {
  const titles = tasks.map(i => i.title);
  if(titles.includes(title)) {
    return false;
  }
  return true;
}
function addTask(){
  const taskTitle = document.querySelector("#taskTitle").value;
  const taskBody =  document.querySelector("#taskDescription").value;
  const titleIsUnique = isUniqueTitle(taskTitle);
  console.log(titleIsUnique);
  if(!taskTitle || !taskBody || !titleIsUnique) {
    //TODO improve error
    alert("Please input something and make sure it's unique!");
  } else {
    tasks.push({title: taskTitle, body: taskBody});
    localStorage.setItem("tasksBoard", JSON.stringify(tasks));
    taskTitle.innerHTML="";
    taskBody.innerHTML="";
    displayTasks();
  }

}

function displayTasks(){
  const tasksPlace = document.querySelector("#tasksPlace");
  let output = ``;
  tasks.map(i => {
    output +=`
    <div class="task" draggable="true" ondragstart="drag(event)" id="task-1">
                <p><span>${i.title}</span></p>
                <p>${i.body}</p>
              <p class="time"></p>
            </div>
    `
  });
  tasksPlace.innerHTML = output;
}


//drag and drop
// Allow dragging the task
function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

// Allow dropping tasks
function allowDrop(ev) {
  ev.preventDefault();
}


function setTimestamp() {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
// When a task is dropped
function drop(ev) {
  ev.preventDefault();
  var data = ev.dataTransfer.getData("text");
  var task = document.getElementById(data);
  var column = ev.target;
  const startedField = task.querySelector('.time');
  if (column.id === "in-progress") {
    if (!startedField.textContent) {
      startedField.textContent = `Started: ${setTimestamp()}`;
    }
  }

  if (column.id === "done") {
    if (!startedField.textContent) {
      startedField.textContent = `Finished: ${setTimestamp()}`;
    }
  }


  if (column.id === "archived") {
    if (!startedField.textContent) {
      startedField.textContent = `Archived: ${setTimestamp()}`;
    }
  }

  column.appendChild(task);
}

displayTasks();