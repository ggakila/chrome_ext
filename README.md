# Screen Recording Endpoints

This document provides an overview of two endpoints used for screen recording functionality in a web application. These endpoints allow you to start and stop screen recording and send recorded video data to a server.

## Start Recording Endpoint

### Description

The "Start Recording" endpoint initiates the screen recording process. It requests access to the user's display and audio streams and begins recording. The recorded video data is sent to a specified server endpoint.

### Usage

- **Endpoint**: `http://localhost:5000/api/startstream`
- **HTTP Method**: GET

### Example

```javascript
fetch(`http://localhost:5000/api/startstream`, {
  method: "GET",
})
  .then((response) => response.json())
  .then((response) => {
    // Handle the response, e.g., obtain session ID
  })
  .catch((error) => {
    console.error("Session Error:", error);
  });
```
### Example of Response
```
{
    "session": {
        "id": "cln8o0og00000uzwjelhljbyl",
        "createdAt": "2023-10-02T09:05:11.616Z",
        "updatedAt": "2023-10-02T09:05:11.616Z",
        "active": true
    }
}
```

## Upload Video Endpoint

### Description

This endpoint allows you to upload video data to the server. The uploaded video data will be appended to an existing file or create a new file if it doesn't exist. Additionally, the metadata of the uploaded video will be stored in a database.

### Endpoint

### Example
```
function sendLastBlobToServer(blob, sessionId) {
  if (blobs.length === 0) {
    return; 
  }

  const lastBlob = blobs[blobs.length - 1];

  const formData = new FormData();
  formData.append("video", lastBlob, "recorded_video.webm");
  if (!sessionId) {
    console.log(sessionId)
    console.log("no session id");
    return;
  }

  fetch(`http://localhost:5000/api/stream/${sessionId}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log("Success:", result);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}
```

### Example of Response

```
{
  success: true
}
```

### Will be provided in swagger during subission 🙂
