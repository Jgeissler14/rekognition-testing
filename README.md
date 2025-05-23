# rekognition-testing

This project provides a simple Node.js API for indexing student faces into an Amazon Rekognition collection and identifying students in new images. It is intended for a yearbook application where each student provides a class photo for enrollment.

## Requirements

- Node.js (v14 or higher)
- An AWS account with Rekognition enabled
- AWS credentials configured in your environment (e.g. using `~/.aws/credentials`)

## Setup

Install dependencies:

```bash
npm install
```

Set environment variables as needed:

- `AWS_REGION` – AWS region for Rekognition (default `us-east-1`)
- `COLLECTION_ID` – name of the Rekognition collection (default `students`)
- `PORT` – port to run the API on (default `3000`)

Start the server:

```bash
npm start
```

Run the tests:

```bash
npm test
```

## API

### `POST /index`

Enroll a student's face.

Request body (JSON):

```json
{
  "studentId": "123",
  "image": "<base64 encoded JPEG or PNG>"
}
```

### `POST /identify`

Identify students in an image.

Request body (JSON):

```json
{
  "image": "<base64 encoded JPEG or PNG>"
}
```

Response example:

```json
{
  "students": [
    { "studentId": "123", "similarity": 98.6 },
    { "studentId": "456", "similarity": 95.2 }
  ]
}
```

The `similarity` field indicates how closely the face matched the enrolled student image.
