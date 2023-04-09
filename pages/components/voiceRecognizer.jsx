import React, { useState, useEffect } from "react";
import SpeakerSelector from "./SpeakerSelector";
import useSpeechRecognition from "../../hooks/useSpeechRecognition";
import styles from "./voiceRecognizer.module.css";
import classnames from 'classnames';

const VoiceRecognizer = () => {
  const {start, stop, finalTranscript} = useSpeechRecognition();
  const [messages, setMessages] = useState([]);
  const [messageHistory, setMessageHistory] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const startRecognition = () => {
    setIsLoading(true);
    start();
  }

  const stopRecognition = async () => {
      setIsLoading(false);
      stop();
      setMessages([...messages, { text: finalTranscript, type: "user" }]);

      const requestText = messageHistory.length === 0 ? [finalTranscript] : messageHistory;
      const responseText = await sendChatGPTRequest(requestText);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseText, type: "bot" },
      ]);
      setMessageHistory((prevMessage) => [
        ...prevMessage,
        finalTranscript,
        responseText
      ])
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const speakGPTRequest = async (text) => {
    console.log("speak text ", text);
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

  const sendChatGPTRequest = async (text) => {
    console.log("text ", text);
    const response = await fetch("/api/chatgpt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });

    const data = await response.json();
    speakGPTRequest(data.text);
    return data.text;
  };

  const handleSpeakerSelected = (speaker) => {
    setSelectedSpeaker(speaker);
  };

  useEffect(() => {
    setChatMessage((prevChatMessage) => [...prevChatMessage, finalTranscript])
  }, [finalTranscript])

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
      <div className={styles['interim-transcript-area']}>
      {chatMessage}
      </div>
      <div className={styles['horizontal-bar']}>
      </div>
      <br />
      <SpeakerSelector onSpeakerSelected={handleSpeakerSelected} />
      <br />
      <div className={styles["button-container"]}>
        <button className={styles["default-button"]} onClick={startRecognition} disabled={isLoading}>
          Start
        </button>
        <button className={styles["default-button"]} onClick={stopRecognition} disabled={!isLoading}>
          End
        </button>
        <button className={styles["default-button"]} onClick={clearMessages} disabled={isLoading}>
          Chat Clear
        </button>
      </div>
    </div>
  );
};

export default VoiceRecognizer;
