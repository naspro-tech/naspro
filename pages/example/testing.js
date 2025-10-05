<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Deposit Page</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; }
  .payment-options button { margin: 5px; padding: 10px 20px; cursor: pointer; }
  .channels, .amount-tags, #customAmount { margin-top: 20px; display: none; }
  .amount-tags button { margin: 3px; }
</style>
</head>
<body>

<h2>Select Payment Method</h2>
<div class="payment-options">
  <button onclick="showChannels('EasyPaisa')">EasyPaisa</button>
  <button onclick="showChannels('JazzCash')">JazzCash</button>
  <button onclick="showChannels('Bank Transfer')">Bank Transfer</button>
  <button onclick="showChannels('Nayapay')">Nayapay</button>
</div>

<div class="channels" id="channels">
  <h3>Select Channel</h3>
  <div id="channelButtons"></div>
</div>

<div class="amount-tags" id="amountTags">
  <h3>Select Amount</h3>
  <div>
    <button onclick="setAmount(200)">200</button>
    <button onclick="setAmount(500)">500</button>
    <button onclick="setAmount(1000)">1000</button>
    <button onclick="setAmount(1250)">1250</button>
  </div>
</div>

<div id="customAmount">
  <form id="depositForm" onsubmit="submitDeposit(event)">
    <label>Enter Amount (1 - 50000): </label>
    <input type="number" id="amount" min="1" max="50000" required>
    <button type="submit" id="submitBtn">Deposit</button>
  </form>
</div>

<script>
let selectedService = '';
let selectedChannel = '';

function showChannels(service) {
  selectedService = service;
  const channelDiv = document.getElementById('channels');
  const channelButtons = document.getElementById('channelButtons');

  channelButtons.innerHTML = '';

  let channels = [];
  // Define channels per service
  if (service === 'EasyPaisa') channels = ['Jeeway', 'Jeepay'];
  else if (service === 'JazzCash') channels = ['JazzChannel1', 'JazzChannel2'];
  else if (service === 'Bank Transfer') channels = ['BankA', 'BankB'];
  else if (service === 'Nayapay') channels = ['Nayapay1'];

  channels.forEach(channel => {
    const btn = document.createElement('button');
    btn.textContent = channel;
    btn.onclick = () => selectChannel(channel);
    channelButtons.appendChild(btn);
  });

  channelDiv.style.display = 'block';
  document.getElementById('amountTags').style.display = 'none';
  document.getElementById('customAmount').style.display = 'none';
}

function selectChannel(channel) {
  selectedChannel = channel;
  document.getElementById('amountTags').style.display = 'block';
  document.getElementById('customAmount').style.display = 'block';
  document.getElementById('amount').value = '';
}

function setAmount(value) {
  document.getElementById('amount').value = value;
}

function submitDeposit(event) {
  event.preventDefault();
  const amount = parseInt(document.getElementById('amount').value);

  if (!amount || amount < 1 || amount > 50000) {
    alert("Please enter a valid amount between 1 and 50,000.");
    return;
  }

  const redirectUrl = `https://naspropvt.vercel.app/pay?amount=${amount}&service=${encodeURIComponent(selectedChannel)}`;
  window.open(redirectUrl, "_blank");
}
</script>

</body>
</html>
