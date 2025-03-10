const modalBtn = document.querySelector(
  '.open-modal'
);
const closeBtn = document.querySelector(".close");

closeBtn.addEventListener("click", closeModal);


modalBtn.addEventListener('click', openModal);

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
