const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// 👉 buat ngecek apakah server udah nyala
app.get("/", (req, res) => {
    res.send("🚀 Lark integration server is running");
});

// --- Memory data untuk simulasi approval
let approvals = [];

// --- POST - Tambah data approval manual
app.post("/approval", (req, res) => {
    const { nama, approval_type } = req.body;

    const newApproval = {
        id: approvals.length + 1,
        nama,
        approval_type,
        created_at: new Date().toISOString(),
    };

    approvals.push(newApproval);
    res.status(201).json(newApproval);
});

// --- GET - Ambil semua data approval
app.get("/approval", (req, res) => {
    res.json(approvals);
});

// --- DELETE - Hapus semua data approval
app.delete("/approval", (req, res) => {
    approvals = [];
    res.json({ message: "Semua data berhasil dihapus" });
});

// --- DELETE by ID
app.delete("/approval/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const index = approvals.findIndex((approval) => approval.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "Data tidak ditemukan" });
    }

    approvals.splice(index, 1);
    res.json({ message: "Data berhasil dihapus" });
});

// --- 🌟 LARK CALLBACK (ini endpoint yang lo masukin di Lark Developer Console)
app.post("/lark/callback", (req, res) => {
    console.log("📩 Lark callback received:", req.body);
    const { challenge, type, event } = req.body;

    // STEP 1: URL VERIFICATION
    if (challenge) {
        console.log("✅ Lark verification challenge:", challenge);
        return res.json({ challenge }); // HARUS EXACT format ini
    }

    // STEP 2: HANDLE EVENT CALLBACK
    if (type === "event_callback" && event) {
        console.log("📢 Lark event received:", event);

        // contoh simulasi auto-create approval
        if (event.event_type === "im.message.receive_v1") {
            const message = event.event.message;
            if (message.content && message.content.includes("approval")) {
                const newApproval = {
                    id: approvals.length + 1,
                    nama: event.event.sender.sender_id.user_id || "Lark User",
                    approval_type: "Lark Request",
                    message: message.content,
                    created_at: new Date().toISOString(),
                };
                approvals.push(newApproval);
                console.log("🆕 Auto-created approval:", newApproval);
            }
        }
    }

    // STEP 3: Balas sukses biar Lark ga error
    res.json({ success: true });
});

// --- Extra: GET dengan format mirip Lark
app.get("/lark/approvals", (req, res) => {
    const larkFormat = approvals.map((approval) => ({
        ...approval,
        lark_card: {
            type: "template",
            data: {
                template_id: "approval_card",
                template_variable: {
                    nama: approval.nama,
                    type: approval.approval_type,
                    status: "Pending",
                },
            },
        },
    }));
    res.json(larkFormat);
});

// --- Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`🌐 Lark callback URL: https://test-public-server.up.railway.app/lark/callback`);
});
