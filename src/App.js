import React, {useState, useEffect, useRef, useCallback, useMemo, createContext} from 'react';
// import {Switch, Route, Redirect} from 'react-router-dom';
import * as Tone from "tone";

import mp3Url from "./media/FWDL.mp3";
import useDeviceOrientation from 'components/useDeviceOrientation';

const frequencyRanges = {
  bass: [20, 140],
  lowMid: [140, 400],
  mid: [400, 2600],
  highMid: [2600, 5200],
  treble: [5200, 14000]
};
const App = () => {
  const [{direction, speed, angle, permissionGranted}, {setPermissionGranted}] = useDeviceOrientation();
  const [volume, setVolume] = useState(0);
  const [playing, setPlaying] = useState(false);
  // filter
  const [filterFrequency, setFilterFrequency] = useState(5000);
  const [filterType, setFilterType] = useState("lowpass");
  const [filterQ, setFilterQ] = useState(0);
  // reverb
  const [reverbWet, setReverbWet] = useState(0.5);
  const [reverbDecay, setReverbDecay] = useState(1.5);
  const [reverbPredelay, setReverbPredelay] = useState(0.01);
  //envelope
  const [envAttack, setEnvAttack] = useState(0.4);
  const [envDecay, setEnvDecay] = useState(0.2);
  const [envSustain, setEnvSustain] = useState(1.0);
  const [envRelease, setEnvRelease] = useState(0.4);
  // lfo
  const [lfoFrequency, setLFOFrequency] = useState(1);
  const [keypressed, setKeypressed] = useState(false);
  // const synth = useMemo(() => new Tone.Synth().toMaster(), []);
  const noise = useMemo(() => new Tone.Noise("white").start(), []);
  const sinWave = useMemo(() => new Tone.Oscillator(440, "sine").start(), []);
  const pluseWave = useMemo(() => new Tone.Synth(), []);
  const reverb = useMemo(() => new Tone.Reverb().toMaster(), []);
  const env = useMemo(() => new Tone.AmplitudeEnvelope({
		attack: envAttack,
		decay: envDecay,
		sustain: envSustain,
		release: envRelease
	}), []);
  const lfo = useMemo(() => new Tone.LFO(lfoFrequency, -4900, 4000).start(), []);
  // const lfo = useMemo(() => new Tone.AutoFilter(lfoFrequency).start(), []);
  const multiply = useMemo(() => new Tone.Multiply(), []);
  const split = useMemo(() => new Tone.Split(),[]);
  const merge = useMemo(() => new Tone.Merge(), []);
  // const soundSource = sinWave;
  const player = useMemo(() => new Tone.Player({
    url : mp3Url,
    loop : true,
    autostart: true
  }), []);
  // const noise = useMemo(() => new Tone.Noise("white").start(), []);

  // const osc = useMemo(() => new Tone.Oscillator(440, "sawtooth"), []);
  const filter = useMemo(() => new Tone.Filter(filterFrequency, filterType, -48), []);

  const analyser = useMemo(() => new Tone.Analyser('fft', 2048), []);

  const switchGraph = () => {
    if (analyser.type === "waveform") {
      analyser.type = "fft";
    } else {
      analyser.type = "waveform";
    }
  }
  const canvasRef = useRef(null);
  const canvasContextRef = useRef(null);
  const requestPermission = () => {
    // setPermissionGranted(true);
    // temp disable
    if (typeof(DeviceOrientationEvent) === "function" && typeof(DeviceOrientationEvent.requestPermission) === "function") {
      // alert('DeviceOrientationEvent.requestPermission');
      DeviceOrientationEvent.requestPermission().then(response => {
          if (response == 'granted') {
            setPermissionGranted(true);
            // window.addEventListener('deviceorientation', onMotion, false);
            // window.addEventListener('deviceorientation', (e) => {
            //   // do something with e
            // })
          }
        })
        .catch(console.error);
    } else {
      setPermissionGranted(true);
      // alert('no DeviceOrientationEvent.requestPermission');
      // window.addEventListener('deviceorientation', onMotion, false);
    }
  };

  // window.player = player;
  // window.reverb = reverb;
  // window.pluseWave = pluseWave;

  // window.env = env;
  // window.merge = merge;
  // window.filter = filter;

  // const freqEnv = useMemo(() => new Tone.AmplitudeEnvelope({
  //   "attack" : 0.2,
  //   "baseFrequency" : "C2",
  //   "octaves" : 4
  // }).connect(Tone.Master), []);
  
  
  // const gate = useMemo(() => new Tone.Gate(0, 0.2, 0.6).toMaster(), []);
  // freqEnv.connect(osc.frequency);
  const play = () => filter.connect(reverb);
  const stop = () => filter.disconnect();

  // const 
  const setCanvas = useCallback((ref) => {
    canvasRef.current = ref;
    canvasContextRef.current = ref.getContext("2d");
  }, []);
  // const play = () => player.start();
  // const stop = () => player.stop();
  const keypress = (event) => {
    let sound = 'C4';
    switch (event.key) {
      case 'a':
      case 'b':
        sound = event.key + '3';
        break;
      case 'c':
      case 'd':
      case 'e':
      case 'f':
      case 'g':
        sound = event.key + '4';
        break;
    }
    // soundSource.triggerAttackRelease(sound, 0.4);
    // soundSource.triggerAttackRelease(10);
    console.log('keypress');
  };
  const keydown = (event) => {
    let line = 4;
    if (event.key) {
      if (event.ctrlKey) {
        line = 3;
      } else if (event.shiftKey) {
        line = 5;
      }
      switch (event.key.toLowerCase()) {
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'e':
        case 'f':
        case 'g':
          sinWave.frequency.value = `${event.key}${line}`;
          setKeypressed(true);
          event.preventDefault();
          break;
  
        default: 
          sinWave.frequency.value = 440;
          break;
      }
    } else {
      sinWave.frequency.value = `C4`;
      setKeypressed(true);
    }
      // setKeypressed(true);
    // }
    // env.triggerAttack();
    // console.log('keydown');
  };
  const keyup = (event) => {
    setKeypressed(false);
    // env.triggerRelease();
    // console.log('keyup');
  };

  const draw = () => {
    // waveform
    if (analyser.type === "waveform") {
      const values = analyser.getValue();
      canvasContextRef.current.save();
      canvasContextRef.current.beginPath();
      canvasContextRef.current.fillStyle = "#000000";
      canvasContextRef.current.fillRect(0, 0, canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
      canvasContextRef.current.strokeStyle = "#FFFFFF";
      canvasContextRef.current.moveTo(0, canvasRef.current.offsetHeight / 2);
  
      for (let i = 0; i < values.length; i++) {
        const amplitude = values[i];
        const x = i / (values.length - 1) * canvasRef.current.offsetWidth;
        const y = canvasRef.current.offsetHeight / 2 + amplitude * canvasRef.current.offsetHeight;
        // Place vertex
        canvasContextRef.current.lineTo(x, y);
      }
      canvasContextRef.current.stroke();
      canvasContextRef.current.closePath();
      canvasContextRef.current.restore();
    } else if (analyser.type === "fft") {
      // fft
      // https://glitch.com/edit/#!/dfpi-audio-fft?path=AudioEnergy.js:44:15
      // analyser2._updated = true;
      analyser.getValue();
      const buffer = analyser._buffer;
      const minFrequency = 0;
      const maxFrequency = analyser.context.sampleRate / 2;
      const n = analyser.size;
      const bands = [];
      for (let i = 0; i < n; i++) {
        const minT = i / n;
        const maxT = minT + 1 / n;
        const minHz = minT * (maxFrequency - minFrequency) + minFrequency;
        const maxHz = maxT * (maxFrequency - minFrequency) + minFrequency;
        // const energy = this.getEnergy(minHz, maxHz);
        const lowIndex = Math.max(
          0,
          Math.min(
            n - 1,
            Math.floor((minHz / maxFrequency) * n)
          )
        );
        const highIndex = Math.max(
          0,
          Math.min(
            n - 1,
            Math.floor((maxHz / maxFrequency) * n)
          )
        );
        let total = 0;
        for (let i = lowIndex; i <= highIndex; i++) {
          total += buffer[i];
        }
        bands.push(total / (highIndex - lowIndex + 1));
      }
      canvasContextRef.current.save();//a
      canvasContextRef.current.beginPath();
      canvasContextRef.current.fillStyle = "#000000";
      canvasContextRef.current.fillRect(0, 0, canvasRef.current.offsetWidth, canvasRef.current.offsetHeight);
      canvasContextRef.current.strokeStyle = "#FFFFFF";
      canvasContextRef.current.moveTo(0, canvasRef.current.offsetHeight / 2);
      canvasContextRef.current.moveTo(0, canvasRef.current.offsetHeight * (0.9 - 0.5 * (Math.min(Math.max(bands[0], -100), -30) + 100) / 70));
      for (let i = 0; i < bands.length; i++) {
        const amplitude = bands[i];
        const x = i / (bands.length - 1) * canvasRef.current.offsetWidth;
        const y = canvasRef.current.offsetHeight * (0.9 - 0.8 * (Math.min(Math.max(amplitude, -100), -30) + 100) / 70);
        // Place vertex
        canvasContextRef.current.lineTo(x, y);
      }
      canvasContextRef.current.stroke();
      canvasContextRef.current.closePath();
      canvasContextRef.current.restore();
    }
    requestAnimationFrame(draw);
  }
  useEffect(() => {
    if (keypressed) {
      // console.log('keydown');
      env.triggerAttack();
    } else {
      // console.log('keyup');
      env.triggerRelease();
    }
    return () => {
      // console.log('keyup');
      // env.triggerRelease();
    }
  }, [keypressed]);
  const toggle = () => {
    if (playing) {
      setPlaying(false);
      stop();
    } else {
      setPlaying(true);
      play();
    }
  };
  useEffect(() => {
    sinWave.volume.value = (volume >= -40? volume: -Infinity);
    noise.volume.value = (volume >= -40? volume: -Infinity);
    // soundSourceL.volume.value = (volume >= -40? volume: -Infinity);
  }, [volume]);
  useEffect(() => {
    filter.frequency.value = parseFloat(filterFrequency);
    lfo.min = filter.frequency.value * 0.1;
    lfo.max = filter.frequency.value * 2;
  }, [filterFrequency]);
  useEffect(() => {
    filter.Q.value = Math.max(0.1, parseFloat(filterQ));
  }, [filterQ]);
  useEffect(() => {
    filter.type = filterType;
  }, [filterType]);
  useEffect(() => {
    reverb.wet.value = parseFloat(reverbWet);
  }, [reverbWet]);
  useEffect(() => {
    reverb.decay = parseFloat(reverbDecay);
    reverb.preDelay = parseFloat(reverbPredelay);
    reverb.generate();
  }, [reverbDecay, reverbPredelay]);
  useEffect(() => {
    env.attack = parseFloat(envAttack);
    env.decay = parseFloat(envDecay);
    env.sustain = parseFloat(envSustain);
    env.release = Math.max(0.001, parseFloat(envRelease));
    reverb.generate();
  }, [envAttack, envDecay, envSustain, envRelease]);
  useEffect(() => {
    lfo.frequency.value = lfoFrequency;
    // lfo.sync();
  }, [lfoFrequency]);
  useEffect(() => {
    reverb.generate().then(() => {
      console.log(reverb);
    });
    noise.chain(filter, reverb, Tone.Master);
    reverb.connect(analyser);
    // reverb.connect(analyser2);
    // 1/2
    // player.start();
    // filter.frequency.connect(lfo);
    // lfo.chain(Tone.Master);
    // lfo.chain(filter, reverb, Tone.Master);
    lfo.connect(filter.frequency);
  }, [env, reverb]);
  
  useEffect(() => {
    const absSpeed = Math.abs(speed);
    const convertedDirection = direction;
    if (absSpeed > 0.3 && absSpeed < 50) {
      setLFOFrequency(speed * 80);
    } else {
      setLFOFrequency(0);
    }
    // speed
    // angle
    // permissionGranted
  }, [direction, speed, angle])

  useEffect(() => {
    document.addEventListener("keydown", keydown);
    // document.addEventListener("keypress", keypress);
    document.addEventListener("keyup", keyup);

    draw();

    requestPermission();
    return () => {
      document.removeEventListener("keydown", keydown);
      // document.removeEventListener("keypress", keypress);
      document.removeEventListener("keyup", keyup);
    }
  }, []);
  return (
    <div>
      {/* <div onMouseDown={keydown} onMouseUp={keyup}>don</div> */}
      <div>{speed}</div>
      <div>{direction}</div>
      <div>{angle}</div>
      <br/>
      <canvas ref={setCanvas} onClick={switchGraph} />
      {/* <canvas ref={setCanvas2} /> */}
      <br/>
      <label>dBm</label>
      <div>
        <input type="range" min="-41" max="6" step="1" onChange={(event) => setVolume(event.target.value)} value={volume} />
        {(volume >= -40? volume + 'dBm': ' Muted')}
      </div>
      <br/>
      {/* <label>Env</label>
      <div>
        <input type="range" min="0" max="2" step="0.1" onChange={(event) => setEnvAttack(event.target.value)} value={envAttack} />
        Attack: {envAttack}
      </div>
      <div>
        <input type="range" min="0" max="2" step="0.1" onChange={(event) => setEnvDecay(event.target.value)} value={envDecay} />
        Decay: {envDecay}
      </div>
      <div>
        <input type="range" min="0" max="1" step="0.1" onChange={(event) => setEnvSustain(event.target.value)} value={envSustain} />
        Sustain: {envSustain}
      </div>
      <div>
        <input type="range" min="0" max="3" step="0.1" onChange={(event) => setEnvRelease(event.target.value)} value={envRelease} />
        Release: {envRelease}
      </div>
      <br/> */}
      <label>
        <select 
          onChange={(event) => setFilterType(event.target.value)}
          value={filterType}
        >
          <option value="lowpass">Lowpass</option>
          <option value="highpass">Highpass</option>
          <option value="bandpass">Bandpass</option>
        </select> Filter</label>
      <div>
        <input type="range" min="20" max="5000" step="1" onChange={(event) => setFilterFrequency(event.target.value)} value={filterFrequency} />
        <input type="text" style={{
            width: '3em',
            border: 0,
            textAlign: 'right',
            fontSize: 20,
            verticalAlign: 'baseline'
          }}
          value={filterFrequency}
          onChange={(event) => setFilterFrequency(event.target.value)}
        />Hz
      </div>
      <div>
        <input type="range" min="0" max="127" step="1" onChange={(event) => setFilterQ(event.target.value)} value={filterQ} />
        Q: {filterQ}
      </div>
      <br/>
      <label>LFO</label>
      <div>
        <input type="range" min="0" max="20" step="0.1" onChange={(event) => setLFOFrequency(event.target.value)} value={lfoFrequency} />
        Frequency: {lfoFrequency}
      </div>
      <br/>
      <label>Reverb</label>
      <div>
        <input type="range" min="0" max="1" step="0.01" onChange={(event) => setReverbWet(event.target.value)} value={reverbWet} />
        Wet: {reverbWet}
      </div>
      <div>
        <input type="range" min="0.1" max="4" step="0.1" onChange={(event) => setReverbDecay(event.target.value)} value={reverbDecay} />
        Decay: {reverbDecay}
      </div>
      <div>
        <input type="range" min="0.01" max="0.1" step="0.01" onChange={(event) => setReverbPredelay(event.target.value)} value={reverbPredelay} />
        Predelay: {reverbPredelay}
      </div>
    </div>
  );
}

export default App;
