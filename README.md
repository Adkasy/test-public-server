# Approval API

Simple REST API for approval management with Lark integration.

## Endpoints

- `GET /approval` - Get all approvals
- `POST /approval` - Create new approval
- `DELETE /approval` - Delete all approvals  
- `DELETE /approval/:id` - Delete specific approval
- `POST /lark/callback` - Lark webhook endpoint
- `GET /lark/approvals` - Get approvals in Lark format

## Deploy

### Railway
```bash
git push origin main
```

### Render
1. Connect GitHub repo
2. Build command: `npm install`
3. Start command: `npm start`

## Local Development
```bash
npm install
npm start
```