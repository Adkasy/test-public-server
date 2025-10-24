const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let approvals = [];

// POST - Tambah data approval
app.post('/approval', (req, res) => {
  const { nama, approval_type } = req.body;
  
  const newApproval = {
    id: approvals.length + 1,
    nama,
    approval_type,
    created_at: new Date().toISOString()
  };
  
  approvals.push(newApproval);
  res.status(201).json(newApproval);
});

// GET - Ambil semua data approval
app.get('/approval', (req, res) => {
  res.json(approvals);
});

// DELETE - Hapus semua data approval
app.delete('/approval', (req, res) => {
  approvals = [];
  res.json({ message: 'Semua data berhasil dihapus' });
});

// DELETE - Hapus data approval berdasarkan ID
app.delete('/approval/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = approvals.findIndex(approval => approval.id === id);
  
  if (index === -1) {
    return res.status(404).json({ message: 'Data tidak ditemukan' });
  }
  
  approvals.splice(index, 1);
  res.json({ message: 'Data berhasil dihapus' });
});

// Lark callback endpoint
app.post('/lark/callback', (req, res) => {
  const { challenge, type, event } = req.body;
  
  // Step 1: URL verification
  if (challenge) {
    console.log('Lark verification:', challenge);
    return res.json({ challenge });
  }
  
  // Step 2: Handle events
  if (type === 'event_callback' && event) {
    console.log('Lark event received:', event);
    
    // Contoh: auto-create approval dari Lark message
    if (event.event_type === 'im.message.receive_v1') {
      const message = event.event.message;
      if (message.content && message.content.includes('approval')) {
        const newApproval = {
          id: approvals.length + 1,
          nama: event.event.sender.sender_id.user_id || 'Lark User',
          approval_type: 'Lark Request',
          message: message.content,
          created_at: new Date().toISOString()
        };
        approvals.push(newApproval);
        console.log('Auto-created approval:', newApproval);
      }
    }
  }
  
  res.json({ success: true });
});

// Get approvals with Lark format
app.get('/lark/approvals', (req, res) => {
  const larkFormat = approvals.map(approval => ({
    ...approval,
    lark_card: {
      type: 'template',
      data: {
        template_id: 'approval_card',
        template_variable: {
          nama: approval.nama,
          type: approval.approval_type,
          status: 'Pending'
        }
      }
    }
  }));
  res.json(larkFormat);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Lark callback: http://localhost:${PORT}/lark/callback`);
});