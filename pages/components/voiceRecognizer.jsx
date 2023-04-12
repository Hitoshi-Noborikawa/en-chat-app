import React, { useState, useEffect } from "react";
import SpeakerSelector from "./SpeakerSelector";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import styles from "./voiceRecognizer.module.scss";

const VoiceRecognizer = () => {
  const { start, stop, finalTranscript } = useSpeechRecognition();
  const [messages, setMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([
    {
      role: "system",
      content:
        "Can you correct my mistakes while we chat, without including capitalization, commas, or periods?",
    },
  ]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [selectedRadio, setSelectedRadio] = useState("on");
  const [chatMessage, setChatMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const startRecognition = () => {
    setIsLoading(true);
    setChatMessage("");
    start();
  };

  const stopRecognition = async () => {
    setIsLoading(false);
    stop();
    sendMessage();
  };

  const speak = (text) => {
    const splitText = text.split(/\.|\,|\:|\!|\?\s/g);
    let spokenCount = 0;
    for (const st of splitText) {
      let u = new SpeechSynthesisUtterance(st);
      u.lang = "en-US";
      u.pitch = 1;
      u.voice = selectedSpeaker;
      u.onend = function () {
        spokenCount++;
        if (spokenCount === splitText.length - 1) {
        }
      };
      speechSynthesis.speak(u);
    }
  };

  const sendMessage = async () => {
    setMessages([...messages, { text: chatMessage, type: "user" }]);
    const requestText =
      messageHistory.length === 0
        ? [{ role: "user", content: chatMessage }]
        : [...messageHistory, { role: "user", content: chatMessage }];

    try {
      const responseText = await sendChatGPTRequest(requestText);
      speak(responseText);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseText, type: "bot" },
      ]);
      setMessageHistory([
        ...requestText,
        { role: "assistant", content: responseText },
      ]);
    } catch (err) {
      <Error />;
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const sendChatGPTRequest = async (text) => {
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    return data.text;
  };

  const handleSpeakerSelected = (speaker) => {
    setSelectedSpeaker(speaker);
  };

  const handleChangeRadio = (e) => {
    if (e.target.value === "on" && chatMessage !== "") {
      setChatMessage("");
    }
    setSelectedRadio(e.target.value);
  };

  const handleChangeText = (e) => {
    setChatMessage(e.target.value);
  };

  useEffect(() => {
    setChatMessage((prevChatMessage) => [...prevChatMessage, finalTranscript]);
  }, [finalTranscript]);

  return (
    <div className={styles.container}>
      {isLoading && <div className={styles.spinner}></div>}
      <div className={styles.chatWindow}>
        {messages.map((message, index) => (
          <div key={index} className={styles[message.type]}>
            {message.text}
          </div>
        ))}
      </div>
      <SpeakerSelector onSpeakerSelected={handleSpeakerSelected} />
      <h3>Speak or Text</h3>
      <div className={styles["radio-container"]}>
        <div className={styles["radio-wrapper"]}>
          <input
            type="radio"
            id="on"
            name="status"
            value="on"
            checked={selectedRadio === "on"}
            onChange={handleChangeRadio}
          />
          <label htmlFor="on">Voice Recognition</label>
        </div>
        <div className={styles["radio-wrapper"]}>
          <input
            type="radio"
            id="off"
            name="status"
            value="off"
            checked={selectedRadio === "off"}
            onChange={handleChangeRadio}
          />
          <label htmlFor="off">Text</label>
        </div>
      </div>
      {selectedRadio === "on" ? (
        <div className={styles["interim-transcript-area"]}>{chatMessage}</div>
      ) : (
        <div className={styles["text-area"]}>
          <input
            type="text"
            placeholder="ここにテキストを入力してください"
            onChange={handleChangeText}
            value={chatMessage}
          />
        </div>
      )}
      <div className={styles["horizontal-bar"]}></div>
      <br />
      <div className={styles["button-container"]}>
        {selectedRadio === "on" ? (
          <>
            <button
              className={styles["default-button"]}
              onClick={startRecognition}
              disabled={isLoading}
            >
              Start
            </button>
            <button
              className={styles["default-button"]}
              onClick={stopRecognition}
              disabled={!isLoading}
            >
              End
            </button>
            <button
              className={styles["default-button"]}
              onClick={clearMessages}
              disabled={isLoading}
            >
              Chat Clear
            </button>
          </>
        ) : (
          <>
            <button className={styles["default-button"]} onClick={sendMessage}>
              Send
            </button>
            <button
              className={styles["default-button"]}
              onClick={clearMessages}
            >
              Chat Clear
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default VoiceRecognizer;
