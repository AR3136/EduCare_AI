// EduCare Companion AI - Sound Synthesis Engine using Web Audio API
const SoundEngine = (() => {
  let audioCtx = null;
  let breathingInterval = null;
  let breathingOscillators = [];

  function getAudioContext() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // A bubbly pop sound for clicks/typing
  function playPop() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);

      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // A beautiful, ascending magical chime for success/rewards
  function playSuccess() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5 (Major Chime)
      
      notes.forEach((freq, index) => {
        const time = now + index * 0.08;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);

        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.1, time + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.3);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // A soft, low-frequency descending tone for sad mood or frustrations
  function playSad() {
    try {
      const ctx = getAudioContext();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.4);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Sparkling cosmic sounds for transitioning modules
  function playRedirect() {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime;
      const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50]; // C5 to C6 Major Scale
      
      notes.forEach((freq, index) => {
        const time = now + index * 0.05;
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        
        gainNode.gain.setValueAtTime(0, time);
        gainNode.gain.linearRampToValueAtTime(0.08, time + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + 0.2);
      });
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  // Start playing a soothing breathing wave that loops
  function startCalm() {
    try {
      stopCalm(); // Ensure no overlaps
      const ctx = getAudioContext();
      
      const createWave = (type, freq, maxVolume) => {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.02, ctx.currentTime);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        
        breathingOscillators.push({ osc, gainNode, maxVolume });
      };

      // Create a nice warm combination of low frequencies
      createWave('sine', 110, 0.08); // A2
      createWave('sine', 165, 0.04); // E3

      let breathingIn = true;
      const breatheCycle = () => {
        const duration = 4; // 4 seconds in, 4 seconds out
        const targetVolMultiplier = breathingIn ? 1 : 0.15;
        const targetFreqMultiplier = breathingIn ? 1.05 : 0.95;
        const now = ctx.currentTime;

        breathingOscillators.forEach((item) => {
          item.gainNode.gain.linearRampToValueAtTime(item.maxVolume * targetVolMultiplier, now + duration);
          
          const baseFreq = item.osc.frequency.value;
          // Slowly modulate frequency
          item.osc.frequency.linearRampToValueAtTime(baseFreq * targetFreqMultiplier, now + duration);
        });

        breathingIn = !breathingIn;
      };

      breatheCycle();
      breathingInterval = setInterval(breatheCycle, 4000);
    } catch (e) {
      console.warn("Audio error:", e);
    }
  }

  function stopCalm() {
    if (breathingInterval) {
      clearInterval(breathingInterval);
      breathingInterval = null;
    }
    breathingOscillators.forEach((item) => {
      try {
        item.osc.stop();
      } catch (e) {}
    });
    breathingOscillators = [];
  }

  return {
    playPop,
    playSuccess,
    playSad,
    playRedirect,
    startCalm,
    stopCalm
  };
})();

export default SoundEngine;
