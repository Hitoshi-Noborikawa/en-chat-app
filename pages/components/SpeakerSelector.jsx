import React, { useState, useEffect } from "react";

const SpeakerSelector = ({ onSpeakerSelected }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");

  useEffect(() => {
    const getVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      const speakers = [];
      for (const voice of availableVoices) {
        if (voice.lang === "en-US") {
          speakers.push(voice);
        }
      }

      setVoices(speakers);
    };

    getVoices();
    window.speechSynthesis.onvoiceschanged = getVoices;
  }, []);

  const handleChange = (e) => {
    setSelectedVoice(e.target.value);
    onSpeakerSelected(voices.find((voice) => voice.name === e.target.value));
  };

  return (
    <select value={selectedVoice} onChange={handleChange}>
      <option value="">Select a speaker</option>
      {voices.map((voice) => (
        <option key={voice.name} value={voice.name}>
          {voice.name} ({voice.lang})
        </option>
      ))}
    </select>
  );
};

export default SpeakerSelector;
