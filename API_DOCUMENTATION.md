# 📡 NextBoard API Documentation

Complete API reference for NextBoard backend endpoints.

---

## Base URL

- **Development**: `http://localhost:3000`
- **Production**: `https://your-app.up.railway.app`

---

## Endpoints

### 1. Upload File

**Endpoint**: `POST /api/upload`

**Description**: Upload a meeting transcript or recording file.

**Content-Type**: `multipart/form-data`

**Request Body**:
```typescript
{
  file: File;           // Required: The file to upload
  title?: string;       // Optional: Meeting title
  participants?: string;// Optional: Comma-separated participants
  date?: string;        // Optional: ISO date string
}
```

**Supported File Types**:
- Audio: `.mp3`, `.wav`, `.mp4`
- Transcript: `.txt`, `.vtt`, `.docx`

**Response**:
```json
{
  "success": true,
  "file": {
    "filename": "1697450000000-transcript.txt",
    "originalName": "transcript.txt",
    "size": 12345,
    "type": "text/plain",
    "path": "/uploads/1697450000000-transcript.txt",
    "isAudioVideo": false,
    "isTranscript": true
  },
  "metadata": {
    "title": "Weekly Sync",
    "participants": "Alex, Sarah, Mike",
    "date": "2024-10-16T10:00:00.000Z"
  }
}
```

**Example (cURL)**:
```bash
curl -X POST http://localhost:3000/api/upload \
  -F "file=@transcript.txt" \
  -F "title=Weekly Team Meeting" \
  -F "participants=Alice, Bob, Charlie"
```

**Example (JavaScript)**:
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('title', 'Weekly Sync');
formData.append('participants', 'Alex, Sarah');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

---

### 2. Process Transcript

**Endpoint**: `POST /api/process`

**Description**: Process uploaded transcript with AI to extract action items.

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "filepath": "/uploads/1697450000000-transcript.txt",
  "title": "Weekly Sync",
  "participants": "Alex, Sarah, Mike",
  "date": "2024-10-16T10:00:00.000Z",
  "transcript": "Optional: raw transcript text instead of file"
}
```

**Response**:
```json
{
  "success": true,
  "meeting": {
    "id": "cm1abc123",
    "title": "Weekly Product Team Sync",
    "summary": "Team discussed Q4 roadmap, authentication refactor...",
    "createdAt": "2024-10-16T10:30:00.000Z",
    "cards": [
      {
        "id": "cm1def456",
        "meetingId": "cm1abc123",
        "type": "Action",
        "summary": "Prepare design mockups for new dashboard",
        "owner": "Sarah",
        "dueDate": "Friday",
        "timestamp": "00:03:00",
        "context": "Needed for client presentation",
        "status": "Pending",
        "createdAt": "2024-10-16T10:30:00.000Z",
        "updatedAt": "2024-10-16T10:30:00.000Z"
      }
    ]
  }
}
```

**Example (cURL)**:
```bash
curl -X POST http://localhost:3000/api/process \
  -H "Content-Type: application/json" \
  -d '{
    "filepath": "/uploads/transcript.txt",
    "title": "Weekly Sync",
    "participants": "Alex, Sarah"
  }'
```

---

### 3. Get Board by ID

**Endpoint**: `GET /api/board/:id`

**Description**: Retrieve a specific meeting board with all cards.

**Path Parameters**:
- `id` (string): Meeting ID

**Response**:
```json
{
  "id": "cm1abc123",
  "title": "Weekly Product Team Sync",
  "summary": "Team discussed Q4 roadmap...",
  "createdAt": "2024-10-16T10:30:00.000Z",
  "cards": [...]
}
```

**Example (cURL)**:
```bash
curl http://localhost:3000/api/board/cm1abc123
```

---

### 4. Get All Boards

**Endpoint**: `GET /api/boards`

**Description**: List all meeting boards, sorted by creation date (newest first).

**Response**:
```json
{
  "meetings": [
    {
      "id": "cm1abc123",
      "title": "Weekly Sync",
      "summary": "...",
      "createdAt": "2024-10-16T10:30:00.000Z",
      "cardCount": 8,
      "cards": [...]
    }
  ]
}
```

**Example (cURL)**:
```bash
curl http://localhost:3000/api/boards
```

---

### 5. Update Card

**Endpoint**: `PUT /api/card/:id`

**Description**: Update a card's details (status, owner, etc.)

**Path Parameters**:
- `id` (string): Card ID

**Content-Type**: `application/json`

**Request Body**:
```json
{
  "status": "In Progress",
  "owner": "Mike",
  "dueDate": "Next Friday",
  "summary": "Updated summary text",
  "context": "Additional context"
}
```

**Response**:
```json
{
  "success": true,
  "card": {
    "id": "cm1def456",
    "meetingId": "cm1abc123",
    "type": "Action",
    "summary": "Updated summary text",
    "owner": "Mike",
    "dueDate": "Next Friday",
    "status": "In Progress",
    "context": "Additional context",
    "timestamp": "00:03:00",
    "createdAt": "2024-10-16T10:30:00.000Z",
    "updatedAt": "2024-10-16T11:00:00.000Z"
  }
}
```

**Example (cURL)**:
```bash
curl -X PUT http://localhost:3000/api/card/cm1def456 \
  -H "Content-Type: application/json" \
  -d '{"status": "Done"}'
```

---

### 6. Delete Card

**Endpoint**: `DELETE /api/card/:id`

**Description**: Delete a card permanently.

**Path Parameters**:
- `id` (string): Card ID

**Response**:
```json
{
  "success": true,
  "message": "Card deleted successfully"
}
```

**Example (cURL)**:
```bash
curl -X DELETE http://localhost:3000/api/card/cm1def456
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message",
  "details": "Optional detailed error information"
}
```

### Common Error Codes

| Status | Description |
|--------|-------------|
| `400` | Bad Request - Invalid input |
| `404` | Not Found - Resource doesn't exist |
| `500` | Internal Server Error - Server error |

---

## Data Types

### CardType
```typescript
type CardType = "Action" | "Decision" | "Follow-up" | "Update";
```

### CardStatus
```typescript
type CardStatus = "Pending" | "In Progress" | "Done";
```

### Meeting
```typescript
interface Meeting {
  id: string;
  title: string;
  summary: string;
  createdAt: string; // ISO 8601
  cards: MeetingCard[];
}
```

### MeetingCard
```typescript
interface MeetingCard {
  id: string;
  meetingId: string;
  type: CardType;
  summary: string;
  owner: string | null;
  dueDate: string | null;
  timestamp: string | null;
  context: string | null;
  status: CardStatus;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

---

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting in production using:
- `express-rate-limit` middleware
- Railway's built-in DDoS protection
- API Gateway (if using AWS)

---

## Authentication

Currently no authentication is required. For production, consider implementing:
- **NextAuth.js**: Email/OAuth authentication
- **Clerk**: Drop-in authentication
- **API Keys**: Simple token-based auth

---

## CORS

The API accepts requests from all origins in development. For production, configure CORS in `next.config.js`:

```javascript
module.exports = {
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "https://yourdomain.com" },
        ],
      },
    ];
  },
};
```

---

## Webhook Support (Future)

Planned webhook support for:
- New meeting created
- Card status changed
- Meeting completed

---

For more information, see [README.md](./README.md)







