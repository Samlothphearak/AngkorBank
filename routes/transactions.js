router.post("/process-payment", async (req, res) => {
    try {
        const { senderAccount, recipientAccount, amount } = req.body;

        // Validate input
        if (!senderAccount || !recipientAccount || amount <= 0) {
            return res.status(400).json({ error: "Invalid transaction data" });
        }

        const sender = await User.findOne({ accountNumber: senderAccount });
        const recipient = await User.findOne({ accountNumber: recipientAccount });

        if (!sender || !recipient) return res.status(404).json({ error: "User not found" });

        if (sender.balance < amount) return res.status(400).json({ error: "Insufficient funds" });

        // Deduct from sender and add to recipient
        sender.balance -= amount;
        recipient.balance += amount;

        await sender.save();
        await recipient.save();

        res.json({ message: "Transaction successful", senderBalance: sender.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});
