// ================= PASSCODE =================
const PASSCODE = "1234";

function unlock() {
  if (document.getElementById("passcode").value === PASSCODE) {
    document.getElementById("gate").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    addRow();
  } else {
    alert("Wrong passcode");
  }
}

// ================= CONSTANTS =================
const VAT = 0.18;
const RETAIL_MARGIN = 0.35;

const INSURANCE = 0.01;     // 1% of FOB
const FREIGHT = 0.09;       // 9% of FOB
const OTHER_IMPORT = 0.10;  // 10% of landing cost

// ================= COMMODITIES =================
const COMMODITIES = {
  "TOYS GENERAL": 0.40,
  "TOYS DOLLS": 0.40,
  "TOYS SAFTA INDIA": 0.20,
  "INSTANT COFFEE": 0.85,
  "SLIME": 0.20
};

// ================= CALCULATION =================
function calculate(row) {

  const fob = parseFloat(row.querySelector(".fob")?.value);
  const exchange = parseFloat(row.querySelector(".exchange")?.value);
  const ourMargin = parseFloat(row.querySelector(".ourMargin")?.value);
  const commodity = row.querySelector(".commodity")?.value;

  const costFactor = COMMODITIES[commodity];

  const totalCostCell = row.querySelector(".totalCost");
  const calcMRPCell = row.querySelector(".calcMRP");

  if (isNaN(fob) || isNaN(exchange)) {
    totalCostCell.textContent = "";
    calcMRPCell.textContent = "";
    return;
  }

  // CIF and landing
  const cif = fob * (1 + INSURANCE + FREIGHT);
  const landing = cif * exchange;
  const duty = landing * costFactor;
  const other = landing * OTHER_IMPORT;

  const totalCost = landing + duty + other;
  totalCostCell.textContent = totalCost.toFixed(2);

  // System MRP
  if (!isNaN(ourMargin)) {
    const m = ourMargin / 100;
    const sellExVat = totalCost * (1 + m);
    const exVatConsumer = sellExVat / (1 - RETAIL_MARGIN);
    const calcMRP = exVatConsumer * (1 + VAT);
    calcMRPCell.textContent = calcMRP.toFixed(2);
  } else {
    calcMRPCell.textContent = "";
  }
}

// ================= ROW =================
function addRow() {
  const tbody = document.querySelector("#pricingTable tbody");
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input></td>

    <td>
      <select class="commodity" onchange="calculate(this.closest('tr'))">
        ${Object.keys(COMMODITIES).map(c => `<option>${c}</option>`).join("")}
      </select>
    </td>

    <td><input class="fob" oninput="calculate(this.closest('tr'))"></td>

    <td><input class="exchange" value="315" oninput="calculate(this.closest('tr'))"></td>

    <td class="totalCost readonly"></td>

    <td><input class="ourMargin" value="30" oninput="calculate(this.closest('tr'))"></td>

    <td class="calcMRP readonly"></td>

    <td><input class="roundedMRP"></td>
  `;

  tbody.appendChild(row);
}

// ================= CSV =================
function exportCSV() {
  let csv = [];
  document.querySelectorAll("#pricingTable tr").forEach(row => {
    const cols = Array.from(row.children).map(td =>
      td.querySelector("input")?.value ||
      td.querySelector("select")?.value ||
      td.textContent
    );
    csv.push(cols.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pricing_v3.csv";
  a.click();
}
