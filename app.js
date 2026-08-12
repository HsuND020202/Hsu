// ========================================
// HsuMoney - app.js
// ========================================

let balances = {
    cash: 0,
    kbzpay: 0,
    wave: 0,
    agent: 0,
    merchant: 0,
    cbpay: 0,
    ayapay: 0
};

let totalProfit = 0;
let transactions = [];
let voucherNo = 1;


// ========================================
// STORAGE
// ========================================

function saveData() {
    localStorage.setItem("hsuBalances", JSON.stringify(balances));
    localStorage.setItem("hsuProfit", totalProfit);
    localStorage.setItem("hsuTransactions", JSON.stringify(transactions));
    localStorage.setItem("hsuVoucherNo", voucherNo);
}


function loadData() {

    const b = localStorage.getItem("hsuBalances");
    const p = localStorage.getItem("hsuProfit");
    const t = localStorage.getItem("hsuTransactions");
    const v = localStorage.getItem("hsuVoucherNo");

    if (b) {
        balances = JSON.parse(b);
    }

    if (p) {
        totalProfit = Number(p);
    }

    if (t) {
        transactions = JSON.parse(t);
    }

    if (v) {
        voucherNo = Number(v);
    }

    updateDisplay();
    renderTransactions();
}


// ========================================
// MONEY FORMAT
// ========================================

function money(number) {
    return Number(number || 0).toLocaleString() + " Ks";
}


// ========================================
// DISPLAY BALANCE
// ========================================

function setBalance(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.textContent = money(value);
    }
}


function updateDisplay() {

    setBalance("cashBalance", balances.cash);
    setBalance("kpayBalance", balances.kbzpay);
    setBalance("kbzpayBalance", balances.kbzpay);

    setBalance("waveBalance", balances.wave);
    setBalance("agentBalance", balances.agent);
    setBalance("waveAgentBalance", balances.agent);

    setBalance("merchantBalance", balances.merchant);
    setBalance("merchantBalance", balances.merchant);

    setBalance("cbpayBalance", balances.cbpay);
    setBalance("ayapayBalance", balances.ayapay);

    const total =
        balances.cash +
        balances.kbzpay +
        balances.wave +
        balances.agent +
        balances.merchant +
        balances.cbpay +
        balances.ayapay;

    setBalance("totalBalance", total);
    setBalance("profitBalance", totalProfit);
}


// ========================================
// WALLET FUNCTIONS
// ========================================

function add(wallet, amount) {
    balances[wallet] += Number(amount);
}


function remove(wallet, amount) {
    balances[wallet] -= Number(amount);
}
// ========================================
// TRANSACTION BALANCE
// Fee = Profit only
// Wallet Balance = Amount only
// ========================================

function updateBalances(type, amount, fee, feeMode) {

    amount = Number(amount || 0);
    fee = Number(fee || 0);

    switch (type) {

        // Cash -> KBZPay
        case "Cash ➜ KBZPay":
            remove("cash", amount);
            add("kbzpay", amount);
            break;

        // KBZPay -> Cash
        case "KBZPay ➜ Cash":
            remove("kbzpay", amount);
            add("cash", amount);
            break;

        // Cash -> Wave
        case "Cash ➜ Wave":
            remove("cash", amount);
            add("wave", amount);
            break;

        // Wave -> Cash
        case "Wave ➜ Cash":
            remove("wave", amount);
            add("cash", amount);
            break;

        // Cash -> Wave Agent
        case "Cash ➜ Wave Agent":
            remove("cash", amount);
            add("agent", amount);
            break;

        // Wave Agent -> Cash
        case "Wave Agent ➜ Cash":
            remove("agent", amount);
            add("cash", amount);
            break;

        // Cash -> KPay Merchant
        case "Cash ➜ KPay Merchant":
            remove("cash", amount);
            add("merchant", amount);
            break;

        // KPay Merchant -> Cash
        case "KPay Merchant ➜ Cash":
            remove("merchant", amount);
            add("cash", amount);
            break;

        // Cash -> CB Pay
        case "Cash ➜ CB Pay":
            remove("cash", amount);
            add("cbpay", amount);
            break;

        // CB Pay -> Cash
        case "CB Pay ➜ Cash":
            remove("cbpay", amount);
            add("cash", amount);
            break;

        // Cash -> AYA Pay
        case "Cash ➜ AYA Pay":
            remove("cash", amount);
            add("ayapay", amount);
            break;

        // AYA Pay -> Cash
        case "AYA Pay ➜ Cash":
            remove("ayapay", amount);
            add("cash", amount);
            break;
    }
}

// ===============================
// SAVE TRANSACTION
// ========================================

function saveTransaction() {

    const customer =
        document.getElementById("customerName")?.value.trim() || "";

    const phone =
        document.getElementById("phone")?.value.trim() || "";

    const amount =
        Number(document.getElementById("amount")?.value || 0);

    const fee =
        Number(document.getElementById("fee")?.value || 0);

    const type =
        document.getElementById("transactionType")?.value || "";

    const note =
        document.getElementById("note")?.value.trim() || "";

    const feeMode =
        document.getElementById("feeMode")?.value || "separate";


    if (!customer || !phone || amount <= 0 || !type) {

        alert("Customer, Phone, Amount နှင့် Transaction Type ဖြည့်ပါ။");

        return;
    }


    // ========================================
    // EDIT EXISTING TRANSACTION
    // ========================================

    if (window.editingTransactionId) {

        const index = transactions.findIndex(function (item) {
            return item.id === window.editingTransactionId;
        });

        if (index !== -1) {

            const oldItem = transactions[index];

            // အဟောင်း Transaction ကို Balance မှ ပြန်ဖျက်
            reverseTransaction(oldItem);

            // အဟောင်း Fee ကို Profit မှ ပြန်နုတ်
            totalProfit -= Number(oldItem.fee || 0);


            // အသစ် Transaction Balance
            updateBalances(
                type,
                amount,
                fee,
                feeMode
            );

            // အသစ် Fee
            totalProfit += fee;


            // အဟောင်းကိုပဲ Update
            transactions[index] = {

                voucher: oldItem.voucher,

                id: oldItem.id,

                customer: customer,

                phone: phone,

                amount: amount,

                fee: fee,

                feeMode: feeMode,

                type: type,

                note: note,

                date: new Date().toISOString()
            };


            // Edit mode ပြန်ပိတ်
            window.editingTransactionId = null;


            saveData();

            updateDisplay();

            renderTransactions();
  
            updateDashboard();


            alert("Transaction Updated Successfully!");

        }

    }

    // ========================================
    // NEW TRANSACTION
    // ========================================

    else {

        updateBalances(
            type,
            amount,
            fee,
            feeMode
        );


        totalProfit += fee;


        const transaction = {

            voucher:
                "HM-" +
                String(voucherNo).padStart(6, "0"),

            id: Date.now(),

            customer: customer,

            phone: phone,

            amount: amount,

            fee: fee,

            feeMode: feeMode,

            type: type,

            note: note,

            date: new Date().toISOString()
        };


        transactions.push(transaction);

        voucherNo++;


        saveData();

        updateDisplay();

        renderTransactions();

        updateDashboard();


        alert("Transaction Saved Successfully!");
    }


    // ========================================
    // CLEAR FORM
    // ========================================

    const fields = [
        "customerName",
        "phone",
        "amount",
        "fee",
        "note"
    ];


    fields.forEach(function(id) {

        const element =
            document.getElementById(id);

        if (element) {
            element.value = "";
        }

    });

}


// ========================================
// TRANSACTION HISTORY
// ========================================

function renderTransactions() {

    const history =
        document.getElementById("transactionHistory");

    const summary =
        document.getElementById("customerSummary");

    if (!history) return;


    const searchBox =
        document.getElementById("searchTransaction");

    const dateBox =
        document.getElementById("historyDate");


    const keyword =
        searchBox?.value.toLowerCase().trim() || "";

    const selectedDate =
        dateBox?.value || "";


    let filtered = transactions.filter(function(item) {

        const matchSearch =
            !keyword ||
            String(item.customer || "")
                .toLowerCase()
                .includes(keyword) ||
            String(item.phone || "")
                .toLowerCase()
                .includes(keyword) ||
            String(item.voucher || "")
                .toLowerCase()
                .includes(keyword);


        let matchDate = true;

        if (selectedDate) {

            const itemDate =
                new Date(item.date);

            const year =
                itemDate.getFullYear();

            const month =
                String(itemDate.getMonth() + 1)
                    .padStart(2, "0");

            const day =
                String(itemDate.getDate())
                    .padStart(2, "0");

            const itemDateText =
                `${year}-${month}-${day}`;

            matchDate =
                itemDateText === selectedDate;
        }


        return matchSearch && matchDate;
    });


    // ========================================
    // CUSTOMER SUMMARY
    // ========================================

    let customerTotal = 0;
    let customerFee = 0;


    filtered.forEach(function(item) {

        customerTotal +=
            Number(item.amount || 0);

        customerFee +=
            Number(item.fee || 0);

    });


    if (summary) {

        if (filtered.length === 0) {

            summary.innerHTML = "";

        } else {

            summary.innerHTML = `
                <div class="customer-summary">

                    <strong>
                        👤 Customer Summary
                    </strong>

                    <p>
                        Transactions:
                        <strong>
                            ${filtered.length}
                        </strong>
                    </p>

                    <p>
                        Total Amount:
                        <strong>
                            ${money(customerTotal)}
                        </strong>
                    </p>

                    <p>
                        Total Fee:
                        <strong>
                            ${money(customerFee)}
                        </strong>
                    </p>

                </div>
            `;
        }
    }


    // ========================================
    // NO RESULT
    // ========================================

    if (filtered.length === 0) {

        history.innerHTML =
            "<p>No matching transactions.</p>";

        return;
    }


    history.innerHTML = "";


    // ========================================
    // TRANSACTION LIST
    // ========================================

    filtered
        .slice()
        .reverse()
        .forEach(function(item) {

            const div =
                document.createElement("div");

            div.className =
                "transaction-item";


            div.innerHTML = `

                <div>
                    <strong>
                        ${item.voucher}
                    </strong>
                </div>

                <div>
                    ${item.type}
                </div>

                <div>
                    Customer:
                    ${item.customer}
                </div>

                <div>
                    Phone:
                    ${item.phone}
                </div>

                <div>
                    Amount:
                    ${money(item.amount)}
                </div>

                <div>
                    Fee:
                    ${money(item.fee)}
                </div>

                <div>
                    ${
                        item.feeMode === "deduct"
                        ? "Fee Mode: B - Fee နှုတ်ပေး"
                        : "Fee Mode: A - Fee သီးသန့်ယူ"
                    }
                </div>

                <div>
                    ${item.note || ""}
                </div>

                <small>
                    ${item.date}
                </small>

                <br><br>

                <button
                    onclick="editTransaction(${item.id})">
                    ✏️ Edit
                </button>

                <button
                    onclick="deleteTransaction(${item.id})">
                    🗑️ Delete
                </button>
                <button
    onclick="showReceipt(${item.id})">
    🧾 Receipt
</button>

                <hr>
            `;


            history.appendChild(div);
        });
}


// ========================================
// DELETE TRANSACTION
// ========================================

function deleteTransaction(id) {

    const index =
        transactions.findIndex(
            item => item.id === id
        );


    if (index === -1) {
        return;
    }


    const item =
        transactions[index];


    // Reverse balance
    reverseTransaction(item);


    // Reverse profit
    totalProfit -= Number(item.fee);


    // Remove history
    transactions.splice(index, 1);


    saveData();

    updateDisplay();

    renderTransactions();
    
}

// ========================================
// REVERSE TRANSACTION
// Wallet = Amount only
// Fee = Profit only
// ========================================

function reverseTransaction(item) {

    const amount = Number(item.amount || 0);

    switch (item.type) {

        // Cash -> KBZPay
        case "Cash ➜ KBZPay":
            add("cash", amount);
            remove("kbzpay", amount);
            break;

        // KBZPay -> Cash
        case "KBZPay ➜ Cash":
            add("kbzpay", amount);
            remove("cash", amount);
            break;

        // Cash -> Wave
        case "Cash ➜ Wave":
            add("cash", amount);
            remove("wave", amount);
            break;

        // Wave -> Cash
        case "Wave ➜ Cash":
            add("wave", amount);
            remove("cash", amount);
            break;

        // Cash -> Wave Agent
        case "Cash ➜ Wave Agent":
            add("cash", amount);
            remove("agent", amount);
            break;

        // Wave Agent -> Cash
        case "Wave Agent ➜ Cash":
            add("agent", amount);
            remove("cash", amount);
            break;

        // Cash -> KPay Merchant
        case "Cash ➜ KPay Merchant":
            add("cash", amount);
            remove("merchant", amount);
            break;

        // KPay Merchant -> Cash
        case "KPay Merchant ➜ Cash":
            add("merchant", amount);
            remove("cash", amount);
            break;

        // Cash -> CB Pay
        case "Cash ➜ CB Pay":
            add("cash", amount);
            remove("cbpay", amount);
            break;

        // CB Pay -> Cash
        case "CB Pay ➜ Cash":
            add("cbpay", amount);
            remove("cash", amount);
            break;

        // Cash -> AYA Pay
        case "Cash ➜ AYA Pay":
            add("cash", amount);
            remove("ayapay", amount);
            break;

        // AYA Pay -> Cash
        case "AYA Pay ➜ Cash":
            add("ayapay", amount);
            remove("cash", amount);
            break;
    }
}


// ========================================
// START APP
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadData();


        const saveBtn =
            document.getElementById("saveBtn");


        if (saveBtn) {

            saveBtn.addEventListener(
                "click",
                saveTransaction
            );
        }

    }
);
document.addEventListener("DOMContentLoaded", function () {

    const searchBox =
        document.getElementById("searchTransaction");

    if (searchBox) {
        searchBox.addEventListener("input", function () {

            const keyword =
                searchBox.value.toLowerCase().trim();

            const history =
                document.getElementById("transactionHistory");

            if (!history) return;

            const filtered =
                transactions.filter(function (item) {

                    return (
                        item.customer.toLowerCase().includes(keyword) ||
                        item.phone.toLowerCase().includes(keyword) ||
                        item.voucher.toLowerCase().includes(keyword)
                    );
                });

            history.innerHTML = "";

            filtered.slice().reverse().forEach(function (item) {

                const div =
                    document.createElement("div");

                div.className = "transaction-item";

                div.innerHTML = `
                    <strong>${item.voucher}</strong><br>
                    ${item.type}<br>
                    Customer: ${item.customer}<br>
                    Phone: ${item.phone}<br>
                    Amount: ${Number(item.amount).toLocaleString()} Ks<br>
                    Fee: ${Number(item.fee).toLocaleString()} Ks<br>
                    <small>${item.date}</small>
                    <hr>
                `;

                history.appendChild(div);
            });
        });
    }
});
function editTransaction(id) {

    const item = transactions.find(function (t) {
        return t.id === id;
    });

    if (!item) {
        return;
    }

    const customer = document.getElementById("customerName");
    const phone = document.getElementById("phone");
    const amount = document.getElementById("amount");
    const fee = document.getElementById("fee");
    const type = document.getElementById("transactionType");
    const note = document.getElementById("note");
    const feeMode = document.getElementById("feeMode");

    if (customer) customer.value = item.customer;
    if (phone) phone.value = item.phone;
    if (amount) amount.value = item.amount;
    if (fee) fee.value = item.fee;
    if (type) type.value = item.type;
    if (note) note.value = item.note || "";

    if (feeMode) {
        feeMode.value = item.feeMode || "separate";
    }

    window.editingTransactionId = id;

    alert("အချက်အလက်တွေ Form ထဲ ပြန်ရောက်ပါပြီ။");
}  
function showReport(type) {

    const result =
        document.getElementById("reportResult");

    if (!result) return;

    const now = new Date();

    let list = transactions.filter(function (item) {

        const date = new Date(item.date);

        if (type === "today") {

            return (
                date.toDateString() ===
                now.toDateString()
            );
        }

        if (type === "month") {

            return (
                date.getMonth() === now.getMonth() &&
                date.getFullYear() === now.getFullYear()
            );
        }

        return true;
    });


    let totalAmount = 0;
    let totalFee = 0;

    list.forEach(function (item) {

        totalAmount += Number(item.amount || 0);
        totalFee += Number(item.fee || 0);

    });


    result.innerHTML = `
        <div class="report-card">

            <h3>
                ${
                    type === "today"
                    ? "📅 Today Report"
                    : type === "month"
                    ? "📆 This Month Report"
                    : "📋 All Transactions"
                }
            </h3>

            <p>
                Transactions:
                <strong>${list.length}</strong>
            </p>

            <p>
                Total Amount:
                <strong>
                    ${totalAmount.toLocaleString()} Ks
                </strong>
            </p>

            <p>
                Total Fee / Profit:
                <strong>
                    ${totalFee.toLocaleString()} Ks
                </strong>
            </p>

        </div>
    `;
}


document.addEventListener(
    "DOMContentLoaded",
    function () {

        const todayBtn =
            document.getElementById("todayReportBtn");

        const monthBtn =
            document.getElementById("monthReportBtn");

        const allBtn =
            document.getElementById("allReportBtn");


        if (todayBtn) {

            todayBtn.addEventListener(
                "click",
                function () {
                    showReport("today");
                }
            );

        }


        if (monthBtn) {

            monthBtn.addEventListener(
                "click",
                function () {
                    showReport("month");
                }
            );

        }


        if (allBtn) {

            allBtn.addEventListener(
                "click",
                function () {
                    showReport("all");
                }
            );

        }

    }
);
document.addEventListener("DOMContentLoaded", function () {

    const searchBox =
        document.getElementById("searchTransaction");

    const dateBox =
        document.getElementById("historyDate");

    const clearBtn =
        document.getElementById("clearHistoryFilter");


    if (searchBox) {
        searchBox.addEventListener("input", function () {
            renderTransactions();
        });
    }


    if (dateBox) {
        dateBox.addEventListener("change", function () {
            renderTransactions();
        });
    }


    if (clearBtn) {
        clearBtn.addEventListener("click", function () {

            if (searchBox) {
                searchBox.value = "";
            }

            if (dateBox) {
                dateBox.value = "";
            }

            renderTransactions();
        });
    }

});
function showReceipt(id) {

    const item = transactions.find(function (t) {
        return t.id === id;
    });

    if (!item) return;

    const receiptArea =
        document.getElementById("receiptArea");

    if (!receiptArea) return;

    receiptArea.innerHTML = `
        <div class="receipt">

            <h2>🧾 HsuMoney</h2>

            <hr>

            <p>
                <strong>Voucher:</strong>
                ${item.voucher}
            </p>

            <p>
                <strong>Date:</strong>
                ${item.date}
            </p>

            <p>
                <strong>Customer:</strong>
                ${item.customer}
            </p>

            <p>
                <strong>Phone:</strong>
                ${item.phone}
            </p>

            <p>
                <strong>Transaction:</strong>
                ${item.type}
            </p>

            <p>
                <strong>Amount:</strong>
                ${money(item.amount)}
            </p>

            <p>
                <strong>Fee:</strong>
                ${money(item.fee)}
            </p>

            <p>
                <strong>Fee Mode:</strong>
                ${
                    item.feeMode === "deduct"
                    ? "B - Fee နှုတ်ပေး"
                    : "A - Fee သီးသန့်ယူ"
                }
            </p>

            ${
                item.note
                ? `<p><strong>Note:</strong> ${item.note}</p>`
                : ""
            }

            <hr>

            <button onclick="window.print()">
                🖨️ Print
            </button>

            <button onclick="
                document.getElementById('receiptArea').innerHTML = '';
            ">
                ❌ Close
            </button>

        </div>
    `;
}
// ========================================
// ========================================
// BACKUP & RESTORE - NO DOWNLOAD
// ========================================

function createBackup() {

    const backupData = {
        balances: balances,
        totalProfit: totalProfit,
        transactions: transactions,
        voucherNo: voucherNo,
        backupDate: new Date().toLocaleString()
    };

    const json =
        JSON.stringify(backupData, null, 2);

    const area =
        document.getElementById("backupText");

    if (area) {
        area.value = json;
    }

    const box =
        document.getElementById("backupBox");

    if (box) {
        box.style.display = "block";
    }
}


function copyBackup() {

    const area =
        document.getElementById("backupText");

    if (!area) return;

    area.select();

    navigator.clipboard.writeText(area.value)
        .then(function () {

            alert(
                "✅ Backup Data Copy ကူးပြီးပါပြီ။"
            );

        })
        .catch(function () {

            document.execCommand("copy");

            alert(
                "✅ Backup Data Copy ကူးပြီးပါပြီ။"
            );

        });
}


function closeBackup() {

    const box =
        document.getElementById("backupBox");

    if (box) {
        box.style.display = "none";
    }
}
function openRestore() {

    const box =
        document.getElementById("restoreBox");

    if (box) {
        box.style.display = "block";
    }
}


function closeRestore() {

    const box =
        document.getElementById("restoreBox");

    if (box) {
        box.style.display = "none";
    }
}


function restoreFromText() {

    const area =
        document.getElementById("restoreText");

    if (!area) return;

    const text =
        area.value.trim();

    if (!text) {

        alert("❌ Backup Data ထည့်ပါ။");

        return;
    }


    try {

        const data =
            JSON.parse(text);


        if (
            !data.balances ||
            !Array.isArray(data.transactions)
        ) {

            alert(
                "❌ Backup Data မမှန်ပါ။"
            );

            return;
        }


        const ok =
            confirm(
                "⚠️ လက်ရှိ Data ကို Backup Data နဲ့ အစားထိုးမလား?"
            );


        if (!ok) return;


        balances =
            data.balances;

        totalProfit =
            Number(
                data.totalProfit || 0
            );

        transactions =
            data.transactions;

        voucherNo =
            Number(
                data.voucherNo || 1
            );


        saveData();

        updateDisplay();

        renderTransactions();


        alert(
            "✅ Restore အောင်မြင်ပါပြီ။"
        );


        area.value = "";

        closeRestore();


    } catch (error) {

        alert(
            "❌ Backup Data ဖတ်လို့မရပါ။"
        );

        console.error(error);
    }
}

// ========================================
// OPENING BALANCE
// ========================================

document.addEventListener("DOMContentLoaded", function () {

    const openingBtn =
        document.getElementById("openingBalanceBtn");

    const editBtn =
        document.getElementById("editOpeningBalanceBtn");


    if (!openingBtn) return;


    // ========================================
    // CHECK SAVED OPENING BALANCE
    // ========================================

    function checkOpeningBalance() {

        const saved =
            localStorage.getItem("hsuOpeningBalanceSaved");

        if (saved === "yes") {

            openingBtn.disabled = true;

            openingBtn.textContent =
                "🔒 Opening Balance Saved";
        }
    }


    // ========================================
    // SAVE OPENING BALANCE
    // ========================================

    openingBtn.addEventListener("click", function () {

        const cash =
            Number(
                document.getElementById("openingCash")?.value || 0
            );

        const kpay =
            Number(
                document.getElementById("openingKpay")?.value || 0
            );

        const wave =
            Number(
                document.getElementById("openingWave")?.value || 0
            );

        const agent =
            Number(
                document.getElementById("openingAgent")?.value || 0
            );

        const merchant =
            Number(
                document.getElementById("openingMerchant")?.value || 0
            );

        const cbpay =
            Number(
                document.getElementById("openingCbpay")?.value || 0
            );

        const ayapay =
            Number(
                document.getElementById("openingAyapay")?.value || 0
            );


        // ========================================
        // SAVE BALANCES
        // ========================================

        balances.cash = cash;
        balances.kbzpay = kpay;
        balances.wave = wave;
        balances.agent = agent;
        balances.merchant = merchant;
        balances.cbpay = cbpay;
        balances.ayapay = ayapay;


        // Save data
        saveData();

        updateDisplay();

        if (typeof updateDashboard === "function") {
            updateDashboard();
        }


        // Lock Opening Balance
        localStorage.setItem(
            "hsuOpeningBalanceSaved",
            "yes"
        );


        openingBtn.disabled = true;

        openingBtn.textContent =
            "🔒 Opening Balance Saved";


        alert(
            "✅ Opening Balance သိမ်းပြီးပါပြီ။"
        );

    });


    // ========================================
    // EDIT OPENING BALANCE
    // ========================================

    if (editBtn) {

        editBtn.addEventListener(
            "click",
            function () {

                openingBtn.disabled = false;

                openingBtn.textContent =
                    "💾 Save Opening Balance";


                alert(
                    "✏️ Opening Balance ပြန်ပြင်လို့ရပါပြီ။"
                );

            }
        );

    }


    // ========================================
    // START CHECK
    // ========================================

    checkOpeningBalance();

});
// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {

    const totalBalance =
        document.getElementById("dashboardTotalBalance");

    const profit =
        document.getElementById("dashboardProfit");

    const todayCount =
        document.getElementById("todayTransactionCount");

    const todayFee =
        document.getElementById("todayFee");

    const monthCount =
        document.getElementById("monthTransactionCount");

    const monthFee =
        document.getElementById("monthFee");


    const now = new Date();

    let todayTransactions = [];
    let monthTransactions = [];


    transactions.forEach(function (item) {

        const date =
            new Date(item.date);


        // Today
        if (
            date.toDateString() ===
            now.toDateString()
        ) {
            todayTransactions.push(item);
        }


        // This Month
        if (
            date.getMonth() === now.getMonth() &&
            date.getFullYear() === now.getFullYear()
        ) {
            monthTransactions.push(item);
        }

    });


    let todayTotalFee = 0;

    todayTransactions.forEach(function (item) {
        todayTotalFee += Number(item.fee || 0);
    });


    let monthTotalFee = 0;

    monthTransactions.forEach(function (item) {
        monthTotalFee += Number(item.fee || 0);
    });


    const total =
        balances.cash +
        balances.kbzpay +
        balances.wave +
        balances.agent +
        balances.merchant +
        balances.cbpay +
        balances.ayapay;


    if (totalBalance) {
        totalBalance.textContent =
            money(total);
    }


    if (profit) {
        profit.textContent =
            money(totalProfit);
    }


    if (todayCount) {
        todayCount.textContent =
            todayTransactions.length;
    }


    if (todayFee) {
        todayFee.textContent =
            money(todayTotalFee);
    }


    if (monthCount) {
        monthCount.textContent =
            monthTransactions.length;
    }


    if (monthFee) {
        monthFee.textContent =
            money(monthTotalFee);
    }

}
// ========================================
// WALLET BALANCE EDIT
// ========================================

function editWallet(wallet, name) {

    const current =
        Number(balances[wallet] || 0);

    const input =
        prompt(
            `✏️ ${name}\n\nလက်ရှိ Balance: ${money(current)}\n\nအသစ်ထည့်မည့် Balance ကို ရိုက်ပါ။`,
            current
        );

    if (input === null) {
        return;
    }

    const newBalance =
        Number(input);

    if (!Number.isFinite(newBalance) || newBalance < 0) {

        alert("❌ မှန်ကန်တဲ့ ငွေပမာဏ ထည့်ပါ။");

        return;
    }

    balances[wallet] = newBalance;

    saveData();

    updateDisplay();

    updateDashboard();

    alert(
        `✅ ${name} Balance ပြောင်းပြီးပါပြီ။\n\n${money(newBalance)}`
    );
}
