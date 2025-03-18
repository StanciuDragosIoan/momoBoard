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

 

async function performTaskEdit(taskID, button) {
  console.log("test123", taskID, button);

  // Extracting task details from UI
  const title = button.parentElement.children[2].children[0].innerHTML;
  const description = button.parentElement.children[3].innerHTML;

  console.log('title', title);
  console.log('description', description); // ✅ Fixed incorrect logging

  // Pre-fill the form with task details
  const taskTitleInput = document.querySelector("#taskTitle");
  const taskDescriptionInput = document.querySelector("#taskDescription");
  const actionButton = document.querySelector(".input-add-btn");

  taskTitleInput.value = title;
  taskDescriptionInput.value = description;
  actionButton.innerHTML = "Update Task";

  // Remove any previous event listeners to prevent duplicates
  actionButton.replaceWith(actionButton.cloneNode(true));
  const newActionButton = document.querySelector(".input-add-btn");

  // Add event listener for updating task
  newActionButton.addEventListener("click", async function updateHandler() {
    const updatedTitle = taskTitleInput.value;
    const updatedDescription = taskDescriptionInput.value;

    await updateTask(taskID, updatedTitle, updatedDescription); // ✅ Update the task

    // Reset button to "Add Task" mode after update
    newActionButton.innerHTML = "Add Task";

    // Remove update event and restore "addTask" behavior
    newActionButton.replaceWith(newActionButton.cloneNode(true));
    document.querySelector(".input-add-btn").addEventListener("click", addTask);
  });

  openModal(); // Open the modal for editing
}



async function updateTask(id, title, description) {
 
  try {
    if (!id) {
      alert("Task ID is required!");
      return;
    }

    const response = await fetch(`https://small-services-back-ends.vercel.app/api/task`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id, title, description }), // Sending the ID in the request body
    });

    if (!response.ok) {
      throw new Error('Failed to delete task');
    }

    const data = await response.json();
    console.log('Task update successfully:', data);

    document.querySelector("#taskTitle").value="";
    document.querySelector("#taskDescription").value="";

    document.querySelector(".input-add-btn").innerHTML = "Add Task";
    document.querySelector(".input-add-btn").removeEventListener("click", updateTask);
    document.querySelector(".input-add-btn").addEventListener("click", addTask);
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
          <span class="edit" data-id="${task.id}">&#x270E;</span>
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

      // Add event listeners after rendering tasks
      document.querySelectorAll('.edit').forEach(button => {
        button.addEventListener('click', function () {
          const taskId = this.getAttribute('data-id'); // Get task id
          performTaskEdit(taskId, button); // Call deleteTask with the id
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

  // Ensure the drop target is not inside a task (not a nested task)
  if (column.classList.contains('task') || !column.classList.contains('column')) {
    return;
  }
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