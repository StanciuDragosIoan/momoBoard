// Allow dragging the task
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  
  // Allow dropping tasks
  function allowDrop(ev) {
    ev.preventDefault();
  }
  
  // When a task is dropped
  function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    var task = document.getElementById(data);
    var column = ev.target;
  
    if (column.id === "in-progress") {
      const startedField = task.querySelector('.started');
      if (!startedField.textContent) {
        const now = new Date();
        const day = now.getDate().toString().padStart(2, '0');
        const month = (now.getMonth() + 1).toString().padStart(2, '0');
        const year = now.getFullYear();
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        startedField.textContent = `Started: ${day}/${month}/${year} ${hours}:${minutes}`;
      }
    }
  
    column.appendChild(task);
  }
  
  // Modal functions
  function openModal() {
    document.querySelector(".modal");
    console.log(modal);
    // document.querySelector(".modal-overlay").classList.add("active");
  }
  
  function closeModal() {
    document.querySelector(".modal").classList.remove("active");
    // document.querySelector(".modal-overlay").classList.remove("active");
  }
  
  // Add new task to the board
  function addNewTask() {
    const title = document.getElementById("taskTitle").value;
    const description = document.getElementById("taskDescription").value;
  
    if (!title || !description) {
      alert("Please fill in both fields!");
      return;
    }
  
    const newTask = document.createElement("div");
    newTask.classList.add("task");
    newTask.setAttribute("draggable", "true");
    newTask.setAttribute("ondragstart", "drag(event)");
  
    const taskContent = `
      <p><span>${title}</span></p>
      <p class="started"></p>
    `;
    newTask.innerHTML = taskContent;
  
    document.getElementById("todo").appendChild(newTask);
    closeModal();
  }
  