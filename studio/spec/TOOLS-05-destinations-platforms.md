# TOOLS-05 — Destinations, Platform Integrations & Multistreaming

Static-analysis inventory mined from the local Restream Studio capture.
No network access was used; no account was logged in.

Legend: **[O]** = observed exact literal in a captured file · **[I]** = inferred from surrounding code.

Primary evidence files (all paths absolute):

| Role | File |
|---|---|
| Platform enum, API client, decoders | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/externals.b634d3e8690cf1f3.js` |
| Studio app: connect flows, forms, destination UI | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/restream.887ca3d5bcd09a3a.js` |
| Runtime host/env constants | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/Index.312bd7238c465fa2.js` |
| UI strings (dashboard locale) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/locale-en-US.js` |
| Chat embed message renderer | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/restreamchatembedthemes.d79062a9951586dd.js` |
| Webinar chat store | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/client-static/js/593.47f82f224fb8c169.js` |
| Recovered SCSS component paths | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/03-deep-static/source-maps/extracted` |
| Inline SVG capture (117 files) | `C:/Users/Dvi AudioVisual/Downloads/UPDATES/SVG/RESTREAM Clone/01-inside-studio-verified/inline-svg` |

---

## 1. The master platform enum

**[O]** A single TypeScript numeric enum enumerates every destination type. It is defined once in
`externals.b634d3e8690cf1f3.js` (minified local `f`) and re-exported under the mangled name **`ODD`**
(`ODD:()=>f`). The Studio app consumes it everywhere as `o.ODD.<NAME>`.

**58 enum members.** IDs are sparse — gaps (7–9, 11–13, 18, 22–23, 30–31, 34, 36, 39, 41–42, 44–47, 50,
52–53, 56, 63–64) are retired platforms whose IDs were never reused. **[I]**

Two display-name maps exist in `restream.887ca3d5bcd09a3a.js`: `wbe` (45 entries, used by
`ConnectPlatformTileItem` and destination rows) and `R2e` (46 entries, used by `PlatformCard`).
Their union covers **47** of the 58 enum members; the remaining **11** are dead enum slots with no UI. **[O]**

### 1.1 Full enum → display name

| ID | Enum member | `wbe` name | `R2e` name (PlatformCard) | In "Add channels" list? |
|---:|---|---|---|---|
| 1 | `TWITCH` | Twitch | Twitch | yes |
| 2 | `CYBERGAME` | — | — | no (dead) |
| 3 | `GOODGAME` | GoodGame | GoodGame | no |
| 4 | `SMASHCAST` | — | — | no (dead) |
| 5 | `YOUTUBE` | YouTube | YouTube | yes |
| 6 | `USTREAM` | — | — | no (dead) |
| 10 | `VAUGHNLIVE` | Vaughn Live | Vaughn Live | yes |
| 14 | `NICONICO` | — | — | no (dead) |
| 15 | `MLG` | Major League Gaming | Major League Gaming | yes |
| 16 | `DOUYU` | Douyu | Douyu | yes |
| 17 | `LIVEHOUSE` | — | — | no (dead) |
| 19 | `MIXER` | — | — | no (dead) |
| 20 | `LIVEEDU` | LiveEdu(Education Ecosystem) | LiveEdu | no |
| 21 | `CAVETUBE` | — | — | no (dead) |
| 24 | `PICARTO` | Picarto.TV | Picarto.TV | yes |
| 25 | `YOUTUBE_STREAM_NOW` | YouTube | — | no (legacy) |
| 26 | `BREAKERS` | Breakers.TV | Breakers.TV | yes |
| 27 | `VAPERS` | Vapers.TV | Vapers.TV | no |
| 28 | `INSTAGIB` | Instagib | Instagib | no |
| 29 | `CUSTOM_RTMP` | Custom RTMP | Custom RTMP | yes |
| 32 | `YOUNOW` | — | — | no (dead) |
| 33 | `CHEW` | — | — | no (dead) |
| 35 | `MOBCRUSH` | Mobcrush | Mobcrush | no |
| 37 | `FACEBOOK` | Facebook | Facebook | yes |
| 38 | `PERISCOPE` | Periscope by Twitter | Periscope by Twitter | no (deprecated) |
| 40 | `AFREECA_TV` | SOOP | SOOP | yes |
| 43 | `BILIBILI` | Bilibili | Bilibili | yes |
| 48 | `FC2` | FC2 Live | FC2 Live | yes |
| 49 | `STEAM` | Steam | Steam | yes |
| 51 | `HUYA` | Huya | Huya | yes |
| 54 | `STREAMCRAFT` | — | — | no (dead) |
| 55 | `TELE2` | TELE2 | TELE2 | no |
| 57 | `DLIVE` | DLive | DLive | no (shutdown) |
| 58 | `ZHANQI` | Zhanqi.tv | Zhanqi.tv | yes |
| 59 | `LINKEDIN` | LinkedIn | LinkedIn | yes |
| 60 | `NIMO` | Nimo TV | Nimo TV | yes |
| 61 | `NAVER` | Naver TV | Naver TV | yes |
| 62 | `KAKAO` | kakaoTV | kakaoTV | yes |
| 65 | `LOOTS` | — | — | no (dead) |
| 66 | `DAILYMOTION` | Dailymotion | Dailymotion | yes |
| 67 | `TIKTOK` | TikTok | TikTok | yes |
| 68 | `MIXCLOUD` | Mixcloud | Mixcloud | yes |
| 69 | `TROVO` | Trovo | Trovo | no (shutdown) |
| 70 | `NONOLIVE` | Nonolive | Nonolive | yes |
| 71 | `TWITTER` | X | X | yes |
| 72 | `TELEGRAM` | Telegram | Telegram | yes |
| 73 | `INSTAGRAM` | Instagram | Instagram | yes |
| 74 | `AMAZON_LIVE` | — | Amazon Live | yes |
| 75 | `KICK` | Kick | Kick | yes |
| 76 | `SLACK` | Slack | Slack | yes |
| 77 | `RUMBLE` | Rumble | Rumble | yes |
| 78 | `CUSTOM_SRT` | Custom SRT | Custom SRT | yes |
| 79 | `SUBSTACK` | Substack | Substack | yes |
| 80 | `MUX` | Mux | Mux | yes |
| 81 | `CUSTOM_WHIP` | Custom WHIP | Custom WHIP | yes (BETA badge) |
| 82 | `CUSTOM_HLS` | Custom HLS | Custom HLS | yes |
| 83 | `EMBED_PLAYER` | — | Embed Player | yes (NEW/UPGRADE badge) |
| 84 | `PATREON` | Patreon | Patreon | yes (NEW badge) |

**Exact enum literal [O]** (`externals.b634d3e8690cf1f3.js`, byte offset ≈ 615 700):

```js
var f=(e=>(e[e.TWITCH=1]="TWITCH",e[e.CYBERGAME=2]="CYBERGAME",e[e.GOODGAME=3]="GOODGAME",
e[e.SMASHCAST=4]="SMASHCAST",e[e.YOUTUBE=5]="YOUTUBE",e[e.USTREAM=6]="USTREAM",
e[e.VAUGHNLIVE=10]="VAUGHNLIVE",e[e.NICONICO=14]="NICONICO",e[e.MLG=15]="MLG",
e[e.DOUYU=16]="DOUYU",e[e.LIVEHOUSE=17]="LIVEHOUSE",e[e.MIXER=19]="MIXER",
e[e.LIVEEDU=20]="LIVEEDU",e[e.CAVETUBE=21]="CAVETUBE",e[e.PICARTO=24]="PICARTO",
e[e.YOUTUBE_STREAM_NOW=25]="YOUTUBE_STREAM_NOW",e[e.BREAKERS=26]="BREAKERS",
e[e.VAPERS=27]="VAPERS",e[e.INSTAGIB=28]="INSTAGIB",e[e.CUSTOM_RTMP=29]="CUSTOM_RTMP",
e[e.YOUNOW=32]="YOUNOW",e[e.CHEW=33]="CHEW",e[e.MOBCRUSH=35]="MOBCRUSH",
e[e.FACEBOOK=37]="FACEBOOK",e[e.PERISCOPE=38]="PERISCOPE",e[e.AFREECA_TV=40]="AFREECA_TV",
e[e.BILIBILI=43]="BILIBILI",e[e.FC2=48]="FC2",e[e.STEAM=49]="STEAM",e[e.HUYA=51]="HUYA",
e[e.STREAMCRAFT=54]="STREAMCRAFT",e[e.TELE2=55]="TELE2",e[e.DLIVE=57]="DLIVE",
e[e.ZHANQI=58]="ZHANQI",e[e.LINKEDIN=59]="LINKEDIN",e[e.NIMO=60]="NIMO",
e[e.NAVER=61]="NAVER",e[e.KAKAO=62]="KAKAO",e[e.LOOTS=65]="LOOTS",
e[e.DAILYMOTION=66]="DAILYMOTION",e[e.TIKTOK=67]="TIKTOK",e[e.MIXCLOUD=68]="MIXCLOUD",
e[e.TROVO=69]="TROVO",e[e.NONOLIVE=70]="NONOLIVE",e[e.TWITTER=71]="TWITTER",
e[e.TELEGRAM=72]="TELEGRAM",e[e.INSTAGRAM=73]="INSTAGRAM",e[e.AMAZON_LIVE=74]="AMAZON_LIVE",
e[e.KICK=75]="KICK",e[e.SLACK=76]="SLACK",e[e.RUMBLE=77]="RUMBLE",
e[e.CUSTOM_SRT=78]="CUSTOM_SRT",e[e.SUBSTACK=79]="SUBSTACK",e[e.MUX=80]="MUX",
e[e.CUSTOM_WHIP=81]="CUSTOM_WHIP",e[e.CUSTOM_HLS=82]="CUSTOM_HLS",
e[e.EMBED_PLAYER=83]="EMBED_PLAYER",e[e.PATREON=84]="PATREON",e))(f||{})
```

### 1.2 Ordered "Add new channels" catalogue (`PlatformsList`)

**[O]** `M2e` in `restream.887ca3d5bcd09a3a.js` — 37 tiles, in exact render order:

```
YOUTUBE, FACEBOOK, LINKEDIN, TWITCH, KICK, INSTAGRAM, TWITTER, TIKTOK, RUMBLE,
CUSTOM_RTMP, CUSTOM_SRT, CUSTOM_WHIP, CUSTOM_HLS, EMBED_PLAYER, SLACK, MUX,
PATREON, SUBSTACK, AMAZON_LIVE, TELEGRAM, MIXCLOUD, AFREECA_TV, NAVER,
VAUGHNLIVE, STEAM, DAILYMOTION, NIMO, PICARTO, FC2, BREAKERS, BILIBILI,
NONOLIVE, KAKAO, MLG, DOUYU, HUYA, ZHANQI
```

Modal header **[O]**: `"Add new channels"` (`PlatformsStep`).

Badges applied on the tile grid **[O]**:

| Badge | Condition |
|---|---|
| `UPGRADE` (promo) on CUSTOM_RTMP | `!paidFeatures.customRtmpAvailable` |
| `UPGRADE` on CUSTOM_SRT | `!paidFeatures.customSrtChannelAvailable` |
| `UPGRADE` on CUSTOM_HLS | `!paidFeatures.customHlsChannelAvailable` |
| `UPGRADE` / `NEW` on EMBED_PLAYER | `maxConcurrentEmbedPlayerViewers === 0` → UPGRADE, else NEW |
| `NEW` / `UPGRADE` on SLACK | `studioWebinarsAvailable \|\| slackStreamingAvailable` → NEW, else UPGRADE |
| `BETA` | `W2e = [CUSTOM_WHIP]` |
| `NEW` | `D2e = [PATREON]` |

**[O]** Onboarding "recommended" tile map `I4e`:
`FACEBOOK {isRecommended:true}`, `TWITCH {onDesktopOnly:true}`, `TWITTER`, `YOUTUBE`,
`LINKEDIN {onDesktopOnly:true}`, `CUSTOM_RTMP`. Compact onboarding list `Q4e = [FACEBOOK, YOUTUBE, TWITCH, TWITTER]`;
avatar-stack default `S8e = [YOUTUBE, FACEBOOK, TWITCH, PERISCOPE, LINKEDIN]`;
bulk-title platforms `$jt = [YOUTUBE, FACEBOOK, LINKEDIN, TWITCH, TWITTER]`.

### 1.3 Platform icons

**[O]** Icons are **React components inlined in the JS bundle**, not shared assets:

| Map | Entries | Purpose |
|---|---:|---|
| `K2e` | 47 | dark-theme `PlatformCard` icons |
| `q2e` | 46 | light-theme `PlatformCard` icons |
| `I2e` | 1 | alt hover icon — `{ [CUSTOM_RTMP]: <icon> }` |

Per-icon scale overrides **[O]**: `AFREECA_TV` and `TELEGRAM` `tw-scale-[2]`,
`CUSTOM_HLS` `tw-scale-[2] tw-mb-2`, `PATREON` `tw-scale-[1.1]`, `CUSTOM_WHIP` `tw-scale-[1.2]`,
`EMBED_PLAYER` `tw-scale-[1.25]`, `FACEBOOK` (light) `tw-scale-[1.2]`.

**[O]** Remote icon URL helpers (`zje` / `Fje`):
```js
https://restream.io/img/api/platforms/platform-${id}.png
https://restream.io/img/api/platforms/platform-${id}.svg
https://restream.io/img/api/platforms/platform-${platform}-alt.svg
// special-case id 5 (YouTube):
https://restream.io/img/api/platforms/platform-5-social.png|svg
```
Confirmed on disk: `01-inside-studio-verified/referenced-static/restream.io/img/api/platforms/platform-5-social.{png,svg}`.
`platformDecoder` supplies these server-side as `{ id, name, image: { png, svg } }` **[O]**.

**[O] Negative finding — inline SVG capture contains no platform logos.**
A brand-colour scan of all 117 files in `01-inside-studio-verified/inline-svg/`
(Twitch `#9146FF`, YouTube `#FF0000`, Facebook `#1877F2`, LinkedIn `#0A66C2`/`#2867B2`,
Kick `#00E701`/`#53FC18`, Instagram `#E4405F`, TikTok `#25F4EE`/`#FE2C55`, Telegram `#229ED9`,
Patreon `#FF424D`, Substack `#FF6719`, Trovo `#19FFC7`, Rumble `#85C742`, Discord `#5865F2`)
matched **zero** files. Path-data prefix matching traced 87/117 back to a JS bundle; the other 30
are generic chrome glyphs. The largest file, `inline-svg-018.svg` (4 726 B, viewBox `0 0 116 23`,
fill `#1D1D1D`), is a wordmark, not a platform logo. The captured DOM did not have the destinations
panel open. Platform logos must be recovered from `K2e`/`q2e` in `restream.887ca3d5bcd09a3a.js`,
or from the remote URL pattern above.

Ingest-server flag icons: `https://restream.io/img/flags/4x3/${icon}` **[O]**.

---

## 2. Connection method per platform — OAuth vs RTMP key

**[O]** The authoritative switch is `s0e` in `restream.887ca3d5bcd09a3a.js` (`ConnectPlatformStep`).
It routes each platform ID to either `H_e` (OAuth `ConnectButton`, which opens a popup and posts
`hbe = "OAUTH_CHANNEL_MESSAGE"` / `gbe = "restream_oauth_channel_connect_result"`) or `r0e`
(the manual RTMP/key form dispatcher).

### 2.1 OAuth-based

| Platform | Route | Notes |
|---|---|---|
| `TWITCH` | OAuth | plain |
| `PERISCOPE` | OAuth | deprecated — see §2.5 |
| `DLIVE` | OAuth | `DliveShutdownError` exists |
| `TROVO` | OAuth | `TrovoShutdownError` exists |
| `PICARTO` | OAuth | plain |
| `SLACK` | OAuth | gated on `slackStreamingAvailable` / `studioWebinarsAvailable` |
| `PATREON` | OAuth | plain |
| `TWITTER` (X) | OAuth | `disableAutoOpen:!0` (needs explicit click) |
| `DAILYMOTION` | OAuth (`n0e`) | plain |
| `AFREECA_TV` (SOOP) | OAuth (`o$e`) | also has manual key form `m$e` with server select |
| `LINKEDIN` | OAuth (`i0e`) | preceded by `CHOICE_OF_TARGETS` |
| `YOUTUBE` | OAuth (`Z_e`/`__e`) | plus "Set Up Manually" when `isManualAddingSupported` |
| `GOODGAME` | OAuth skin + manual form | — |
| `FACEBOOK` profile / page | OAuth (`o0e` / `a0e`) | preceded by `CHOICE_OF_TARGETS` |

### 2.2 Feature-flag gated (OAuth when available, else manual key)

**[O]** verbatim:
```js
case TIKTOK:    return e.isAddingTikTokViaApiSupported;
case KICK:      return e.isAddingKickViaApiSupported;
case RUMBLE:    return true;
case INSTAGRAM: return e.isAddingInstagramViaApiSupported;
```
Server-side signals: `"tiktok_channel_can_be_added_via_api"`, `"kick_channel_can_be_added_via_api"` **[O]**.

### 2.3 Manual RTMP / key only

**[O]** `MIXCLOUD, KAKAO, NAVER, NIMO, NONOLIVE, HUYA, ZHANQI, BILIBILI, MOBCRUSH, MLG, DOUYU,
LIVEEDU, VAUGHNLIVE, INSTAGIB, BREAKERS, VAPERS, FC2, STEAM, TELE2, TELEGRAM, AMAZON_LIVE,
SUBSTACK, MUX, CUSTOM_RTMP, CUSTOM_SRT, CUSTOM_WHIP, CUSTOM_HLS, EMBED_PLAYER`
plus `FACEBOOK` when `typeTarget === "group"`.

Facebook-group hint **[O]**: *"Use a persistent stream key from the Live Producer page."*
(`https://www.facebook.com/live/producer`).

### 2.4 Per-platform connect form fields and ingest/key patterns

Placeholders below are **verbatim `placeholder:"…"` literals** from the connect forms **[O]**.
They are the platform's real ingest URL shape as Restream documents it.

| Platform | Form fields | RTMP / ingest URL placeholder | Stream-key placeholder |
|---|---|---|---|
| `YOUTUBE` (manual) | `channelPageUrl`, `key`, `serverId` | channel/stream URL `https://www.youtube.com/watch?v=CwmcAKpX-Q0` | `example.aw3k-kbty-p23m-awkp` |
| `AFREECA_TV` (manual) | `key`, `serverId` | (server dropdown only) | `example-567479391` |
| `AMAZON_LIVE` | `amazon_live` (url), `key` | `rtmp://rtmp.live.amazon.com/live` | `4593fcd2-dadd-40dd-8c10-c88609f4ad8b` |
| `BILIBILI` | `url`, `key`, `channelPageUrl` | `rtmp://js.live-send.acg.tv/live-js` · page `https://live.bilibili.com/100500` | `?streamname=live_25046456_6293557&key=e0b292e96743f47e7292153eb8c773e4` |
| `BREAKERS` | `key`, `channelPageUrl`, `serverId` | page `https://breakers.tv/example` | `btw_sDGbRq_0T0J0E` |
| `DOUYU` | `url`, `key` | `rtmp://send3.douyutv.com/live` | `228322rCW017Yk8rd?wsSecret=7c65555a8c9edf84d58cb7eb95a23f68&wsTime=35ec64f0` |
| `FACEBOOK` (group) | `displayName`, `key` | — (persistent key) | `Enter here` |
| `FC2` | `key`, `channelPageUrl` | page `https://live.fc2.com/100500` | `b554c4a1d8931aab3` |
| `HUYA` | `url`, `key` | `rtmp://ws.upstream.huya.com/huyalive` | `1234567890-1234567890-0-1234567890-12345-A-1524345807-1` |
| `INSTAGIB` | `key`, `channelPageUrl`, `serverId` | page `https://instagib.tv/example` | `instagib_sDGbRq_0T0J0E` |
| `INSTAGRAM` | `username`, `key` | (implicit, validated against `instagram.com` / `fbcdn.net`) | `17972604562626435?5_sw=0&s_vt=ig&a=AbxtxtC5dPLyII2B` |
| `KAKAO` | `key` | — | `d16fb36f0911f878998c136191af705e` |
| `KICK` | `username` (channel URL), `url`, `key` | `rtmps://fa723fc1b171.global-contribute.live-video.net` · channel `https://kick.com/channelName` | `sk_us-west-3_5sFKjd4wpsCA_yLfweZhlXXUEss2asfrijUyvrZKglI` |
| `LIVEEDU` | `key`, `serverId` | — | `channelname?t=a5dpv3bp0d5c` |
| `MIXCLOUD` | `key` | — | `10a974f8-b396-4732-949f-2586983a6802_09d41515-f` |
| `MLG` | `channelPageUrl`, `key`, `serverId` | page `http://tv.majorleaguegaming.com/channel/mychannelname` | `stream_7a334334ff2a112343b4ac051dbc5544` |
| `MOBCRUSH` | `channelPageUrl`, `key` | page `https://www.mobcrush.com/example` | `f54fdd1d43b012093757f152b2e259bff137b304dff01c358d310001d01cb6c` |
| `MUX` | `displayName`, `key` | — (Mux supplies the URL) | `9f7e4bc7-0134-d77e-6923-3c0d028da515` |
| `NAVER` | `url`, `key` | `rtmp://rtmp.nova.naver.com/live` | `Tz56BNePnq` |
| `NIMO` | `url`, `key` | `rtmp://wspush.rtmp.nimo.tv/live` | (generic) |
| `NONOLIVE` | `url`, `key` | `rtmp://va-live1.livenono.com:1935/live` | `39581514-0e5f6d1a3629rc79153811e9f59b6f02` |
| `RUMBLE` | `username` (channel URL), `url`, `key` | `rtmp://ls20.live.rmbl.ws/slot-123` · channel `https://rumble.com/c/channelName` | `r9d1-59h5-7j0u` |
| `STEAM` | `url`, `key` | `rtmp://br4-lhr1.broadcast.steamcontent.com/app` | `steam_852695447_c3886cec1233395a` |
| `SUBSTACK` | `displayName`, `key` | — | `9f7e4bc7-0134-d77e-6923-3c0d028da515` |
| `TELE2` | `url`, `key`, `serverId` | (server dropdown) | `restream?key=4xgd1cvfma912xrsqxeh4o` |
| `TELEGRAM` | `telegram` (url), `key` | `rtmps://rtmp4-1.telesco.pe/s/` | `123456789:uJK1_vksKqKz6S1LcNDK3o` |
| `TIKTOK` | `username`, `tiktok` (url), `keyRequired` | `rtmp://push-rtmp-l1.tiktokcdn.com/stage/` · username `@username` | (required, non-empty) |
| `VAPERS` | `key`, `channelPageUrl`, `serverId` | page `https://vapers.tv/example` | `vtv_sDGbRq_0T0J0E` |
| `VAUGHNLIVE` | `key`, `channelPageUrl`, `serverId` | page `https://vaughnlive.tv/example` | `live_sDGbRq_0T0J0E` |
| `ZHANQI` | `url`, `key` | `rtmp://yfrtmpup.cdn.zhanqi.tv/zqlive` | `123456_zTKpU?k=5d41402abc4b2a76b9719d911017c592&t=5d41402a` |
| `CUSTOM_RTMP` | see §3.1 | `URL needs to start with rtmp://` | `Paste here` |
| `CUSTOM_SRT` | see §3.2 | `URL needs to start with srt://` | (Stream ID / Passphrase) |
| `CUSTOM_WHIP` / `CUSTOM_HLS` | see §3.3–3.4 | `URL needs to start with http(s)://` | — |

**[O]** Platforms that get an **"Autodetect"** server option (`u$e`):
`TWITCH, SMASHCAST, CYBERGAME, VAUGHNLIVE, INSTAGIB, BREAKERS, VAPERS, CHEW, AFREECA_TV`.
Server list comes from `GET v2/public/platforms/${platformId}/stream-servers`, decoded by
`platformStreamServerDecoder = { id: string, serverName: string, default: string }` **[O]**.
Locale: `modal_add_channel_server_select_server = "Server"`,
`modal_add_channel_server_select_option_autodetect = "Autodetect"` **[O]**.

### 2.5 Connect-flow steps

**[O]** `Cze` step enum (`restream.887ca3d5bcd09a3a.js`):

```
PLATFORMS, CHANNEL_SETTINGS, CHOICE_OF_TARGETS, CONNECT_PLATFORM,
EMPTY_CHANNEL_TARGETS, CHANNEL_TARGETS, FINISH_ADDING_CHANNEL_STEP,
FB_ADD_APPLICATION, REQUEST_LINKEDIN_LIVE,
REQUEST_FACEBOOK_NOT_ELIGIBLE_TO_GO_LIVE_YET, REQUEST_FACEBOOK_ESTABLISHED_PRESENCE,
YOUTUBE_HOLD, YOUTUBE_INSUFFICIENT_SCOPES, CHANNEL_ALREADY_ADDED, UPGRADE_FLOW,
CHANNEL_GENERAL_ERROR, CONNECTED_INSTAGRAM_ACCOUNTS, REQUEST_X_PLATFORM_LIVE,
EMBED_PLAYER_SETTINGS, EMBED_PLAYER_IMAGE_CROP
```

**[O]** Target-type enum `IXe`: `PROFILE="profile"`, `PUBLIC_PAGE="page"`, `PUBLIC_GROUP="group"`,
`CHANNEL="channel"`, `EVENT="event"`. Only `FACEBOOK` and `LINKEDIN` take the `CHOICE_OF_TARGETS`
branch (`xbe = e => e===FACEBOOK || e===LINKEDIN`).

**[O]** `channelConnectStateDecoder = { uuid, userId, platformId, channelIdentifier, displayName, targetType, isActive, createdAt }`
— the OAuth handshake record (`v2/api/channel-connect-state/{uuid}`, `…/save-added-channel`).

**[O]** `channelTargetDecoder = { id, name, icon, isAdded, privacy }` — Facebook pages/groups and
LinkedIn organisations offered in `CHANNEL_TARGETS`.

**[O]** `connectedInstagramAccountDecoder = [{ id, name, profilePictureUrl, followersCount, username }]`.

**[O]** Deprecation strings: `periscope_deprecated = "X has deactivated Periscope."`,
`periscope_deprecated_link_message = "Connect your X account here."`,
`DliveShutdownError`, `TrovoShutdownError`, `UnsupportedPlatformError`.

**[O]** Analytics events emitted by the flow: `"New Channel Selected"`, `"New Channel Client Attempt"`,
`"New Channel Client Added"`, `"New Channel Client Add Error"`, `"New Channel Client Add Popup Blocked"`,
each with `{category:"Channels", connection_type:"api"|"manual", platform_id, platform_name, type_target, url, query_parameters}`.

---

## 3. Custom destination configuration (RTMP / SRT / WHIP / HLS)

All four "custom" destination editors are in `restream.887ca3d5bcd09a3a.js`.
CSS modules: `RtmpConnect`, `RtmpSettings`, `RtmpSettingsModal`, `CustomSrtSettings`,
`CustomWhipSettings`, `CustomHlsSettings`, `DestinationTypeSelect` **[O]**.

### 3.1 Custom RTMP (`CUSTOM_RTMP`, id 29)

**[O]** Form `B$e`, initial values:
```js
{ displayName:"", url:"", key:"", useAuthentication:false, rtmpUsername:"", rtmpPassword:"" }
```
Submitted payload: `{ displayName, userName: displayName, url, key, useAuthentication }`
plus `{ rtmpUsername, rtmpPassword }` when `useAuthentication` is true.

| Field | Label (locale key → text) | Placeholder | Validation |
|---|---|---|---|
| `displayName` | `modal_edit_channel_custom_rtmp_auth_display_name_input_label` → "Display name" | `Name your channel (optional)` | free text |
| `url` | `modal_add_channel_rtpm_url_input_label` → "RTMP URL" | `URL needs to start with rtmp://` | must match `^rtmps?:\/\/`, must **not** match `^https?:\/\/` |
| `key` | `modal_add_channel_key_input_label` → "Stream key" | `Paste here` | free text (server validates) |
| `useAuthentication` | `modal_edit_channel_custom_rtmp_auth_checkbox_input_label` → "Use authentication" | — | boolean |
| `rtmpUsername` | `…auth_username_input_label` → "Username" | `Type here` | required when auth on → `error_channel_rtmp_username = "Please, enter your username"` |
| `rtmpPassword` | `…auth_password_input_label` → "Password" | `Type here` | — |

Marketing copy **[O]**:
`channel_custom_rtmp_description = "Allows you to add a Custom RTMP or more than 1 channel of the same platform from our list of 30+ supported platforms."`,
`channel_custom_rtmp_short_description = "or your server"`.

### 3.2 Custom SRT (`CUSTOM_SRT`, id 78) — schema `ZQe` **[O]**

```js
aN({
  displayName: GS(),
  url: GS().required("URL is required")
        .matches(/^srt:\/\//, "URL needs to start with srt://")
        .test("valid-srt-url","Please enter a valid SRT URL", e => new URL(e).protocol === "srt:")
        .test("has-port","Port number is required", e => new URL(e).port !== ""),
  isCombinedUrl: zS().default(false),
  streamId: GS(),
  streamPassPhrase: GS()
})
```

| Field | UI | Behaviour |
|---|---|---|
| `displayName` | "Display Name" — tooltip *"Just for you to easily recognize your channel / It will not show on the stream."* | optional |
| `isCombinedUrl` | switch **"Combined SRT URL"** — tooltip *"Disable to enter SRT URL, SRT Stream ID, and SRT Stream Passphrase separately."* | UI default `true` |
| `url` | placeholder `URL needs to start with srt://` | must be `srt://` **and carry an explicit port** |
| `streamId` | "Stream ID" — tooltip *"Some platforms provide Stream Key for Stream ID."*, placeholder `Paste here (optional)` | merged into URL as `?streamid=` |
| `streamPassPhrase` | "Stream Passphrase" — tooltip *"Passphrase is needed to encrypt your stream."*, placeholder `Paste here (optional)` | merged into URL as `?passphrase=` |

**[O]** On submit, when *not* combined, the form writes `streamid` and `passphrase` into the URL
query string; toggling the switch round-trips those params in and out of the URL
(`a.delete("streamid"); a.delete("passphrase")` when re-combining).
Final payload: `{ displayName, userName: displayName, url }`.

### 3.3 Custom WHIP (`CUSTOM_WHIP`, id 81, BETA) — schema `_Qe` **[O]**

```js
aN({ displayName: GS(),
     streamKey: GS().required("URL is required")
       .matches(/^https?:\/\//,"URL needs to start with http(s)://")
       .test("valid-whip-url","Please enter a valid WHIP URL",
             e => ["http:","https:"].includes(new URL(e).protocol)) })
```
Single field labelled **"URL"** (placeholder `URL needs to start with http(s)://`) — the WHIP endpoint
is stored in the channel's `streamKey`; the connect step remaps it:
`onSubmit:({streamKey,...t})=>onSubmit({...t,key:streamKey})` **[O]**.

### 3.4 Custom HLS (`CUSTOM_HLS`, id 82) — schema `HQe` **[O]**

Identical shape to WHIP: `displayName` + `streamKey`, required, `^https?:\/\/`,
error `"Please enter a valid hls URL"`. Same `streamKey → key` remap.
Gated behind `customHlsChannelAvailable`; upgrade flow targets plans `BUSINESS, ENTERPRISE`
with `hideLowerPlans:true` and feature `rO.CUSTOM_HLS_CHANNEL` **[O]**.

### 3.5 Embed Player (`EMBED_PLAYER`, id 83)

**[O]** Connect form `l$e` collects only `displayName` (schema `s$e = aN({displayName: GS()})`).
Settings decoder:
```js
embedPlayerSettingsDecoder = {
  settings: { showRestreamLogo: boolean, showViewersCounter: boolean,
              sizeMode: string, size: {width,height}|null, brandColor: string },
  thumbnailUrl: string|null,
  allowEvents?: boolean }
embedPlayerTokenDecoder = { token: string }
```
Player URL builder `tZe` appends `?token=…`, `brng=0` (hide Restream logo), `vwrs=1` (viewer counter),
`offline=0` / `offlineText=…`; offline text sanitised by `eZe = e => e.replace(/[<>]/g,"").slice(0,50)` **[O]**.
Limit copy **[O]**: *"You can stream to up to 2 embed players at a time. Need more?"*, *"Unlock more embeds"*.
Steps `EMBED_PLAYER_SETTINGS`, `EMBED_PLAYER_IMAGE_CROP`.

### 3.6 How the RTMP URL is reassembled for display

**[O]** Three composers exist in `restream.887ca3d5bcd09a3a.js`:

```js
// sGe — appinstance appended as a query string
`${protocol}://${rtmpUrl}${rtmpPort?":"+rtmpPort:""}${rtmpApplication?"/"+rtmpApplication:""}${rtmpAppinstance?"?"+rtmpAppinstance:""}`

// lGe — appinstance appended as a path segment (default in Channel Settings)
`${protocol}://${rtmpUrl}${rtmpPort?":"+rtmpPort:""}${rtmpApplication?"/"+rtmpApplication:""}${rtmpAppinstance?"/"+rtmpAppinstance:""}`

// Kick variant — port "0" is rewritten to 443
`${protocol}://${rtmpUrl}${rtmpPort?":"+(rtmpPort==="0"?"443":rtmpPort):""}${rtmpApplication?"/"+rtmpApplication:""}${rtmpAppinstance?"/"+rtmpAppinstance:""}`
```

**[O]** LinkedIn target key derivation:
```js
TSe = e => e.linkedinProfile && e.channel.rtmpAppinstance === e.linkedinProfile.id
        ? `profile_${e.linkedinProfile.id}` : `organization_${e.channel.rtmpAppinstance}`
```

### 3.7 Ingest server selection ("Custom ingest")

**[O]** `IngestSelect` (`BGe`), fed by `GET v2/public/ingests`:
`ingestDecoder = { id: number, name: string, icon: string, url: string, hostname: string }`.
A synthetic `{ id: 0, name: "Disabled" }` entry is prepended when `withDisabledOption`.
Item id `20` renders without a flag icon **[O]**.
Labels: `modal_edit_custom_ingest_select_label` (+ `_tooltip`).
User record carries `selectedIngestId: number` and `isProxyAvailable: boolean`;
channel-edit posts `ingest` in the settings payload; per-channel override endpoint
`v2/api/channels/{id}/ingest` **[O]**.
`accountSettingsDecoder = { rtmpsEnabled: boolean }` **[O]**.
Channel-level proxy: `supportedProxy: boolean` on `channelDecoder`, UI step `ChannelProxyStep` **[O]**.

---

## 4. The channels / destinations / events model

### 4.1 Five distinct objects

| Object | Scope | Where it lives |
|---|---|---|
| **Channel** | account-level connected platform account (persistent) | `v2/api/channels`, `channelDecoder` |
| **Event** | one broadcast (instant or scheduled) | `/events`, `eventDecoder` |
| **Event destination** | a channel bound to one event, with per-event overrides | `/events/{id}/destinations`, `eventDestinationDecoder` |
| **Destination template** | per-channel default payload reused across events | `/events/{id}/destinations-templates` |
| **Child event destination** | destination on a guest/child (paired) event | `childEventDestinationDecoder` |

Locale page title **[O]**: `channel_page_title = "Destinations"`.

### 4.2 `channelDecoder` — account-level channel **[O]**

Required (`channelRequiredFieldsDecoder`):
```
channelIdentifier: string      createdAt: number            deletedAt: number
descriptionLimit: number|null  displayName: string          enabled: boolean
eventIdentifier: string        hasSettings: boolean         id: number
isAddedViaApi: boolean         streamingPlatformId: number  streamingPlatformName: string
supported: boolean             supportedCategory: boolean   supportedDescription: boolean
supportedGame: boolean         supportedProxy: boolean      title: string
titleLimit: number|null        transcodingEnabled: boolean  updatedAt: number
userId: number                 viewersCountSupported: boolean
```
Optional (`channelOptionalFieldsDecoder`):
```
parentId: number|null   icon: string|null   isRecentlyAdded: boolean|null
privacy: string|null    targetType: string|null
ytAuthUser / ytGoogleUserId: string|null
properties: { autorecord?: boolean|null,
              isCreatedForKids?: boolean|null,
              rumbleChannelId?: number|null } | null
```

The per-platform capability booleans (`supported`, `supportedCategory`, `supportedDescription`,
`supportedGame`, `supportedProxy`, `viewersCountSupported`) plus `titleLimit` / `descriptionLimit`
are **server-supplied per channel** — the client's hard-coded lists in §4.7 are the Studio-side
mirror of the same knowledge. **[I]**

### 4.3 `channelRequiredDecoder` — the raw RTMP credential record **[O]**

```
id, title, rtmpAppinstance, rtmpApplication, rtmpUsername, rtmpPassword,
rtmpUrl, rtmpPort, protocol, channelIdentifier, ingest, streamKey,
displayName, serviceId, useRtmpAuthorization, autodetectServer,
periscopeSuperHeartsEnabled, isAddedViaApi, channelUrl
```
(all typed `string` in the decoder — the backend serialises them as strings).
Optional: `properties:{vod,autorecord}`, `eventUrl`, `eventIdentifier`, `ytEventsCategory`, `description`.

`channelDataDecoder` adds `service {serviceId,serviceName,serviceUrl}`, `servers[]`, `serverId`, plus:
`abilityChangeProfile`, `facebookProfile`, `facebookPages[]`, `facebookGroups[]`,
`paidFacebookPagesGroups`, `preCreatedEvents[]`, `linkedinProfile`, `linkedinAppliedSetting`,
`linkedinOrganizations[]`, `titleLimit`, `privacyStatusTypes[]`, and
`additionalSettings { isCreatedForKids, rumbleChannelId, channelProps{targetType}, preferredStreamingProtocol }` **[O]**.

### 4.4 `eventDestinationDecoder` — per-event override record **[O]**

```js
{
  id: string, channelId: number, platform: number, status: number,
  eventId: string, createdAt: number,
  meta: {
    coverUrl?, title?, description?, privacy?, categoryId?, categoryName?,
    tierIds?: number[]|null,                     // Patreon
    autoCaptionLanguage?: "en-US"|null,          // LinkedIn
    autorecord?, scheduled?, isCreatedForKids?,  // Dailymotion
    scheduledAssetId?,                           // LinkedIn pre-created asset
    post?: { urn },                              // LinkedIn UGC post
    shareUrl?,
    broadcast?: { id, thumbnailUrl?, scheduledStartTime?, shareUrl?,
                  runAdsOnStream?, adsFrequency?: "LOW"|"MEDIUM"|"HIGH",
                  eligibleForAdsMonetization? },   // YouTube
    liveVideo?: { id, notFound, state },         // Facebook
    isPrecreated?, isHidden?,
    rumbleChannelId?: number|null,
    closedCaptionsEnabled?: boolean|null,        // YouTube
    latencyPreference?: string|null,             // YouTube
    streamingOrientation: "horizontal"|"vertical"|"dual",
    chatAccess: "disabled"|"everyone"|"verifiedAccounts"
               |"followedAccounts"|"subscribers"|null,   // X
    runAdsOnStream?, adsFrequency?: "LOW"|"MEDIUM"|"HIGH"
  },
  externalUrl?, eventUrl?, platformEventIdentifier?, parentId?
}
```

`childEventDestinationDecoder` (guest destinations) **[O]**:
`{ platform, channelId, createdAt, eventId, id, status }` + optional
`{ channelName, channelIcon, channelUrl, externalUrl, title, pairingEnabled, channelProps{addedUsingWorkAccount,privacy,targetType}, streamingOrientation, parentId }`.

### 4.5 Status enums **[O]**

| Enum | Values |
|---|---|
| Event status (`fbu` / `OT`) | `UPCOMING=0, IN_PROGRESS=1, FINISHED=2, MISSED=3, WAITING_FOR_HOST=10` |
| Destination status (`$CO` / `AT`) | `CREATED=0, PRE_PUBLISH=1, IN_PROGRESS=2, FINISHED=3, DRAFTED=4` |
| Event source type (`wSZ` / `MT`) | `LIVE=0, RECORDING=1, FILE=2, DEMO_FILE=3, STUDIO_SCENES=4` |
| Channel live status (`sje`) | `"online" \| "offline" \| "connecting" \| "unable to connect"` |
| Transcoding status (`cje`) | `ONLINE=0, OFFLINE=1` |
| Missed reason (`bA`) | `user_already_streaming, streaming_is_blocked, can_not_activate_multiple_linkedin, channels_count_too_much, paid_facebook_not_available, custom_rtmp_not_available, custom_srt_not_available, not_started_in_time, event_expired, bad_status, max_video_uploads_exceeded` |

Status-chip locale strings **[O]**: `channel_status_online="Online"`, `channel_status_offline="Offline"`,
`channel_status_connecting="Sending data..."`, `channel_status_error="Unable to connect"`,
`channel_status_warning="Warning"`, `channel_status_unknown="Unknown"`,
`channel_status_not_supported="Statuses are not supported for this platform"`.
Transcoding chips: `channel_transcode_enabled/disabled/error/initial/live`
(`"Transcoding enabled" / "Transcoding disabled" / "Transcoding error" / "Transcoding" / "Transcoding live"`).

### 4.6 Enable / disable, ordering, removal

| Action | Endpoint | Notes |
|---|---|---|
| Activate one channel | `POST v2/api/channel/activate_channel` | **[O]** |
| Deactivate one channel | `POST v2/api/channel/deactivate_channel` | **[O]** |
| Activate all | `POST v2/api/channel/activate_all_channels` | drives `channel_toggle_all = "Toggle all"` **[O]** |
| Deactivate all | `POST v2/api/channel/deactivate_all_channels` | **[O]** |
| Reorder | `POST v2/api/channels/order` · `channels/order` | order mirrored in `event.meta.channelsOrdered: number[]` **[O]** |
| Per-event enable/disable | `POST /events/{eventId}/channels/{channelId}/enable` / `/disable` | **[O]** |
| Paired (guest) destination toggle | `POST /pairs/events/{eventId}/destinations/{destId}/enable` / `/disable` | **[O]** |
| Validate selection before go-live | `POST /events/{eventId}/channels-validate` body `{channel_ids:[…]}` | **[O]** |
| Per-destination orientation | `POST /pairs/events/{eventId}/destinations/{destId}/streaming-orientation` | **[O]** |
| Remove channel | `DELETE v2/api/channel/delete/{id}` — blocked by `channels/{id}/not-finished-events` | `channel_settings_delete_button = "Remove Channel"` **[O]** |

Optimistic UI **[O]**: `toggleChannel` mutation patches `enabled` in the cached channel list via
`onMutate` and invalidates on error. Analytics triggers: `destination_toggle`,
`destination_toggle_all_trigger`, `toggle_all_channels_trigger`, `channel_item_toggle_trigger`,
`destination_state_switch_trigger`.

**[O]** `ActivateChannelError` cause enum `Co`:
`LIMIT_EXCEED=0, CUSTOM_RTMP=1, PAID_FACEBOOK=2, LINKEDIN=3, EMBED_PLAYER=4, SLACK=5`,
mapped from server error strings `channels_count_too_much`, `custom_rtmp_not_available`,
`paid_facebook_not_available`, `can_not_activate_multiple_linkedin`, `embed_player_not_available`,
`slack_not_available`.

Upgrade-popover copy **[O]**: *"Too many channels"*, *"LinkedIn limit"*, *"Paid destination"*,
*"Unlock more embeds"*, *"Your trial has ended"*,
`modal_another_linkedin_channel_disabled_title = "You can't add another LinkedIn channel!"`,
`modal_another_linkedin_channel_disabled_content = "Unfortunately, LinkedIn doesn't allow streaming to multiple LinkedIn destinations at once."`,
`modal_custom_rtmp_payment_no_more_slots = "You are using all your available Extra destinations. If you need more, please upgrade your subscription."`,
`error_channel_custom_rtmp_limit = "You have reached the limit of Extra destinations."`,
`error_channel_double_limit = "You have reached the limit of paid extra destinations."`,
`golive_status_connecting_no_channels = "⚠️Ready to stream? Toggle on at least one channel and try again."`

### 4.7 Per-destination override capability matrix

Derived from named predicate lists in `restream.887ca3d5bcd09a3a.js` **[O]**; the meaning of each
list was confirmed at its call sites.

| Capability | Predicate | Platforms |
|---|---|---|
| **Title editable per destination** | `eMe` / `$Ee` | DAILYMOTION, DLIVE, FACEBOOK, GOODGAME, LINKEDIN, PERISCOPE, PICARTO, TWITCH, YOUTUBE, TWITTER, SLACK, TIKTOK, TROVO, KICK, RUMBLE, PATREON (16) |
| **Description editable per destination** | `iMe` / `nMe` | DAILYMOTION, DLIVE, FACEBOOK, LINKEDIN, YOUTUBE, SLACK, RUMBLE, PATREON (8) |
| **Cover / thumbnail upload** | `cMe` / `lMe` | FACEBOOK, YOUTUBE, LINKEDIN, SLACK (4) |
| **Child-event (guest) cover upload** | `uMe` | FACEBOOK, YOUTUBE, SLACK (3) |
| **Stream details locked once live** | `!oMe` / `aMe` | PATREON, TWITTER, LINKEDIN, INSTAGRAM (4) |
| **Channel settings editable via API** | `Obe` / `jbe` | DLIVE, FACEBOOK, PICARTO, TWITCH, YOUTUBE, TROVO, DAILYMOTION, SLACK, TIKTOK, RUMBLE, KICK, LINKEDIN, PATREON, TWITTER (14) |
| **Live viewer count shown on the row** | `vbe` | YOUTUBE, TWITCH, TWITTER, PICARTO, MOBCRUSH, GOODGAME, FC2, FACEBOOK, DLIVE, PERISCOPE, KICK (11) |
| **Defaults to portrait/vertical** | `Tbe` / `Vbe` | TIKTOK, INSTAGRAM (2) |
| **Dedicated payload form (not the generic one)** | `opt` | TIKTOK, RUMBLE, TWITCH, DLIVE, KICK (5) |
| **Pre-created platform event can be bound** | `qe` | YOUTUBE, LINKEDIN, FACEBOOK (3) |
| **"View event" external link shown** | inline list | YOUTUBE, LINKEDIN (2) |
| **Title must be set on the platform itself** | `qSe` | INSTAGRAM → *"Go to Instagram to edit title."*, KICK → *"Set the stream title directly in your Kick channel."*, TIKTOK → *"Set the stream title directly in your Tiktok Live Room."*, FACEBOOK group → *"Set the title directly in your Facebook Group."*, default → *"Set your title directly on the streaming platform."* |

**[O]** Facebook **groups** are excluded from title/description editing:
`tMe = e => e.streamingPlatformId===FACEBOOK && "group"===e.targetType`, and
`rMe` / `nMe` are `!tMe(e) && eMe/iMe(...)`.

**[O]** `WSe` — destinations that always require a warning/confirmation before enabling:
`(TIKTOK && flag) || INSTAGRAM || KICK || RUMBLE || (flag && platform !== CUSTOM_RTMP)`.

### 4.8 Per-destination payload built for the API (`qFe`) **[O]**

| Platform | Payload keys |
|---|---|
| `FACEBOOK` | `title, description(trimmed), streamingOrientation` |
| `YOUTUBE` | `title, description, privacy(default "public"), categoryId, broadcastId, closedCaptionsEnabled, latencyPreference, streamingOrientation, runAdsOnStream, adsFrequency` |
| `LINKEDIN` | `title, description, enableAutoCaptions, scheduled:true, streamingOrientation` |
| `DAILYMOTION` | `title, description, autorecord, isCreatedForKids, categoryId, categoryName, streamingOrientation` |
| `SLACK` | `title, description, streamingOrientation` |
| `DLIVE` | `title, description, categoryId, categoryName, streamingOrientation` |
| `PATREON` | `title, description, tierIds[], streamingOrientation` |
| `TROVO` / `PERISCOPE` / `PICARTO` / `GOODGAME` / `TWITCH` | `title, categoryId, categoryName, streamingOrientation` |
| `TWITTER` (X) | `title, categoryId, categoryName, streamingOrientation, chatAccess` |
| `TIKTOK` | `title, categoryId, categoryName, streamingOrientation` |
| `RUMBLE` | `title, description, rumbleChannelId, streamingOrientation` |
| `KICK` | `title, categoryId, categoryName, streamingOrientation` |
| `INSTAGRAM` | `streamingOrientation` only |
| `EMBED_PLAYER` | `title, streamingOrientation` |
| default | `streamingOrientation` only |

**[O]** Channel-settings save payload (`ChannelSettingsModal`):
```js
{ serviceId, serverId, ingest, channel_page_url, key, rtmp_username, rtmp_password, display_name }
```
plus per-platform extras (`url`, `userName`, `dailymotion_autorecord`, `dailymotion_isCreatedForKids`).

**[O]** Clips/social share payloads (`platformFieldsDecoder`, a discriminated union on `platformId`):
```js
YOUTUBE   { title, privacy, description }
TIKTOK    { title, disableDuet, disableStitch, disableComment, privacyLevel }
FACEBOOK  { description }
INSTAGRAM { title }
LINKEDIN  { description, visibility? }
TWITTER   { title }
RUMBLE    { title, description, visibility, rumbleChannelId? }
```

### 4.9 Per-platform title / description length limits

Two parallel schema sets exist: `CFe(platform)` for **channel titles** and `_Fe(platform)` for
**event-destination payloads** **[O]**. Limits are byte-length
(`new TextEncoder().encode(x).length`) unless noted as character count.

| Platform | Title limit | Description limit | Extra rules |
|---|---|---|---|
| `FACEBOOK` | 255 bytes (event form also caps 140 chars) | 9 950 bytes | description **required**: *"A description is now required on this platform"* |
| `TWITCH` | 140 bytes, trimmed, required | — | — |
| `YOUTUBE` | 100 characters (`Array.from().length`), required | 4 950 bytes | title & description reject `<` and `>` |
| `LINKEDIN` | 75 chars, required | 950 bytes | — |
| `PERISCOPE` | 256 chars, required | — | — |
| `PICARTO` | 60 bytes | — | — |
| `GOODGAME` | 1 000 bytes | — | — |
| `DLIVE` | 1 000 bytes | 5 000 bytes | — |
| `PATREON` | 1 000 bytes, required | 5 000 bytes (channel) / required (event) | event form requires `tierIds.min(1)` — *"Please select at least one tier"* |
| `DAILYMOTION` | 255 chars, required | 5 000 chars, required | — |
| `TWITTER` (X) | 256 chars — optional on channel, required on event | — | — |
| `AFREECA_TV` (SOOP) | 75 chars | — | — |
| `SLACK` | 4 000 bytes | 4 000 bytes | event title required |
| `TIKTOK` | 256 chars, required | — | — |
| `KICK` | 249 bytes, required (event: only when `isAddedViaApi`) | — | — |
| `TROVO` | 1 000 bytes (event form) | — | — |
| Restream event itself | 1 000 chars, trimmed, required | 10 000 chars | plus `scheduled`, `scheduledFor`, `loopsCount` |
| any other | no schema (`NFe` / `FFe` = empty object) | — | — |

Error strings **[O]**: `"Please add a stream title"`, `"Please limit your title to ${max} characters"`,
`"Please limit your description to ${max} characters"`, `"The text entered exceeds the maximum length"`,
`"The event title exceeds the maximum length"`, `"The event description exceeds the maximum length"`,
`"A title contains invalid characters '<' or '>'"`, `"Please name your Live Event."`,
`titles_title_not_supported = "Title changes are not supported for "`.

Bulk title update **[O]**: `ChannelsTitlesModal` → `POST v2/api/titles/update_channel_info`,
button `titles_form_button_submit = "Update All"`; failure modes
`titles_error_channel_not_found_message_text = "This channel was added manually. Reconnect it with the API."`,
`titles_error_unauthorized_message_text = "Connection expired. Remove channel from Dashboard and add it again."`

### 4.10 Privacy / visibility / audience options

| Platform | Field | Values **[O]** |
|---|---|---|
| YouTube | `privacy` | `"public"`, `"private"`, `"unlisted"` (default `public`); server can also supply `privacyStatusTypes[]` per channel |
| YouTube | `latencyPreference` (`xXe`/`wXe`) | `"normal"`→Normal, `"low"`→Low, `"ultraLow"`→Ultra Low. Choosing non-`normal` force-clears `closedCaptionsEnabled` |
| YouTube | `closedCaptionsType` | derived: `closedCaptionsEnabled = (closedCaptionsType === "closedCaptionsEmbedded")` |
| YouTube | `adsFrequency` (`SXe`/`NXe`/`CXe`) | `"LOW"`=Conservative *(fewer ads)*, `"MEDIUM"`=Balanced, `"HIGH"`=Aggressive *(more ads)*; gated by `eligibleForAdsMonetization` |
| YouTube | `categoryId` | fixed 32-entry list (§4.11) |
| X / Twitter | `chatAccess` (`vXe`) | `disabled`, `everyone` → "Everyone", `verifiedAccounts` → "Verified accounts", `followedAccounts` → "Accounts I follow on X", `subscribers` → "My subscribers"; default `everyone` |
| LinkedIn | target | `Personal profile` / `Organization: %s`; `enableAutoCaptions`; `autoCaptionLanguage:"en-US"`; audience targeting by `Location` (`linkedinLocationDecoder {entity, displayName}`), audience size `"%s people"` / "Calculating..." / "Unknown" |
| LinkedIn | privacy switch | `channel_edit_linkedIn_switcher_info = "If your event is private on LinkedIn, set the switch to - private"` |
| Facebook | target | `Personal profile` / `Public page: %s` / `Group: %s` — pages & groups are a paid feature (`modal_edit_channel_paid_facebook_feature`) |
| Dailymotion | toggles | "Automatically record live event" (`autorecord`), "Is your content created for kids?" (`isCreatedForKids`) |
| Periscope | toggle | `Enable "Super Hearts"` (`periscopeSuperHeartsEnabled`) |
| OK.ru (legacy locale only) | toggle | "Save past broadcasts" (`vod`) |
| TikTok (clips share) | `privacyLevel`, `disableDuet`, `disableStitch`, `disableComment` | `tiktokDecoder` |
| Rumble (clips share) | `visibility`, `rumbleChannelId` | `rumbleDecoder` |
| LinkedIn (clips share) | `visibility` | `linkedinDecoder` |
| Patreon | `tierIds: number[]` | `patreonLiveAccessRuleDecoder = { ruleId, ruleType, tierTitle?, tierDescription?, tierAmountCents? }`, response adds `currency` |

### 4.11 YouTube category list (`bXe`) **[O]**

`1 Film & Animation · 2 Autos & Vehicles · 10 Music · 15 Pets & Animals · 17 Sports ·
18 Short Movies · 19 Travel & Events · 20 Gaming · 21 Videoblogging · 22 People & Blogs ·
23 Comedy · 24 Entertainment · 25 News & Politics · 26 Howto & Style · 27 Education ·
28 Science & Technology · 29 Nonprofits & Activism · 30 Movies · 31 Anime/Animation ·
32 Action/Adventure · 33 Classics · 34 Comedy · 35 Documentary · 36 Drama · 37 Family ·
38 Foreign · 39 Horror · 40 Sci-Fi/Fantasy · 41 Thriller · 42 Shorts · 43 Shows · 44 Trailers`

Game / category lookup is server-side: `platform-games` and `multiplatform-games`
(`platformGameDecoder = {id,name}`, `multiplatformGameDecoder = {name, platforms: Record<string,string>}`) **[O]**.
Stale locale note **[O]**:
`titles_games_tooltip_description = "Currently available only for popular games on Twitch, Facebook, Mixer, Smashcast, GoodGame, and VK."`
(mentions three retired platforms).

---

## 5. Scheduling and events

### 5.1 Event record (`eventDecoder`) **[O]**

```
id, userId, status, sourceType, createdAt, editedAt, title,
startedAt: number|null, finishedAt: number|null, scheduledFor: number|null,
studioJoinToken, webinarViewerJoinToken: string|null,
meta: { description, coverUrl,
        isStudioStream?, isStudioInstantStream?, isInstantStream?, isWebinarMode?,
        webinarLiveCallInEnabled?, isPairsEnabled?, scheduled?, missedReason?,
        loopsCount?, liveClipsEnabled?, isDefaultTitle?, isIsolatedStudioSettings?,
        scenePreview?, channelsOrdered?: number[], streamingCategoryId?,
        totalDurationSec?, fallbackVideo?: {id, duration, enabled} }
optional: showId, destinations[], destinationsTemplates[], source, parentId,
          userData{name}, embedChatToken, childEvents[], childIds[],
          recordingSuids[], parent{id,title,scheduledFor,userData,meta{coverUrl}}
```
`eventSourceDecoder = { recordingSuid?, fileId?, demoFileId?, uploadId?, playlistFileIds? }` **[O]**.
The sentinel event id `"instant"` (and `"rtmp-instant-event"`) marks the un-persisted instant stream **[O]**.

### 5.2 Scheduling constraints **[O]**

| Rule | Literal |
|---|---|
| Restream event window | `IFe = YS().when("scheduled",{is:true, then: e => e.min(addHours(now,1), VFe).max(addDays(now,7), VFe)})` |
| Message | `"The event should be scheduled no sooner than 1 hour and up to 7 days from now."` |
| LinkedIn | `"LinkedIn Live video must be scheduled for at least 1 hour to 7 days from now.\nPlease edit the start time"`; short form `"Scheduled time should be within 1 hour and 7 days from now."` |
| LinkedIn go-live window | `platform_settings_linkedin_notice = "This LinkedIn event is scheduled for %s."` + `platform_settings_linkedin_notice_part2 = "You can go live 15 min early & up to 2 hours after scheduled time."` |
| Start-soon threshold | `oZe`: status `UPCOMING` and `0 < secondsUntilStart < 300` |
| Auto-nudge past times | `AMe`: if `scheduledFor <= now`, round up to `now + 15 s` (minute granularity) |
| Reschedule detection | `dMe = (e,t) => !!e.scheduledFor && e.status !== IN_PROGRESS && e.scheduledFor !== t.scheduledFor` |

**[O] No recurrence support.** Grepping every bundle for `recurrence`, `RRULE`, `repeat`, `weekly`,
`daily`, `cron` yields only unrelated AWS-SDK hits. Scheduled events are **single-shot**; there is no
series/recurrence model in the client.

### 5.3 Timezone handling **[O]**

`EventModalDatetime` (`Plt`) resolves the timezone entirely client-side:

```js
const u = useMemo(() => {
  const e = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return "Europe/Kiev" === e ? "Europe/Kyiv" : e;
}, []);
```
The IANA zone string is rendered as the label above the time input. Times are persisted as
**epoch milliseconds** (`scheduledFor: number`) — there is no per-event timezone field.
Time picker granularity `Olt.MIN_15` (15-minute steps). Date-picker `onChange` copies the existing
hours/minutes onto the newly picked day and falls back to midnight when invalid **[O]**.
Channel-row display format: `"MMM d・h:mm a "` (note the ideographic separator `・`) **[O]**.

### 5.4 Overlap / concurrency detection **[O]**

```js
checkOverlapDecoder             = { overlapsCount: number, overlappingEvents: Event[] }
checkDestinationsOverlapDecoder = { overlappingDestinations: EventDestination[] }
```
Endpoint `POST /destinations/check-overlap`; UI component `ConcurrentEventsCallout`;
paid-feature flags `allowedStreamInstantAndEventsSimultaneously`, `maxConcurrentEventsStreams`.
Blocking error `user_already_streaming`; dialog `AlreadyStreamingPopover`.

### 5.5 Pre-created platform events (`preCreatedEventDecoder`) **[O]**

```
required: id, title, description, category, state, privacyStatus, scheduledAt, icon, ugcPostUrn
optional: ugcPostUrn, scheduledStartTime, latencyPreference, closedCaptionsType,
          runAdsOnStream, adsFrequency: "LOW"|"MEDIUM"|"HIGH", eligibleForAdsMonetization
```
Used to bind an existing YouTube broadcast or LinkedIn scheduled live video to a Restream event.
Locale **[O]**: `modal_edit_channel_scheduled_event_scheduled_live_video_select_label = "Scheduled live videos"`,
`modal_edit_channel_scheduled_event_scheduled_live_video_create_btn = "+ Schedule a new live video"`,
`modal_edit_channel_create_linkedin_live_video_button = "Schedule a Live Video"`,
`modal_edit_channel_select_event = "Event"`, `modal_edit_channel_select_new_event = "Create new"`,
`channel_settings_youtube_online_warning = "You can't edit YouTube stream settings during a livestream."`

YouTube broadcast de-duplication **[O]**: the picker filters out `broadcast.id` values already used by
another destination on the same event, and appends the currently-selected broadcast if the API omits it.

**[O]** External event-URL builder `BSe`:
```
FACEBOOK  → https://www.facebook.com/events/{meta.eventId}
            or https://www.facebook.com{meta.liveVideo.permalinkUrl}
YOUTUBE   → https://www.youtube.com/watch?v={meta.broadcast.id}
LINKEDIN  → https://www.linkedin.com/feed/update/{meta.post.urn}
SLACK     → {meta.postUrl}
default   → meta.shareUrl ?? meta.broadcast.shareUrl
```

---

## 6. Stream-key handling and validation regexes

**[O]** Shared validator factory `A$e(t, fields)` in `restream.887ca3d5bcd09a3a.js`:

| Field | Rule | Error key |
|---|---|---|
| `url` | must **not** match `/^https?:\/\//` | `error_channel_url_instead_of_rtmp_url` |
| `url` | must match `/^rtmps?:\/\//` | `error_channel_rtmp_incorrect` |
| `channelPageUrl` | must **not** match `/^rtmps?:\/\//` | `error_channel_rtmp_instead_of_channel_page_url` |
| `channelPageUrl` | must match `/^https?:\/\//` | `error_channel_url_incorrect` |
| `telegram` | `/^(rtmps?):\/\/([a-z0-9_-]+(?:\.rtmp\.t\.me\|\.telesco\.pe))(:(\d+))?(?:\/([a-z0-9A-Z]+)(?:\/([a-z0-9A-Z]+))?)?\/?$/` | `telegram_rtmp_error` |
| `tiktok` | `/^(rtmps?):\/\/(.*\.(?:.*[tiktok].*)\.com)(?::(\d+))?(?:\/(.+)\/?)?$/` | `tiktok_rtmp_error` |
| `instagram` | `/^(rtmps?):\/\/((.+\.)?instagram.com)(:(\d+))?\/?(\w+)?\/?/` **or** `/^(rtmps?):\/\/((.+\.)?fbcdn.net)(:(\d+))?\/?(\w+)?\/?/` | `instagram_rtmp_error` |
| `key` | free string | — |
| `keyRequired` | non-empty | `"Invalid stream key"` |
| `username` | free string | — |

Platform-specific validators **[O]**:

| Platform | Regex | Message |
|---|---|---|
| Kick RTMP URL (`sQe`) | `/^(rtmps?):\/\/([0-9a-zA-Z.\-_]+\.global-contribute.live-video.net)(:\d+)?$/` | `kick_rtmp_error` |
| Kick channel URL (`lQe`) | `/^https:\/\/kick\.com\/[a-zA-Z0-9_-]+$\|^$/` | `kick_username_error` |
| Kick slug extractor | `/^(?:https?:\/\/)?(?:www\.)?kick\.com\/([^/]+)$/` | — |
| Rumble channel URL | `/^https:\/\/rumble\.com\/c\/[a-zA-Z0-9]+$/` | `"Invalid Rumble channel URL entered"` |
| Instagram username (`_Ge`) | `/^[a-zA-Z0-9._]{1,30}$/` (or empty) | `"Please, enter correct username"` |
| SRT URL | `/^srt:\/\//` + `new URL(u).protocol === "srt:"` + `port !== ""` | `"Please enter a valid SRT URL"` / `"Port number is required"` |
| WHIP URL | `/^https?:\/\//` + protocol check | `"Please enter a valid WHIP URL"` |
| HLS URL | `/^https?:\/\//` + protocol check | `"Please enter a valid hls URL"` |
| Generic URL parseability (`aQe`) | `try { new URL(e) } catch { return false }` | — |

**[O]** Server-side key rejection surfaces as `ChannelSettingsSaveWrongKeyError` →
`modal_edit_channel_error_wrong_key_message = "Invalid stream key"`, plus
`ChannelAddInvalidKeyError` → `error_channel_wrong_key = "Invalid stream key"`,
`ChannelAddInvalidUrlError` → `error_channel_no_url = "Invalid channel URL"`,
`ChannelIllegalServiceError` → *"Forbidden url. Maybe a typo?"*,
`ChannelAddParseUrlError` → `error_parse_url = "Invalid RTMP URL or stream key"`,
`error_channel_rtmp_instead_of_key = "You should enter your stream key in this field, not the RTMP URL."`

**[O]** Keys are never rendered in a plain text field in the settings modal: the stream-key input uses
the masked component `ut.K$` (vs. the plain `ut.pd` used for URLs and display names).
Clipboard affordances: `stream_key_copied = "Stream key copied to clipboard"`,
`game_key_copied = "Game key copied to clipboard"`, `game_title_copied = "Stream title copied to clipboard"`.

**[O]** Encoder-side setup strings (Restream's *own* ingest for OBS/XSplit users):
`streaming_setting_modal_title = "Streaming settings (RTMP)"`,
`streaming_setup = "Streaming software"`,
`streaming_setup_description = "Learn more how to setup OBS, SLOBS, XSplit or your favorite encoder."`,
`account_menu_item_streamkey = "Streaming setup"`.

---

## 7. Bitrate / resolution ladders and per-destination transcoding

### 7.1 Per-channel transcoding (`ChannelTranscodingModal`) **[O]**

`channelTranscodingDecoder`:
```
enabled: boolean, auto: boolean, profile: string, fps: number,
width: number, height: number, videoBitrate: number, audioBitrate: number,
enableRotate: boolean, rotate: number
```

| Control | Values |
|---|---|
| "Enable transcoding for the channel" | boolean; tooltip *"Adjust the quality settings for specific platforms without affecting others."* |
| "Rotate video" | `Off` (rotate 0) · `Left` (rotate **90**) · `Right` (rotate **270**); tooltip *"Ideal for displaying horizontal video as 'full screen' on vertical platforms like Instagram or TikTok."* |
| "Output Settings" | `Default (HD)` → `enableAutoSettings = true` · `Advanced` → manual fields |
| H.264 `profile` (`F5e`) | `"main"`, `"high"`, `"baseline"` |
| `fps` | free numeric input (form default 30) |
| `width` / `height` | free numeric inputs (form default 0 = inherit) |
| `videoBitrate` / `audioBitrate` | free numeric inputs (form default 0 = inherit) |

**[O] There is no fixed resolution/bitrate ladder in the client.** The advanced form accepts arbitrary
integers; the backend validates and returns `ChannelTranscodingEditError.messages` containing any of:
`invalid_audio_bitrate_value`, `invalid_video_bitrate_value`, `invalid_height_value`,
`invalid_width_value`, `invalid_fps_value`.

Endpoints **[O]**: `v2/api/channel/{id}/transcoding`, `…/transcoding/enable`, `…/transcoding/disable`,
`v2/api/channels/{id}/transcoding-settings` (enable/disable is always called **before** the settings PUT).
Metering: `user.transcodingCredits`, `user.isThereAnyInvoiceForTranscoding`; upsell link
`https://app.restream.io/settings/billing?buy-transcoding-hours` with copy
*"You have no transcoding hours left."* / `account_settings_billing_buy_transcoding_title = "Buy transcoding hours"`.

### 7.2 Studio outgoing profile format **[O]**

```js
OutgoingStreamProfileIdIO : /^(\d+)x(\d+)@(\d+)fps\+(\w+)$/
OutgoingStreamProfileIO   : { id, width, height, framerate, meta }
OutgoingStreamOrientation : "LANDSCAPE" | "PORTRAIT"
ProducerEncodingIO        : { active?, maxBitrate?, scaleResolutionDownBy? }
ProducerIdToMaxLayerIO    : Record<string, number>
```
No concrete profile IDs are hard-coded — the ladder is served at runtime. Simulcast layers are
expressed as WebRTC `maxBitrate` + `scaleResolutionDownBy` encodings **[O]**.

Studio quality picker (legacy locale) **[O]**: `golive_quality_low = "Low (slow network)"`,
`golive_quality_medium = "Medium (recommended)"`, `golive_quality_high = "High (not recommended)"`,
`golive_video_resolution_label = "Resolution"`,
`golive_warning_browser_does_not_support_dynamic_quality_change`.

### 7.3 Plan-tier quality caps (marketing table literals) **[O]**

| Feature | Standard | Professional | Business | Enterprise |
|---|---|---|---|---|
| `studioVideoQuality` | HD 720p | Full HD 1080p | Full HD 1080p | "No limits" |
| Recording resolution | — | — | 4K 2160p | "No limits" |
| `backupStream` | — | — | — | Yes |

Related plan-feature enum entries **[O]**: `AUSTIN_PROFESSIONAL_RESOLUTION`,
`AUSTIN_PROFESSIONAL_STUDIO_RESOLUTION`, `AUSTIN_PROFESSIONAL_STREAM_ORIENTATION`,
`AUSTIN_PROFESSIONAL_PULL_LINKS`, `AUSTIN_STANDARD_PAIRS_RTMP`,
`AUSTIN_BUSINESS_STUDIO_RTMP_SOURCE`, `AUSTIN_BUSINESS_CUSTOM_SRT`, `AUSTIN_BUSINESS_CUSTOM_HLS`,
`AUSTIN_BUSINESS_EMBED_PLAYER`, `AUSTIN_ENTERPRISE_STREAM_BACKUP`, `AUSTIN_ENTERPRISE_PULL_LINKS`,
`CD_EXP_BUSINESS_RESOLUTION`, `CD_EXP_BUSINESS_RECORDING_4K`.

### 7.4 Dual output (landscape + portrait to different destinations) **[O]**

- Per-destination `streamingOrientation: "horizontal" | "vertical" | "dual"`.
- Paid gate: `paidFeatures.studioDualOutputAvailable`.
- UI copy: *"Landscape + Portrait"*, *"Via OBS plugin"*, *"… to different channels."*
- OBS vertical plugin downloads, verbatim:
  `https://vertical-plugin.restream.io/obs-vertical-plugin-macos.pkg`
  `https://vertical-plugin.restream.io/obs-vertical-plugin-windows.exe`
- Help link `https://support.restream.io/en/articles/11730141-dual-output`;
  tooltip *"In OBS Settings, set the stream Service to Restream.io."*
- `KBe` computes the orientation set across destinations: `SLACK` is forced `"horizontal"`;
  otherwise `meta.streamingOrientation ?? (Tbe(platform) ? "vertical" : "horizontal")`
  — i.e. TikTok and Instagram default to vertical. `qBe` flags a mixed set (> 1 distinct orientation).
- `DualPreviewDestinations` splits the preview by orientation, treating `"dual"` destinations as
  belonging to both sides.
- Legacy fallback radio group: `Horizontal` / `Vertical (Get OBS plugin: MacOS, Windows)`.
- When `!studioDualOutputAvailable` and a mixed set is detected, the destination is forced to
  `$CO.DRAFTED` and an upgrade/trial popover is shown (`dualOutputPopoverType: "trial" | "upgrade"`).

---

## 8. Chat aggregation

### 8.1 Which platforms' chat is ingested

**[O]** The capability set is **server-driven**, fetched from `GET api/client/platform-features`
(query key `["chat-client/platform-features"]`) and decoded per platform as:

```js
{ id: number, title: string,
  websitePlatformId: number|null, websiteKind: string|null,
  receiveSupported: boolean,   // chat messages are ingested from this platform
  replySupported: boolean,     // Restream can post a reply back
  relaySupported: boolean,     // messages can be relayed onward
  imageUrl: string, altImageUrl: string }
```
Because the array is fetched at runtime, the exact platform set is **UNRESOLVED from static assets
alone** — but the contract above is exact.

**[I]** The client-side list that most closely tracks "chat/API-capable" is `jbe`/`Obe` (§4.7):
DLIVE, FACEBOOK, PICARTO, TWITCH, YOUTUBE, TROVO, DAILYMOTION, SLACK, TIKTOK, RUMBLE, KICK,
LINKEDIN, PATREON, TWITTER. Marked **inferred** — its call sites concern editable settings, not chat.

**[O]** LinkedIn reply capability is explicitly modelled:
`LinkedinMissingScopeReplyChatError` / `linkedin_missing_scope_reply_chat`.
Plan feature: *"Cross-platform chat"* (`crossPlatformChat`), *"chat history export"*
(`chatHistoryExportAvailable`).

### 8.2 Normalised chat message shape

**[O]** From `externals.b634d3e8690cf1f3.js` (decoder `uc`, used by `protected/chat/history`):

```js
// required
userId: number
timestamp: number
authorAnonymized: string
text: string|null
link: string|null
eventTypeId: number|null      // message vs follow / sub / gift / donation taxonomy
eventSourceId: number|null    // which platform produced it
isChatOwner: boolean
isBot: boolean
eventId: string
emotesReplaces: Array<{ name, url,
                        altText?, comboCount?, duration?,
                        hasVisualEffect?, jewelsAmount?, language? }> | null
showId: string|null

// optional
connectionUuid: string|null
channelId: number|null
connectionIdentifier: string|null
eventIdentifier: string|null
connectionIdentifiersRepliesMap: Record<string, Emote> | null
donation: { amount: string, currencyString: string, tier: number } | null
meta: { gift: {...}|null } | null
```

Paged response **[O]**: `{ messages[], nextPageToken, previousPageToken, downloadToken }`
(query params `page_size`, `page_token`, `timestamp`).
Note: `connection_identifiers_replies_map` is deliberately **not** camelised by the generic
`camelizeKeys` pass — the client re-maps it key-by-key so platform connection identifiers survive verbatim.

**[O]** Chat channel descriptors used alongside messages:
`{ channelIdentifier, deletedAt, displayName, id, platformId, parentId? }` and the compact
`{ id, displayName, platformId, isDeleted }`.

**[O]** Chat-embed render props (`restreamchatembedthemes.d79062a9951586dd.js`):
```js
{ author, timestamp, showAvatars, authorAvatarUrl, channelIcon,
  badges: [{ type: "img", content: url }], color, hosted, children }
```
with `p = /^Restream(.io)?$/i` special-casing Restream's own avatar and CSS class
`icon-platform` marking the per-message platform badge. Themes include
`default-rounded`, `8-bit`, `8-bit-compact`, `pubg-1`, `pubg-boxed`, `lol-boxed`, `r6-boxed`,
`overwatch-boxed`, `bo4-boxed`, `ac-odyssey-boxed`, `minecraft-boxed`, `wot-boxed`, `wow-boxed`
(each with a `-compact` variant).

### 8.3 Webinar / virtual-event chat (separate, simpler stream) **[O]**

```js
ReceivedChatMessageIO = { type:"text", createdAt: number, text: string,
                          author: { name: string, avatarUrl: string|null } }
ReceivedErrorMessageIO = { error: string }
connection states      = DISCONNECTED | CONNECTING | CONNECTED
terminal close reasons = event_not_found | event_finished | invalid_path
```
Transport `VIRTUAL_EVENTS_CHAT_URL = wss://virtual-events-chat.restream.io`.

### 8.4 Chat endpoints and hosts **[O]**

| Purpose | Path / host |
|---|---|
| Chat REST API | `CHAT_BACKEND_URL = https://backend.chat.restream.io/api` |
| Chat web app | `CHAT_URL = https://chat.restream.io` |
| Per-platform capabilities | `api/client/platform-features`, `chat-client/platform-features` |
| Batch history tokens | `POST user/events/chat/history` body `{eventIds:[…]}` (chunked 50 per request) |
| Session chat | `analytics/session/chat-messages`, `analytics/chat-history` |
| Shared/public chat | `analytics/shared/chat-messages`, `protected/chat/history`, `protected/chat/messages` |
| Paired (guest) chat | `analytics/pairs/chat-messages` |
| Embedded chat tokens | env `EMBEDDED_CHAT_TOKEN`, `GUEST_EMBEDDED_CHAT_TOKEN`, `EMBEDDED_CHAT_GET_TOKEN_MAX_ATTEMPTS: "10"` |

**[O]** Studio chat UI surfaces (recovered SCSS paths, deduplicated across chunk-hash folders):
`scripts/modules/Chat/components/{ChatMessage, ChatTabs, HostChat, PinnedMessagesButton,
PinnedMessagesList, ShownMessagesList, ToggleIcon, ChatMessagesComingSoonBanner}`,
`scripts/entries/Overlay/StreamOverlay/ChatOverlay/{ChatOverlay, ChatOverlayControls, ChatOverlayToolbar}`,
`scripts/modules/ChatOverlayCustomization/components/{ChatOverlayPreview, ChatOverlaySelect}`,
`scripts/modules/PrivateChat/*`, `scripts/modules/PrivateChatV2`,
`scripts/modules/VirtualEventsChat/components/{GuestVirtualEventsChat, HostVirtualEventsChat}`,
`scripts/modules/Sidebar/components/GuestChat`,
`scripts/modules/Webinar/components/WebinarViewerChatInput`,
`scripts/components/Chat/{Bubble, Message, MessageScroller}`, `scripts/components/ChatText`.

Overlay/chat state keys observed in the bundles **[O]**: `overlayChat`, `shouldShowOverlayChat`,
`showChatOverlayPreview`, `chatOverlayHighlightField`, `shouldShowChatFilters`,
`shouldEnableChatHistory`, `shouldEnableChatOverlayCustomization`, `onChatIncomingMessage`,
`onRequestChatHistory`, `setChatCaption` / `onSelectChatCaption` / `onDeselectChatCaption`,
`hasUnreadChatMessages`, `hasUnreadPrivateChatMessages`, `shouldPushProductLinksToChat`,
`chatTokenStore`, `hostRoomPrivateChatStore`, `virtualEventsChatStore`.
Wire types: `OverlayChatIO`, `OverlayChatLayoutIO`, `ChatCaptionIO`, `ChatCaptionBodyIO`,
`PrivateChatMessageIdIO`, `PrivateChatMessagePayloadIO`, `PrivateChatMessageActorIO`,
`StartPrivateChatTyping`, `PrivateChatTypingUpdated`.

---

## 9. Analytics surfaced per destination

### 9.1 Live, in-Studio **[O]**

| Metric | Source |
|---|---|
| Live viewers per channel | `ChannelViewers` (`Bje`), gated by `vbe.includes(streamingPlatformId)` **and** `channel.viewersCountSupported`. Hover popover renders a per-channel breakdown with platform icons |
| Aggregate viewers + chatters | `streamAnalyticsDecoder = { channels[], viewers:{value,previous,change}, chatters:{value,previous,change} }` |
| Channel status dot | `sje` — online / offline / connecting / unable to connect |
| Transcoding indicator | `cje` — ONLINE/OFFLINE badge on the channel row |
| Live status feed | `STREAMING_STATUSES_URL = wss://streaming-statuses.restream.io` (`SHOULD_ENABLE_STREAMING_STATUSES: "true"`); `statusServerDataDecoder = { token }` |

`streamAnalyticsChannelDecoder = { displayName, id, platform: { icon:{png}, id, name } }` **[O]**.

### 9.2 Post-stream analytics API **[O]**

| Series | Endpoints | Aggregation shape |
|---|---|---|
| Viewers | `analytics/session/viewers`, `analytics/shared/viewers`, `analytics/pairs/viewers`, `protected/streaming/viewers` | per channel `{ viewersPerMinute: number[][], mean, max, peakTime, watchedTime, viewsTotal }` + top-level `{ live, mean, max, viewsTotal, channels[] }` |
| Chat | `analytics/session/chat-messages`, `analytics/shared/chat-messages`, `analytics/pairs/chat-messages`, `protected/chat/messages` | per channel `{ graph: number[][], chattersTotal, messagesTotal }` + `{ live, sum, chattersTotal, channels[] }` |
| Followers | `analytics/session/followers`, `analytics/shared/followers`, `analytics/pairs/followers`, `protected/streaming/followers` | per channel `{ graph: number[][], diff, last, rate }` |
| Outgoing stream health (**per destination**) | `analytics/session/outgoing-stream-statistic`, `analytics/pairs/outgoing-stream-statistic`, `analytics/shared/monitor-outgoing`, `protected/monitor/outgoing` | per channel `{ bitrate, maxBufferedBytes, restarts, successfulPublishStarts, bitrateGraph: number[][], bufferedBytes: number[][] }` |
| Incoming stream health (single source) | `analytics/session/incoming-stream-statistic`, `analytics/shared/monitor-incoming`, `protected/monitor/incoming` | `{ audioCodec, audioFrequency, bitrate, frameDrops, keyframeInterval, streamFps, videoCodec, videoHeight, videoWidth, bitrateAudio[][], bitrateVideo[][], bitrateTotal[][], fps[][] }` |
| Commerce | `commerceAnalyticsDecoder`, `analyticsTotalDecoder` (`scans{unique,items,money{value,text,change}}`) | — |
| Sharing | `analytics/sharing-token`, `analytics/shared/metadata` — auth headers `analytics-token`, `analytics-passcode` | `{ event{title,userId,destinations}, recordings[], channels[], platforms }` |
| AI summary | `v2/api/user/ai-agent/event-analytics` | — |

Monitor UI labels **[O]**: `Bitrate`, `FPS`, `Frame drops`, `Keyframe interval`, `Resolution`,
`Audio codec`, `Audio frequency`, `Video codec`, `Server`, `Started at`, `Duration`,
`Max buffer size`, `Restarts`, `Successful starts`, `Audio Bitrate (Kbps)`, `Video Bitrate (Kbps)`,
`Buffer size (Kbps)`, `Incoming stream`, `Outgoing Stream`, `Platforms`,
`monitor_guest_page_description = "Restream Monitor is a tool that allows you to keep an eye on streams as well as incoming and outgoing data for all of connected platforms."`

Paid gating **[O]**: `analyticsAvailable`, `advancedAnalyticsAvailable`, `analyticsExportAvailable`,
`chatHistoryExportAvailable`. Export copy: *"Soon you'll be able to export stream session data into CSV and PDF."*

### 9.3 Stream history per destination **[O]**

```js
streamHistoryEventDecoder      = { id, status, sourceType, createdAt, scheduledFor,
                                   studioJoinToken, childIds[], meta{…}, source?, parentId?, parent? }
streamHistoryDestinationDecoder= { channelId, platform, title } + partial { id, status, … }
finishedStreamDecoder / lastIncomingStreamDecoder
```

---

## 10. Multistreaming limits and paid-feature flags

**[O]** `userPaidFeaturesDecoder` (`GET v2/api/user/paid-features`) — destination-relevant subset:

| Flag | Type | Meaning |
|---|---|---|
| `destinationsAvailable` | number | base simultaneous destination cap |
| `extraDestinationsAvailable` | number | purchasable extra slots |
| `customRtmpAvailable` | number | Custom RTMP slots |
| `customSrtChannelAvailable` | boolean | Custom SRT allowed |
| `customHlsChannelAvailable` | boolean | Custom HLS allowed |
| `paidFacebookAvailable` | boolean | Facebook page/group streaming |
| `slackStreamingAvailable` | boolean | Slack destination |
| `studioWebinarsAvailable` / `studioMaxWebinarViewers` | bool / number | webinar mode |
| `maxConcurrentEmbedPlayerViewers` | number | Embed Player cap (0 ⇒ upgrade) |
| `disableEmbedPlayerBrandingAvailable` | boolean | Embed Player branding removal |
| `studioDualOutputAvailable` | boolean | landscape + portrait simultaneously |
| `srtProtocolAvailable` | boolean | SRT ingest |
| `proxyAvailable` | boolean | proxy / custom ingest |
| `rtmpPullsAvailable` | number | RTMP pull links |
| `fallbackAvailable` | boolean | fallback video on disconnect |
| `encoderDisconnectProtectionAvailable` (+ `…LimitedAvailable`) | boolean | reconnect protection |
| `hasPairs` | boolean | paired / guest destinations |
| `maxConcurrentEventsStreams` | number | concurrent live events |
| `allowedStreamInstantAndEventsSimultaneously` | boolean | instant + scheduled overlap |
| `doublingAvailable` | number | stream doubling |
| `removeBrandingAvailable`, `channelManagementAvailable`, `customGraphicOverlays` | boolean | — |
| `hasStreamDurationLimit`, `maxPlaylistHoursPerStream` | bool / number | — |

**[O]** `userBillingSummaryDecoder`:
`{ extraDestinations:{paid,used}, paidFacebook:{paid,used}, customRTMP:{paid,used} }`.

**[O]** `userRequiredDecoder` destination-relevant fields: `channelManagementAvailable`,
`transcodingCredits`, `isThereAnyInvoiceForTranscoding`, `isProxyAvailable`, `selectedIngestId`,
`fallbackAvailable`, `rtmpPulls`, `rtmpPullsAvailable`, `customRtmpAvailable`, `hasScenes`,
`role: "owner"|"admin"|"cohost"`, `isWorkspaceUser`, `typePricing: "bundle"|"bundle_austin"`.

---

## 11. Full API surface for destinations

**[O]** Host constants (`Index.312bd7238c465fa2.js`):

```
RESTREAM_WEB_API_HOST      = https://api.restream.io
EVENTS_BACKEND_URL         = https://backend.events.restream.io
STUDIO_BACKEND_URL         = https://studio-backend.restream.io
STUDIO_API_BACKEND_URL     = https://studio-api-backend.restream.io
STUDIO_BACKEND_VIDEO_UPLOADS_URL = https://studio-backend-upload.restream.io
STREAMING_BALANCER_URL     = https://streaming-balancer.restream.io
STREAMING_STATUSES_URL     = wss://streaming-statuses.restream.io
CHAT_BACKEND_URL           = https://backend.chat.restream.io/api
CHAT_URL                   = https://chat.restream.io
VIRTUAL_EVENTS_CHAT_URL    = wss://virtual-events-chat.restream.io
RECORDINGS_URL             = https://streaming-recordings.restream.io
CLIPS_BACKEND_HOST         = https://clips-backend.restream.io
BILLING_BACKEND_URL        = https://billing-backend.restream.io
ORGANIZATIONS_BACKEND_HOST = https://organizations-backend.restream.io
ECOMMERCE_BACKEND_URL      = https://ecommerce-backend.restream.io
VIDEO_STORAGE_BACKEND_URL  = https://video-storage.restream.io
WEBSITE_BACKEND_URL        = https://website-backend.restream.io
RESTREAM_APP_URL           = https://app.restream.io
PUBLIC_URL                 = https://studio.restream.io
WEBSITE_URL                = https://restream.io
LOBBY_URL                  = https://app.restream.io/home
```

### 11.1 Channel endpoints **[O]**

| Method / Path | Purpose |
|---|---|
| `GET v2/api/channels` | list channels |
| `POST v2/api/channel/add` | add channel (manual) |
| `POST v2/api/channel/edit` | save channel settings |
| `GET v2/api/channel/get_data/{id}` | channel data + servers + FB/LI targets |
| `DELETE v2/api/channel/delete/{id}` | remove channel |
| `POST v2/api/channel/activate_channel` / `deactivate_channel` | enable / disable |
| `POST v2/api/channel/activate_all_channels` / `deactivate_all_channels` | toggle all |
| `POST v2/api/channels/order` · `channels/order` | reorder |
| `GET v2/api/channels/{id}/is-able-to-stream` | pre-flight |
| `v2/api/channels/{id}/ingest` | per-channel ingest override |
| `GET v2/api/channels/{id}/connected-instagram-accounts` | Instagram accounts |
| `GET v2/api/channels/{id}/patreon-live-access-rules` | Patreon tiers |
| `v2/api/channels/{id}/targets/{targetId}` | FB page/group, LinkedIn org |
| `GET v2/api/channels/{id}/transcoding-settings` | transcoding |
| `v2/api/channel/{id}/transcoding` · `/enable` · `/disable` | transcoding |
| `v2/api/channel-connect-state/{uuid}` · `/save-added-channel` | OAuth handshake state |
| `GET channels/{id}/not-finished-events` | blocking events before delete |
| `GET v2/api/rumble/user-channels` | Rumble sub-channels |
| `v2/api/titles/channels` · `get_channel_info` · `update_channel_info` | bulk title/game update |
| `POST /user/channels/{id}/autoposting-template` | social autoposting template |
| `GET v2/public/show-channel/{id}` · `v2/public/show-channel-event/{id}` | public show pages |

### 11.2 Event & destination endpoints **[O]**

| Method / Path | Purpose |
|---|---|
| `POST /events/{eventId}/channels-validate` | validate active channel set |
| `POST /events/{eventId}/channels/{channelId}/enable` · `/disable` | per-event toggle |
| `POST /events/{eventId}/channels/{channelId}/validate` | per-channel validate |
| `POST` / `DELETE /events/{eventId}/channels/{channelId}/cover` | cover on channel binding |
| `GET` / `POST /events/{eventId}/destinations` | destination list / create |
| `PATCH /events/{eventId}/destinations/{destId}` | update payload |
| `POST /events/{eventId}/destinations/{destId}/stop` | stop a single destination |
| `POST` / `DELETE /events/{eventId}/destinations/{destId}/cover` | thumbnail |
| `POST /events/{eventId}/destinations/facebook/cover/{channelId}` | FB cover (`Content-type: image/png`) |
| `POST /events/{eventId}/destinations/linkedin/cover/{channelId}` | LinkedIn cover (`Content-type: image/png`) |
| `POST /events/{eventId}/destinations/{destId}/linkedin/disconnect` | unlink LinkedIn asset |
| `GET` / `POST /events/{eventId}/destinations-templates[/{id}]` | per-channel default payload |
| `POST` / `DELETE /events/{eventId}/destinations-templates/cover/{channelId}` | template cover |
| `POST /destinations/check-overlap` | concurrent-destination conflict |
| `POST /pairs/events/{eventId}/destinations/{destId}/enable` · `/disable` | guest destinations |
| `POST /pairs/events/{eventId}/destinations/{destId}/streaming-orientation` | guest orientation |
| `GET v2/public/platforms` | platform catalogue (`platformDecoder {id,name,image{png,svg}}`) |
| `GET v2/public/platforms/{id}/stream-servers` | server list |
| `GET v2/public/ingests` | ingest server list |
| `GET api/client/platform-features` | chat capability matrix |

Cover-upload error mapping **[O]**: `youtube_forbidden` → `YTForbiddenUploadCoverError`,
`youtube_upload_thumbnail_rate_limit_exceeded` → `YTUploadThumbnailRateLimitExceededError`,
`image_decoding_failed` → `ImageDecodingFailedError`, otherwise `DestinationInternalServerError`.
The uploader also logs `invalidCoverReason` and `coverDiagnostics`.

---

## 12. Per-platform error taxonomy

**[O]** Reason codes mapped to typed errors in `externals.b634d3e8690cf1f3.js` /
`restream.887ca3d5bcd09a3a.js`:

| Platform | Reason codes |
|---|---|
| YouTube | `youtube_channel_no_longer_exists`, `youtube_channel_not_in_good_standing`, `youtube_live_permission_blocked`, `youtube_streaming_not_enabled`, `youtube_live_streaming_is_not_enabled`, `youtube_live_streaming_not_enabled`, `youtube_live_streaming_is_on_hold`, `youtube_streaming_on_hold`, `youtube_streaming_pending`, `youtube_account_suspended`, `youtube_authenticated_user_account_suspended`, `youtube_account_closed`, `youtube_no_channel_error`, `youtube_insufficient_scopes`, `youtube_insufficient_live_permissions`, `youtube_channel_empty_events_error`, `youtube_channel_on_hold`, `youtube_invalid_title`, `youtube_invalid_description`, `youtube_invalid_image`, `youtube_invalid_scheduled_start_time`, `youtube_live_broadcast_not_found`, `youtube_live_broadcast_was_removed_from_platform`, `youtube_live_broadcast_binding_not_allowed`, `youtube_live_broadcast_deletion_not_allowed`, `youtube_made_for_kids_modification_not_allowed`, `youtube_modification_not_allowed`, `youtube_not_scheduled_broadcast`, `youtube_media_body_required`, `youtube_rate_limit_exceeded`, `youtube_upload_thumbnail_rate_limit_exceeded`, `youtube_user_broadcasts_exceed_limit`, `youtube_video_not_found`, `youtube_forbidden`, `youtube_unauthorized`, `youtube_bad_request`, `youtube_access_denied`, `youtube_auth_error`, `youtube_permissions_not_accepted`, `youtube_connection_error`, `youtube_is_already_added` |
| Facebook | `FbAppHasNoPermissionToCreateLiveError`, `FbAppNotAuthorizedError`, `FbImpersonationSecurityError`, `FbLinkViolatesStandardsError`, `FbLogicObjectDoesntExistOrPermissionsError`, `FbLoginAndActionsNeededError`, `FbMustBeOnWhitelistError`, `FbNoLivePermissionsError`, `FbNotConfirmedUserError`, `FbPermissionManagePagesToImpersonateError`, `FbPoliciesRecentViolationError`, `FbPostFrequencyError`, `FbRecentCopyrightAudioError`, `FbRecentCopyrightVideoError`, `FbRequiresAdminPermsOrPublishToGroupsError`, `FbScopesManagePublishPagesError`, `FbSecurityChangedError`, `FbSubjectHasNoPermToCreateLiveError` (*"(#200) Subject does not have permission to create live video on this user/page/group"*), `FbUnknownBanError`, `FbUserLogoutOrSystemError`; plus `facebook_channel_empty_pages_error`, `facebook_channel_empty_groups_error`, `facebook_page_deleted`, `facebook_signup_delay`, `facebook_not_eligible_to_go_live_yet`, `facebook_user_account_needs_to_have_established_presence`, `FacebookGroupIsNotSupportedViaAPIError`, `FacebookGroupMissingRequiredScopesError`, `FacebookPageMissingRequiredScopesError`, `FacebookMissingScopePublishVideoError`, `FacebookUserChangedPasswordError`, `paid_facebook_not_available` |
| LinkedIn | `linkedin_streaming_not_enabled`, `linkedin_channel_empty_pages_error`, `linkedin_missing_scope_reply_chat`, `can_not_activate_multiple_linkedin`, `modal_edit_channel_error_linkedin_no_organization_tokens`, `…_no_personal_tokens` |
| Twitch | `twitch_2fa_required`, `twitch_user_input_contains_banned_words` |
| Periscope | `periscope_channel_error`, `periscope_deprecated`, `periscope_streaming_disabled`, `periscope_account_streaming_disabled` |
| TikTok | `tiktok_refresh_token_expired`, `tiktok_unset_channel_identifier`, `tiktok_channel_can_be_added_via_api`, `tiktok_rtmp_error` |
| Kick | `kick_channel_can_be_added_via_api`, `kick_unset_channel_identifier`, `kick_invalid_channel_identifier`, `kick_rtmp_error`, `kick_username_error` |
| Instagram | `instagram_unset_channel_identifier`, `InstagramStreamKeyExpiresSoonError`, `instagram_rtmp_error` |
| Rumble | `rumble_unset_channel_identifier`, `rumble_invalid_channel_identifier`, `RumbleUserHasNoAvailableLiveStreamingSlots`, `RumbleUserDidNotPassVerificationCriteria` |
| X / Twitter | `twitter_channel_not_found`, `xplatform_user_is_not_allowed_to_stream` |
| Slack | `slack_not_available`, `slack_channel_access_revoked` |
| Picarto | `picarto_platform_cant_decrypt_refresh_token` |
| GoodGame | `goodgame_channel_not_found_error`, `error_goodgame_channel_not_found` |
| Dailymotion | `dailymotion_is_created_for_kids_is_not_specified_at_dailymotion_channel_level` |
| Generic | `dlive_shutdown`, `trovo_shutdown`, `unsupported`, `reconnect_required`, `platform_reconnect_required`, `channel_already_added_error`, `destination_exist`, `could_not_start_event_for_channels_set`, `number_of_guest_destinations_exceeded`, `platform_user_upload_limit_exceeded`, `channels_count_too_much`, `custom_rtmp_not_available`, `custom_srt_not_available`, `embed_player_not_available` |

Typed error classes surfaced in the UI **[O]**: `ActivateChannelError`, `ActivateAllChannelsError`,
`PlatformConnectDoubleChannelsError`, `PlatformConnectDoubleRtmpError`,
`PlatformConnectDoubleLinkedinError`, `PlatformConnectQuotaOutError`,
`PlatformConnectCustomRtmpError`, `PlatformConnectHashError`, `ChannelNotAddedViaApiError`,
`ChannelExpiresSoonError`, `ReconnectRequiredError`, `CustomRtmpNotAvailableError`,
`CustomSrtNotAvailableError`, `EmbedPlayerNotAvailableError`, `EmbedPlayerLimitError`,
`SlackNotAvailableError`, `PaidFacebookNotAvailableError`, `ChannelTranscodingError`,
`ChannelTranscodingEditError`, `ChannelInfoError`, `ChannelSettingsSaveInvalidUrlError`,
`ChannelSettingsSaveWrongKeyError`.

---

## 13. UI component inventory (destinations domain)

**[O]** CSS-module names extracted from the bundles (377 total modules; 104 in this domain).

Destination / channel:
`AddDestinationsButton · ChannelAlreadyAddedStep · ChannelApiError · ChannelDropdownMenu ·
ChannelGeneralErrorStep · ChannelIconPlaceholder · ChannelIconWithTitle · ChannelItem ·
ChannelName · ChannelProxyStep · ChannelRemoveModal · ChannelSettingsModal · ChannelSettingsStep ·
ChannelStatus · ChannelTargetsStep · ChannelTitle · ChannelTitleModal · ChannelTranscodingModal ·
ChannelTranscodingStep · ChannelViewers · Channels · ChannelsError · ChannelsList · ChannelsLoader ·
ChannelsPlaceholder · ChannelsTitlesModal · ChannelsToggleAll · ChoiceOfChannelsStep ·
ConnectLinkedinPrecreatedEventStep · ConnectPlatformItem · ConnectPlatformStep ·
ConnectPlatformTileItem · CustomHlsSettings · CustomSrtSettings · CustomWhipSettings ·
DeleteChannelButton · DestinationError · DestinationIssue · DestinationIssueError ·
DestinationIssueErrorButton · DestinationItem · DestinationPayloadStep · DestinationPopover ·
DestinationRow · DestinationTypeSelect · DestinationsError · DestinationsList ·
DestinationsPlaceholder · DestinationsStep · DestinationsStepAddChannelsButton ·
DestinationsSummary · DestinationsSummaryAppendix · DestinationsSummaryPopover ·
EditDestinationsPlaceholder · FinishAddingChannelStep · GamesSelectFormGroup ·
GuestDestinationPayload · IngestSelect · LinkedInEventCalloutDescription · ModalChannelName ·
PairChannelsStepContent · PlatformCard · PlatformConnect · PlatformConnectAbout ·
PlatformConnectForm · PlatformsList · PlatformsStep · RemoveDestinationStep ·
RequestXPlatformLiveStep · RtmpConnect · RtmpSettings · RtmpSettingsModal · ShowChannelLink ·
SkipWaitPlatformsPlaceholder · StreamingDisabledCTA · ViewStreamButton · ViewStreamButtonItem ·
YoutubeStreamingNotEnabled · FormCallout · Separator`

`ConnectButton` per-platform skins **[O]**: `facebook, twitch, youtube, dailymotion, periscope,
linkedin, dlive, trovo, goodgame, picarto, twitter, slack, tiktok, rumble, kick, instagram, patreon`.
`PlatformCard` also carries a dedicated `kick` modifier class.

Event / scheduling:
`AllInProgressEventsStep · ConcurrentEventsCallout · EventCard · EventConfirmationCard · EventFlow ·
EventFlowModal · EventInfoModal · EventItemBadge · EventItemThumbnail · EventModalDatetime ·
EventModalNavigator · EventPayloadStep · EventSourceFormGroup · EventSourceLoader ·
EventSuccessStep · EventTypeItem · EventTypeStep · EventsSelect · LiveEventLink ·
LiveEventsSection · MiniEventCard · PastEventInfoModal · StudioEventContent ·
StreamingTimeLimitsModal · ForceDemoEventLoader`

Recovered real repo paths **[O]** (from `03-deep-static/source-maps/extracted`, deduplicated):
`scripts/entries/Host/HostPage/Headers/HostHeaderV2/Channels.module.scss`,
`scripts/entries/Host/HostPage/Headers/HostHeaderV2/Schedule/Schedule.module.scss`,
`scripts/entries/Host/HostPage/Headers/HostHeaderV2/StreamDetails.module.scss`,
`scripts/entries/Host/HostPage/Headers/components/HeaderStreamTitle/HeaderStreamTitle.module.scss`,
`scripts/entries/Host/HostPage/LiveStreamOrientationSwitch/LiveStreamOrientationSwitch.module.scss`,
`scripts/modules/Preview/components/DualPreview/DualPreviewDestinations.module.scss`,
`scripts/modules/Player/components/OutgoingStreamModeSwitch/OutgoingStreamModeSwitch.module.scss`,
`scripts/dialogs/AddSourceModal/steps/RtmpSourceStep/RtmpSource/RtmpSource.module.scss`,
`scripts/dialogs/AddSourceModal/steps/RtmpSourceStep/RtmpSourceContent/RtmpSourceContent.module.scss`,
`scripts/dialogs/AlreadyStreamingPopover/AlreadyStreamingPopover.module.scss`,
`scripts/dialogs/EditEventTitleModal/EditEventTitleModal.module.scss`,
`scripts/components/EventSummaryCard/EventSummaryCard.module.scss`,
`scripts/components/BaseStreamDescription/BaseStreamDescription.module.scss`.

---

## 14. UNRESOLVED / partially characterised

| Item | What is known | Why unresolved |
|---|---|---|
| Exact chat `receiveSupported` / `replySupported` / `relaySupported` platform set | shape and endpoint confirmed (`api/client/platform-features`) | values served at runtime; not present in static assets |
| `eventTypeId` / `eventSourceId` chat taxonomy | fields exist on every chat message | numeric mappings live in the separate `chat.restream.io` app, which is not in this capture |
| Concrete `OutgoingStreamProfileIO` ladder | id format `WxH@Nfps+meta` confirmed | list is fetched at runtime |
| Ingest server catalogue (`v2/public/ingests`) | decoder `{id,name,icon,url,hostname}`; id 20 is icon-less | list is server-provided |
| `bbe` / `ybe` predicate `[LINKEDIN, FACEBOOK, RUMBLE]` | used around `onClickConnect` and post-connect routing | the minifier collapsed the original longer array into a dead comma-expression (`DAILYMOTION, DLIVE, FACEBOOK, GOODGAME, LINKEDIN, PERISCOPE, PICARTO, TWITCH, YOUTUBE, TWITTER, SLACK, TIKTOK, KICK, RUMBLE, PATREON`), so the surviving semantics are ambiguous |
| `kbe = [YOUTUBE_STREAM_NOW, MIXER]` | array survives | call site eliminated by the minifier |
| `sMe = [LINKEDIN]` (with dead prefix `[YOUTUBE, FACEBOOK, LINKEDIN, PERISCOPE, TWITCH].reverse()`) | array survives | call site eliminated by the minifier |
| Numeric destination caps per plan | flags `destinationsAvailable`, `extraDestinationsAvailable`, `customRtmpAvailable` exist | values are per-account, fetched at runtime |
| `STREAMCRAFT, LOOTS, CAVETUBE, CHEW, CYBERGAME, LIVEHOUSE, MIXER, NICONICO, SMASHCAST, USTREAM, YOUNOW` | enum IDs present; marketing descriptions still in `locale-en-US.js` | no icon, no display-name map entry, no connect form → **retired**, but IDs still reserved server-side |
| `VK Live`, `OK.ru`, `V LIVE`, `Amazon Live` (locale-only), `Akamai`, `Wowza`, `Niconico` | full marketing descriptions and titles still present in `locale-en-US.js` (`channel_vk_title`, `channel_ok_title`, `channel_vlive_title`, `channel_akamai_title`, `channel_wowza_title`) | **VK, OK.ru, V LIVE, Akamai and Wowza have no enum ID at all** in the current Studio build — dashboard-era leftovers or removed entirely |
| Per-platform max bitrate / max resolution caps | none found | Restream does not encode per-destination bitrate ceilings client-side; transcoding is free-form and validated server-side |
| Latency modes beyond YouTube | only YouTube exposes `latencyPreference` | no other platform has a latency control in the client |
