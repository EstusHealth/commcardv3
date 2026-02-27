/* CommCard V3 - Voice Module */
/* Wrapper for the Web Speech API (speechSynthesis) */

const Voice = (() => {
  const isAvailable = 'speechSynthesis' in window;
  let voices = [];
  let selectedVoiceURI = null;
  let rate = 0.85;
  let volume = 1.0;
  let voiceChangeCallbacks = [];

  const loadVoices = () => {
    if (!isAvailable) return [];
    voices = window.speechSynthesis.getVoices();
    voiceChangeCallbacks.forEach(cb => cb(voices));
    return voices;
  };

  const init = () => {
    if (!isAvailable) return;
    loadVoices();
    // Voices load asynchronously in many browsers
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);
  };

  const getVoices = () => voices;

  const setVoiceByURI = (uri) => {
    selectedVoiceURI = uri;
  };

  const setRate = (r) => { rate = parseFloat(r); };
  const setVolume = (v) => { volume = parseFloat(v); };
  const getRate = () => rate;
  const getVolume = () => volume;
  const getSelectedVoiceURI = () => selectedVoiceURI;

  const onVoicesChanged = (cb) => {
    voiceChangeCallbacks.push(cb);
  };

  const speak = (text) => {
    if (!isAvailable) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoiceURI) {
      const voice = voices.find(v => v.voiceURI === selectedVoiceURI);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = rate;
    utterance.volume = volume;
    // iOS workaround: resume if paused
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);
  };

  const cancel = () => {
    if (isAvailable) window.speechSynthesis.cancel();
  };

  return {
    init,
    isAvailable,
    getVoices,
    setVoiceByURI,
    setRate,
    setVolume,
    getRate,
    getVolume,
    getSelectedVoiceURI,
    onVoicesChanged,
    speak,
    cancel
  };
})();
