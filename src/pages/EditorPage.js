import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import ACTIONS from "../Actions";
import Client from "../components/Client";
import Editor from "../components/Editor";
import "../App.css";
import { initSocket } from "../socket";
import {
  useLocation,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import { FaPlay } from "react-icons/fa";

const EditorPage = () => {
  const socketRef = useRef(null);
  const codeRef = useRef("");
  const location = useLocation();
  const { roomId } = useParams();
  const reactNavigator = useNavigate();
  const [clients, setClients] = useState([]);
  const [language, setLanguage] = useState("javascript");
  const [output, setOutput] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        socketRef.current = await initSocket();
        if (!socketRef.current) {
          throw new Error("Socket initialization failed");
        }

        socketRef.current.on("connect_error", handleErrors);
        socketRef.current.on("connect_failed", handleErrors);

        function handleErrors(e) {
          console.error("Socket error:", e);
          toast.error("Socket connection failed, try again later.");
          reactNavigator("/");
        }

        socketRef.current.emit(ACTIONS.JOIN, {
          roomId,
          username: location.state?.username,
        });

        socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
          if (username !== location.state?.username) {
            toast.success(`${username} joined the room.`);
            console.log(`${username} joined`);
          }
          setClients(clients);
          socketRef.current.emit(ACTIONS.SYNC_CODE, {
            code: codeRef.current || "",
            socketId,
          });
        });

        socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
          toast.success(`${username} left the room.`);
          setClients((prev) => prev.filter((client) => client.socketId !== socketId));
        });
      } catch (error) {
        console.error("Socket initialization failed:", error);
        toast.error("Failed to connect to WebSocket server.");
        reactNavigator("/");
      }
    };

    init();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off(ACTIONS.JOINED);
        socketRef.current.off(ACTIONS.DISCONNECTED);
      }
    };
  }, []);

  async function copyRoomId() {
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room ID has been copied to your clipboard");
    } catch (err) {
      toast.error("Could not copy the Room ID");
      console.error(err);
    }
  }

  function leaveRoom() {
    reactNavigator("/");
  }

  async function runCode() {
    const code = codeRef.current;
    if (!code.trim()) {
      toast.error("Write some code before running!");
      return;
    }

    setOutput("Running... 🚀");

    try {
      const response = await axios.post("http://localhost:5000/run", {
        code,
        language,
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput("Error executing code");
      console.error("Execution error:", error.response?.data || error.message);
    }
  }

  if (!location.state?.username) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mainWrap">
      {/* Sidebar */}
      <div className="aside">
        <div className="asideInner">
          <div className="logo">
            <img className="logoImage" src="/Codesync.png" alt="logo" />
          </div>
          <h3>Connected</h3>
          <div className="clientsList">
            {clients.map((client) => (
              <Client key={client.socketId} username={client.username} />
            ))}
          </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>
          Copy ROOM ID
        </button>
        <button className="btn leaveBtn" onClick={leaveRoom}>
          Leave
        </button>
      </div>

      <div className="editorWrap">
        <div className="editorHeader">
          <div className="languageContainer">
            <p>Select Language:</p>
            <select
              className="languageSelect"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
            </select>
          </div>
          <button className="runBtn" onClick={runCode}>
            <FaPlay />
            Run
          </button>
        </div>

        {/* Editor */}
        <Editor
          socketRef={socketRef}
          roomId={roomId}
          onCodeChange={(code) => {
            codeRef.current = code;
          }}
        />

        {/* Output Section */}
        <div className="outputSection">
          <h3>Output:</h3>
          <div className="outputBox">
            <pre>{output || "// Your output will be shown here..."}</pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
