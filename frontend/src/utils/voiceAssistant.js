/**
 * Voice Assistant Utility
 * Provides client-side Text-to-Speech (narration) and Speech-to-Text (mic transcription)
 * powered natively by the Web Speech API without requiring external keys or latency.
 */

class VoiceAssistant {
  constructor() {
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.isListening = false;
    this.recognition = null;
    this.onStateChangeCallbacks = new Set();

    this.initRecognition();
  }

  subscribe(callback) {
    this.onStateChangeCallbacks.add(callback);
    return () => this.onStateChangeCallbacks.delete(callback);
  }

  notifyStateChange() {
    const state = {
      isSpeaking: this.isSpeaking,
      isListening: this.isListening
    };
    this.onStateChangeCallbacks.forEach((cb) => cb(state));
  }

  initRecognition() {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onstart = () => {
        this.isListening = true;
        this.notifyStateChange();
      };

      this.recognition.onend = () => {
        this.isListening = false;
        this.notifyStateChange();
      };

      this.recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        this.isListening = false;
        this.notifyStateChange();
      };
    } catch (e) {
      console.warn('Speech recognition initialization failed:', e);
    }
  }

  /**
   * Reads text aloud with natural tone
   */
  speak(text, onComplete) {
    if (!this.synth) return;

    this.stop(); // Stop any existing audio

    const cleanedText = text.replace(/[*_#`[\]]/g, '').trim();
    if (!cleanedText) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick optimal English voice
    const voices = this.synth.getVoices();
    const preferredVoice = voices.find(
      (v) => (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Samantha') || v.name.includes('Alex')) && v.lang.startsWith('en')
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.notifyStateChange();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyStateChange();
      if (onComplete) onComplete();
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      this.notifyStateChange();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  /**
   * Stops any ongoing speech or microphone capture
   */
  stop() {
    if (this.synth && this.synth.speaking) {
      this.synth.cancel();
    }
    this.isSpeaking = false;
    this.currentUtterance = null;

    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore
      }
      this.isListening = false;
    }

    this.notifyStateChange();
  }

  /**
   * Starts listening to user voice and streams back transcript
   */
  startListening(onResult, onError) {
    if (!this.recognition) {
      if (onError) onError('Speech recognition is not supported in this browser. Please use Chrome/Edge or type your question.');
      return;
    }

    this.stop(); // Stop speaking if currently active

    this.recognition.onresult = (event) => {
      const results = Array.from(event.results);
      const transcript = results.map((r) => r[0].transcript).join('');
      const isFinal = event.results[event.results.length - 1].isFinal;
      if (onResult) {
        onResult(transcript, isFinal);
      }
    };

    try {
      this.recognition.start();
    } catch (e) {
      console.warn('Recognition start failed:', e);
      if (onError) onError('Could not start microphone listener. Check browser permissions.');
    }
  }

  isSupported() {
    return {
      tts: !!this.synth,
      stt: !!this.recognition
    };
  }
}

export const voiceAssistant = new VoiceAssistant();
