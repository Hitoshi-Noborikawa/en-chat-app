import React, { useState, useEffect } from "react";
import SpeakerSelector from "./SpeakerSelector";
import styles from "./voiceRecognizer.module.css";

const VoiceRecognizer = () => {
  const [recognition, setRecognition] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedSpeaker, setSelectedSpeaker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const speechRecognition = new webkitSpeechRecognition();
      speechRecognition.lang = "en";
      speechRecognition.continuous = true;
      speechRecognition.interimResults = true;

      speechRecognition.onresult = (event) => {
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setTranscript(event.results[i][0].transcript);
          }
        }
      };

      setRecognition(speechRecognition);
    } else {
      console.error("Web Speech API is not supported in this browser.");
    }
  }, []);

  const startRecognition = () => {
    if (recognition) {
      recognition.start();
      setIsLoading(true);
    }
  };

  const stopRecognition = async () => {
    if (recognition) {
      recognition.stop();
      setIsLoading(false);
      setMessages([...messages, { text: transcript, type: "user" }]);

      const responseText = await sendChatGPTRequest(transcript);
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: responseText, type: "bot" },
      ]);
    }
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

  const showRecognizeMessage = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  }

  return (
    <div className={styles.container}>
      <div className={styles.chatWindow}>
        {messages.map((message, index) => (
          <div key={index} className={styles[message.type]}>
            {message.text}

          </div>
        ))}
      </div>
      {isLoading && <div className={styles.spinner}></div>}
      <SpeakerSelector onSpeakerSelected={handleSpeakerSelected} />
      <br />
      <div className={styles["button-container"]}>
        <button className={styles["default-button"]} onClick={startRecognition}>
          Start
        </button>
        <button className={styles["default-button"]} onClick={stopRecognition}>
          End
        </button>
        <button className={styles["default-button"]} onClick={clearMessages}>
          Clear
        </button>
      </div>
    </div>
  );
};

export default VoiceRecognizer;
