# SPEC — APIs, Realtime Events & Media Runtime (Restream Studio)

Derived by static grep of the local capture only. Nothing was fetched from restream.io.

**Primary sources**
- `01-inside-studio-verified/client-static/js/restream.887ca3d5bcd09a3a.js` (12 MB, app + vendored Datadog Logs SDK)
- `01-inside-studio-verified/client-static/js/externals.b634d3e8690cf1f3.js` (5 MB, **mediasoup-client + room protocol codecs + watchRTC**)
- Supporting chunks that the two above lazily import: `Index.312bd7238c465fa2.js`, `593.47f82f224fb8c169.js` (media capture / local recording), `577.61b0a7bbb0dbc94a.js` (producer encodings), `288.e5852046176082ad.js` (skin-mask worker), `awssdk.06c9eae97cc86f8d.js` (aws-sdk-js **v2**), `mediapipetasksvision.a54ec1e1b0502c02.js`
- `01-inside-studio-verified/client-static/misc/studio-shell.html` (the only place third-party SDKs are *initialised* with real keys)

Webpack chunk global: `self.webpackChunkstudio_frontend`.

Throughout, **Observed literal** = exact string/number present on disk. **Inferred** = my reading of the surrounding minified code.

---

## 0. Executive shape of the system

**Inferred architecture.** Studio is *not* a peer-to-peer app and it is *not* a client-side compositor for the outgoing stream. It is:

1. A **mediasoup SFU** client (`mediasoup-client` is bundled verbatim in `externals`). Every participant *produces* their camera/mic/screen into the SFU and *consumes* other participants.
2. A **server-side compositor** — the room protocol has first-class `Compositor` participant messages (`COMPOSITOR_CONNECTED`, `COMPOSITOR_UPDATED`, `CompositorProducerTrackReceived`). The browser sends layout *state*, not pixels. There is no `MediaStreamTrackGenerator`, no `VideoEncoder`, no insertable streams anywhere in the capture.
3. A **Room Manager** authority that owns scene/layout/overlay state and broadcasts it. ~669 io-ts codecs describe this protocol.
4. A conventional **REST** surface over ~24 independently-hosted backends, all injected at runtime.
5. The browser only does local rendering: WebGL background segmentation, canvas camera placeholders, and `MediaRecorder` for *local* (per-participant) recordings uploaded to S3.

---

## 1. HTTP endpoints and API hosts

### 1.1 Host configuration is injected, not hard-coded

**Observed literal** — the app receives every backend base URL as React context props. Names found in `restream.887ca3d5bcd09a3a.js` (occurrence counts):

| Config key | Hits | Config key | Hits |
|---|---|---|---|
| `websiteBackendHost` | 89 | `videoStorageAPIHost` | 3 |
| `websiteAPIHost` | 22 | `streamingRecordingsAPIHost` | 3 |
| `eventsAPIHost` | 7 | `ecommerceAPIHost` | 3 |
| `clientRecordingsBackendHost` | 7 | `webBackendHost` | 2 |
| `geoAPIHost` | 6 | `userBackendHost` | 2 |
| `billingBackendHost` | 6 | `studioAPIHost` | 2 |
| `socialAlertsBackendHost` | 2 | `organizationsBackendHost` | 2 |
| `embedPlayerAPIHost` | 2 | `clipsBackendHost` | 2 |
| `chatHistoryBackendHost` | 2 | `chatClientBackendHost` | 2 |
| `analyticsBackendHost` | 2 | `aiCreatorBackendHost` | 2 |
| `videoStorageBackendHost` | 1 | `recordingsBackendHost` | 1 |
| `eventsBackendHost` | 1 | `clientRecordingsBackendBaseUrl` | 2 |

Also passed alongside: `restreamAppHost`, `studioOrigin`, `isStudio`, `streamingStatusesHost`, `embedPlayerHost`, `stripePublicKey`, `reCaptchaPublicKey`, `googleA…` (truncated in minified source).

**Observed literal** — the joiner (a normalising `${host}/${path}` helper):

```js
(t => `${e.replace(/\/$/,"")}/${t.replace(/^\//,"")}`)
```

**Inferred:** ~24 separately deployed services. A clone should mirror the *seams* (auth, events, files, studio/pairs, billing, ecommerce, chat, clips) but does not need 24 deployments.

### 1.2 Website backend — `v2/api/*` (authenticated)

**Observed literals** (all joined onto `websiteBackendHost`; `${…}` are template holes):

```
v2/api/user
v2/api/user/account-settings
v2/api/user/feature-groups
v2/api/user/social-profile
v2/api/user/stream-categories
v2/api/user/stream-presets/default
v2/api/user/streaming-time
v2/api/user/trial-features
v2/api/user/events/streaming/available?eventIds=…
v2/api/auth/getStatusServerFrontendToken
v2/api/system-messages
v2/api/stream-categories
v2/api/stream/${id}/analytics
v2/api/stream-analytics/streaming-sessions?userId=&page=&perPage=
v2/api/events/incoming-stream?suids=…
v2/api/channel/add
v2/api/channel/edit
v2/api/channel/delete/${id}
v2/api/channel/get_data/${id}
v2/api/channel/activate_channel
v2/api/channel/deactivate_channel
v2/api/channel/activate_all_channels
v2/api/channel/deactivate_all_channels
v2/api/channel/canAddOneMoreChannel/${id}
v2/api/channel/checkChannelApiConnection
v2/api/channel/${id}/transcoding
v2/api/channel/${id}/transcoding/enable
v2/api/channel/${id}/transcoding/disable
v2/api/channels?${query}
v2/api/channels/canActivateAll
v2/api/channels/canActivateChannelSet
v2/api/channels/${id}/canActivate
v2/api/channels/${id}/is-able-to-stream
v2/api/channels/${id}/targets/${targetId}
v2/api/channels/${id}/targets?type-target=${t}
v2/api/channels/${id}/transcoding-settings
v2/api/channels/${id}/connected-instagram-accounts
v2/api/channels/${id}/patreon-live-access-rules
v2/api/channels/${id}/playlists?pageToken=${t}
v2/api/channels/${id}/videos?playlistId=${t}&pageToken=${r}
v2/api/channels/${channelId}/precreated-events?destinationId=…
v2/api/channel-connect-state/${id}
v2/api/channel-connect-state/${id}/save-added-channel
v2/api/channel-connect-state/${id}/targets?type-target=&isAdmin=
v2/api/oauth/streaming-platform/${platformId}/connect-url?${q}
v2/api/titles/channels
v2/api/titles/get_channel_info
v2/api/titles/update_channel_info
v2/api/titles/get-games?platform=${channelId}&q=${query}
v2/api/linkedin/getEventUrn
v2/api/linkedin/findLocations?channelId=&query=
v2/api/linkedin/isUserAbleToStream?channelId=&organizationId=
v2/api/youtube/optimistic-verification
v2/api/billing/getUserBillingSummary
v2/api/billing/getCouponFromSubscription
v2/api/billing/subscription/${id}/details
v2/api/billing/subscription-override
v2/api/billing/recharge
v2/api/billing/removeCard
v2/api/billing/send-facebook-subscribe-event
```

### 1.3 Website backend — `v2/public/*` (unauthenticated)

```
v2/public/platforms
v2/public/platforms/${platformId}/stream-servers
v2/public/ingests
v2/public/paid-features
v2/public/auth/google
v2/public/auth/registration
v2/public/auth/ajax_check_ip
v2/public/auth/generate_recover_password_url
v2/public/oauth/social-login/${provider}
v2/public/open_authorization_youtube/youtubeRetryCheck
v2/public/billing/coupons/${code}
v2/public/show-channel
v2/public/show-channel/${id}
v2/public/show-channel-event
v2/public/show-channel-event/${channelId}
```

Note the only *bare* `"/api/v2/"` string literal in the whole 12 MB bundle is a legacy prefix constant; the live convention is `v2/api/…` with **no leading slash**.

### 1.4 Events API (`eventsAPIHost`)

```
/events                                     /events/history
/events/${id}                               /events/${id}/start
/events/${id}/hide                          /events/${id}/source
/events/${id}/cover                         /events/${id}/loops
/events/${id}/reschedule                    /events/${id}/channels-validate
/events/${id}/studio-access-key             /events/${id}/stream-key/reset
/events/${id}/destinations
/events/${id}/destinations/${dst}
/events/${id}/destinations/${dst}/stop
/events/${id}/destinations/${dst}/cover
/events/${id}/destinations/${dst}/linkedin/disconnect
/events/${id}/destinations/facebook/cover/${x}
/events/${id}/destinations/linkedin/cover/${x}
/events/${id}?delete_external=${bool}
/events/${id}/unschedule?delete_external=false
/events/check-overlap?only_overlaps_count=true
/events/used-events-in-last-n-streams
/events/used-sourced-events-in-last-n-streams
/destinations/check-overlap
events/${id}/relatives          events/${id}/stream-key
events/${id}/invite-access-key  events/pairs
events/last?show_id=&with_destinations_templates=true
events/used-demo-file           channels/${id}/not-finished-events
```

### 1.5 Files / video storage

```
/files                                  /files/${id}
/files/import                           /files/${id}/playlist
/files/${id}/trims                      /files/import-recording/${id}
/files/trim-recording/${id}             /files/upload/${uploadId}
/files/upload-credentials?s=${ts}       /files/upload-credentials/${id}/refresh
/integrations/files                     /integrations/files/${id}
/integrations/files/${id}/download      /integrations/files/trim-recording/${id}
/recordings        /recordings/${id}    /recordings/${id}/playlist
/studio-recordings/${id}/metadata
/demo-file
```

**Observed literal (error code):** `"files_limit"` triggers a `VideoLimitError`.

### 1.6 Studio API — guest/host channel pairing ("Pairs")

```
/pairs/hosts/${roomId}/active-channels
/pairs/hosts/${roomId}/guests/${guestId}/active-channels/${channelId}/remove
/pairs/guests/${roomId}/active-channels
/pairs/guests/${roomId}/active-channels/${channelId}/${enable|disable}
/pairs/guests/${roomId}/request-pairs-trial
/pairs/events/${eventId}/enable-pairs
/pairs/events/${eventId}/disable-pairs
/pairs/events/${eventId}?user_id=${userId}
/pairs/events/${eventId}/destinations/${dst}?user_id=…
/pairs/events/${eventId}/destinations/${dst}/stop?user_id=…
/pairs/events/${eventId}/destinations/${dst}/cover?user_id=…
```

Requests use `{withCredentials:true}`. Domain errors observed: `HostActivePairedChannelsPairsDisabledForRoomError`, `GuestActivePairedChannelsGuestNotFoundError`; response reasons `"missing_token"`, `"guest_not_found"`.

### 1.7 Ecommerce / live shopping API (`${this.host}` = `ecommerceAPIHost`)

```
${host}/v2/user                          ${host}/v2/user/events
${host}/v2/user/groups                   ${host}/v2/user/groups/current
${host}/v2/user/groups/${id}             ${host}/v2/user/groups/${id}/products
${host}/v2/user/groups/${id}/products/${p}
${host}/v2/user/groups/event/metadata/batch
${host}/v2/user/groups/products/duplicate
${host}/v2/user/products                 ${host}/v2/user/products/${id}
${host}/v2/user/stores                   ${host}/v2/user/stores/${id}
${host}/v2/user/stores/save              ${host}/v2/user/stores/${id}/connection
${host}/v2/user/stores/${id}/reconnect   ${host}/v2/user/stores/${id}/products?limit=
${host}/v2/user/integrations/${id}/authorize
${host}/v2/user/integrations/scrape?value=${encodeURIComponent(...)}
${host}/v2/user/analytics/links/stream/${id}/totals
${host}/v2/user/analytics/links/stream/${id}/detailed
${host}/v2/public/groups/${id}/meta
${host}/v2/public/groups/${id}/products
${host}/v2/public/groups/${id}/destinations
${host}/v2/public/assets/products/${id}/qr.svg
${host}/v2/public/links/sp/qr.svg
```

### 1.8 Other observed paths

`api/country` (geo API) · `/organizations/current` · `/teams` · `/team-invite` · `/video-storage/uploads` · `/sdk/v2/flags` (Amplitude Experiment, see §6).

### 1.9 API client classes

**Observed literal** class names in `restream.887ca3d5bcd09a3a.js`:
`WebsiteAPIClient`, `StudioAPIClient`, `GeoAPIClient`, `ECommerceAPIClient`, `EmbedPlayerAPIClient`; plus `AICreatorBackendClient` in `Index.312bd7238c465fa2.js`.

All go through an `httpClientWithRefreshToken` wrapper. Response bodies are `camelizeKeys`-ed and then validated through io-ts decoders (`T3z(decoder, body)`), so **the backend speaks snake_case and the client speaks camelCase**.

### 1.10 First-party restream.io hosts observed

```
https://app.restream.io                 https://player.restream.io
https://studio.restream.io              https://live.restream.io
https://restream.io                     https://support.restream.io
https://vertical-plugin.restream.io/obs-vertical-plugin-windows.exe
https://vertical-plugin.restream.io/obs-vertical-plugin-macos.pkg
https://evs.cdp.restream.io             (Segment CDN proxy — see §6)
https://restream.io/img/api/platforms/platform-${id}.svg   (and -alt.svg, .png)
https://restream.io/img/flags/4x3/${code}
https://studio.restream.io/backgrounds/2025/5_black.jpg
/mediapipe                              (self-hosted MediaPipe wasm dir)
```

**Absent:** no literal `api.restream.io`, no literal SFU hostname, no literal `wss://` anywhere in either target bundle.

---

## 2. WebSocket / realtime

There are **two entirely separate** WebSocket subsystems. Neither has a hard-coded URL.

### 2.1 Streaming Statuses socket (simple, JSON, text)

**Observed literal** (`restream.887ca3d5bcd09a3a.js`):

```js
const i = new WebSocket(`${e}/ws?source=sdk`, ["restream-status-token", r.token]);
i.onmessage = e => { const r = JSON.parse(e.data); t.current.next(r) }
```

- Base URL: `streamingStatusesHost` (injected).
- **The sub-protocol array is used as the auth channel**: `["restream-status-token", <jwt>]`.
- Token from `GET {websiteBackendHost}/v2/api/auth/getStatusServerFrontendToken`.
- Reconnect: retry delay `1000 * (5 * Math.random())`; after 10 attempts it logs `"connection to Streaming Statuses closed"` and stops warning.
- Observed log strings: `"connection to Streaming Statuses opened"` with `{retryAttempt, source:"sdk"}`.
- A second, viewer-scoped JWT exists via the room message `REQUEST_STREAMING_STATUSES_VIEWERS_JWT` / `RequestStreamingStatusesViewersJwtMessageIO`.

### 2.2 Room / SFU socket (binary, mediasoup)

**Observed literal** (`externals.b634d3e8690cf1f3.js`, `Client.createInternal`):

```js
const h = new URL(t);
h.searchParams.set("platform", navigator.platform);
i && h.searchParams.set("region", i);
const y = new WebSocket(h.toString());
y.binaryType = "arraybuffer";
```

Query params: `platform`, `region`. No literal region values are in the bundle (`"us-east-1"` appears only inside the AWS SDK).

#### Binary framing (observed literal)

```js
const A = 36, M = new TextEncoder, P = new TextDecoder;

function D(e){                       // decode
  const t = new Uint8Array(e), n = t[0];
  switch(n){
    case x.Sfu:              return {category:n, message: JSON.parse(P.decode(t.subarray(1)))};
    case x.Client:
    case x.Broadcast:      { const e = P.decode(t.subarray(1));
                             return {category:n, clientId: e.substring(0,A),
                                     message: JSON.parse(e.substring(A))}; }
    case x.OverlayBroadcast: return {category:n, message: JSON.parse(P.decode(t.subarray(1)))};
    case x.RoomManager:      return {category:n, message: JSON.parse(P.decode(t.subarray(1)))};
    default: throw new Error(`Bad message category ${n}`);
  }
}

function N(e){                       // encode toward SFU
  const t = M.encode(JSON.stringify(e)), n = new Uint8Array(t.length + 1);
  n.set([x.Sfu]); n.set(t, 1); return n;
}
```

**Wire format:** `byte[0] = category`, then UTF-8. For `Client`/`Broadcast`, bytes `1..37` are a fixed **36-char clientId** (UUID) and the remainder is JSON.

#### Category enums (observed literals)

Client-side transport categories:
`Sfu=0, Client=1, Broadcast=2, RoomManager=3, OverlayBroadcast=4` — plus a separate constant `RoomManager=12`.

Full participant/role enum:
`Sfu=0, Ingest=1, Client=2, Host=3, Broadcast=4, OverlayBroadcast=5, SourcePuller=6, Overlay=7, IngestV2=8, ViewersBroadcast=9`

#### Message envelope (observed literal)

Every room-manager message is `{ type: <string literal>, messageId, value }`:

```js
r.type({type:r.literal("PAUSE_COUNTDOWN_SCENE"), messageId:s,
        value:r.intersection([r.type({sceneId:_.EA}), r.partial({positionMs:r.number})])},
       "PauseCountdownSceneMessageIO")

r.type({type:r.literal("AddScene"), messageId:s,
        value:r.intersection([r.type({scene:Ie.iY}), r.partial({shouldSelect:r.boolean})])},
       "AddSceneMessageIO")
```

**Inferred:** the protocol was migrated mid-life — older messages use `SCREAMING_SNAKE_CASE` type strings, newer ones `PascalCase`. Both are live simultaneously.

#### SFU request/response pairs (observed literals)

| Request `action` | Awaited response |
|---|---|
| `ClientInitialization` | (initialization message) |
| `ConnectProducerTransport` | `ProducerTransportConnected` |
| `ConnectConsumerTransport` | `ConsumerTransportConnected` |
| `Produce` | `Produced` |
| `ProduceData` | `DataProduced` |
| `GetIceServers` | `IceServersList` |
| `IceRestart` | `IceRestart` |

Other `action:` literals: `ClientClosed`, `CloseRoom`, `ConsumerPause`, `ConsumerResume`, `ConsumerSetPreferredLayers`, `ConsumerSetPriority`, `RemoveProducer`, `UpdateDisplayName`, `UpdateDisplayTitle`, `WebRTCMetrics`, `WebRTCSetupReady`.
(`GET_EXTENSION_INFO`, `GET_TESTRTC_SYSTEM_INFO`, `init`, `reset`, `write` belong to watchRTC / Datadog, not the room protocol.)

Server-pushed SFU messages awaited in infinite loops:
`ClientClosed`, `ClientFailedToEnterFullRoom`, `ClientRemoved`, `ClientUpdated`, `ConsumerAdded`, `ConsumerRemoved`, `ConsumerStats`, `DataConsumerAdded`, `PcapPlaybackStarted`, `PcapPlaybackStopped`, `ProducerStats`, `ProducerVolumes`, `StreamStopped`, `WebRTCSetupReady`.

`ClientInitialization` payload (observed literal):

```js
y.send(c({action:"ClientInitialization", displayName:n, displayTitle:r,
          mediaDevices:o, rtpCapabilities:f.recvRtpCapabilities}))
```

`Produce` payloads:

```js
{action:"Produce",     producerOptions:{kind, rtpParameters, appData}}
{action:"ProduceData", producerOptions:{sctpStreamParameters, label, protocol, appData}}
```

#### Close codes (observed literal enums)

Connection close reasons:

```
Disconnected=0  Other=1  ClientTransportClosed=2  BrowserNormal=1000
Graceful=4000   ServerTransportClosed=4001  Eviction=4002  HostDisconnected=4003
UnexpectedRoomClosing=4004  KickedOut=4005  Failed=4006  Left=4007
AbortedConnection=4008  BadInitializationMessage=4009
ClientMediaSetupFailed=4010  ClientMediaConnectionFailed=4011
NewPlaylistRoomWithoutHostsOrStreamTimeout=4012
PlaylistStreamTimeout=4013  PlaylistStreamStopped=4014
RoomSessionDurationExceeded=4014  RoomCooldownDurationExceeded=4015
DemotedToViewer=4016  RoomClosedBySupport=4017  ConsumeError=4018
DataProducerClosed=4100  SctpSendBufferFull=4101  SwitchedToDataChannels=4666
```

Room-join errors: `BadRoomId=4100, RoomNotFound=4101, RoomIsFull=4102, CompositorCreationError=4103, Unknown=4104, NoClientIdOrSecret=4105, BadClientSecret=4106`.
Auth errors: `JwtVerifyError=4109, InvalidJwtPayload=4110`.
Producer close reasons: `Graceful=0, TransportClosed=1, Destroyed=2, Unexpected=3, RoomClosing=4, StreamStartError=5, Disconnected=6, DurationExceed…`.
Error-code union in responses: `"RoomNotFound" | "ClientNotFound" | "BadClientSecret"`; other observed error literals: `ClientNotFoundError`, `PermissionError`, `DisabledError`, `NotLiveError`, `GenericError`, `SuidDoesNotMatchError`, `UnsupportedClientTypeError`.

#### DataChannel fallback (observed literals)

The client can migrate the whole control plane off the WebSocket onto an SCTP DataChannel: `useDataChannels`, `switchedToDataChannels`, `onUsingDataChannels`, `connectDataChannels`, `dataProducerSendingBufferedMessages`, `maxSendMessageLength`. Buffer thresholds beside the `Client` class: `4194304` (4 MiB) and `12582912` (12 MiB); separate max-message constant `1048576` (1 MiB). Close code `SwitchedToDataChannels=4666`.

### 2.3 The room protocol type catalogue

**Observed:** 669 distinct io-ts codec names ending in `IO`, and 397 distinct `literal("…")` discriminants (185 SCREAMING_SNAKE, 184 PascalCase, remainder enum values). Full lists are recoverable with:

```bash
rg -oN '"[A-Z][A-Za-z0-9]+IO"' externals.b634d3e8690cf1f3.js | sort -u
rg -oN 'literal\("[A-Za-z0-9_]+"\)' externals.b634d3e8690cf1f3.js | sort -u
```

Top-level union codecs (these name the actual channels):
`ClientToRoomManagerMessageIO`, `HostToRoomManagerMessageIO`, `OverlayToRoomManagerMessageIO`, `SfuToRoomManagerMessageIO`, `SourcePullerToRoomManagerMessageIO`, `RtmpSourcePullerToRoomManagerMessageIO`, `RoomManagerToClientMessageIO`, `RoomManagerToHostMessageIO`, `RoomManagerToOverlayMessageIO`, `RoomManagerToSfuMessagesIO`.

Response envelopes: `ClientOkResponseIO`/`ClientErrorResponseIO`, `SfuOkResponseIO`/`SfuErrorResponseIO`, `OverlayOkResponseIO`/`OverlayErrorResponseIO`, `RoomManagerOkResponseIO`/`RoomManagerErrorResponseIO`, `SourcePullerOkResponseIO`/`SourcePullerErrorResponseIO`.

Representative subsystem groupings (all observed literals):

- **Room lifecycle:** `CREATE_ROOM`, `CloseRoom`, `ROOM_STATE_SNAPSHOT`, `CLIENT_ROOM_STATE_SNAPSHOT`, `RoomShutdownWarning`, `KICK_CLIENT`, `PromoteToHost`, `PromotionToHostOffer`, `HOST_CONNECTED`/`HOST_DISCONNECTED`/`HOST_UPDATED`, `GUEST_CONNECTED`/`GUEST_DISCONNECTED`/`GUEST_UPDATED`, `CLIENTS_ORDER_UPDATED`, `UPDATE_CLIENTS_ORDER`, `CLIENT_IS_LIVE_UPDATED`, `UpdateGuestIsViewer`.
- **Scenes:** `AddScene`, `AddScenesBatch`, `CREATE_NEW_SCENE`, `CREATE_NEW_SCENES_BATCH`, `DELETE_SCENE`, `DUPLICATE_SCENE`, `DuplicateScene`, `SCENE_SELECTED`, `SceneAdded`/`SceneRemoved`/`SceneUpdated`, `SCENES_UPDATED`, `ScenesOrderUpdated`, `UPDATE_SCENES_ORDER`, `UPDATE_SCENE_NAME`, `UPDATE_SCENE_ID`, `StartEditingScene`/`StopEditingScene`, `SceneEditorsUpdated`, `PreloadSceneMedia`, `SwapSceneMedia`, `AssignSource`/`UnassignSource`/`UnassignCamera`, `UpdateSceneAssignedCamera`, `UpdateSceneAssignedSource`, `UpdateCameraSceneAssignmentMode`, `UpdateSourceSceneAssignmentMode`.
- **Layouts (V2):** `UPDATE_LAYOUT_TYPE_V2`, `LAYOUT_TYPE_UPDATED`, `VIDEO_LAYOUT_UPDATED`, `AUDIO_LAYOUT_UPDATED`, `ResetLayoutOptions`, plus per-layout option/temp-option pairs for `Contain`, `Cover`, `HalfScreen`, `Pip`, `Showtime`, `Spotlight`, `Tbpn`, `Thumbnails`, `Cinema`, each with `Global`/`Main`/`Aside`/`Single`/`Secondary` variants.
- **Media & players:** `PLAY_VIDEO`/`STOP_VIDEO`, `PLAY_AUDIO`/`PAUSE_AUDIO`/`RESUME_AUDIO`/`STOP_AUDIO`/`RestartAudio`/`ReplaceAudio`/`SeekAudio`/`SetAudioVolume`/`SetAudioLoop`, `PLAY_HLS_VIDEO`, `PAUSE_HLS_VIDEO_V2`, `RESUME_HLS_VIDEO_V2`, `SEEK_HLS_VIDEO_V2`, `STOP_HLS_VIDEO_V2`, `UPDATE_HLS_VIDEO_LOOP_V2`, `HLS_VIDEO_ADDED`/`_REMOVED`/`_UPDATED`, `PLAY_IN_PROGRESS_HLS_VIDEO`, `IN_PROGRESS_HLS_VIDEO_FAILED`, `VIDEO_PLAYER_STATUS_UPDATED`, `AUDIO_PLAYER_STATUS_UPDATED`, `PLAY_COUNTDOWN_SCENE`/`PAUSE_COUNTDOWN_SCENE`.
- **Live stream control:** `CREATE_LIVE_STREAM`, `START_LIVE_STREAM`, `StartLiveStreams`, `STOP_LIVE_STREAM`, `AbortLiveStreamStart`, `LIVE_STREAM_STATE`, `LiveStreamStopped`, `LIVE_STREAM_STOPPED`, `START_PLAYLIST_PREVIEW`/`STOP_PLAYLIST_PREVIEW`, `LiveStreamRecordingStatusUpdated`, `PauseLiveStreamRecording`/`ResumeLiveStreamRecording`/`RestartLiveStreamRecording`.
- **Local recording:** `REGISTER_LOCAL_RECORDING`, `UpdateLocalRecordingMode`, `UpdateLocalRecordingResolution`, `LOCAL_RECORDING_MAX_RECORD_HOURS_UPDATED`, `LocalRecordingModeUpdated`, `LocalRecordingResolutionUpdated`, `LocalRecordingClientDisabledUpdated`, `LocalRecordingDisabledClientsUpdated`, `SHOULD_ENABLE_LOCAL_RECORDING_UPDATED`, `RecordModeUpdated`, `RecordingNameUpdated`.
- **Source pulling (RTMP/video/audio ingest into the room):** `ADD_SCENE_RTMP_SOURCE_PULL`, `REMOVE_SCENE_RTMP_SOURCE_PULL`, `REFRESH_RTMP_SOURCE_PULL_KEY`, `RTMP_SOURCE_PULL_KEY_REFRESHED`, `RTMP_SOURCE_PULL_CONNECTED`/`_DISCONNECTED`/`_STATUS_UPDATED`, `VIDEO_SOURCE_PULL_CONNECTED`/`_DISCONNECTED`, `AUDIO_SOURCE_PULL_CONNECTED`/`_DISCONNECTED`, `VideoPullPlay`, `VideoPullProgress`, `AudioPullProgress`, `SetRtmpSourcePullerAudioVolume`.
- **Overlays / branding:** `OVERLAY_STATE_UPDATED`, `UPDATE_OVERLAY`, `SHOW_OVERLAY_ALERT`, `SHOW_TICKER_V2`/`HIDE_TICKERS_V2`/`UPDATE_TICKER`/`UpdateTickerSpeed`, `UPDATE_LOGO`/`UpdateLogoPosition`, `UPDATE_PRIMARY_COLOR`, `UPDATE_BRAND_ID`, `THEME_TYPE_UPDATED`/`THEME_STATE_UPDATED`, `UPDATE_BACKGROUND`, `BACKGROUND_STATE_UPDATED`, `UPDATE_CAPTION`, `ADD_PINNED_MESSAGE`/`REMOVE_PINNED_MESSAGE`/`UpdatePinnedMessageOrder`, `ADD_SHOWN_MESSAGE`/`SHOWN_MESSAGES_UPDATED`, `UpdateChatOverlayOptions`, `PORTRAIT_OVERLAY_STATE_UPDATED`.
- **Webinar mode:** `SetWebinarModeEnabled`, `WebinarModeEnabledChanged`, `InviteWebinarViewerToStudio`, `AcceptWebinarViewerInviteToStudio`, `DeclineWebinarViewerInviteToStudio`, `CancelWebinarViewerInviteToStudio`, `WebinarViewerInviteToStudioAdded`/`Offered`/`Removed`/`Withdrawn`, `RequestWebinarLiveCallIn`, `AcceptWebinarLiveCallInRequest`, `RejectWebinarLiveCallInRequest`, `CancelWebinarLiveCallInRequest`, `LeaveWebinarLiveCallIn`, `WebinarLiveCallInRequestAdded`/`Rejected`/`Removed`, `WebinarViewersUpdated`, `WebinarViewersCountUpdated`, `AddWebinarViewerChatMessage`.
- **Ecommerce overlay:** `UPDATE_ECOMMERCE_PRODUCT_STATE`, `SHOW_ECOMMERCE_PRODUCT_VIEWED_ALERT`, `TOTAL_ECOMMERCE_PRODUCT_VIEWS_COUNT_UPDATED`, `TOTAL_ECOMMERCE_PRODUCT_PURCHASES_COUNT_UPDATED`, `UPDATE_QR_CODE`.
- **Media transport control:** `PRODUCER_CREATED`/`PRODUCER_DELETED`, `PRODUCERS_MAX_LAYERS_UPDATED`, `UPDATE_PRODUCERS_ENCODINGS`, `COMPOSITOR_CONNECTED`/`_DISCONNECTED`/`_UPDATED`, `CompositorProducerTrackReceived`, `SFU_TOKEN_UPDATED`/`UPDATE_SFU_TOKEN`, `UpdateMediaDevice`, `UpdateMediaDeviceOffer`, `UpdateMediaDevices`, `ClientMediaDevicesUpdated`, `UPDATE_MEDIA_STREAMS_IS_MUTED_STATE`, `UPDATE_MEDIA_STREAMS_ON_AIR_STATE`, `UPDATE_STREAMS_METADATA_V3`, `SOURCES_STATE_UPDATED`, `UPDATE_SOURCE_STATE`, `SWAP_SOURCES`, `REMOVE_SOURCE`.
- **Debug/QA:** `PlayPcapRecording`, `StopPcapRecording`, `PcapPlaybackStarted`, `PcapPlaybackStopped`. **Inferred:** the SFU can replay captured pcap streams into a room for testing.

`RoomManagerCapabilitiesIO` is a feature-negotiation object of booleans (all defaulting to `false`); observed keys include `sourceImages`, `addSceneMessagesV2`, `scenesCommerceOverlayMode`, `customTrackMusic`, `countdownCustomTrackMusic`, `audioSourcePullSeekAndLoop`, `scenesLogoPosition`, `overlayFontSelect`, `countdownSceneFontColorSize`.

---

## 3. WebRTC configuration

### 3.1 Stack identity

**Observed literal:** `const i = "mediasoup-client"` (logger prefix); SDP origin username `` `mediasoup-client-v${u.version}` ``; `iceOptions:"ice2"`; optional `icelite:"ice-lite"`; `msidSemantic:{semantic:"WMS"}`.
Handler classes present: `Chrome111`, `Chrome74`, `Firefox120`, `Safari12`, `ReactNative106`.
API surface used: `createSendTransport`, `createRecvTransport`, `createTransport` with `{id, iceParameters, iceCandidates, dtlsParameters, sctpParameters, iceServers, iceTransportPolicy, additionalSettings, appData}`.

**Inferred:** the SFU is mediasoup (or mediasoup-protocol-compatible). A clone that wants this exact client can run mediasoup server-side unchanged.

### 3.2 ICE

**Observed literal** — no STUN/TURN URLs are baked in; they are fetched at connect time:

```js
if (this.useDataChannels) r = this.iceServers;
else ({iceServers:r} = yield this.sendSfuMessage({action:"GetIceServers"}, "IceServersList"));

const o = (typeof r[0]?.urls === "string" && r[0].urls.startsWith("turn:")) ||
          (Array.isArray(r[0]?.urls) && r[0].urls[0]?.startsWith("turn:")) ? "relay" : "all";

const {iceServers:i, iceTransportPolicy:a} = this.prepareIceParameters(r, o);
```

**Inferred:** if the server returns a TURN server first, the client forces `iceTransportPolicy:"relay"`; otherwise `"all"`. This is a deliberate server-controlled relay-only switch.

ICE resilience machinery observed as instance fields: `iceRestartingTransports`, `iceConnectionTimers`, `iceDisconnectedTimers`, `consecutiveIceRestartsCounts`; message `IceRestart` + `processIceRestartResponse`.
`iceParameters` codec: `{usernameFragment: string, password: string}` + optional `{iceLite: boolean}`; `transport: "producer" | "consumer"`.

### 3.3 Simulcast / encodings

**Observed literal — the ladders** (`593.47f82f224fb8c169.js`; `active:!0` is `true`):

```js
// single layer
[{scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? 300000,          active:true}]
[{scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.hd30Fps,      active:true}]
[{scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.hd60Fps,      active:true}]
[{scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.fullHd30Fps,  active:true}]
[{scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.ultraHd30Fps, active:true}]

// two layers
[{scaleResolutionDownBy:4, maxBitrate:100000, active:true},
 {scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.<preset>, active:true}]
[{scaleResolutionDownBy:3, maxBitrate:100000, active:true},
 {scaleResolutionDownBy:1, maxBitrate:300000, active:true}]

// three layers
[{scaleResolutionDownBy:4, maxBitrate:100000, active:true},
 {scaleResolutionDownBy:2, maxBitrate:250000, active:true},
 {scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? BR.hd30Fps, active:true}]

// reserved inactive top layer
[{scaleResolutionDownBy:3, maxBitrate:100000, active:true},
 {scaleResolutionDownBy:1, maxBitrate:300000, active:true},
 {scaleResolutionDownBy:1, maxBitrate: featureStore.maxBitrate ?? 400000,
  active:false, isPlaceholder:true}]
```

**Observed literal — the bitrate enum and reference constants** (`593.47f82f224fb8c169.js`):

```js
const s = 1280, r = 720, n = s * r;              // 921600 px reference
var a = { hd30Fps:      1900000,
          hd60Fps:      3500000,
          fullHd30Fps:  4000000,
          ultraHd30Fps: 12000000 };
const d = 1900000 / 921600 / 30;                 // ≈ 0.0687 bits per pixel per frame
const c = (w,h,fps,q) => `${w}x${h}@${fps}fps+${q}`;
const h = c(1280, 720, 30, "normal");            // default profile id "1280x720@30fps+normal"
```

**Observed literal — encoding priorities:**

```js
const l = (shouldForceBestQuality || onLayout) ? this.producer.maxPriority : "very-low";
const c = encodings.map(e => ({...e, priority:l, networkPriority:l}));
const h = this.userSettingsStore.shouldUseVp9 || this.featureStore.vp9.value;
await this.producer.updateProducerEncodings(c, o, h);
```

**Observed literal — adaptive behaviour:**

- `findOptimalSpatialLayer(targetWidth, targetHeight, framerate, maxBitrates)` → `setProducerMaxSpatialLayer(n)`; logged as `"Setting optimal max spatial layer"` with `{optimalMaxSpatialLayer, targetWidth, targetHeight, framerate, shouldForceTopLayer}`.
- `adaptAvailability`: if the producer is **not on the current layout** (or `layout.opacity === 0`) the producer is `pause()`d; otherwise `resume()`d. Log strings: `"Not on layout: pausing"`, `"On layout or disable pausing: resuming"`.
- `updateProducerEncodingsWithTopLayerScaled(...)` scales the top layer to `layout.videoContainer.width/height`, falling back to the 1280×720 constants when off-layout.
- User setting `producerEncodingScaling` has a mode `ScalingAndResolution`.

**Observed literal — codecs:** `"video/VP8"` (4×), `"video/VP9"` (2×), `"video/H264"` (3×), `"audio/opus"` (8×). One `scalabilityMode:"L3T3"`. `setCodecPreferences` is only *monkey-patched* by watchRTC in `externals`; the app selects codecs through mediasoup's `codecOptions` / `updateProducerEncodings(…, useVp9)` rather than raw transceiver preferences.

**Caution — two false positives to avoid copying:**
1. `sendEncodings:[{rid:"r0",maxBitrate:100000},{rid:"r1",maxBitrate:500000}]` in `externals` is **mediasoup-client's browser capability probe** (it builds a throwaway `RTCPeerConnection`, offers, then closes it). Not a production ladder.
2. Every `turn:` regex hit in `externals` except one is the minifier's `return:` inside a TypeScript `__generator` helper.

**Observed literal — server-validated encoding schema:**

```js
r.partial({active:r.boolean, maxBitrate:r.number, scaleResolutionDownBy:r.number}, "ProducerEncodingIO")
r.type({isPaused:r.boolean, encodings:r.readonly(r.array(...))}, "ProducerEncodingsIO")
```

mediasoup pass-through fields honoured: `scalabilityMode`, `scaleResolutionDownBy`, `maxBitrate`, `maxFramerate`, `adaptivePtime`.

### 3.4 Metrics

`webRtcMetricsRunIntervalMs` drives a periodic `sendSfuMessage({action:"WebRTCMetrics", data})`, toggled by `enableWebRtcMetrics()` / `disableWebRtcMetrics()`.

---

## 4. Media pipeline

### 4.1 Capture constraints (all in `593.47f82f224fb8c169.js`)

**Camera video — observed literal:**

```js
get videoTrackConstraints() {
  return (this.videoResolution.id === Auto &&
          this.localRecordingsStateStore.isEnabled &&
          this.localRecordingsStateStore.resolution === ULTRA_HD)
    ? {aspectRatio:this.videoResolution.aspectRatio,
       frameRate:this.videoResolution.framerate,
       width:{ideal:3840}, height:{ideal:2160}}
    : {width:this.videoResolution.width, height:this.videoResolution.height,
       aspectRatio:this.videoResolution.aspectRatio, frameRate:this.videoResolution.framerate};
}
```

Device selection merges `{deviceId:{exact:…}}` from `userCameraDevicesService.videoInputDevice` or `mediaDevicesStore.preferredDefaultVideoInputDevice`.

**Microphone audio — observed literal:**

```js
{ deviceId: audioInputDevice ? {exact: audioInputDevice.deviceId} : undefined,
  echoCancellation:  settings.shouldUseEchoCancellation,
  noiseSuppression:  settings.actualShouldUseNoiseSuppression,
  autoGainControl:   settings.shouldUseStereoAudioInput ? undefined : settings.shouldUseAutoGainControl,
  sampleRate:        featureStore.prefer… }
```

(`autoGainControl` is deliberately left *unset* in stereo mode.)

**Screen share — observed literal:**

```js
getDisplayMedia({
  video: this.videoTrackConstraints,       // {frameRate, width, height}, or 4K "ideal"
  audio: {echoCancellation:false, noiseSuppression:false, autoGainControl:false, channelCount:2,
          ...(featureStore.screenShareRestrictOwnAudio.value ? {restrictOwnAudio:true} : {})},
  ...(controller ? {controller} : {})
})
```

Plus **Captured Surface Control**: `new window.CaptureController()`, `onzoomlevelchange`, `setFocusBehavior("no-focus-change")` when `displaySurface === "browser"`, `zoomLevel` default `100`. Tab-capture detection: `isTabCapture = displaySurface === "browser"`.

Track settings mirrored for telemetry: `aspectRatio, displaySurface, facingMode, frameRate, width, height, channelCount, sampleRate, sampleSize, autoGainControl, echoCancellation, noiseSuppression, restrictOwnAudio, suppressLocalAudioPlayback, capabilities`.

gUM error taxonomy (observed literal enum): `AbortError, NotAllowedError, NotFoundError, NotReadableError, OverconstrainedError, SecurityError, TypeError`.

### 4.2 Local recording (MediaRecorder)

**Observed literal — mime candidate lists** (`Index.312bd7238c465fa2.js`, webpack module `97882`):

```js
const o = ["video/x-matroska;codecs=avc1.4D402A,opus", "video/x-matroska;codecs=avc1,opus"];
const a = ["video/mp4;codecs=avc1.4D402A,mp4a.40.2",  "video/mp4;codecs=avc1,mp4a.40.2"];
const l = ["video/mp4;codecs=avc3.4D402A,mp4a.40.2",  "video/mp4;codecs=avc3,mp4a.40.2"];
const c = ["video/webm;codecs=vp8,opus", "video/webm;codecs=vp9,opus", "video/webm", "video/mp4"];

// preference order, driven by two experiment flags
const d = (preferMp4, preferMp4Avc3) =>
  preferMp4Avc3 ? [...l, ...a, ...o, ...c]
: preferMp4     ? [...a, ...o, ...c]
:                 [...o, ...a, ...c];

const u = list => list.find(window.MediaRecorder.isTypeSupported.bind(window.MediaRecorder));
const h = m => m.includes("mp4") && m.includes("avc3") ? "mp4-avc3"
             : m.includes("mp4") ? "mp4" : "webm";
```

**Inferred:** the *default* container is Matroska with H.264 + Opus — almost certainly because MKV survives a truncated write, unlike fragmented MP4.

Flags: `shouldPreferMp4LocalRecording`, `shouldPreferMp4Avc3LocalRecording`, `shouldEnableLocalRecordings`.

**Observed literal — bitrate ladder** (`593.47f82f224fb8c169.js`):

```js
const h = this.session.sourceModel.size ?? {width:1280, height:720};
const g = this.session.sourceModel.videoTrack?.getSettings().frameRate;

const m = (({width:t, height:o, framerate:i}) => {
  let s; const r = Math.max(t,o); const n = i >= 50;
  if      (r >= 2160) s = n ? 21000000 : 14000000;
  else if (r >= 1080) s = n ?  9000000 :  6000000;
  else if (r >=  720) s = n ?  8000000 :  5000000;
  else { const e = t*o/921600; s = Math.round(5000000 * e); }
  return {audioBitsPerSecond: 256000, videoBitsPerSecond: s};
})({width:h.width, height:h.height, framerate: g ?? 30});

this.recorder = new window.MediaRecorder(stream, {
  audioBitsPerSecond: m.audioBitsPerSecond,
  videoBitsPerSecond: m.videoBitsPerSecond,
  mimeType: this.mimeType });
```

Chunking: `5242880` bytes (5 MiB) per part; part naming `` `${recordingId}_chunk_${n}` ``.
Recording resolution enum: `AUTO = "auto"`, `ULTRA_HD = "4k"`.
Stop reasons (observed literal enum): `ADD_SHOT_ERROR, ADD_SHOT_PART_ERROR, AUDIO_OR_VIDEO_CHANGE, RECORDER_STOP_EVENT, STARTING_NEW_MEDIA_STREAM, RECORDING_DESTROYED, REMOVED, MAX_RECORD_DURATION_EXCEEDED, PAUSED, SOURCE_OFF_AIR`.
Start reasons: `INITIAL, RECORDING_RESUMED, SOURCE_ON_AIR`.
Service-level stops: `LIVE_STREAM_STOP_OR_DISABLED, WEBINAR_VIEWER_MODE, SERVICE_STOP, STOP_LOCAL_RECORDINGS_CLICK`.
Telemetry event: `"Local Recordings Capabilities"` with `{selectedMimeType, supportedMimeTypes}`.

**Inferred upload path:** `GET /files/upload-credentials` → temporary S3 credentials → `awssdk.06c9eae97cc86f8d.js` (**aws-sdk-js v2**, `signatureVersion`, `"S3"`) performs the multipart upload → `/files/upload/${uploadId}`; refresh via `/files/upload-credentials/${id}/refresh`. There is no `@aws-sdk/*` (v3) marker anywhere in the capture.

### 4.3 Canvas capture and rendering

- `captureStream()` is used only to lift a `<video>` element into a MediaStream, with `mozCaptureStream()` fallback. **No explicit fps argument is passed anywhere**, so the browser default (frame-driven) applies. Error string: `"Capture from video element is not supported"`.
- Camera placeholder renderer: `document.createElement("canvas").getContext("2d",{alpha:false})`, canvas sized to `videoResolution.width/height`, hard-coded `get framerate(){ … return 30 }`.
  Text placeholder styling (observed literal): `{fontFamily:"Graphik", fontSizePx: 72 * (height/720), fontWeight:"bold", fontStyle:"normal", lineHeightRatio:1.33, color:"#CCCCCC"}`. Two renderers: `ImageCameraPlaceholderRenderer`, `TextCameraPlaceholderRenderer`, both taking `mirroredInitially`.
- `requestVideoFrameCallback`, `createImageBitmap`, `getContext("webgl2")` and `OffscreenCanvas` are all present in `593`. **Absent everywhere:** `MediaStreamTrackProcessor`, `MediaStreamTrackGenerator`, `VideoEncoder`, `transferControlToOffscreen`, any WebCodecs usage.

### 4.4 Audio worklet

**Observed literal:**

```js
audioContext.audioWorklet.addModule(new URL(o(15082), o.b))     // webpack asset URL
const e = new AudioWorkletNode(this.audioContextService.audioContext, "volumeMeter", {numberOfInputs:1});
e.port.onmessage = ev => this.setDb(ev.data ?? -60);
e.onprocessorerror = ev => this.log.error("Unexpected worklet processor error", {...});
```

Processor name `"volumeMeter"`, floor `-60` dB. Failure string: `"Failed to add volume meter worklet module"`.
Audio wiring observed: `suspendAudioContext` feature flag; `processedAudioTrack` vs `audioInputTrack` (processing bypassed when the context is suspended); `audioGainLevel`.
Protocol-level audio constants: `AudioBitrate` enum `128000 / 160000 / 192000 / 256000`; `SamplingRate` enum `44100 / 48000`.

### 4.5 MediaPipe segmentation (background removal)

Two independent segmenters.

**A. Background replacement — `VideoSegmenter` (`Index.312bd7238c465fa2.js`), observed literal:**

```js
const n = [
  {url:"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite",
   maskTexelSize:[1/256, 1/256]},
  {url:"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite",
   maskTexelSize:[1/144, 1/256]}
];
var i = { General: 0, Landscape: 1 };      // "mediapipeSegmentationType" / "mediapipe-segmentation-type"

const l = await FilesetResolver.forVisionTasks("/mediapipe");
const c = await ImageSegmenter.createFromOptions(l, {
  baseOptions: {modelAssetPath: n[s].url, delegate:"GPU"},
  canvas: t, runningMode: "VIDEO" });

segmentVideo(cb) {
  this.segmenterService.segmentForVideo(this.video, performance.now(), r => {
    if (r.confidenceMasks && r.confidenceMasks.length > 0) {
      const m = r.confidenceMasks[0];
      if (m?.hasWebGLTexture()) return void cb(m.getAsWebGLTexture());
    }
    cb(null);
  });
}
```

**B. Skin mask / "Beautify" — `SkinMaskSegmenterWorker` (`288.e5852046176082ad.js`), runs in a Web Worker, observed literal:**

```js
const r = await FilesetResolver.forVisionTasks("/mediapipe");
const n = await ImageSegmenter.createFromOptions(r, {
  baseOptions: {modelAssetPath:"https://storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite",
                delegate:"CPU"},
  canvas: new OffscreenCanvas(1,1),
  runningMode: "VIDEO",
  outputConfidenceMasks: true });

const i = n.getLabels();
this.faceSkinIndex = i.indexOf("face-skin");
this.bodySkinIndex = i.indexOf("body-skin");
// throws: `Failed to resolve skin categories: model labels are [${i.join(", ")}]`
```

Worker message types: `Created`, `Result`, `Error`. Analytics event: `"Beautify Filter Toggled"`.

**Assets confirmed on disk** (`03-deep-static/recursive/`):

```
storage.googleapis.com/mediapipe-models/image_segmenter/selfie_multiclass_256x256/float32/latest/selfie_multiclass_256x256.tflite
storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter/float16/latest/selfie_segmenter.tflite
storage.googleapis.com/mediapipe-models/image_segmenter/selfie_segmenter_landscape/float16/latest/selfie_segmenter_landscape.tflite
studio.restream.io/mediapipe/vision_wasm_internal.wasm
studio.restream.io/mediapipe/vision_wasm_nosimd_internal.wasm
```

**Inferred:** the wasm runtime is self-hosted under `/mediapipe` (CSP- and latency-controlled), but the `.tflite` weights are still pulled from Google's public CDN at runtime.
Lazy chunk: `mediapipetasksvision.a54ec1e1b0502c02.js` is loaded via `r.e("202","low")` — low-priority prefetch.

### 4.6 Playback

`hlsjs.3e5d0a83ecd57757.js` (hls.js) for HLS playback of clips/pull sources; `restreamvideoeditor.d22611927fb1ae5c.js` for the clip editor. Capability probes in `Index`: `canPlayType("video/webm; codecs=av01.0.05M.08,opus")` → `supportsAv1Decode`; `canPlayType("video/webm; codecs=vp8,opus")` → `supportsVP8VideoDecode`; plus a `preferH264Codec` branch keyed on the iOS UA version.

---

## 5. Destinations and RTMP ingest

### 5.1 Platform ID enum (observed literal, `externals.b634d3e8690cf1f3.js`)

```
1  TWITCH        2  CYBERGAME     3  GOODGAME      4  SMASHCAST
5  YOUTUBE       6  USTREAM      10  VAUGHNLIVE   14  NICONICO
15 MLG          16  DOUYU        17  LIVEHOUSE    19  MIXER
20 LIVEEDU      21  CAVETUBE     24  PICARTO      25  YOUTUBE_STREAM_NOW
26 BREAKERS     27  VAPERS       28  INSTAGIB     29  CUSTOM_RTMP
32 YOUNOW       33  CHEW         35  MOBCRUSH     37  FACEBOOK
38 PERISCOPE    40  AFREECA_TV   43  BILIBILI     48  FC2
49 STEAM        51  HUYA         54  STREAMCRAFT  55  TELE2
57 DLIVE        58  ZHANQI       59  LINKEDIN     60  NIMO
61 NAVER        62  KAKAO        65  LOOTS        66  DAILYMOTION
67 TIKTOK       68  MIXCLOUD     69  TROVO        70  NONOLIVE
71 TWITTER      72  TELEGRAM     73  INSTAGRAM    74  AMAZON_LIVE
75 KICK         76  SLACK        77  RUMBLE       78  CUSTOM_SRT
79 SUBSTACK     80  MUX          81  CUSTOM_WHIP  82  CUSTOM_HLS
83 EMBED_PLAYER 84  PATREON
```

Display-name overrides (observed literal): `TWITTER → "X"`, `PERISCOPE → "Periscope by Twitter"`, `YOUTUBE_STREAM_NOW → "YouTube"`, `CUSTOM_WHIP → "Custom WHIP"`, `CUSTOM_HLS → "Custom HLS"`, `CUSTOM_SRT → "Custom SRT"`.

Per-platform destination metadata objects carry:
`{urlInputShow, urlInputPlaceholder, keyInputPlaceholder, title, description, videoURL, supportArticleUrl, isOAuthSupported, isManualAddingSupported, serviceId, serviceName}`.

Per-platform share/clip field decoders (observed literal io-ts names):
`youtubeDecoder {platformId, title, privacy, description}`, `tiktokDecoder {title, disableDuet, disableStitch, disableComment, privacyLevel}`, `facebookDecoder {description}`, `instagramDecoder {title}`, `linkedinDecoder {description, visibility?}`, `twitterDecoder {title}`, `rumbleDecoder {title, description, visibility, rumbleChannelId?}`.

### 5.2 Restream's own ingest (observed literal)

```
rtmp://live.restream.io/live         # primary
rtmp://live.restream.io/fallback     # backup
rtmp://live.restream.io/studio       # Studio-specific app (Index chunk)
```

Live ingest server lists are fetched from `v2/public/ingests` and `v2/public/platforms/${id}/stream-servers`.

### 5.3 Third-party ingest placeholders

**Inferred:** these are UI *placeholder* strings for the Custom-RTMP-family setup forms, not endpoints the client posts to. They still document the ingest shape Restream expects per platform.

```
rtmps://fa723fc1b171.global-contribute.live-video.net       (Twitch)
rtmps://live-upload.instagram.com:443/rtmp/                  (Instagram)
rtmps://rtmp4-1.telesco.pe/s/                               (Telegram)
rtmp://push-rtmp-l1.tiktokcdn.com/stage/                    (TikTok)
rtmp://rtmp.live.amazon.com/live                            (Amazon Live)
rtmp://global-live.mux.com:5222/app                         (Mux)
rtmp://ls20.live.rmbl.ws/slot-123                           (Rumble)
rtmp://stream.dlive.tv/live                                 (DLive)
rtmp://br4-lhr1.broadcast.steamcontent.com/app              (Steam)
rtmp://js.live-send.acg.tv/live-js/                         (Bilibili)
rtmp://send3.douyutv.com/live                               (Douyu)
rtmp://ws.upstream.huya.com/huyalive                        (Huya)
rtmp://wspush.rtmp.nimo.tv/live                             (Nimo)
rtmp://yfrtmpup.cdn.zhanqi.tv/zqlive                        (Zhanqi)
rtmp://rtmp.nova.naver.com/live                             (Naver)
rtmp://rtmp.play.kakao.com/kakaotv                          (Kakao)
rtmp://va-live1.livenono.com:1935/live                      (NonoLive)
rtmp://nlpoca104.live.nicovideo.jp:1935/publicorigin/...    (NicoNico)
rtmp://go.live.loots.com/live                               (Loots)
rtmp://ie.pscp.tv:80/x/5                                    (Periscope)
rtmp://1.19595351.fme.ustream.tv/ustreamVideo/00000000      (Ustream)
rtmp://34.213.58.26:7301/stream_obs                         (Tele2)
rtmp://somedomain.com/someapplication                       (generic custom RTMP)
https://customer-gllhkkbamkskdl1p.cloudflarestream.com/<uid>/webRTC/publish  (Custom WHIP)
```

Custom WHIP validation (observed literal): URL must match `/^https?:\/\//` and parse with protocol `http:` or `https:`; message `"Please enter a valid WHIP URL"`.

**Note:** WHIP appears only as an *outbound destination type* (`CUSTOM_WHIP = 81`). Studio's own ingest is mediasoup-over-WebSocket, not WHIP.

### 5.4 Outgoing stream profile / orientation (observed literal)

```js
OutgoingStreamOrientation = { LANDSCAPE:"LANDSCAPE", PORTRAIT:"PORTRAIT" };

const Sg = /^(\d+)x(\d+)@(\d+)fps\+(\w+)$/;                 // OutgoingStreamProfileIdIO
r.type({id:Eg, width:r.number, height:r.number, framerate:r.number, meta:r.string},
       "OutgoingStreamProfileIO");

const _h = /^(\d+)p@(\d+)$/;                                 // e.g. "1080p@30"
const xh = /^(\d+)x(\d+)p@(\d+)$/;                           // e.g. "1920x1080p@60"
Sh = r.brand(r.string, e => _h.test(e) || xh.test(e), "VideoPresetNameIO");

r.type({name:Sh, bitrate:r.number, width:r.number, height:r.number,
        framerate:r.number, cost:r.number}, "VideoPresetIO");
```

**Inferred:** the `cost` field on a video preset implies server-side transcoding is metered per-preset. No concrete preset *values* exist in the client — the table is supplied by the backend.

Related messages: `UPDATE_OUTGOING_STREAM_PROFILE` / `OUTGOING_STREAM_PROFILE_UPDATED`, `UPDATE_OUTGOING_STREAM_ORIENTATION` / `OUTGOING_STREAM_ORIENTATION_UPDATED`, `OutgoingStreamModeUpdated`, `DestinationsOutgoingStreamOrientationUpdated`.

---

## 6. Third-party SDKs actually initialised

Every real key lives in `client-static/misc/studio-shell.html`, **not** in the JS bundles.

| SDK | Evidence | Observed literal |
|---|---|---|
| **Segment (self-proxied)** | shell `<script>` | loader `https://evs.cdp.restream.io/bgR2R8cwnEzn69s63TNTmY/hNoNGLcHeAvVUQH3crgg94.min.js`; `analytics._cdn = 'https://evs.cdp.restream.io'`; `SNIPPET_VERSION = '5.2.0'`; attribute `data-global-segment-analytics-key`; then `analytics.page({… session_id: window.analyticsAmplitudeSessionId })` |
| **Amplitude** | shell + bundle | `window.analyticsAmplitudeSessionId = Date.now()`. Amplitude **Experiment** client in bundle: `GET {serverUrl}/sdk/v2/flags?delivery_method=…`, header `X-Amp-Exp-User` (base64 JSON), header `library: ${libraryName}/${libraryVersion}`; server URLs `https://api.lab.amplitude.com`, `https://api.lab.eu.amplitude.com`, `https://flag.lab.amplitude.com`, `https://flag.lab.eu.amplitude.com` |
| **Intercom** | shell | `APP_ID = 'wvwee5xi'`; `s.src = 'https://widget.intercom.io/widget/' + APP_ID`; `window.intercomSettings = {app_id, custom_launcher_selector:'#custom-intercom-launcher', …}` |
| **Datadog Browser Logs** | vendored into `restream.887ca3d5bcd09a3a.js` | SDK name `"browser-logs-sdk"`, version `"6.6.3"`; globals `DD_LOGS`, `DD_RUM`, `DD_RUM_SYNTHETICS`; sites `datadoghq.com` / `datadoghq.eu`; intakes `https://www.datadoghq-browser-agent.com` and `https://www.datad0g-browser-agent.com`; options `clientToken`, `sessionSampleRate`, `forwardErrorsToLogs`, `forwardConsoleLogs`, `forwardReports`, `requestErrorResponseLengthLimit: 32768`, `usePciIntake`, `trackingConsent`; help path `/real_user_monitoring/browser/troubleshooting`. RUM constants (`applicationId`, `sessionReplaySampleRate`, `trackUserInteractions`) exist in `externals`. All config values are runtime-injected. |
| **Stripe** | bundle | `"https://js.stripe.com/v3"`; regex `/^https:\/\/js\.stripe\.com\/v3\/?(\?.*)?$/`; lazy `loadStripe` promise; `stripePublicKey` injected via context |
| **Cloudflare Turnstile** | bundle + shell | script id `"cf-turnstile-script"`; callback `"onloadTurnstileCallback"`; container `"cf-turnstile"`; widget sizes `{normal:{300,65}, compact:{150,140}, invisible:{0,0}}`; shell loads `https://challenges.cloudflare.com/turnstile/v0/api.js` |
| **Canny** | shell | `e.src = 'https://canny.io/sdk.js'`, `'canny-jssdk'` |
| **Convert Experiments** (A/B) | shell | `https://cdn-3.convertexperiments.com/js/10034870-10034041.js` |
| **Google Identity / APIs** | shell + bundle | `https://apis.google.com/js/api.js`, `https://accounts.google.com/gsi/client` |
| **watchRTC (testRTC)** | `externals` | monkey-patches `RTCPeerConnection`, `getUserMedia`, `getDisplayMedia`, `enumerateDevices`, `setCodecPreferences`; config keys `rtcRoomId`, `rtcPeerId`, `watchRTCSessionId`, `watchRTCAgentId`, `apiKey`, `apiVersion:"v1"`, `collectionInterval`; assets under `03-deep-static/recursive/qualityrtc-sdk.s3.amazonaws.com` |
| **jQuery 3.6.0** | shell | `https://code.jquery.com/jquery-3.6.0.min.js` (legacy, shell only) |
| **aws-sdk-js v2** | `awssdk.…js` | full v2 build with `signatureVersion` and `"S3"`; used for recording/file uploads |
| **Vercel AI SDK / AI Gateway** | `externals` | WS subprotocols `["ai-gateway-realtime.v1", "ai-gateway-auth.<key>", "ai-gateway-team.<b64url>"]`; error symbol `Symbol.for("vercel.ai.gateway.error")` — **inferred** to back the `aiCreatorBackendHost` / onboarding-chat features |

**Explicitly absent** (grep count 0 in both target bundles): Sentry, LaunchDarkly, Mixpanel, PostHog, Hotjar, FullStory, GrowthBook, Statsig, Unleash, `gtag`/GTM, socket.io, SockJS, SignalR, Centrifugo, Pusher, Ably, PubNub, MQTT, STOMP, LiveKit, Janus, Agora, Twilio, Vonage/OpenTok, Daily, Millicast, Amazon IVS.

### 6.1 Analytics event vocabulary

**Observed:** 511 `eventsReporter.report("…")` call sites across the bundles; names are Title Case and human-readable. Sample from `593` / `restream`:

`Background Uploaded`, `Beautify Filter Toggled`, `Browser Source Removed`, `Browser Source Updated`, `Copied To Clipboard`, `Countdown Background Color Selected`, `Countdown Background Opacity Selected`, `Countdown Color Selected`, `Countdown Custom Music Selected`, `Countdown Font Selected`, `Countdown Timer Selected`, `Custom Music Files Uploaded`, `Entered Fullscreen`, `Exited Fullscreen`, `Font Selected`, `Local Recording Started`, `Local Recording Ended`, `Local Recordings Capabilities`, `Logo Uploaded`, `Media Device Change Request Received` / `Allowed` / `Rejected`, `No Activity`, `Overlay Uploaded`, `Pasted From Clipboard`, `Scene Edit Mode Entered` / `Exited`, `Scene Edit Mode Target Switched`, `Scene Note Added` / `Removed`, `Sign In Clicked`, `Sign In Requested`.

Full list: `rg -oN 'eventsReporter\.report\("[A-Za-z0-9 _:-]+"' *.js | sort -u`

---

## 7. Implications for the clone

**Inferred throughout this section.**

1. **Build the SFU seam first.** The most load-bearing decision Restream made is *server-side compositing*. The browser never encodes the program feed. A clone that composites client-side will diverge on CPU cost, on multi-guest scaling, and on the entire scene-state protocol.
2. **mediasoup is a drop-in.** Because `mediasoup-client` is the literal client, a mediasoup SFU gives transport/producer/consumer compatibility for free. Only the *envelope* (`{action, …}` inside a 1-byte-prefixed binary WS frame) is bespoke.
3. **The room protocol is the product.** 669 codecs is the real surface area — not the REST API. Model it as one authoritative Room Manager owning scene/layout/overlay state, broadcasting deltas, with per-role message unions (`Client` / `Host` / `Overlay` / `Sfu` / `SourcePuller`). Adopt the `{type, messageId, value}` envelope with request/response correlation by `messageId`.
4. **Copy the shape, not the strings.** Two naming conventions coexist because of an incomplete migration. A clone should pick one and stay with it.
5. **Runtime-inject every host.** Zero backend URLs are compiled in. Keep that property.
6. **Adaptive producer control is client-side.** Pausing producers that are off-layout (`adaptAvailability`) and picking `maxSpatialLayer` from the layout's `videoContainer` size are cheap, high-leverage wins worth replicating verbatim.
7. **Local recording is a separate, redundant path.** MediaRecorder → 5 MiB parts → S3, MKV preferred for crash resilience, deliberately independent of the live stream.
8. **Self-host the wasm; consider self-hosting the models too.** Restream self-hosts `/mediapipe/*.wasm` but still hits Google's CDN for `.tflite` weights — an availability dependency a clone may not want.

---

## 8. Gaps / explicitly not found

- No `wss://` or `ws://` literal, no SFU hostname, no region identifiers. All runtime-injected.
- No STUN/TURN URLs. Fetched at connect time via `GetIceServers`.
- No concrete `VideoPreset` table (name/bitrate/width/height/framerate/cost) — server-supplied.
- No Datadog `clientToken` / `applicationId`. No Segment write key in the JS (the key is passed to `analytics.load(key)` from a variable in the shell; only the CDN loader path is a literal).
- No `MediaRecorder` `timeslice` value found; chunking is by byte count (5 MiB), not by interval.
- No canvas `captureStream(fps)` argument anywhere.
- No WebCodecs / insertable-streams / `MediaStreamTrackGenerator` usage.
- Chat backends (`chatClientBackendHost`, `chatHistoryBackendHost`) are wired into context but no chat HTTP paths and no chat socket URL appear as literals. Chat reaches the overlay through the room protocol instead: `REQUEST_CHAT_HISTORY`, `ADD_PRIVATE_CHAT_MESSAGE`, `CHAT_TOKEN_UPDATED`, `UPDATE_VIRTUAL_EVENTS_CHAT_CREDENTIALS`, `OverlayRequestChatHistoryMessageIO`.
