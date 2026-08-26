# TOOLS-03 — Audio Pipeline (Restream Studio)

Evidence-based inventory of the Restream Studio audio pipeline, mined from the local capture.
Every row marked **[observed]** quotes an exact literal found on disk. **[inferred]** marks reasoning.

Primary evidence bundles:

| Bundle | Role for audio |
| --- | --- |
| `03-deep-static/recursive/studio.restream.io/e2008f0435580b8b.worklet.js` | the **only** AudioWorklet shipped (1 065 bytes) |
| `client-static/js/593.47f82f224fb8c169.js` | audio core: `AudioContextService`, `VolumeMeter`, `UserCameraSettingsModel`, gain nodes, producer codec options, MediaRecorder, `AudioPlayerService`, `AudioBackgroundStore` |
| `client-static/js/575.434695f973e2e774.js` | audio **UI**: settings form, `SlidingLimiter` meter+gain slider, 19-dot `VolumeMeter`, solo/mute controls |
| `client-static/js/131.8f878df5d7c38b5a.js` | music sidebar, custom music, AI music tools, mute-all, audio-only mode |
| `client-static/js/577.61b0a7bbb0dbc94a.js` | guest-side mirror of the same models |
| `client-static/js/Index.312bd7238c465fa2.js` | feature flags, device-kind enums, hotkeys, custom-music MIME set |
| `client-static/js/externals.b634d3e8690cf1f3.js` | io-ts wire codecs (`AudioBitrate`, `SamplingRate`, `AudioLayoutIO`), gain constants, bundled **hark** VAD |
| `client-static/js/onboarding-chat.2a0e5f8a2643f258.js` | `AudioOptionsPicker` waveform widget |

Negative result worth recording: a full-tree `grep -ril "rnnoise\|krisp\|speex\|denoise\|dolby"` over the
capture returns **only** `node_modules/mime-db`-style false positives. **There is no custom DSP model,
no RNNoise, no Krisp, no WASM audio processor anywhere in the capture.** [observed]

---

## 1. The AudioWorklet — `volumeMeter`

**File:** `03-deep-static/recursive/studio.restream.io/e2008f0435580b8b.worklet.js` (1 065 bytes, ES module) [observed]
**Registered as:** `registerProcessor("volumeMeter", VolumeMeterWorklet)` [observed]
**Class:** `class VolumeMeterWorklet extends AudioWorkletProcessor` [observed]
**Loaded by:** `AudioContextService.addVolumeMeterModuleOnce()` →
`t.audioWorklet.addModule(new URL(o(15082), o.b))`, where webpack module `15082` is
`e.exports = o.p + "e2008f0435580b8b.worklet.js"` (in `593.…js`). [observed]
**Instantiated as:** `new AudioWorkletNode(audioContext, "volumeMeter", { numberOfInputs: 1 })` [observed]

### DSP performed

It is a **windowed RMS → dBFS meter with asymmetric (instant-attack / exponential-release) smoothing and a
delta-gated message port**. No filtering, no gain, no noise processing. It never writes to its outputs
(`process()` returns `true` but leaves `outputs` untouched), so it is a pure tap. [observed + inferred]

Per invocation of `process(inputs)`:

1. Take `inputs[0][0]` — **channel 0 of input 0 only**. If absent → `return false` (processor tears down).
2. `nextMeasureFrameMs -= block.length` (block is 128 frames; the field is misnamed, it counts *frames*).
3. When the counter goes negative, measure:
   - `sum = Σ sample²` over the 128-frame block
   - `rms = Math.sqrt(sum / block.length)`
   - `dB = linearToDb(rms) = 20 * Math.log10(Math.max(rms, epsilon))`
   - `smoothed = Math.max(dB, this.db + (dB - this.db) * (1 - smoothingFactor))`
     → **attack is instantaneous** (`Math.max`), **release is a one-pole IIR** with coefficient
       `1 - 0.85 = 0.15` per measurement tick.
   - `if (Math.abs(smoothed - this.db) > 0.5) this.port.postMessage(smoothed)` — **0.5 dB dead-band**.
   - `this.db = smoothed; nextMeasureFrameMs += intervalInFrames`

### Exact parameters [observed]

| Field / getter | Literal | Meaning |
| --- | --- | --- |
| `measureIntervalMs` | `1e3/24` (41.666… ms) | measurement period → **24 measurements/second** |
| `intervalInFrames` | `this.measureIntervalMs / 1e3 * sampleRate` | ≈ 2000 frames @48 kHz (≈ 15.6 render quanta) |
| `smoothingFactor` | `.85` | release coefficient; effective per-tick decay `×0.15` toward target |
| `minDb` | `-60` | initial `db`, and the floor used by the consumer |
| `epsilon` | `1e-10` | log guard → hard floor of `-200 dB` |
| `nextMeasureFrameMs` | init `= this.measureIntervalMs` | frame countdown accumulator |
| `db` | init `= this.minDb` (`-60`) | last reported value |
| message-port gate | `> .5` | only post when the value moved more than **0.5 dB** |
| `AudioWorkletNodeOptions` | `{ numberOfInputs: 1 }` | mono tap, default 1 output / 128-frame quantum |

> Note: `process()` reads only `input[0]` — a stereo mic is metered on its **left channel only**. [observed]

### `AudioContextService` (`593.…js`) [observed]

- `new (window.AudioContext ?? window.webkitAudioContext)` — **no `sampleRate` option passed**, so the
  context runs at the hardware/browser default (typically 48 000 Hz).
- On construction it logs `Initialized with ${state} state and ${sampleRate} Hz sample rate` with fields
  `{state, sampleRate, baseLatency, currentTime, outputLatency, destination:{numberOfInputs, numberOfOutputs,
  maxChannelCount, channelCount, channelCountMode, channelInterpretation}}`.
- Auto-resume: on `statechange` to `suspended`/`interrupted` it calls `resume()`; on failure it attaches a
  one-shot `document.body` `click` handler that resumes and logs `"Resumed on click"`.
- `addVolumeMeterModuleOnce()` memoises the `addModule` promise (`volumeMeterModuleAddingPromise`); failure
  logs `"Failed to add volume meter worklet module"`.

---

## 2. Noise suppression / echo cancellation / AGC — **100 % browser-native**

All three are plain `getUserMedia` constraints. No custom model exists in the capture. [observed]

### 2.1 Microphone constraint object — exact literal [observed] (`593.…js`)

```js
get audioConstraints(){
  return !(!this.userCameraDevicesService.audioInputDevice &&
           !this.options.shouldAutoStartAudioWithoutDevice) && {
    deviceId: this.userCameraDevicesService.audioInputDevice
                ? { exact: this.userCameraDevicesService.audioInputDevice.deviceId }
                : void 0,
    echoCancellation: this.settings.shouldUseEchoCancellation,
    noiseSuppression: this.settings.actualShouldUseNoiseSuppression,
    autoGainControl: this.settings.shouldUseStereoAudioInput
                       ? void 0
                       : this.settings.shouldUseAutoGainControl,
    sampleRate: this.featureStore.preferSameSampleRate.value &&
                !this.featureStore.suspendAudioContext.value
                  ? this.audioContextService.audioContext.sampleRate
                  : void 0
  }
}
```

Key behaviours: **AGC is omitted entirely (`undefined`) when stereo input is requested**, and
`sampleRate` is only pinned (to the AudioContext's rate) behind the `prefer-same-sample-rate` URL flag.

### 2.2 Screen-share audio constraint — exact literal [observed] (`593.…js`)

```js
audio: {
  echoCancellation: !1,
  noiseSuppression: !1,
  autoGainControl:  !1,
  channelCount: 2,
  ...(this.featureStore.screenShareRestrictOwnAudio.value ? { restrictOwnAudio: !0 } : {})
}
```

i.e. `{echoCancellation:false, noiseSuppression:false, autoGainControl:false, channelCount:2}` —
screen-share audio is captured **stereo and completely unprocessed**, with the Chrome-specific
`restrictOwnAudio: true` added when the `screen-share-restrict-own-audio` flag is on (default on).

### 2.3 `UserCameraSettingsModel` — the switch model [observed] (`593.…js`)

| Getter | Implementation | Notes |
| --- | --- | --- |
| `shouldUseEchoCancellation` | `shouldUseEchoCancellationStore.value` | |
| `shouldUseNoiseSuppression` | `shouldUseNoiseSuppressionStore.value` | raw user preference |
| `shouldLockNoiseSuppression` | `this.systemFeatureStore.isSafari.value` | **NS disabled on Safari** |
| `actualShouldUseNoiseSuppression` | `!this.shouldLockNoiseSuppression && this.shouldUseNoiseSuppression` | value actually sent to gUM |
| `shouldUseAutoGainControl` | `shouldUseAutoGainControlStore.value` | |
| `shouldUseStereoAudioInput` | `shouldUseStereoAudioInputStore.value` | |
| `shouldLockStereoAudioInput` | `this.systemFeatureStore.isChrome.value && (this.shouldUseEchoCancellation \|\| this.actualShouldUseNoiseSuppression)` | Chrome forces mono when AEC/NS on |
| `actualShouldUseStereoAudioInput` | `!this.shouldLockStereoAudioInput && this.shouldUseStereoAudioInput` | |
| `shouldUseHighResolutionAudio` | `shouldUseHighResolutionAudioStore.value` | drives `opusMaxAverageBitrate` |

### 2.4 Persisted settings keys + defaults [observed] (`593.…js`)

| localStorage key (primary camera) | Extra-camera key | Type | Default | Synced |
| --- | --- | --- | --- | --- |
| `studio.settings.shouldUseEchoCancellation` | `studio.extraCameraSettings.shouldUseEchoCancellation` | boolean | `true` | no |
| `studio.settings.shouldUseNoiseSuppression` | `studio.extraCameraSettings.shouldUseNoiseSuppression` | boolean | `true` | `shouldSync: isPrimaryCamera` |
| `studio.settings.shouldUseAutoGainControl` | `studio.extraCameraSettings.shouldUseAutoGainControl` | boolean | `true` | no |
| `studio.settings.shouldUseStereoAudioInput` | `studio.extraCameraSettings.shouldUseStereoAudioInput` | boolean | `false` | `shouldSync: isPrimaryCamera` |
| `studio.extraCameraSettings.shouldUseHighResolutionAudio` | (same key) | boolean | `false` | no |
| `studio.settings.webcam.isMuted` | — | boolean | `false` | `shouldSync: isPrimaryCamera` |

### 2.5 Settings-panel UI (module `71709` in `575.…js`) [observed]

| Control id | Label | Info / tooltip text |
| --- | --- | --- |
| `liveStudioAudioInputSelect` | `Audio input` | select + live 19-dot meter in `renderAfter` |
| `liveStudioAudioOutputSelect` | `Audio output` | rendered only when `audioOutputDevices.length > 0` |
| `liveStudioEchoCancellationInfo` | `Echo cancellation` | `Reduce the echo when talking without headphones.` |
| `liveStudioNoiseSuppressionInfo` | `Noise suppression` | `Reduce background noises during the stream. We recommend keeping it enabled unless you have an isolated environment for capturing audio.` — disabledTip `Noise suppression is not supported in Safari.` |
| `liveStudioStereoInputInfo` | `Stereo audio input` | `Echo cancellation and noise suppression must be disabled to use stereo audio input in Chrome.` — disabledTip `Echo cancellation and noise suppression must be disabled to use stereo audio input.` |
| `liveStudioHighResolutionAudioInput` | `High-resolution audio` | `Increases capture and output audio bitrate to 256kbps, suitable for streaming high-quality audio performance.` |
| `liveStudioAutoGainControlInputInfo` | `Auto gain control` | `Enables auto adjustment of the microphone gain to maintain steady overall volume level.` |

The last three sit behind a `RevealOnClickComponent` labelled **`Show advanced options`**
(prop `collapsedAdvancedAudioSettings = true`). SCSS: `scripts/entries/.../AudioSettingsForm` styles are
inlined; the reveal component is `scripts/components/.../RevealOnClickComponent`. [observed]

---

## 3. Audio mixer — gain, mute, solo, ducking

### 3.1 Gain constants (`sRr`, defined in `externals.…js`) [observed]

```js
v = { MIN: 0, DEFAULT_BACKGROUND_MUSIC: .5, DEFAULT: 1, MAX: 1.5 }
```

| Name | Value | Used as |
| --- | --- | --- |
| `sRr.MIN` | `0` | `minVolume` on every source model → slider min `100*0 = 0` |
| `sRr.DEFAULT` | `1` | initial `audioGainLevel` for camera / screen-share / local video |
| `sRr.MAX` | `1.5` | `maxVolume` → slider max `100*1.5 = 150` (i.e. **+3.5 dB boost**) |
| `sRr.DEFAULT_BACKGROUND_MUSIC` | `.5` | fallback for `preferredMusicVolume` |

### 3.2 Per-source gain graph [observed] (`593.…js`)

Identical three-node graph is built for **camera**, **screen share** and **local video**:

```js
const src  = audioContext.createMediaStreamSource(new MediaStream([inputTrack]));
const dest = audioContext.createMediaStreamDestination();
const gain = audioContext.createGain();
src.connect(gain); gain.connect(dest);
gain.gain.value = this.audioGainLevel;          // camera path sets it immediately
const [processedTrack] = dest.stream.getAudioTracks();
```

- Setter: `setAudioGainLevel(e){ if (this.audioGainLevel!==e){ this.audioGainLevel=e;
  this.audioGainNode && (this.audioGainNode.gain.value = e); … } }` — a **direct `.value` write, no ramp**.
- Screen share additionally keeps them in sync through a mobx reaction on
  `({level:this.audioGainLevel, node:this.audioGainNode}) → node.gain.value = level`.
- Whole graph is bypassed when `featureStore.suspendAudioContext` or `featureStore.suspendAudioGainNode`
  is set (URL flags `suspend-audio-context`, `suspend-audio-gain-node`); then `processedAudioTrack = null`
  and the raw device track is used.
- `audioGainLevel` resets to `sRr.DEFAULT` whenever `audioInputTrack` changes (screen-share path).

### 3.3 Mute / silence semantics [observed]

| Concept | Field | Mechanism |
| --- | --- | --- |
| User mute | `isMuted` (`isMutedStore`, persisted, synced) | reaction sets `audioTrack.enabled = !isMuted && !isSilenced` **and** `audioInputTrack.enabled = …` |
| Auto-silence | `isSilenced` / `setIsSilenced(b)` | driven by `RoomAudioProducerSuspender`: `const t = this.isHeardOnLayout && !this.isMuted; sourceModel?.setIsSilenced(!t); …` then `producer.pause()` / `producer.resume()` |
| Heard-on-layout | `isHeardOnLayout` | `remoteAudioLayoutStore.remoteAudioLayout[stateKey]` and `!entry.isMuted` — the **compositor** decides who is audible |
| Muted by host | `isMutedByHost` | wire message `STREAM_AUDIO_GAIN_STATUS` / mute toasts |
| Mute reason enum | `l = {User:"User", System:"System"}` (`Index.…js`) | `setIsMuted(false, oi.System)` used for auto-unmute on device change |
| Self-muted flag | `isSelfMuted` (`StreamMetadataIO`, default `false`) | gated by backend feature `selfMutedSupport` |

Auto-silence surfaces to the user as these strings [observed]:
`Your mic is muted during the countdown`, `Your mic is muted during video clip`,
`Your mic is muted until the video ends`, `Your mic is muted while you are backstage.`,
`Your mic is muted. <disableSceneAutoSwitchButton>Disable auto-switch</disableSceneAutoSwitchButton> to enable it`,
`Your mic is muted. Press %s to unmute.`

### 3.4 Wire model — `MediaStreamStateIO` audio fields [observed] (`externals.…js`)

```
isMuted: boolean, isOnAir: boolean, isSolo: boolean, isSpotlighted: boolean,
isAudioOnly: boolean (default false), audioGainLevel: number, isAudio: boolean,
isBlinded: boolean, isSelfMuted: boolean (default false),
audioInput: ClientMediaDevice|null, videoInput: ClientMediaDevice|null
```
`HlsVideoStateIO` carries the same `isMuted / isSolo / isSpotlighted / audioGainLevel`.
`AudioLayoutItemIO = { isMuted: boolean }`; `AudioLayoutIO = record<stateKey, AudioLayoutItemIO>`.

### 3.5 Solo & spotlight [observed]

- `get roomSoloMediaStream(){ for (const e of this.mediaStreams) if (e.isSolo) return e; return null }`
  (`575.…js`) — **at most one solo source at a time**.
- Sibling `roomSpotlightedMediaStream` uses `isSpotlighted`.
- Tooltip literal: **`Solo puts a participant as the sole active speaker`**.
- Rendered by `SourceControls` with props `{isOnAir, onAirClick, isSpotlighted, onSpotlightChange,
  isSolo, onSoloChange, onAudioRefresh, isLooped, onLoopChange}` (class prefixes
  `SourceControls_controls__item__`, `SourceControls_isActive__`).

### 3.6 Master / all-sources controls [observed]

| Action | Implementation (`131.…js`, `HostSourcesDeckViewStore`) | Hotkey (`Index.…js`) |
| --- | --- | --- |
| `onMuteAllSources` | `streamsDeckStateStore.updateMediaStreamsIsMutedState(true)` | `Shift + Y` (`{key:"Y", code:"KeyY", withShift:true}`) |
| `onUnmuteAllSources` | `…updateMediaStreamsIsMutedState(false)` | `Shift + U` (`{key:"U", code:"KeyU", withShift:true}`) |
| Toggle own microphone | `MICROPHONE` | `M` (`{key:"M", code:"KeyM"}`) |
| Show/hide all sources | `SHOW_ALL_SOURCES` / `HIDE_ALL_SOURCES` | `Shift + S` / `Shift + H` |

Toast strings: `All sources are muted. Press %s to unmute` / `All sources are unmuted. Press %s to mute`
(`autoClose: 2e3`, toastIds `ALL_SOURCES_MUTED_TOAST` / `ALL_SOURCES_UNMUTED_TOAST`). [observed]

There is **no true master gain node** — "mute all" fans out to per-source `isMuted`. [inferred from 3.6+3.2]

### 3.7 Music volume & the `/6` normalisation [observed] (`593.…js`, module `17165`)

```js
const E = 6;   // exported as `Yf`
const r = (this.gain ?? this.hostBackendSettingsStore.preferredMusicVolume) / E;
await this.audioPlayerService.playAudio({id,name,url,kind,backgroundColor},
                                        {streaming:!0, volume:r, loop:!0});
```
- `preferredMusicVolume` = `eventSettings?.musicVolume ?? sRr.DEFAULT_BACKGROUND_MUSIC` (= `0.5`).
- So a UI gain of `0…1.5` becomes a player volume of `0…0.25`; default `0.5/6 ≈ 0.0833`.
  This is the **music-bed duck factor** — music is played ~6× quieter than the nominal slider value.
- `updateMusicVolume(v)` persists via `hostBackendSettingsStore.updateEventSettings({ musicVolume: v })`.
- Custom tracks use the same divisor: `(this.gain ?? …preferredMusicVolume) / f.Yf`.
- Countdown music is a **separate** volume with its own range (below).

### 3.8 Countdown music volume [observed] (`externals.…js`, module `91662`)

```js
xe = 0, Se = 2, Ee = 1;                       // exported as Tk (min), JG (max), uu (default)
musicVolume: new NumberRange(Tk, JG, "CountdownMusicVolume")
musicVolume: (0,o.k)(r.number, Ee)            // default 1
```
| Parameter | Min | Max | Default |
| --- | --- | --- | --- |
| `CountdownMusicVolume` | `0` | `2` | `1` |

Wire messages: `UpdateCountdownSceneMusicVolume` (`{sceneId, volume}`),
`UPDATE_COUNTDOWN_SCENE_MUSIC` (`{sceneId, music}`). Gated by backend feature
`countdownSceneMusicVolume` (default `false`). UI strings: `Countdown volume`,
`Countdown music`, `Adjusting countdown volume…`, `While the countdown music plays, this music is paused`. [observed]

### 3.9 Volume-control React components [observed]

| Component | Bundle | Props / literals |
| --- | --- | --- |
| `VolumeControl` (simple) | `114.…js` mod `57390` | `{isMuted, isMutedByHost, onMuteChange, isViewOnly, audioGainLevel = sRr.DEFAULT, onAudioGainLevelChange, minVolume = 0, maxVolume = 100, thumbSizePx}`; `onChange = e => onAudioGainLevelChange(e/100)` |
| `VolumeControl` (metered) | `575.…js` mod `80016` | wraps `SlidingLimiter`; `progress = (volume?.value ?? 0) * maxVolume * 100`, `limit = 100*audioGainLevel`, `min = 100*minVolume`, `max = 100*maxVolume`, `ariaLabel = "Audio Gain"` |
| `SlidingLimiter` | `575.…js` mod `80016` | the 10-segment meter + gain slider (see §4) |
| `VolumeMeter` | `575.…js` mod `15701` | 19-dot readout (see §4) |
| `SimpleSlider` | SCSS `scripts/components/VolumeControl/SimpleSlider/` | `--progress`, `--thumb-size` (12 px in music cards, 14 px elsewhere), 4 px track |
| `VolumeMuteControl` | SCSS `scripts/components/VolumeControl/VolumeMuteControl/` | mute button, `alternativeIcons` variant |
| `SelfMutedIndicator` | SCSS `scripts/components/SelfMutedIndicator/` | badge for `isSelfMuted` |

Recovered SCSS paths (deduped) [observed]:
`scripts/components/VolumeControl/VolumeControl.module.scss`,
`scripts/components/VolumeControl/SimpleSlider/SimpleSlider.module.scss`,
`scripts/components/VolumeControl/VolumeMuteControl/VolumeMuteControl.module.scss`,
`scripts/components/SelfMutedIndicator/SelfMutedIndicator.module.scss`,
`scripts/modules/SourcesDeck/components/ClientSources/SlidingLimiter/SlidingLimiter.module.scss`,
`scripts/modules/Player/components/ToggleMicrophone/ToggleMicrophone.module.scss`.
Slider thumb asset: `scripts/components/VolumeControl/assets/volume-control.svg`.

---

## 4. Level metering — computation, rate, dB range

### 4.1 Chain

```
MediaStreamTrack.clone()  →  createMediaStreamSource  →  AudioWorkletNode("volumeMeter")
                                                            └─ port.postMessage(dB) → VolumeMeter.setDb
```
`VolumeMeter` **clones** the monitored track (`this.monitoredTrack = t.clone(); this.monitoredTrack.enabled = true`)
so metering keeps working while the source track is muted (`enabled=false`). [observed]

### 4.2 `class VolumeMeter` (`593.…js`, module `1202`) [observed]

| Member | Literal | Notes |
| --- | --- | --- |
| `db` | init `-60` | last value from the worklet |
| `setDb` | `e => this.db = e` | port handler is `e => this.setDb(e.data ?? -60)` |
| `get isLoud()` | `return this.volume > .4` | 0.4 normalised ⇒ **−36 dBFS** speaking threshold |
| `get volume()` | `(0, l.Pv)(this.db)` | normalised 0…1 |
| `get linearVolume()` | `(0, l.Zy)(this.db)` | linear amplitude |
| `suspend()` | `…disconnect(); this.node = null; this.setDb(-60)` | resets to floor |
| lazy activation | `tC(this,"db", … resume())` / `q$(this,"db", … suspend())` | mobx **becomeObserved / becomeUnobserved** — the worklet only runs while some UI observes the value |
| node options | `{ numberOfInputs: 1 }` | |
| error hook | `onprocessorerror` → `"Unexpected worklet processor error"` | |
| queue | `new PQueue({ concurrency: 1 })` | serialises resume/suspend/destroy |
| meter names | `` `Camera:${cameraId}` ``, `` `ScreenShare:${id}` ``, `` `RoomMediaStream:${stateKey}` ``, `"AudioBackground"`, `` `VolumeMeter:${name}` `` (logger) | |

`VolumeMeterFactory.create(name, track)` builds them; construction is skipped when
`featureStore.suspendAudioContext` or `featureStore.suspendVolumeMeters` is set. [observed]

### 4.3 dB ↔ UI conversion helpers (`593.…js`, module `84018`) [observed]

```js
const clamp = (e,t,r) => Math.max(t, Math.min(e, r));                 // module 90055, export N
const Pv = (e, t = -60, o = 0) => (clamp(e,t,o) - t) / (o - t);       // dB → 0…1
const Zy = (e, t = -60, o = 0) => Math.pow(10, clamp(e,t,o) / 20);    // dB → linear amplitude
const n=54, a=179, d=126, c=255, l=86, u=48;
const Hn = e => e < .9
      ? (e <= .01 ? `rgba(54, 179, 126, 0)` : `rgba(54, 179, 126, 1)`)
      : `rgba(255, 86, 48, 1)`;
```

| Quantity | Range |
| --- | --- |
| **Meter dB range** | **−60 dBFS … 0 dBFS** (both the worklet floor and `Pv`/`Zy` defaults) |
| Normalised `volume` | `0` at −60 dB → `1` at 0 dB, linear in dB |
| `isLoud` threshold | `volume > 0.4` ⇒ **−36 dB** |
| `Hn` "silent" | `volume <= 0.01` ⇒ ≈ −59.4 dB → fully transparent |
| `Hn` "clipping" | `volume >= 0.9` ⇒ **−6 dB** → red `#FF5630` |
| `Hn` normal | green `#36B37E` |

`Hn` is applied as a **speaking/level ring border** on scene source previews:
`const e = Hn(s.volume?.value ?? 0); <div style={{borderColor: e}} />` (`131.…js`). [observed]

### 4.4 Meter widget A — `SlidingLimiter` (10 segments) [observed] (`575.…js`, mod `80016`)

```js
const k = useMemo(() => new Array(10).fill(null), []);   // 10 bars
const I = .6 * k.length;   // 6  → yellow from index 6
const T = .8 * k.length;   // 8  → red    from index 8
const L = Math.min(progress, limit);
const B = Math.floor(L / (max / k.length));              // how many bars lit
const V = limit / max * k.length;                        // limiter (gain) position
…
const r = t >= T ? red : t >= I ? yellow : green;
```

| Aspect | Value |
| --- | --- |
| Segment count | **10** |
| Green segments | indices 0–5 (`< 0.6 × 10`) — `#36b37e` |
| Yellow segments | indices 6–7 (`>= 0.6 × 10`) — `#ffab00` |
| Red segments | indices 8–9 (`>= 0.8 × 10`) — `#de350b` |
| Bar height | `4px` (`2px` in `isCompactMode`) |
| Inactive bar colour | `rgb(255 255 255 / 54%)` (`/ 30%` compact) |
| Colour transition | `background-color 200ms linear` |
| Level is clipped by the gain limiter | `Math.min(progress, limit)` — the meter never shows more than the fader |
| CSS vars | `--sliderControlWidth: 14px`, `--sliderWidth: 98px` |
| Numeric readout | `<output name="rangeOutput">` positioned via `rAF`, shows the raw 0–150 value on hover |
| Slider step | `onChange: Math.round(Number(e.target.value))` — **integer percent steps** |

### 4.5 Meter widget B — settings-panel `VolumeMeter` (19 dots) [observed] (`575.…js`, mod `15701`)

```js
const c = ({volume, circlesCount = 19, activeVolumeClassName = "", defaultVolumeClassName = ""}) => {
  const c = volume * t;                        // t = circlesCount
  … h.map((e,t) => <div className={cx(circle, r, {[green]: c > t, [o]: c > t})} key={t}/>)
}
```
| Aspect | Value |
| --- | --- |
| Dot count | **19** (default prop `circlesCount = 19`) |
| Lit test | `volume * 19 > index` |
| Dot geometry | `width: 12px; height: 4px` |
| Idle colour | `rgb(9 30 66 / 14%)` |
| Active colour | `#36b37e` |
| Transition | `background-color 200ms linear` |
| Class names | `VolumeMeter_root__HBOyS`, `VolumeMeter_circle__DKcyg`, `VolumeMeter_green__d4vm5` |

### 4.6 Update rates [observed]

| Path | Rate |
| --- | --- |
| Worklet → main thread | ≤ **24 msg/s**, gated by the 0.5 dB dead-band |
| React re-render | mobx-driven, i.e. same 24 Hz ceiling |
| Camera placeholder canvas (V1) | `1e3/30` → 30 fps |
| Camera placeholder canvas (V2) | `featureStore.cameraPlaceholders.value ? 30 : 60` fps |
| Local-preview placeholder (hark path) | `window.setInterval(…, 1e3/30)` → 30 fps |
| hark VAD poll | `interval = 50` ms |

### 4.7 Remote (non-local) levels — SFU-signalled, not measured locally [observed]

```js
var p = function(e){ return e[e.MAX = 0] = "MAX", e[e.MIN = -127] = "MIN", e }({});
…
onProducerVolumes: e => { for (const t of this.mediaStreams.values()) {
   const o = t.lastAudioProducerId ? e[t.lastAudioProducerId] : null;
   t.setRemoteVolumeDb(o ?? h.f.MIN); } }
```
- SFU pushes a `ProducerVolumes` message (`{producers: Record<producerId, dB>}`); the client waits on it in a
  loop (`waitForSfuMessage("ProducerVolumes")`).
- Range enum: `MAX = 0`, `MIN = -127` (RTP audio-level / dBov convention).
- `RoomMediaStream.volume` resolution order:
  1. flag `liveAudioVolumeUpdates` off → `Pv(remoteVolumeDb)`
  2. own produced source → its local `volumeMeter` volume, forced to `0` when `remoteVolumeDb <= -127`
  3. otherwise `volumeMeter?.volume ?? Pv(remoteVolumeDb)`

### 4.8 Second, legacy metering path — bundled **hark** (AnalyserNode) [observed]

`externals.…js` module **`66885`** is the `hark` library — the **only** `createAnalyser` /
`getFloatFrequencyData` in the whole capture. It is imported once, in `593.…js`, by the
`LocalCameraPlaceholder` preview component.

| hark parameter | Literal default |
| --- | --- |
| `analyser.fftSize` | `512` |
| `analyser.smoothingTimeConstant` | `options.smoothing \|\| .1` |
| poll `interval` | `options.interval \|\| 50` ms |
| `threshold` | `-50` dB (both media-element and MediaStream branches) |
| `history` | `10` samples |
| level metric | `max(bin)` over `getFloatFrequencyData` bins `4 … length`, ignoring `>= 0` |
| speaking on | `level > threshold` **and** ≥ 2 of last 3 history slots set |
| speaking off | `level < threshold` **and** all 10 history slots clear |
| events | `volume_change`, `speaking`, `stopped_speaking`, `state_change` |

Consumer mapping in `593.…js`:
```js
hark(mediaStream, {play:!1}).on("volume_change", dB => {
  let v = Math.round(10 * Math.pow(10, dB / 85));   // 0…10 scale
  if (v === 1) v = 0;                               // squelch the lowest step
  ref.current = v;
});
```

---

## 5. Music beds / soundboard / sound effects

**There is no user-facing soundboard.** What exists is: a curated streaming music library, user-uploaded
custom music, AI-generated music, countdown music, and two hard-coded UI notification sounds. [observed]

### 5.1 UI notification sounds (the only bundled SFX) [observed]

| Asset | Bundle referencing it | Size on disk |
| --- | --- | --- |
| `assets/guest-joined.16cd1e77e0e42149.aac` | `593.…js` (module `34576`) | 16 719 B |
| `assets/host-joined.16cd1e77e0e42149.aac` | `577.…js` | 16 719 B |

Playback helper (`593.…js`, module `41208`) — singleton `<audio>` routed to the chosen output device:
```js
let s; async function r(e, t){ return s || (s = new Audio),
  t && await (0, i.J8)(s, t),          // apply setSinkId(t)
  s.src = e, s.play(); }
```

### 5.2 Curated background-music catalogue (`593.…js`, module `54746`) [observed]

Fetched from `getAudioBackgrounds()` → `GET /audio-backgrounds`, then filtered against a hard-coded
allow-list of playlists → groups → channels:

```js
const i = {
  moods:  new Map([["calm", Set{"Acoustic"}],
                   ["heroic", Set{"Epic","Cinematic"}],
                   ["erotic", Set{"Erotic"}]]),
  genres: new Map([["house", Set{"Minimal House"}],
                   ["chill", Set{"Downtempo","Chill","Lounge"}],
                   ["ambient", Set{"Ambient","Atmosphere"}],
                   ["jazz & funk", Set{"Jazz"}],
                   ["pop", Set{"Future Pop","Corporate","R&B"}],
                   ["hiphop", Set{"Lofi","Hiphop","Chill Hop"}],
                   ["rock & metal", Set{"Indie Rock"}],
                   ["classical", Set{"Classical"}],
                   ["folk", Set{"World Music"}]]),
  sleep:  new Map([["sounds", Set{"Nature","Rain"}]])
};
```

Display order (`s`, index = sort key) [observed]:
`Chill, Downtempo, Chill Hop, Hiphop, Lofi, Lounge, R&B, Minimal House, Future Pop, Erotic, Classical,
Epic, Cinematic, World Music, Corporate, Indie Rock, Acoustic, Jazz, Ambient, Atmosphere, Nature, Rain`

Paid/exclusive set `r` = all of the above **except** `Downtempo`, `Chill Hop`, `Lofi`
(exclusivity gate: `userStore.user?.features.studioHasBackgroundMusic`; string
`Exclusive soundscape available to you and all the users on the Standard plan and above`). [observed]

Display-name remap `u` [observed]:
`Lofi→"Lo-Fi"`, `Hiphop→"Hip hop"`, `Xmas→"New Year"`, `Nature→"Nature Sounds"`, `Erotic→"Love"`, `Spooky→"Halloween"`.
Seasonal predicates: `Mm = e => "Christmas" === e`, `Hw = e => "Xmas" === e`,
`xY = e => "Valentines" === e`, `hS = e => "Spooky" === e`.

Track card backgrounds: 14 CSS gradients, base
`linear-gradient(94.52deg, #1A2779 0%, #160157 32.99%, #0C0234 65.06%, #450178 100%)`; `DU()` picks a
random different one (max 5 tries). [observed]

`AudioBackground` model fields: `{id: `${playlist}${channel_id}`, name, kind, url: channel.stream.url,
isExclusive, backgroundColor, duration}`; playback is `{streaming: true, volume, loop: true}`. [observed]

### 5.3 Audio player service (`593.…js`) [observed]

`AudioPlayerKindIO` (`MYw`, module `34499`): `BACKGROUND` | `CustomTrack` | `CountdownScene`.
`AudioPlayerStatusTypeIO` (`IuX`): `starting` | `playing` | `paused` | `stopped` | `failed`.

Playback is **server-side** — every method is a room-manager message, not a local `<audio>` element:

| Method | Message | Payload |
| --- | --- | --- |
| `playAudio(audio, options)` | `PLAY_AUDIO` | `{...audio, ...options}` — options include `{streaming, volume, loop}` |
| `stopAudio(kind)` | `STOP_AUDIO` | `{kind}` |
| `restartAudio(kind)` | `RESTART_AUDIO` | `{kind, backgroundColor}` |
| `setAudioVolume(kind, volume)` | `SET_AUDIO_VOLUME` | `{kind, volume}` |
| `pauseAudio(kind)` | `PAUSE_AUDIO` | `{kind}` |
| `resumeAudio(kind)` | `RESUME_AUDIO` | `{kind}` |
| `seek(kind, ms)` | `SeekAudio` | `{kind, positionMs}` |
| `updateLoop(kind, bool)` | `UpdateAudioLoop` | `{kind, shouldLoop}` |

The mixed music comes back into the client as an SFU consumer with
`associatedMediaStreamKind === RoomMediaStreamKind.AUDIO_SOURCE_PULL`, which is what
`AudioBackgroundStore.mediaStreamTrack` meters. [observed]

### 5.4 Custom music upload [observed]

Accepted MIME set (`Index.…js`):
```js
Mp3:"audio/mpeg", Aac:"audio/aac", Flac:"audio/flac", Wav:"audio/wav", M4a:"audio/x-m4a",
Wma:"audio/x-ms-wma", VideoWma:"video/x-ms-wma", Ogg:"audio/ogg", Ac3:"audio/ac3",
Aiff:"audio/aiff", Aifc:"audio/aifc", Amr:"audio/amr", Basic:"audio/basic",
Caf:"audio/x-caf", Voc:"audio/x-voc", Weba:"audio/webm"
```
Status enum `CustomMusicTrackStatus`: `Uploading | Processing | Ready | Failed`.
Errors: `InvalidCustomMusicFileMimeTypeError`, `CustomMusicTrackUploadError`,
`CustomMusicTrackDeleteError`, `CustomMusicTrackRenameError`, `CustomMusicTrackReorderError`.
Server-side variant codec enum `AudioSourceVariantAudioCodec = Aac | Opus | Mpeg`;
variant picker prefers `Mpeg`: `(e, t = [WJ.Mpeg]) => e.find(x => t.includes(x.codec)) ?? e[0]`.
Copyright gate string: `I own or have licensed all my uploaded audio`;
warning: `Creators may receive copyright strikes if their streams include unlicensed audio.`

SCSS modules (recovered): `scripts/modules/BackgroundMusic/components/{BackgroundMusicContainer,
BackgroundMusicContent, BackgroundMusicList, AudioItem}`, `scripts/modules/CustomMusic/components/{CustomMusicContent,
CustomMusicDndZone, CustomMusicItem, CustomMusicList, CustomMusicUploadButton}`,
`scripts/dialogs/{CustomMusicCopyrightWarningModal, CustomMusicNewFunctionalityModal}`,
`scripts/modules/Sidebar/components/HostSidebar/MusicStatus/MusicStatus.module.scss`,
`scripts/components/MusicNewExperienceBanner/`. [observed]

### 5.5 AI music generation (Suno) [observed] (`131.…js`)

Tool `generate_music`: *"Generate a pair of short music tracks via **Suno**. Suno always returns two options
for the same prompt… persists it via `upload_custom_music({ url })`"*. Notes in the description:
`instrumental` defaults to `true`; optional `vocalGender`; *"Generation takes 30 s – 3 min. The audio URLs
returned are valid for ~15 days on Suno's CDN"*. UI: `Music <highlight>AI<super>+</super></highlight>`,
`Generating music…`, `Music generated`, `Music service currently unavailable.`

### 5.6 AI agent audio tool surface (`131.…js` / `onboarding-chat.…js`) [observed]

| Tool | Schema / range | UI label |
| --- | --- | --- |
| `get_audio_backgrounds` | — | `Get music` |
| `play_audio_background` | `{id: string}`; exclusive tracks require `studioHasBackgroundMusic` | `Play music` |
| `stop_audio_background` | `{}` | `Stop music` |
| `set_music_volume` | `{volume?: number().min(0).max(1.5), isMuted?: boolean}` — *"Volume is 0-100 (before internal normalization)"* | `Music volume` |
| `generate_music` | Suno prompt / `instrumental` / `vocalGender` | `Generate music` |
| `upload_custom_music` | `{url, filename?: max 120 chars}`, fallback name `custom-music.mp3` | — |
| `set_participant_volume` | `{stateKey, volume: number().min(0).max(1.5)}` — *"Audio gain level (0 = silent, 1 = default, up to 1.5 for boost)"* | `Source volume` |
| `set_participant_muted` | `{stateKey, isMuted: boolean}` | `Mute source` |
| `set_participant_audio_only` | `{stateKey, isAudioOnly: boolean}` | `Audio only` |
| `set_countdown_music` | `{sceneId, …}` | `Countdown music` |
| `set_countdown_music_volume` | `{sceneId, volume: number().min(0).max(1)}` | `Countdown volume` |
| `present_audio_options` | renders the `AudioOptionsPicker` widget | `Pick a track` |

---

## 6. Monitoring, output device, mic-test flow

### 6.1 Output-device selection [observed]

- Device kinds enum (`Index.…js`): `{VIDEO_INPUT:"videoinput", AUDIO_INPUT:"audioinput", AUDIO_OUTPUT:"audiooutput"}`.
  Note the **client-side wire enum only carries `AudioInput`/`VideoInput`** — `toClientJson()` throws
  `Failed to convert MediaDeviceInfo to ClientMediaDevice: Unsupported device kind ${kind}` for `audiooutput`,
  so output devices are purely local. [observed]
- Support probe + apply (`593.…js`, module `50418`):
  ```js
  const d = (e, t = !0) => (t && "boolean" == typeof a || (a = "setSinkId" in (e ?? document.createElement("video"))), a);
  const l = (e, t) => { const o = c.get(e) ?? new PQueue({concurrency:1}); c.set(e,o);
    return o.add(async () => { d(e) && (await e.setSinkId(""), await e.setSinkId(t)); }); };
  ```
  The **`setSinkId("")` → `setSinkId(id)` double-call** is a deliberate re-bind; each element gets its own
  serialising queue.
- `navigator.mediaDevices.selectAudioOutput()` is **not used** (0 occurrences). [observed]
- Video/preview components take an `audioOutputDeviceId` prop (`131.…js`) and route notification sounds
  through the same sink (`§5.1`).
- Settings select id: `liveStudioAudioOutputSelect`, label `Audio output`, shown only when
  `audioOutputDevices.length > 0` (Firefox/Safari therefore hide it). [observed + inferred]
- Instrumentation: the bundled watchRTC SDK monkey-patches `HTMLMediaElement.prototype.setSinkId` and emits
  `["audioOutputChange", null, device.label]`. [observed]

### 6.2 "Mic test" / pre-join check flow [observed]

There is no dedicated record-and-play-back mic test. The check is a **live meter** in three places:

| Surface | Evidence |
| --- | --- |
| Settings → Audio input select, with the 19-dot `VolumeMeter` in `renderAfter` | `575.…js` mod `71709` |
| Onboarding/permission screen strings | `Check your camera and mic`, `Get started by allowing Studio to use your camera and mic.`, `Allow Mic/Webcam`, `Allow mic/cam access`, `Enter Studio Without Mic`, `For best results, use an external camera and mic with the latest version of` |
| Local camera placeholder with animated level ring (hark) | `593.…js` `LocalCameraPlaceholder` |

Failure strings [observed]: `No microphone found`, `Microphone access is blocked`,
`Microphone permission denied`, `Unable to access the microphone`,
`Unable to access camera and microphone`, `You have blocked microphone access. Please update your browser settings to allow access.`,
`Can't access no longer available microphone. Please reconnect it or select another device.`,
`Streaming the microphone is not supported on your device.`,
`Use of multiple microphones at the same time not supported in this browser.`,
`Studio needs a microphone to join on air. Connect one, then retry.`,
`Mic access not granted. <microphonePermissionsButton>How to fix it?</microphonePermissionsButton>`.

### 6.3 Host-controlled device switching [observed]

Backend feature flag `mediaDevicesControls` (default `false`). Strings:
`Host changed your microphone to <bold>{deviceLabel}</bold>`,
`Host wants to change your microphone to <bold>{deviceLabel}</bold>`,
`Requested guest to change microphone to <bold>{deviceLabel}</bold>`,
`Requested host to change microphone to <bold>{deviceLabel}</bold>`,
`<bold>Microphone</bold> changed to <bold>%s</bold>`.
Analytics event: `Microphone Changed`. Host-mute strings: `The host muted your mic`,
`The host muted $audioInputName`, `The host muted your screen share`, `The host muted your local video`
(+ `unmuted` variants).

### 6.4 Headphone monitoring

**No local monitoring / foldback path exists.** The only `createMediaStreamDestination()` graphs feed the
WebRTC producer, never `audioContext.destination`; the meter worklet's output is discarded. hark's
`play` option is explicitly passed `false` in the only call site. [observed + inferred]

---

## 7. Audio encoding constants

### 7.1 WebRTC producer (mic / screen / local video → SFU) [observed] (`593.…js`, module `22789`)

```js
const R = "video" === track?.kind ? "medium" : "high";
const P = { dtx: !0, priority: R, networkPriority: R };
const O = "video" === track.kind ? … : [{ dtx: !0, priority: "high", networkPriority: "high", adaptivePtime: !0 }];
await transport.addProducer({
  track, appData: {associatedMediaStreamId, kind, sourceId, targetStateKey, targetSceneId},
  stopTracks: !1, disableTrackOnPause: !1, encodings: O,
  zeroRtpOnPause: "audio" === track.kind ? v.audioZeroRtpOnPause.value : v.videoZeroRtpOnPause.value,
  codecOptions: {
    opusStereo: Boolean("audio" === track.kind && h),
    opusNack: !0,
    opusMaxAverageBitrate: S.shouldUseHighResolutionAudio ? 256e3 : void 0
  }
}, codecMimeTypeOverride);
```

| Constant | Value |
| --- | --- |
| Codec | **Opus** (mediasoup `codecOptions`; no audio `codecMimeTypeOverride` — the override only carries `video/vp9`, `video/vp8`, `video/h264`) |
| `opusStereo` | `true` iff audio **and** `actualShouldUseStereoAudioInput` |
| `opusNack` | `true` (always) |
| `opusMaxAverageBitrate` | `256000` when *High-resolution audio* is on, otherwise `undefined` (browser default ≈ 32–40 kbps mono) |
| `dtx` | `true` |
| `priority` / `networkPriority` | `"high"` for audio, `"medium"` for video |
| `adaptivePtime` | `true` (audio only) |
| `zeroRtpOnPause` | `audioZeroRtpOnPause` — URL flag `audio-zero-rtp-on-pause`, **default true** |
| Capture sample rate | not forced; equals `AudioContext.sampleRate` only when `prefer-same-sample-rate` is set |
| Channel count | not constrained for mic (stereo requested via `opusStereo`); **`channelCount: 2` for screen share** |

### 7.2 Outgoing broadcast (compositor → RTMP) codecs [observed] (`externals.…js`)

```js
(Ch = Eh || (Eh = {}))[Ch["128kbps"] = 128e3] = "128kbps",
 Ch[Ch["160kbps"] = 16e4]  = "160kbps",
 Ch[Ch["192kbps"] = 192e3] = "192kbps",
 Ch[Ch["256kbps"] = 256e3] = "256kbps";
const Th = Oh("AudioBitrate", Eh);

(Rh = Ih || (Ih = {}))[Rh["44100hz"] = 44100] = "44100hz",
 Rh[Rh["48000hz"] = 48e3] = "48000hz";
const kh = Oh("SamplingRate", Ih);

audioSettings: readonly({ bitrate: AudioBitrate, samplingRate: SamplingRate })   // "AudioSettings"
```

| Enum | Members |
| --- | --- |
| `AudioBitrate` | `128000`, `160000`, `192000`, `256000` (labels `128kbps`…`256kbps`) |
| `SamplingRate` | `44100`, `48000` (labels `44100hz`, `48000hz`) |
| Carrier | `CreateLiveStreamOptionsIO.audioSettings` (partial) and `LiveStream…IO.audioSettings` (required) |
| Client override | URL param `outgoing-stream-audio-bitrate` → `featureStore.outgoingStreamAudioBitrate` (validated against `AudioBitrate`) |

No default is chosen client-side — the value is server-selected; the client can only override it via the
debug query param. [observed + inferred]

### 7.3 Local recording (`MediaRecorder`) [observed] (`593.…js`, `Index.…js`)

```js
function bitrates({width, height, framerate}) {
  const r = Math.max(width, height), n = framerate >= 50;
  let s;
  if (r >= 2160) s = n ? 21e6 : 14e6;
  else if (r >= 1080) s = n ? 9e6 : 6e6;
  else if (r >=  720) s = n ? 8e6 : 5e6;
  else { const e = width*height/921600; s = Math.round(5e6*e); }
  return { audioBitsPerSecond: 256e3, videoBitsPerSecond: s };
}
new window.MediaRecorder(stream, { audioBitsPerSecond, videoBitsPerSecond, mimeType });
```
**`audioBitsPerSecond` is a flat `256000` regardless of resolution.** [observed]

Candidate mimeTypes (`Index.…js`, module `97882`) [observed]:
```js
o = ["video/x-matroska;codecs=avc1.4D402A,opus", "video/x-matroska;codecs=avc1,opus"]
a = ["video/mp4;codecs=avc1.4D402A,mp4a.40.2", "video/mp4;codecs=avc1,mp4a.40.2"]
l = ["video/mp4;codecs=avc3.4D402A,mp4a.40.2", "video/mp4;codecs=avc3,mp4a.40.2"]
c = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm", "video/mp4"]
```
→ recording audio codec is **Opus** (WebM/Matroska) or **AAC-LC `mp4a.40.2`** (MP4). Shot size limit
`Bytes.fromBytes(5242880)` (5 MiB) per part. `LocalRecordingKindIO = AudioOnly | VideoOnly | AudioVideo`.

Deliverables in the download modal [observed]: `Full video` (MP4), `Full audio` (**M4A**),
`Split audio tracks` (ZIP of per-participant tracks, Professional plan),
`Save your streams as video files and their audio-only versions for repurposing and podcasting`.

### 7.4 HLS / playback (`hlsjs.…js`, `restreamvideoeditor.…js`) [observed]

Standard hls.js constants — ADTS sampling-rate table
`[96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350]`,
MPEG-audio table `[44100, 48000, 32000, 22050, 24000, 16000, 11025, 12000, 8000]`,
containers `audio/mp4`, `audio/mpeg`, codec swap `mp4a.40.2 ↔ mp4a.40.5`,
Android forced to `mp4a.40.2`, `inputTimeScale: 9e4`.

---

## 8. Audio-related widgets

| # | Widget | Location | Key literals |
| --- | --- | --- | --- |
| 1 | **`SlidingLimiter`** — 10-segment meter with an overlaid gain fader | `575.…js` mod `80016`; SCSS `scripts/modules/SourcesDeck/components/ClientSources/SlidingLimiter/` | 10 bars, `#36b37e`/`#ffab00`/`#de350b`, `--sliderWidth:98px`, `--sliderControlWidth:14px`, hover `<output>` |
| 2 | **`VolumeMeter`** — 19-dot input meter in the settings dialog | `575.…js` mod `15701` | `circlesCount = 19`, `12px × 4px` dots, `#36b37e` |
| 3 | **`VolumeControl` / `VolumeMuteControl` / `SimpleSlider`** | `114.…js` mod `57390`, `575.…js` mod `80016` | `min 0 / max 1.5`, `thumbSizePx` 12 or 14, `aria-label="Audio Gain"` |
| 4 | **`SourceControls`** solo / spotlight / refresh-audio row | `575.…js` | `Solo puts a participant as the sole active speaker`, `Minimize`/`Maximize`, `Refresh`, `Loop` |
| 5 | **`SelfMutedIndicator`** | SCSS `scripts/components/SelfMutedIndicator/` | tied to `isSelfMuted`, feature `selfMutedSupport` |
| 6 | **`ToggleMicrophone`** player button | SCSS `scripts/modules/Player/components/ToggleMicrophone/` | `Mute microphone (currently unmuted)` / `Unmute microphone (currently muted)`, hotkey `M` |
| 7 | **Audio-only participant tile** (`AudioOnlyMode`) | `Index.…js`, `575.…js`, `131.…js`; SCSS `scripts/components/AudioOnlyMode/AudioOnlyOnboardingPopover/` | `Audio only`, `Audio on, camera hidden`, `Hide camera, keep audio`, `Audio only enabled. <changeAudioOnlyButton>Show camera</changeAudioOnlyButton>`, `Audio-only is ON - everyone can hear you`, flag `audio-only-mode` (default on) |
| 8 | **`CameraPlaceholderService` (V1)** — canvas avatar with a pulsing level ring | `593.…js` | ring radius `iconRadius + currentVolume`, attack `+13.333333333333334 px/frame`, release `−200/30 px/frame`, colours `#181818` bg / `#383838` ring / `#767676` disc, `f` icon-size ratio, `volume = 100 × volumeMeter.volume`, 30 fps |
| 9 | **`CameraPlaceholderServiceV2`** — WebGL renderers | `593.…js` | `ImageCameraPlaceholderRenderer` + `TextCameraPlaceholderRenderer`; uniforms `u_soundLevel`, `u_circleSizeInner`, both `map(level, [0,1] → [0,0.5], {clamp:false})`; 3 staggered spring levels; spring `stiffness 200, damping 10, mass 0.2, dt 1/60, rest 0.01`; blur downscale `A = 1/12`, `u_blur_radius = 13 × (height/720)`; 30 or 60 fps |
| 10 | **`LocalCameraPlaceholder`** (hark-driven preview) | `593.…js` | `CanvasCameraPlaceholderDrawer(canvas, .3, .85, "#767676", "#383838", "#181818")`, canvas `1280×720`, `setInterval(1e3/30)`, disc radius `.33*h/2 + 10*volume`, `volume = round(10 * 10^(dB/85))` with `1 → 0` |
| 11 | **Speaking ring on scene source previews** | `131.…js` | `borderColor = Hn(volume)` → transparent ≤0.01, `#36B37E`, `#FF5630` ≥0.9 |
| 12 | **`AudioOptionsPicker` waveform** (AI onboarding) | `onboarding-chat.…js` | **synthetic** waveform: FNV-1a hash of track id → LCG PRNG → `56` bars, `h = clamp(0.18 + 0.77·rand·(0.4+0.6·sin(i/55·π)), 0.18, 0.95)`; `--fade-range = 4/55`; `--played-ratio`, `--hover-ratio`, `--play-gate`; `<input type=range step=1>` scrub over a real `<audio preload="metadata">`; labels `Pick a track`, `Pick this`, `Skip`, `Play`, `Seek`, `mm:ss / mm:ss` |
| 13 | **Music sidebar / `MusicStatus`** | `131.…js`; SCSS `scripts/modules/Sidebar/.../MusicStatus/` | `Add Music`, `Upload Music`, `Music playing`, `Music track menu`, `Shuffle`, per-track `minVolume:0, maxVolume:1.5, thumbSizePx:12` |
| 14 | **Countdown music controls** | `131.…js` | `Get countdown music`, `Countdown volume`, per-item `minVolume: Tkq (0), maxVolume: 1` |
| 15 | **Audio timeline (video editor)** | `131.…js` | string `Audio timeline` — **UNRESOLVED**: the editor lives in `restreamvideoeditor.…js`; no waveform-rendering code was located for it in this capture |

---

## 9. Feature flags gating audio (all URL-query driven, `Index.…js`) [observed]

| Flag field | Query param | Default |
| --- | --- | --- |
| `suspendAudioContext` | `suspend-audio-context` | `false` (presence-flag) |
| `suspendVolumeMeters` | `suspend-volume-meters` | `false` (presence-flag) |
| `suspendAudioGainNode` | `suspend-audio-gain-node` | `false` (presence-flag) |
| `preferSameSampleRate` | `prefer-same-sample-rate` | `false` (presence-flag) |
| `liveAudioVolumeUpdates` | `live-audio-volume-updates` | `true` (`"false" !== t`) |
| `audioZeroRtpOnPause` | `audio-zero-rtp-on-pause` | `true` |
| `outgoingStreamAudioBitrate` | `outgoing-stream-audio-bitrate` | unset (decoded against `AudioBitrate`) |
| `overlayAudio` | `overlay-audio` | `null` unless set |
| `shouldEnableAudioOnlyMode` | `audio-only-mode` | `true` |
| `extraCameraAudio` | `extra-camera-audio` | `true` |
| `screenShareRestrictOwnAudio` | `screen-share-restrict-own-audio` | `true` |
| `shouldEnableScenesAutoSwitchV2NoiseToast` | — | drives the `mic_noise_warning` auto-switch disable |

Backend-side feature toggles seen in the settings codec: `selfMutedSupport`, `mediaDevicesControls`,
`countdownSceneMusicVolume`, `studioHasBackgroundMusic`, `localRecording4k`. [observed]

---

## 10. Gaps / UNRESOLVED

| Item | What is known | Why unresolved |
| --- | --- | --- |
| Server-side default `audioSettings` (bitrate + samplingRate for the RTMP output) | Enum values known (`128/160/192/256 kbps`, `44100/48000 Hz`) | Chosen by the backend; no client-side default literal exists in the capture |
| `Audio timeline` (video-editor) waveform rendering | String present in `131.…js` | The editor bundle is 1.1 MB and no waveform/peaks routine was found under audio-related identifiers |
| `restrictOwnAudio` / `suppressLocalAudioPlayback` semantics | Both appear in the track-settings telemetry projection and the screen-share constraint | Chromium-only constraints; no client logic beyond passing them through |
| `Audio frequency` / `Audio codec` monitor labels (`monitor_stream_incoming_audio_codec`, `monitor_stream_incoming_audio_frequency`, `monitor_graph_legend_audio_bitrate`) | In `locale-en-US.js` | Belong to the **restream.io dashboard**, not the Studio client; values come from the ingest server |
| Transcoding audio-bitrate bounds `20…320` (`popover_transcoding_error_audio_bitrate`) | Literal `Invalid audio bitrate value. Value must be in range 20...320.` | Dashboard-side transcoding UI, outside the Studio bundle |
| `mic_svg__gauge` | SVG symbol id in `575.…js` | Icon-internal id only; no separate widget |
| Whether hark's `LocalCameraPlaceholder` path is still reachable | Module `66885` is imported and the component is defined | The V2 WebGL placeholder supersedes it; no call site was traced to the mounted tree |
