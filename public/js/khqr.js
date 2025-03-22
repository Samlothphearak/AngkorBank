document.getElementById("scanQR").addEventListener("click", async () => {
    const scannedData = prompt("Paste the scanned QR data here:");

    if (!scannedData) return alert("No data scanned!");

    try {
        const qrDetails = JSON.parse(scannedData);
        const senderAccount = "<%= user.accountNumber %>"; // Current user
        const recipientAccount = qrDetails.accountNumber;
        const amount = parseFloat(prompt("Enter amount to send:"));

        if (isNaN(amount) || amount <= 0) return alert("Invalid amount!");

        const response = await fetch("/transactions/process-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ senderAccount, recipientAccount, amount }),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Transaction successful!");
        } else {
            alert(result.error);
        }
    } catch (error) {
        console.error("Error processing payment:", error);
    }
});
