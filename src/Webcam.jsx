import { useRef, useState, useEffect } from "react";
import { io } from "socket.io-client";
import PlaySvg from "./assets/play.svg";
import PauseSvg from "./assets/pause.svg";
import "./App.css";
const WebcamCapture = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);

  const [mediaStream, setMediaStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const mediaRecorderRef = useRef(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [status, setStatus] = useState("Idle");
  const [facingMode, setFacingMode] = useState("user");
  const [streamName, setStreamName] = useState("testing");
  const [videoDevices, setVideoDevices] = useState([]);
  const [torchOn, setTorchOn] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");

  useEffect(() => {
    // Connect to the NestJS WebSocket server
    socketRef.current = io("https://elects.space/", {
      query: {
        framespersecond: 30,
        audioBitrate: 44100,
      },
      transports: ["websocket"],
    });

    socketRef.current.on("message", (msg) => {
      console.log("Server message:", msg);
      setStatus(msg);
    });

    socketRef.current.on("fatal", (msg) => {
      console.error("Fatal error:", msg);
      setStatus(`Error: ${msg}`);
      stopStream();
    });

    getCameraSelection();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const getCameraSelection = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );
    setVideoDevices(videoDevices);
  };

  const toggleTorch = () => {
    if (mediaStream && !torchOn) {
      for (const track of mediaStream.getTracks()) {
        track.applyConstraints({
          advanced: [{ torch: true }],
        });
      }
    }
    if (mediaStream && torchOn) {
      for (const track of mediaStream.getTracks()) {
        track.applyConstraints({
          advanced: [{ torch: false }],
        });
      }
    }
  };

  const startStream = async (rtmpUrl) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: {
            min: 1280,
            ideal: 1920,
            max: 1920,
          },
          height: {
            min: 720,
            ideal: 1080,
            max: 1080,
          },
        },
        audio: true,
        facingMode: {
          exact: facingMode,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      socketRef.current.emit("config_rtmpDestination", rtmpUrl);

      const options = {
        mimeType: "video/webm;codecs=h264",
        videoBitsPerSecond: 1000000,
      };

      mediaRecorderRef.current = new MediaRecorder(stream, options);

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0 && socketRef.current) {
          socketRef.current.emit("binarystream", event.data);
        }
      };

      socketRef.current.emit("start");
      mediaRecorderRef.current.start(1000);
      setIsStreaming(true);
      setStatus("Streaming");
      setMediaStream(stream);
    } catch (error) {
      console.error("Error accessing webcam", error);
    }
  };

  // Function to stop the webcam
  const stopStream = () => {
    if (mediaStream) {
      for (const track of mediaStream.getTracks()) {
        track.stop();
      }
      setMediaStream(null);
    }
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setIsStreaming(false);
    setStatus("Stopped");
  };

  const createVideoStream = async () => {
    try {
      const existingStream = localStorage.getItem("stream_data");

      if (existingStream) {
        const streamKey = `rtmps://broadcast.api.video:1936/s/${
          JSON.parse(existingStream).streamKey
        }`;
        return startStream(streamKey);
      }
      console.log(streamName);
      const request = await fetch("https://elects.space/create-stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: streamName,
        }),
      });
      const res = await request.json();

      localStorage.setItem("stream_data", JSON.stringify(res));
      const streamKey = `rtmps://broadcast.api.video:1936/s/${res.streamKey}`;
      startStream(streamKey);
    } catch (err) {
      console.log("Could not create stream api.video error", err);
    }
  };

  // Function to reset state (clear media stream and refs)
  const resetState = () => {
    stopStream(); // Stop the webcam if it's active
    setCapturedImage(null); // Reset captured image
  };

  const copyStreamUrl = () => {
    const existingStream = localStorage.getItem("stream_data");
    const streamData = JSON.parse(existingStream);
    navigator.clipboard.writeText(
      `https://elects.space/watch/${streamData.liveStreamId}`
    );
  };

  return (
    <div className="camera-app">
      <div className="camera-container">
        {/* <img
          src="/api/placeholder/600/338"
          alt="Camera Feed"
          className="camera-feed"
        /> */}
        <video ref={videoRef} autoPlay muted></video>
        <canvas className="d-none" ref={canvasRef}></canvas>
      </div>

      <div className="controls-container">
        <button
          className="control-button primary"
          onClick={() => {
            isStreaming ? stopStream() : createVideoStream();
          }}
        >
          {!isStreaming ? "Start" : "Stop"}
        </button>

        <input
          type="text"
          className="stream-input"
          placeholder="Stream Name"
          value={streamName}
          onChange={(e) => setStreamName(e.target.value)}
        />

        <button
          className={`control-button ${torchOn ? "active" : ""}`}
          onClick={() => setTorchOn(!torchOn)}
        >
          Toggle Torch
        </button>
        <button
          className={`control-button ${isStreaming ? "active" : ""}`}
          onClick={copyStreamUrl}
        >
          Copy Stream Url
        </button>

        <select
          className="camera-select"
          value={selectedCamera}
          onChange={(e) => setSelectedCamera(e.target.value)}
        >
          <option value="">Select Camera</option>
          {videoDevices.map((videoDevice) => {
            return (
              <option value="${videoDevice.deviceId}">
                {videoDevice.label}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
};

export default WebcamCapture;
