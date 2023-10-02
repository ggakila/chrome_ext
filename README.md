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

