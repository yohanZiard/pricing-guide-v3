const PASSCODE = "1234";
const VAT = 0.18;
const RETAIL_MARGIN = 0.35;
const LOCAL_RETAIL_MARGIN = 0.50;

const INSURANCE = 0.01;
const FREIGHT = 0.09;
const OTHER_IMPORT = 0.10;

const COMMODITIES = {
  "TOYS GENERAL": 0.40,
  "TOYS DOLLS": 0.40,
  "TOYS SAFTA INDIA": 0.20,
  "INSTANT COFFEE": 0.85,
  "SLIME": 0.20
};

function unlock() {
  if (document.getElementById("passcode").value === PASSCODE) {
    document.getElementById("gate").style.display = "none";
    document.getElementById("app").classList.remove("hidden");
    addRow();
  } else {
    alert("Wrong passcode");
  }
}

function calculate(row) {

  const mode = row.querySelector(".mode").value;
  const ourMarginInput = row.querySelector(".ourMargin").value;
  const ourMargin = isNaN(parseFloat(ourMarginInput)) ? 0 : parseFloat(ourMarginInput) / 100;

  const totalCostCell = row.querySelector(".totalCost");
  const calcMRPCell = row.querySelector(".calcMRP");

  let totalCost = 0;

  if (mode === "Import") {

    const fob = parseFloat(row.querySelector(".fob").value);
    const exchange = parseFloat(row.querySelector(".exchange").value);
    const commodity = row.querySelector(".commodity").value;
    const costFactor = COMMODITIES[commodity];

    if (!isNaN(fob) && !isNaN(exchange)) {

      const cif = fob * (1 + INSURANCE + FREIGHT);
      const landing = cif * exchange;
      const duty = landing * costFactor;
      const other = landing * OTHER_IMPORT;

      totalCost = landing + duty + other;
      totalCostCell.textContent = totalCost.toFixed(2);

      const sellExVat = totalCost / (1 - ourMargin);
      const exVatConsumer = sellExVat / (1 - RETAIL_MARGIN);
      const calcMRP = exVatConsumer * (1 + VAT);

      calcMRPCell.textContent = calcMRP.toFixed(2);
    } else {
      totalCostCell.textContent = "";
      calcMRPCell.textContent = "";
    }

  } else {

    const supplier = parseFloat(row.querySelector(".supplierCost").value);
    const other = parseFloat(row.querySelector(".otherCost").value);

    if (!isNaN(supplier)) {

      totalCost = supplier + (isNaN(other) ? 0 : other);
      totalCostCell.textContent = totalCost.toFixed(2);

      const sellExVat = totalCost / (1 - ourMargin);
      const calcMRP = sellExVat / (1 - LOCAL_RETAIL_MARGIN);

      calcMRPCell.textContent = calcMRP.toFixed(2);
    } else {
      totalCostCell.textContent = "";
      calcMRPCell.textContent = "";
    }
  }

  calculateReverse(row, totalCost);
}

function calculateReverse(row, cost) {

  const reverseRow = row.nextElementSibling;
  if (!reverseRow || !reverseRow.classList.contains("reverse-row")) return;

  const finalMRPInput = reverseRow.querySelector(".finalMRP").value;
  if (finalMRPInput === "") return;

  const finalMRP = parseFloat(finalMRPInput);

  let discountInput = reverseRow.querySelector(".discount").value;
  let discount = isNaN(parseFloat(discountInput)) ? 0 : parseFloat(discountInput) / 100;

  const vatCustomer = reverseRow.querySelector(".vatToggle").checked;
  const mode = row.querySelector(".mode").value;

  let trueNet = 0;

  if (mode === "Import") {

    if (vatCustomer) {
      const exVat = finalMRP / (1 + VAT);
      trueNet = exVat * (1 - discount);
    } else {
      const grossAfterDiscount = finalMRP * (1 - discount);
      const vatPayable = grossAfterDiscount * VAT;
      trueNet = grossAfterDiscount - vatPayable;
    }

  } else {

    if (vatCustomer) {
      const exVat = finalMRP / (1 + VAT);
      trueNet = exVat * (1 - discount);
    } else {
      trueNet = finalMRP * (1 - discount);
    }
  }

  if (trueNet <= 0) return;

  const marginValue = trueNet - cost;
  const marginPct = (marginValue / trueNet) * 100;

  reverseRow.querySelector(".netSelling").textContent = trueNet.toFixed(2);
  reverseRow.querySelector(".reverseMarginValue").textContent = marginValue.toFixed(2);
  reverseRow.querySelector(".reverseMarginPct").textContent = marginPct.toFixed(2) + "%";
}

function toggleReverse(btn) {
  const row = btn.closest("tr");
  const reverseRow = row.nextElementSibling;
  reverseRow.classList.toggle("hidden");
}

function addRow() {

  const tbody = document.querySelector("#pricingTable tbody");

  const row = document.createElement("tr");
  row.innerHTML = `
    <td><input></td>
    <td>
      <select class="mode" onchange="calculate(this.closest('tr'))">
        <option>Import</option>
        <option>Local</option>
      </select>
    </td>
    <td>
      <select class="commodity" onchange="calculate(this.closest('tr'))">
        ${Object.keys(COMMODITIES).map(c => `<option>${c}</option>`).join("")}
      </select>
    </td>
    <td><input class="fob" oninput="calculate(this.closest('tr'))"></td>
    <td><input class="exchange" value="315" oninput="calculate(this.closest('tr'))"></td>
    <td><input class="supplierCost" oninput="calculate(this.closest('tr'))"></td>
    <td><input class="otherCost" oninput="calculate(this.closest('tr'))"></td>
    <td class="totalCost readonly"></td>
    <td><input class="ourMargin" value="30" oninput="calculate(this.closest('tr'))"></td>
    <td class="calcMRP readonly"></td>
    <td><input class="roundedMRP" oninput="calculate(this.closest('tr'))"></td>
    <td><button onclick="toggleReverse(this)">Open</button></td>
  `;

  const reverseRow = document.createElement("tr");
  reverseRow.classList.add("reverse-row", "hidden");
  reverseRow.innerHTML = `
    <td colspan="12">
      <div style="display:flex; gap:20px; align-items:center;">
        <div>
          Final MRP<br>
          <input class="finalMRP" oninput="calculate(this.closest('tr').previousElementSibling)">
        </div>
        <div>
          VAT Customer<br>
          <input type="checkbox" class="vatToggle" onchange="calculate(this.closest('tr').previousElementSibling)">
        </div>
        <div>
          Discount %<br>
          <input class="discount" oninput="calculate(this.closest('tr').previousElementSibling)">
        </div>
        <div>
          Net Selling<br>
          <span class="netSelling"></span>
        </div>
        <div>
          Margin Rs<br>
          <span class="reverseMarginValue"></span>
        </div>
        <div>
          Margin %<br>
          <span class="reverseMarginPct"></span>
        </div>
      </div>
    </td>
  `;

  tbody.appendChild(row);
  tbody.appendChild(reverseRow);
}

function exportCSV() {
  let csv = [];
  document.querySelectorAll("#pricingTable tr").forEach(row => {
    const cols = Array.from(row.querySelectorAll("input, select, span"))
      .map(el => el.value || el.textContent);
    csv.push(cols.join(","));
  });

  const blob = new Blob([csv.join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pricing_v4.csv";
  a.click();
}
