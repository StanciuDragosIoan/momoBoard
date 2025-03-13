const modalBtn = document.querySelector(
  '.open-modal'
);
const closeBtn = document.querySelector(".close");

const getTasks = async () => {
  try {
    const response = await fetch('https://small-services-back-ends.vercel.app/api/task', {
      method: 'GET',  // Use GET method to fetch data
      headers: {
        'Content-Type': 'application/json',  // Ensure the server knows we are expecting JSON
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tasks');
    }

    const   responseData = await response.json();  // Parse the JSON response

    console.log('Tasks fetched successfully:',responseData);

    const { data }  = responseData;

    return data;
  } catch (error) {
    console.error('Error:', error.message);
    return [];
  }
};

// Call the function to


// const tasks = localStorage.getItem("tasksBoard") ? JSON.parse(localStorage.getItem("tasksBoard")) : [];

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

async function isUniqueTitle(title) {
  const tasks = await getTasks();
  const titles = tasks.map(i => i.title);
  console.log(titles, title, titles.includes(title))
  if(titles.includes(title)) {
    return false;
  }  
  return true;
}
// function addTask(){
//   const taskTitle = document.querySelector("#taskTitle").value;
//   const taskBody =  document.querySelector("#taskDescription").value;
//   const titleIsUnique = isUniqueTitle(taskTitle);
//   console.log(titleIsUnique);
//   if(!taskTitle || !taskBody || !titleIsUnique) {
//     //TODO improve error
//     alert("Please input something and make sure it's unique!");
//   } else {
//     tasks.push({title: taskTitle, description: taskBody});
//     localStorage.setItem("tasksBoard", JSON.stringify(tasks));
//     taskTitle.innerHTML="";
//     taskBody.innerHTML="";
//     displayTasks();
//   }

// }

async function addTask() {
  try {
    const taskTitle = document.querySelector("#taskTitle").value;
    const taskBody =  document.querySelector("#taskDescription").value;
    const task = {
      title: taskTitle,        // Your task title
      description: taskBody,
      column: "todo"
    };

    console.log(task)
    const titleIsUnique = await isUniqueTitle(taskTitle);

 
    if(!taskTitle || !taskBody || !titleIsUnique) {
      //TODO improve error
      alert("Please input something and make sure it's unique!");
 
    } else {
      console.log(task);
  
      const response = await fetch('https://small-services-back-ends.vercel.app/api/task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Ensure you're sending JSON
        },
        body: JSON.stringify(task),  // Convert the task object to a JSON string
      });
  
      if (!response.ok) {
        throw new Error('Failed to create task');
      }
  
      const data = await response.json();  // Parse the JSON response
  
      await displayTasks();
      document.querySelector("#taskTitle").value="";
      document.querySelector("#taskDescription").value="";
      console.log('Task created successfully:', data);
  
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

 
  async function deleteTask(taskId) {
  // console.log(taskId);
  try {
    if (!taskId) {
      alert("Task ID is required!");
      return;
    }

    const response = await fetch(`https://small-services-back-ends.vercel.app/api/task`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: taskId }), // Sending the ID in the request body
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    const data = await response.json();
    console.log('Task deleted successfully:', data);

    await displayTasks(); // Refresh the tasks list after deletion
  } catch (error) {
    console.error('Error:', error.message);
  }
}


function getFormattedTimeStamp(timeStamp) {
  const splits = timeStamp.split("T")[0].split("-");
  return `${splits[2]}-${splits[1]}-${splits[0]}`
}


async function displayTasks() {
  try {
    const tasks = await getTasks(); // Fetch tasks
    console.log(tasks);

    // Clear existing tasks from each column before adding new ones
    document.getElementById("todo").innerHTML = "<h2>To Do</h2>";
    document.getElementById("in-progress").innerHTML = "<h2>In Progress</h2>";
    document.getElementById("done").innerHTML = "<h2>Done</h2>";
    document.getElementById("archived").innerHTML = "<h2>Archived</h2>";

    tasks.forEach(task => {
      const taskHTML = `
        <div class="task" draggable="true" ondragstart="drag(event)" id="task-${task.id}">
          <span class="delete" data-id="${task.id}">x</span>
          <p><span>${task.title}</span></p>
          <p>${task.description}</p>
          <p class="time">${getFormattedTimeStamp(task.created_at)}</p>
        </div>
      `;

      // Find the correct column
      const columnElement = document.getElementById(task.column);
      if (columnElement) {
        columnElement.innerHTML += taskHTML; // Append task to the correct column
      }
    });

    // Add event listeners after rendering tasks
    document.querySelectorAll('.delete').forEach(button => {
      button.addEventListener('click', function () {
        const taskId = this.getAttribute('data-id'); // Get task id
        deleteTask(taskId); // Call deleteTask with the id
      });
    });
  } catch (error) {
    console.error("Error displaying tasks:", error);
  }
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
  // const startedField = task.querySelector('.time');
  const taskId = task.id.split('-').slice(1).join('-');
  let newColumn = column.id;


   // Update the task's column and send a PUT request
  updateTaskColumn(taskId, newColumn);

  column.appendChild(task);
}

async function updateTaskColumn(taskId, newColumn) {
  try {
    const response = await fetch('https://small-services-back-ends.vercel.app/api/task', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: taskId, column: newColumn }),
    });

    if (!response.ok) {
      throw new Error('Failed to update task column');
    }

    const data = await response.json();
    console.log('Task column updated successfully:', data);

    await displayTasks(); // Refresh the tasks list after updating column
  } catch (error) {
    console.error('Error:', error.message);
  }
}

displayTasks();