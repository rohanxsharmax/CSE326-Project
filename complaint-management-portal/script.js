// This project uses localStorage instead of a database.
// Complaints are saved in the browser after they are submitted.

const storageKey = "simpleComplaintPortal";

const exampleComplaints = [
  {
    id: "CMP-1001",
    name: "Aarav Mehta",
    email: "aarav@example.com",
    category: "Service",
    priority: "High",
    subject: "Service request is delayed",
    description: "My service request has not been updated.",
    attachment: "",
    status: "In Progress",
    date: "2026-11-02"
  },
  {
    id: "CMP-1002",
    name: "Meera Kapoor",
    email: "meera@example.com",
    category: "Billing",
    priority: "Medium",
    subject: "Incorrect amount on invoice",
    description: "The invoice includes an extra charge.",
    attachment: "invoice.pdf",
    status: "Open",
    date: "2026-11-04"
  }
];

let complaints = JSON.parse(localStorage.getItem(storageKey)) || exampleComplaints;

const form = document.querySelector("#complaintForm");
const tableBody = document.querySelector("#complaintsBody");
const searchInput = document.querySelector("#searchInput");
const statusFilter = document.querySelector("#statusFilter");

function saveComplaints() {
  localStorage.setItem(storageKey, JSON.stringify(complaints));
}

function statusClass(status) {
  return status.toLowerCase().replace(" ", "-");
}

function updateDashboard() {
  document.querySelector("#totalCount").textContent = complaints.length;
  document.querySelector("#openCount").textContent = complaints.filter(item => item.status === "Open").length;
  document.querySelector("#progressCount").textContent = complaints.filter(item => item.status === "In Progress").length;
  document.querySelector("#resolvedCount").textContent = complaints.filter(item => item.status === "Resolved").length;
}

function getVisibleComplaints() {
  const searchText = searchInput.value.toLowerCase();
  const selectedStatus = statusFilter.value;

  return complaints.filter(item => {
    const matchesSearch = `${item.id} ${item.name} ${item.subject}`.toLowerCase().includes(searchText);
    const matchesStatus = selectedStatus === "All" || item.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });
}

function showComplaints() {
  const visibleComplaints = getVisibleComplaints();
  tableBody.innerHTML = "";
  document.querySelector("#emptyMessage").hidden = visibleComplaints.length !== 0;

  visibleComplaints.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.id}</td>
      <td><strong>${item.subject}</strong><br><small>${item.name}</small></td>
      <td>${item.category}</td>
      <td>${item.priority}</td>
      <td><span class="status ${statusClass(item.status)}">${item.status}</span></td>
      <td>${item.date}</td>
      <td>
        <select class="status-select" data-id="${item.id}" aria-label="Update ${item.id}">
          <option ${item.status === "Open" ? "selected" : ""}>Open</option>
          <option ${item.status === "In Progress" ? "selected" : ""}>In Progress</option>
          <option ${item.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function newTrackingId() {
  return `CMP-${Date.now().toString().slice(-6)}`;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const data = new FormData(form);
  const file = document.querySelector("#attachment").files[0];
  const complaint = {
    id: newTrackingId(),
    name: data.get("name"),
    email: data.get("email"),
    category: data.get("category"),
    priority: data.get("priority"),
    subject: data.get("subject"),
    description: data.get("description"),
    attachment: file ? file.name : "",
    status: "Open",
    date: new Date().toLocaleDateString()
  };

  complaints.unshift(complaint);
  saveComplaints();
  updateDashboard();
  showComplaints();
  form.reset();
  document.querySelector("#formMessage").textContent = `Complaint submitted. Your tracking ID is ${complaint.id}.`;
});

searchInput.addEventListener("input", showComplaints);
statusFilter.addEventListener("change", showComplaints);

tableBody.addEventListener("change", event => {
  if (!event.target.classList.contains("status-select")) return;

  const complaint = complaints.find(item => item.id === event.target.dataset.id);
  complaint.status = event.target.value;
  saveComplaints();
  updateDashboard();
  showComplaints();
});

document.querySelector("#trackButton").addEventListener("click", () => {
  const trackingId = document.querySelector("#trackingInput").value.trim().toUpperCase();
  const result = document.querySelector("#trackingResult");
  const complaint = complaints.find(item => item.id === trackingId);

  if (complaint) {
    result.classList.remove("not-found");
    result.textContent = `${complaint.id}: ${complaint.subject} is ${complaint.status}.`;
  } else {
    result.classList.add("not-found");
    result.textContent = "Complaint not found. Please check the tracking ID.";
  }
});

saveComplaints();
updateDashboard();
showComplaints();
