// Auto-set today's date in record form
document.addEventListener("DOMContentLoaded", () => {
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;
  }

  // Handle form submit
  const form = document.getElementById("wasteForm");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      saveRecord();
    });
  }

  // Load records in view.html
  if (document.getElementById("recordsTable")) {
    loadRecords();
  }

  // Load summary in summary.html
  if (document.getElementById("summaryChart")) {
    loadSummary();
  }
});

// Save to localStorage
function saveRecord() {
  let type = document.getElementById("type").value;
  if (type === "Other") {
    type = document.getElementById("otherType").value.trim();
    if (!type) {
      alert("Please enter a waste type.");
      return;
    }
  }

  const amount = document.getElementById("amount").value;
  const unit = document.getElementById("unit").value;
  const date = document.getElementById("date").value;

  let category = "Non-Hazardous";
  if (["Amalgam", "Sharps", "Chemical Waste"].includes(type)) {
    category = "Hazardous";
  }

  const newRecord = { type, amount: `${amount} ${unit}`, date, category };

  let records = JSON.parse(localStorage.getItem("records")) || [];
  records.push(newRecord);
  localStorage.setItem("records", JSON.stringify(records));

  alert("Record saved!");
  document.getElementById("wasteForm").reset();
  document.getElementById("otherType").style.display = "none"; // hide after save
}

// Load records into table
function loadRecords() {
  const records = JSON.parse(localStorage.getItem("records")) || [];
  const tbody = document.querySelector("#recordsTable tbody");
  tbody.innerHTML = "";

  records.forEach(r => {
    const row = `<tr>
      <td>${r.type}</td>
      <td>${r.amount}</td>
      <td>${r.date}</td>
      <td>${r.category}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

// Load summary with Chart.js
function loadSummary() {
  const records = JSON.parse(localStorage.getItem("records")) || [];
  const totals = {};

  // Loop through records dynamically
  records.forEach(r => {
    if (!totals[r.type]) {
      totals[r.type] = 0;
    }
    totals[r.type] += parseInt(r.amount);
  });

  // Text summary
  let summaryHTML = "";
  for (let type in totals) {
    summaryHTML += `<p>${type}: ${totals[type]}</p>`;
  }
  document.getElementById("summaryText").innerHTML = summaryHTML;

  // Chart
  const ctx = document.getElementById("summaryChart").getContext("2d");
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: Object.keys(totals),
      datasets: [{
        label: "Waste Records",
        data: Object.values(totals),
        backgroundColor: [
          "#FFEC6A",  // Maize
          "#007C40",  // Dark spring green
          "#004923",  // Pakistan green
          "#57b586ff",  // Gray
          "#FAEEBA"   // Extra (for new/other types)
        ]
      }]
   },
    options: {
      plugins: {
        legend: {
          display: false // <--- Add this line to hide the legend
        }
      }
    }
  });
}

// Reset records
function resetRecords() {
  if (confirm("Are you sure you want to delete all records?")) {
    localStorage.removeItem("records"); 
    loadRecords(); // refresh the table to show empty
    alert("All records have been cleared!");
  }
}

function checkOtherOption(select) {
  const otherInput = document.getElementById("otherType");
  if (select.value === "Other") {
    otherInput.style.display = "block";
    otherInput.required = true;
  } else {
    otherInput.style.display = "none";
    otherInput.required = false;
  }
}