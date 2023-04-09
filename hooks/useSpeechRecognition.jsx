import { useState, useEffect, useRef } from 'react';

const useSpeechApi = () => {
  const [finalTranscript, setFinalTranscript] = useState('');
  const [isWebkitSpeechRecognitionAvailable, setIsWebkitSpeechRecognitionAvailable] = useState(false);
  const recognition = useRef(null);

  useEffect(() => {
    setIsWebkitSpeechRecognitionAvailable('webkitSpeechRecognition' in window);

    if (isWebkitSpeechRecognitionAvailable) {
      recognition.current = new webkitSpeechRecognition();
      recognition.current.interimResults = true;
      recognition.current.continuous = true;
      recognition.current.lang = 'en-US';

      recognition.current.onresult = event => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          let transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setFinalTranscript(transcript);
          }
        }
      };
    } else {
      console.warn('webkitSpeechRecognition is not available in this browser.');
    }
  }, [finalTranscript, isWebkitSpeechRecognitionAvailable]);

  const start = () => {
    if (recognition.current) {
      recognition.current.start();
      console.log('start recognition', recognition);
    }
  };

  const stop = () => {
    if (recognition.current) {
      recognition.current.stop();
      recognition.current.abort();
      console.log('stop recognition', recognition);
    }
  };

  return {
    start,
    stop,
    finalTranscript,
  };
};

export default useSpeechApi;
