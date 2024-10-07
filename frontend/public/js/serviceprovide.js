function populateServiceTable() {
  const sampleData = [
      { sNo: 1, serviceType: "Plumbing", description: "Fix leaking faucet", date: "2024-10-07", time: "10:00 AM" },
      { sNo: 2, serviceType: "Electrical", description: "Install new light fixture", date: "2024-10-08", time: "1:00 PM" },
      { sNo: 3, serviceType: "Cleaning", description: "Clean living room carpet", date: "2024-10-09", time: "3:00 PM" }
  ];

  const tableBody = document.querySelector("tbody");
  tableBody.innerHTML = ""; // Clear any existing rows

  sampleData.forEach((service, index) => {
      const row = tableBody.insertRow();

      row.insertCell().textContent = service.sNo;
      row.insertCell().textContent = service.serviceType;
      row.insertCell().textContent = service.description;
      row.insertCell().textContent = service.date;
      row.insertCell().textContent = service.time;

      const actionsCell = row.insertCell();
      actionsCell.appendChild(createActionButtons(service, index));
  });

  // Add search functionality after rows are added
  addSearchFunctionality();
}

// Function to create Accept and Reject buttons
function createActionButtons(serviceId) {
  const div = document.createElement('div');

  const acceptButton = document.createElement('button');
  acceptButton.textContent = 'Accept';
  acceptButton.classList.add('btn', 'btn-success');
  acceptButton.addEventListener('click', () => handleAccept(serviceId));

  const rejectButton = document.createElement('button');
  rejectButton.textContent = 'Reject';
  rejectButton.classList.add('btn', 'btn-danger');
  rejectButton.addEventListener('click', () => handleReject(serviceId));

  div.appendChild(acceptButton);
  div.appendChild(rejectButton);

  return div;
}

// Search functionality
function addSearchFunctionality() {
  const search = document.getElementById('serviceSearch');
  const tableRows = document.querySelectorAll('tbody tr');

  search.addEventListener('input', () => {
      const searchValue = search.value.toLowerCase();
      tableRows.forEach((row) => {
          const rowData = row.textContent.toLowerCase();
          row.style.display = rowData.includes(searchValue) ? '' : 'none';
      });
  });
}

// Handle Accept/Reject actions
function handleAccept(serviceId) {
  console.log(`Accepted service with ID: ${serviceId}`);
  // Add your backend request logic here
}

function handleReject(serviceId) {
  console.log(`Rejected service with ID: ${serviceId}`);
  // Add your backend request logic here
}
window.onload = function() {
  populateServiceTable();
};