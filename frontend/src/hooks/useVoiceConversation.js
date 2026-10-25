import { useCallback, useEffect, useRef, useState } from 'react';

export default function useVoiceConversation({ language, onTranscript, onInterim }) {
  const [voiceMode, setVoiceMode] = useState(false);
  const [muted, setMuted] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const voiceModeRef = useRef(false);
  const mutedRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);
  const onInterimRef = useRef(onInterim);
  const startListeningRef = useRef(null);
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const resolveSpeechRef = useRef(null);

  useEffect(() => { onTranscriptRef.current = onTranscript; }, [onTranscript]);
  useEffect(() => { onInterimRef.current = onInterim; }, [onInterim]);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    utteranceRef.current = null;
    setSpeaking(false);
    resolveSpeechRef.current?.();
    resolveSpeechRef.current = null;
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop?.();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const stopVoiceMode = useCallback(() => {
    voiceModeRef.current = false;
    setVoiceMode(false);
    stopListening();
    stopSpeaking();
  }, [stopListening, stopSpeaking]);

  const speak = useCallback((content) => {
    if (!content || !voiceModeRef.current || mutedRef.current) return Promise.resolve();
    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance !== 'function') {
      setVoiceError('speech-unsupported');
      return Promise.resolve();
    }

    const voicePrefix = language === 'en' ? 'en' : 'sq';
    const installedVoices = window.speechSynthesis.getVoices();
    const preferredVoice = installedVoices.find((voice) => voice.lang?.toLowerCase().startsWith(voicePrefix));
    if (installedVoices.length && !preferredVoice) {
      setVoiceError('speech-language-unsupported');
      return Promise.resolve();
    }

    stopSpeaking();
    return new Promise((resolve) => {
      const utterance = new window.SpeechSynthesisUtterance(content);
      utterance.lang = language === 'en' ? 'en-US' : 'sq-AL';
      if (preferredVoice) utterance.voice = preferredVoice;
      utterance.rate = 0.96;
      utterance.onstart = () => { utteranceRef.current = utterance; setSpeaking(true); setVoiceError(''); };
      utterance.onend = () => {
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setSpeaking(false);
        resolveSpeechRef.current?.();
        resolveSpeechRef.current = null;
        resolve();
      };
      utterance.onerror = (event) => {
        if (event.error !== 'canceled' && event.error !== 'interrupted') setVoiceError(event.error === 'language-unavailable' ? 'speech-language-unsupported' : 'speech-failed');
        if (utteranceRef.current === utterance) utteranceRef.current = null;
        setSpeaking(false);
        resolveSpeechRef.current?.();
        resolveSpeechRef.current = null;
        resolve();
      };
      resolveSpeechRef.current = resolve;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [language, stopSpeaking]);

  const startListening = useCallback(() => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) { setVoiceError('recognition-unsupported'); return false; }
    stopSpeaking();
    stopListening();
    setVoiceError('');
    voiceModeRef.current = true;
    setVoiceMode(true);

    try {
      const recognition = new Recognition();
      let submitted = false;
      recognition.lang = language === 'en' ? 'en-US' : 'sq-AL';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      recognition.onstart = () => setListening(true);
      recognition.onresult = (event) => {
        let finalText = '';
        let interimText = '';
        for (let index = event.resultIndex; index < event.results.length; index += 1) {
          const transcript = event.results[index][0]?.transcript || '';
          if (event.results[index].isFinal) finalText += transcript;
          else interimText += transcript;
        }
        if (interimText) onInterimRef.current?.(interimText.trim());
        if (finalText.trim() && !submitted) {
          submitted = true;
          const transcript = finalText.trim();
          onInterimRef.current?.(transcript);
          Promise.resolve(onTranscriptRef.current?.(transcript))
            .catch(() => {})
            .finally(() => {
              if (voiceModeRef.current && !utteranceRef.current) {
                window.setTimeout(() => {
                  if (voiceModeRef.current && !utteranceRef.current) startListeningRef.current?.();
                }, 300);
              }
            });
        }
      };
      recognition.onerror = (event) => {
        const errors = {
          'not-allowed': 'permission-denied',
          'service-not-allowed': 'permission-denied',
          'audio-capture': 'microphone-unavailable',
          'language-not-supported': 'language-unsupported',
          'no-speech': 'empty-transcription',
          network: 'recognition-network',
        };
        setVoiceError(errors[event.error] || 'recognition-failed');
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'language-not-supported') {
          voiceModeRef.current = false;
          setVoiceMode(false);
        }
      };
      recognition.onend = () => {
        setListening(false);
        if (recognitionRef.current === recognition) recognitionRef.current = null;
      };
      recognitionRef.current = recognition;
      recognition.start();
      return true;
    } catch (error) {
      setVoiceError(error?.name === 'NotAllowedError' ? 'permission-denied'
        : error?.name === 'NotFoundError' ? 'microphone-unavailable' : 'recognition-failed');
      setListening(false);
      voiceModeRef.current = false;
      setVoiceMode(false);
      return false;
    }
  }, [language, stopListening, stopSpeaking]);

  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);

  const toggleVoiceMode = useCallback(() => {
    if (voiceModeRef.current) stopVoiceMode();
    else startListening();
  }, [startListening, stopVoiceMode]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (next) stopSpeaking();
  }, [stopSpeaking]);

  const clearVoiceError = useCallback(() => setVoiceError(''), []);

  useEffect(() => () => {
    voiceModeRef.current = false;
    recognitionRef.current?.abort?.();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    resolveSpeechRef.current?.();
  }, []);

  return {
    voiceMode, muted, listening, speaking, voiceError,
    startListening, stopListening, stopSpeaking, stopVoiceMode, speak, toggleVoiceMode, toggleMute, clearVoiceError,
  };
}
