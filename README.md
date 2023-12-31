# Screen Recording Endpoints

This document provides an overview of two endpoints used for screen recording functionality in a web application. These endpoints allow you to start and stop screen recording and send recorded video data to a server.
Test the app here: [Preview here](https://helpmeout-previewpage-311b.vercel.app/previewpage)
## Video tutorial

Watch a quick tutorial on how to set up and use the screen recording extension on your browser
Watch Video Tutorial Here: [Tutorial](https://drive.google.com/file/d/1eme8WiJrXBBnqF_BYceEjjJlzl8Hmp7P/view?usp=sharing) 

## Start Recording Endpoint

### Description

The "Start Recording" endpoint initiates the screen recording process. It requests access to the user's display and audio streams and begins recording. The recorded video data is sent to a specified server endpoint.

### Usage

- **Endpoint**: [/api/startstream](http://ec2-18-119-101-235.us-east-2.compute.amazonaws.com:3000/api/startstream)
- **HTTP Method**: GET

### Example

```javascript
fetch(`http://18.119.101.235:3000/api/startstream`, {
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
[/api/stream/${sessionId}](http://ec2-18-119-101-235.us-east-2.compute.amazonaws.com:3000/api/stream/${sessionId})

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

  fetch(`http://localhost:5000/api/livestream/${sessionId}`, {
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

# Video Streaming Endpoint

This documentation provides information on how to use the Video Streaming Endpoint to stream video content from the server to clients. The endpoint allows clients to request specific byte ranges of a video file, making it suitable for video streaming applications.

## Endpoint URL

- **URL**: `/api/livestream/:sessionId`
  - `:videoId`: The unique identifier of the video to be streamed.

## Request

### HTTP Method

- `GET`

### Headers

- `Range`: Specifies the byte range to request in the format `bytes=start-end`.

### Example Request

```http
GET http://localhost:5000/api/streamvideo/${sessionId}
Range: bytes=0-999
```


### Will be provided in swagger during subission 🙂
