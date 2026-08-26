# SPEC — Restream Studio component tree (reconstructed from recovered SCSS)

**Source of truth:** `03-deep-static/source-maps/extracted/` — 725 `.scss` + 10 `.css` files
carried inside `sourcesContent` of 23 valid CSS source maps served by `studio.restream.io`.
The webpack identifiers preserve Restream's real repository paths, so the directory layout
below *is* the application's component tree (the style layer of it).

**Deduplication method.** Each map emits its sources into a per-chunk folder, and the same
logical file appears in up to 5 chunks. Dedup is done on the webpack identifier from
`MANIFEST-extracted-sources.csv` after stripping `webpack://studio-frontend/./`:
756 raw entries -> **636 unique logical identifiers** -> 635 real files (one is the empty
`<no source>` placeholder). This matches the package README's own dedup count.

**What this artifact can and cannot tell you.**

* It gives the exact component/module/dialog **names and nesting** as they exist in Restream's
  repo, plus every CSS class name, custom property, breakpoint, z-index and grid definition.
* It does **not** give React/TS sources: all 34 advertised JS source maps returned the SPA HTML
  shell, so no component logic was recovered. Behaviour below is *inferred* from names, class
  names and the (unusually rich) authored comments left in the SCSS.
* One compile-time Sass partial is referenced but not embedded anywhere:
  `scripts/entries/Overlay/overlay-selection-tokens` (used by `StreamOverlay/Frame` and
  `Widgets/WidgetOption` — i.e. the shared selection/hover token set for overlay elements).
  Its values are unrecoverable from public assets.

**Naming conventions observed in the repo**

| pattern | meaning |
|---|---|
| `scripts/entries/<Entry>/` | a routed page bundle (Host, Guest, Overlay, Login, NotFound, …) |
| `scripts/modules/<Feature>/components/**` | a feature slice; UI lives under `components/` |
| `scripts/components/<Name>/<Name>.module.scss` | generic, feature-agnostic UI primitive |
| `scripts/dialogs/<Name>/` | modal / popover surfaces, mostly `rc-dialog` based |
| `scripts/styles/*.scss` | global tokens & mixins (colors, zIndex, viewport, scrollbar) |
| `*.module.scss` | CSS Module; plain `.scss` = shared mixins/constants (`@use`d) |
| `V2`, `New`, `Skeleton`, `Scenes*` prefixes | live A/B or feature-flagged variants shipped side by side |


## 1. The deduplicated source tree

636 unique logical source identifiers were recovered from 23 CSS source maps (756 raw entries;
the same logical file is emitted into several chunk folders, so dedup is by the webpack
identifier after `webpack://studio-frontend/./`). One identifier is the empty `<no source>`
placeholder and is excluded below, leaving **635 real stylesheet sources**.

### 1.1 Counts per top-level area

| area | unique files |
|---|---:|
| `scripts/modules` | 320 |
| `scripts/entries` | 165 |
| `scripts/components` | 71 |
| `scripts/dialogs` | 57 |
| `node_modules/**` | 11 |
| `scripts/styles` | 9 |
| `scripts/assets` | 1 |
| `scripts/services` | 1 |
| **total** | **635** |

Second-level group counts (the actual feature modules):

| `scripts/modules/<X>` | n | | `scripts/entries/<X>` | n |
|---|---:|---|---|---:|
| `ActionButtons`|2 | | `BadJoinToken`|1 |
| `AiTools`|1 | | `BlockedUrl`|1 |
| `AuthModal`|1 | | `CannotJoin`|1 |
| `BackgroundMusic`|4 | | `EventFinished`|1 |
| `CameraSettings`|2 | | `Guest`|9 |
| `Captions`|7 | | `Host`|104 |
| `Chat`|9 | | `Index`|1 |
| `ChatOverlayCustomization`|5 | | `Login`|1 |
| `Commerce`|9 | | `NotFound`|1 |
| `CustomMusic`|6 | | `NotSupported`|5 |
| `Dev`|9 | | `Overlay`|36 |
| `Graphics`|9 | | `OverlayMode`|2 |
| `JoinScreen`|4 | | `UploadLocalRecordings`|1 |
| `LayoutCustomization`|25 | | `WebinarUnavailable`|1 |
| `LocalCameraPreview`|1 | | | |
| `LocalRecording`|3 | | | |
| `Player`|37 | | | |
| `Preview`|37 | | | |
| `PreviewStatusScreen`|13 | | | |
| `PrivateChat`|4 | | | |
| `PrivateChatV2`|1 | | | |
| `PromotionToHost`|2 | | | |
| `RecordingSettings`|1 | | | |
| `SceneCountdown`|4 | | | |
| `ScenesNotes`|1 | | | |
| `ScenesSidebar`|26 | | | |
| `Settings`|21 | | | |
| `Sidebar`|13 | | | |
| `SourceImages`|1 | | | |
| `SourcesDeck`|33 | | | |
| `Theme`|2 | | | |
| `VirtualEventsChat`|3 | | | |
| `Webinar`|17 | | | |
| `Widgets`|7 | | | |

### 1.2 `scripts/components/` — 52 groups / 71 files

```
Alert/   (1)
    Alert/Alert.module.scss
AudioOnlyMode/   (1)
    AudioOnlyMode/AudioOnlyOnboardingPopover/AudioOnlyOnboardingPopover.module.scss
Avatar/   (1)
    Avatar/Avatar.module.scss
BaseStreamDescription/   (1)
    BaseStreamDescription/BaseStreamDescription.module.scss
ButtonWithTooltip/   (2)
    ButtonWithTooltip/ButtonWithTooltip.module.scss
    ButtonWithTooltip/HotkeyTooltipContent/ButtonTooltipContent.module.scss
Chat/   (3)
    Chat/Bubble/Bubble.module.scss
    Chat/Message/Message.module.scss
    Chat/MessageScroller/MessageScroller.module.scss
ChatText/   (1)
    ChatText/ChatText.module.scss
ColorPicker/   (2)
    ColorPicker/ColorPicker.module.scss
    ColorPicker/ColorSwatch/ColorSwatch.module.scss
Copy/   (2)
    Copy/CopyButton/CopyButton.module.scss
    Copy/CopyInput/CopyInput.module.scss
CountdownBackgroundColorPicker/   (1)
    CountdownBackgroundColorPicker/CountdownBackgroundColorPicker.module.scss
CountdownColorPicker/   (1)
    CountdownColorPicker/CountdownColorPicker.module.scss
CustomFontsNewExperienceBanner/   (1)
    CustomFontsNewExperienceBanner/CustomFontsNewExperienceBanner.module.scss
DelayComponentUnmount/   (1)
    DelayComponentUnmount/DelayedUnmountComponent.module.scss
DeprecatedBadge/   (1)
    DeprecatedBadge/DeprecatedBadge.module.scss
EventSummaryCard/   (1)
    EventSummaryCard/EventSummaryCard.module.scss
ExceptionPage/   (1)
    ExceptionPage/ExceptionPage.module.scss
FontSelect/   (2)
    FontSelect/FontSelect.module.scss
    FontSelect/FontSelectItem/FontSelectItem.module.scss
GradientBorder/   (1)
    GradientBorder/GradientBorder.module.scss
HlsPlayer/   (1)
    HlsPlayer/HlsPlayerStatus/HlsPlayerStatus.module.scss
IteractionControls/   (1)
    IteractionControls/InteractionControols.module.scss
Kbd/   (1)
    Kbd/Kbd.module.scss
LightDropdownMenu/   (1)
    LightDropdownMenu/LightDropdownMenu.module.scss
LiveClippingBadge/   (1)
    LiveClippingBadge/LiveClippingBadge.module.scss
Loader/   (1)
    Loader/Loader.module.scss
LocalCameraPlaceholder/   (1)
    LocalCameraPlaceholder/LocalCameraPlaceholder.module.scss
MobileMenuContainer/   (1)
    MobileMenuContainer/MobileMenuContainer.module.scss
MultipleSwitchControl/   (1)
    MultipleSwitchControl/MultipleSwitchControl.module.scss
MusicNewExperienceBanner/   (1)
    MusicNewExperienceBanner/MusicNewExperienceBanner.module.scss
OpacityInput/   (1)
    OpacityInput/OpacityInput.module.scss
OptionActions/   (1)
    OptionActions/OptionActions.module.scss
Popover/   (1)
    Popover/Popover.module.scss
Popper/   (1)
    Popper/Popper.module.scss
PositionPicker/   (1)
    PositionPicker/PositionPicker.module.scss
ProgressBar/   (1)
    ProgressBar/ProgressBar.module.scss
ScenesMobilePlaceholder/   (1)
    ScenesMobilePlaceholder/ScenesMobilePlaceholder.module.scss
ScenesNewExperienceButton/   (2)
    ScenesNewExperienceButton/AnimatedStarsIcon/AnimatedStarsIcon.module.scss
    ScenesNewExperienceButton/ScenesNewExperienceButton.module.scss
SelfMutedIndicator/   (1)
    SelfMutedIndicator/SelfMutedIndicator.module.scss
SimpleVideoControl/   (2)
    SimpleVideoControl/SimpleVideoControl.module.scss
    SimpleVideoControl/SlidersButton/SlidersButton.module.scss
SlideControls/   (1)
    SlideControls/SlideControls.module.scss
Slider/   (1)
    Slider/Slider.module.scss
SliderV2/   (1)
    SliderV2/SliderV2.module.scss
Sprintf/   (1)
    Sprintf/Sprintf.module.scss
SwitchControl/   (1)
    SwitchControl/SwitchControl.module.scss
Tabs/   (1)
    Tabs/Tabs.module.scss
TickerSpeedControl/   (1)
    TickerSpeedControl/TickerSpeedControl.module.scss
Toast/   (8)
    Toast/Toast.module.scss
    Toast/components/CountdownAutoSwitchToast/CountdownAutoSwitchToast.module.scss
    Toast/components/GuestAddedSourceToast/GuestAddedSourceToast.module.scss
    Toast/components/HostVideoSceneAutoSwitchMutedToast/HostVideoSceneAutoSwitchMutedToast.module.scss
    Toast/components/UploadingRecordingsToast/UploadingRecordingsToast.module.scss
    Toast/components/VIdeoAutoSwitchToast/VideoAutoSwitchToast.module.scss
    Toast/components/VideoClipPlayingToast/VideoClipPlayingToast.module.scss
    Toast/components/VideoSceneAutoSwitchToast/VideoSceneAutoSwitchToast.module.scss
TogglikField/   (2)
    TogglikField/Togglik/Togglik.module.scss
    TogglikField/TogglikField.module.scss
UpgradePromptCard/   (1)
    UpgradePromptCard/UpgradePromptCard.module.scss
VerticalTabs/   (1)
    VerticalTabs/VerticalTabs.module.scss
VideoAutoSwitchNotification/   (1)
    VideoAutoSwitchNotification/VideoAutoSwitchNotification.module.scss
VirtualEvent/   (2)
    VirtualEvent/VirtualEventMessage/VirtualEventMessage.module.scss
    VirtualEvent/VirtualEventMessages/VirtualEventMessages.module.scss
VolumeControl/   (3)
    VolumeControl/SimpleSlider/SimpleSlider.module.scss
    VolumeControl/VolumeControl.module.scss
    VolumeControl/VolumeMuteControl/VolumeMuteControl.module.scss
```

### 1.3 `scripts/dialogs/` — 25 groups / 57 files

```
AddSourceModal/   (22)
    AddSourceModal/AddSourceModal.module.scss
    AddSourceModal/SourceOption/SourceOption.module.scss
    AddSourceModal/StepTransition/StepTransition.module.scss
    AddSourceModal/VideoStorageToastContainer/VideoStorageToastContainer.module.scss
    AddSourceModal/steps/AddSourceHomeStep/AddSourceHomeStep.module.scss
    AddSourceModal/steps/ExtraCameraSettingsStep/ExtraCameraSettingsStep.module.scss
    AddSourceModal/steps/ExtraCameraStep/AllowCameraPermission/AllowCameraPermission.module.scss
    AddSourceModal/steps/ExtraCameraStep/ConnectExtraCameraDevice/ConnectExtraCameraDevice.module.scss
    AddSourceModal/steps/ExtraCameraStep/DeniedCameraPermission/DeniedCameraPermission.module.scss
    AddSourceModal/steps/ExtraCameraStep/ExtraCameraContent/ExtraCameraContent.module.scss
    AddSourceModal/steps/ExtraCameraStep/ExtraCameraForm/ExtraCameraForm.module.scss
    AddSourceModal/steps/ExtraCameraStep/MaxExtraCamerasLimitExceeded/MaxExtraCamerasLimitExceeded.module.scss
    AddSourceModal/steps/LocalVideoStep/LocalVideoStep.module.scss
    AddSourceModal/steps/PresentationsStep/PresentationCard/LoadingBook/LoadingBook.module.scss
    AddSourceModal/steps/PresentationsStep/PresentationCard/LoadingText/LoadingText.module.scss
    AddSourceModal/steps/PresentationsStep/PresentationCard/PresentationCard.module.scss
    AddSourceModal/steps/PresentationsStep/PresentationsContent/PresentationsContent.module.scss
    AddSourceModal/steps/RtmpSourceStep/RtmpSource/RtmpSource.module.scss
    AddSourceModal/steps/RtmpSourceStep/RtmpSourceContent/RtmpSourceContent.module.scss
    AddSourceModal/steps/VideoStorageStep/VideoRecordingsCallouts/VideoRecordingsCallouts.module.scss
    AddSourceModal/steps/VideoStorageStep/VideoStorageVideoStep.module.scss
    AddSourceModal/steps/VideoStorageStepPublicUploadStep/VideoStorageStepPublicUpload/VideoStorageStepPublicUpload.module.scss
AlreadyStreamingPopover/   (1)
    AlreadyStreamingPopover/AlreadyStreamingPopover.module.scss
AutoSwitchOnboardingPopover/   (1)
    AutoSwitchOnboardingPopover/AutoSwitchOnboardingPopover.module.scss
AutoSwitchPromoPopover/   (1)
    AutoSwitchPromoPopover/AutoSwitchPromoPopover.module.scss
AvatarsModal/   (6)
    AvatarsModal/AvatarItem/AddAvatarItem.module.scss
    AvatarsModal/AvatarItem/AvatarItem.module.scss
    AvatarsModal/AvatarItem/NoAvatarItem.module.scss
    AvatarsModal/AvatarItem/UploadingAvatarItem.module.scss
    AvatarsModal/AvatarsModal.module.scss
    AvatarsModal/steps/common.module.scss
BaseDialog/   (1)
    BaseDialog/BaseDialog.module.scss
BaseTipModal/   (1)
    BaseTipModal/BaseTipModal.module.scss
CustomMusicCopyrightWarningModal/   (1)
    CustomMusicCopyrightWarningModal/CustomMusicCopyrightWarningModal.module.scss
CustomMusicNewFunctionalityModal/   (1)
    CustomMusicNewFunctionalityModal/CustomMusicNewFunctionalityModal.module.scss
DualOutputTrialModal/   (1)
    DualOutputTrialModal/DualOutputTrialModal.module.scss
EditEventTitleModal/   (1)
    EditEventTitleModal/EditEventTitleModal.module.scss
EditNameModal/   (1)
    EditNameModal/EditNameModal.module.scss
EditRecordingNameModal/   (1)
    EditRecordingNameModal/EditRecordingNameModal.module.scss
GoLiveWithEventsOverlapConfirmationModal/   (1)
    GoLiveWithEventsOverlapConfirmationModal/GoLiveWithEventsOverlapConfirmationModal.module.scss
GoLiveWithoutChannelsConfirmationModal/   (1)
    GoLiveWithoutChannelsConfirmationModal/GoLiveWithoutChannelsConfirmationModal.module.scss
GuestPairsOnboardingPopover/   (1)
    GuestPairsOnboardingPopover/GuestPairsOnboardingPopover.module.scss
InactivityWarningModal/   (1)
    InactivityWarningModal/InactivityWarningModal.module.scss
LandscapeWarningModal/   (1)
    LandscapeWarningModal/LandscapeWarningModal.module.scss
ParticipantsNamesIntroPopover/   (1)
    ParticipantsNamesIntroPopover/ParticipantsNamesIntroPopover.module.scss
RecordingModals/   (7)
    RecordingModals/RecordingPaidFeatureModal/RecordingPaidFeatureModal.module.scss
    RecordingModals/RecordingTrialEndedModal/RecordingTrialEndedModal.module.scss
    RecordingModals/RecordingTrialWarningModal/RecordingTrialWarningModal.module.scss
    RecordingModals/StudioRecordingModal/RecordingBlock/RecordingBlock.module.scss
    RecordingModals/StudioRecordingModal/RecordingBlocksAccordion/RecordingBlockAccordion.module.scss
    RecordingModals/StudioRecordingModal/StudioRecordingModal.module.scss
    RecordingModals/StudioRecordingModal/modal.module.scss
RestartRecordingConfirmationModal/   (1)
    RestartRecordingConfirmationModal/RestartRecordingConfirmationModal.module.scss
SceneEditModeOnboardingModal/   (1)
    SceneEditModeOnboardingModal/SceneEditModeOnboardingModal.module.scss
ScreenSharingModal/   (1)
    ScreenSharingModal/ScreenSharingModal.module.scss
SourceImageNewFunctionalityModal/   (1)
    SourceImageNewFunctionalityModal/SourceImageNewFunctionalityModal.module.scss
WatchPlaylistsTutorialModal/   (1)
    WatchPlaylistsTutorialModal/WatchPlaylistsTutorialModal.module.scss
```

### 1.4 `scripts/modules/` — 34 groups / 320 files

```
ActionButtons/   (2)
    ActionButtons/ActionButtons.module.scss
    ActionButtons/RecordModeSwitchButtonWrapper/RecordModeSwitchButtonWrapper.module.scss
AiTools/   (1)
    AiTools/components/AiSceneActivityShimmer/AiSceneActivityShimmer.module.scss
AuthModal/   (1)
    AuthModal/components/AuthModal.module.scss
BackgroundMusic/   (4)
    BackgroundMusic/components/AudioItem/AudioItem.module.scss
    BackgroundMusic/components/BackgroundMusicContainer.module.scss
    BackgroundMusic/components/BackgroundMusicContent/BackgroundMusicContent.module.scss
    BackgroundMusic/components/BackgroundMusicList/BackgroundMusicList.module.scss
CameraSettings/   (2)
    CameraSettings/CameraSettingsForm/CameraSettingsForm.module.scss
    CameraSettings/VideoSettingsModal/VideoSettingsModal.module.scss
Captions/   (7)
    Captions/components/CaptionSelect/CaptionForm/CaptionForm.module.scss
    Captions/components/CaptionSelect/CaptionOption/CaptionOption.module.scss
    Captions/components/CaptionSelect/CaptionSelect.module.scss
    Captions/components/CaptionSelect/Draggable/DraggableCaptionList.module.scss
    Captions/components/CaptionSelect/Draggable/DraggableWrapper.module.scss
    Captions/components/CaptionsContent/CaptionsContent.module.scss
    Captions/components/CaptionsSection/CaptionsSection.module.scss
Chat/   (9)
    Chat/components/ChatMessage/ChatMessage.module.scss
    Chat/components/ChatMessage/Contents.css
    Chat/components/ChatMessagesComingSoonBanner/ChatMessagesComingSoonBanner.module.scss
    Chat/components/ChatTabs/ChatTabs.module.scss
    Chat/components/HostChat/HostChat.module.scss
    Chat/components/PinnedMessagesButton/PinnedMessagesButton.module.scss
    Chat/components/PinnedMessagesList/PinnedMessagesList.module.scss
    Chat/components/ShownMessagesList/ShownMessagesList.module.scss
    Chat/components/ToggleIcon/ToggleIcon.module.scss
ChatOverlayCustomization/   (5)
    ChatOverlayCustomization/components/ChatOverlayCustomizationContent/ChatOverlayCustomizationContent.module.scss
    ChatOverlayCustomization/components/ChatOverlayPreview/ChatOverlayPreview.module.scss
    ChatOverlayCustomization/components/ChatOverlaySelect/ChatOverlaySelect.module.scss
    ChatOverlayCustomization/components/ChatOverlaySliderControl/ChatOverlaySliderControl.module.scss
    ChatOverlayCustomization/components/ChatOverlayToggleControl/ChatOverlayToggleControl.module.scss
Commerce/   (9)
    Commerce/QrCodes/components/QrCodeOverlay/QrCodeOverlay.module.scss
    Commerce/QrCodes/components/QrCodeSelect/Draggable/DraggableQrCodeList.module.scss
    Commerce/QrCodes/components/QrCodeSelect/Draggable/DraggableQrCodeWrapper.module.scss
    Commerce/QrCodes/components/QrCodeSelect/QrCodeForm/QrCodeForm.module.scss
    Commerce/QrCodes/components/QrCodeSelect/QrCodeOption/QrCodeOption.module.scss
    Commerce/QrCodes/components/QrCodeSelect/QrCodeSelect.module.scss
    Commerce/QrCodes/components/QrCodesContent/QrCodesContent.module.scss
    Commerce/QrCodes/components/QrCodesSection/QrCodesSection.module.scss
    Commerce/components/CommerceContainer.module.scss
CustomMusic/   (6)
    CustomMusic/components/CustomMusicContent/CustomMusicContent.module.scss
    CustomMusic/components/CustomMusicDndZone/CustomMusicDndZone.module.scss
    CustomMusic/components/CustomMusicItem/CustomMusicItem.module.scss
    CustomMusic/components/CustomMusicItem/CustomMusicItemMenu/CustomMusicItemMenu.module.scss
    CustomMusic/components/CustomMusicList/CustomMusicList.module.scss
    CustomMusic/components/CustomMusicUploadButton/CustomMusicUploadButton.module.scss
Dev/   (9)
    Dev/components/DevAiSpendPanel/DevAiSpendPanel.module.scss
    Dev/components/DevFloatingPanel/DevFloatingPanel.module.scss
    Dev/components/DevFormFromCodec/DevFormFromCodec.module.scss
    Dev/components/DevFormFromCodec/DevInputField/DevInputField.module.scss
    Dev/components/DevFormFromCodec/DevNumInputField/DevNumInputField.module.scss
    Dev/components/DevFormFromCodec/DevPositionPad/DevPositionPad.module.scss
    Dev/components/DevFormFromCodec/DevSelectField/DevSelectField.module.scss
    Dev/components/DevFormFromCodec/DevTogglikField/DevTogglikField.module.scss
    Dev/components/DevSceneEditingPresencePanel/DevSceneEditingPresencePanel.module.scss
Graphics/   (9)
    Graphics/components/DndOverlayZone/DndOverlayZone.module.scss
    Graphics/components/GraphicsContent/GraphicsContent.module.scss
    Graphics/components/GraphicsDndZone/GraphicsDndZone.module.scss
    Graphics/components/GraphicsSection/GraphicsSection.module.scss
    Graphics/components/GraphicsSections/GraphicsSections.module.scss
    Graphics/components/GraphicsUploadAction/GraphicsUploadAction.module.scss
    Graphics/components/ImageUploadProcessingLoader/ImageUploadProcessingLoader.module.scss
    Graphics/components/VideoClips/VideoClips.module.scss
    Graphics/components/VideoUploader/VideoUploader.module.scss
JoinScreen/   (4)
    JoinScreen/components/JoinScreen/JoinScreen.module.scss
    JoinScreen/components/JoinScreen/JumpingDots/JumpingDots.module.scss
    JoinScreen/components/JoinScreen/ParticipantsList/ParticipantsList.module.scss
    JoinScreen/components/JoinScreen/WebinarEventInfo/WebinarEventInfo.module.scss
LayoutCustomization/   (25)
    LayoutCustomization/components/ContainLayoutCustomizationContent/ContainLayoutCustomizationContent.module.scss
    LayoutCustomization/components/ContainLayoutSourceShapeControl/ContainLayoutSourceShapeControl.module.scss
    LayoutCustomization/components/CoverLayoutCustomizationContent/CoverLayoutCustomizationContent.module.scss
    LayoutCustomization/components/CustomizationAlerts/CustomizationNotSupportedAlert/CustomizationNotSupportedAlert.module.scss
    LayoutCustomization/components/CustomizationAlerts/NotEnoughSourcesAlert/NotEnoughSourcesAlert.module.scss
    LayoutCustomization/components/CustomizationAlerts/SourceMaximizedAlert/SourceMaximizedAlert.module.scss
    LayoutCustomization/components/CustomizationResetButton/AnimatedResetIcon/AnimatedResetIcon.module.scss
    LayoutCustomization/components/CustomizationResetButton/CustomizationResetButton.module.scss
    LayoutCustomization/components/CustomizationSourceTypeSwitch/CustomizationLayoutElementTypeSwitch.module.scss
    LayoutCustomization/components/EdgePositionControl/EdgePositionControl.module.scss
    LayoutCustomization/components/HalfScreenAlignmentControl/HalfScreenAlignmentControl.module.scss
    LayoutCustomization/components/HalfScreenLayoutCustomizationContent/HalfScreenLayoutCustomizationContent.module.scss
    LayoutCustomization/components/ParticipantNamesToggleControl/ParticipantNamesToggleControl.module.scss
    LayoutCustomization/components/ParticipantScreenShareNamesToggleControl/ParticipantScreenShareNamesToggleControl.module.scss
    LayoutCustomization/components/PipLayoutCustomizationContent/PipLayoutCustomizationContent.module.scss
    LayoutCustomization/components/PipLayoutPositionModeControl/PipLayoutPositionModeControl.module.scss
    LayoutCustomization/components/PreviewsPositionControl/PreviewsPositionControl.module.scss
    LayoutCustomization/components/PreviewsShapeControl/PreviewsShapeControl.module.scss
    LayoutCustomization/components/ShowtimeAlignmentControl/ShowtimeAlignmentControl.module.scss
    LayoutCustomization/components/ShowtimeLayoutCustomizationContent/ShowtimeLayoutCustomizationContent.module.scss
    LayoutCustomization/components/SpotlightLayoutCustomizationContent/SpotlightLayoutCustomizationContent.module.scss
    LayoutCustomization/components/SpotlightLayoutPositionModeControl/SpotlightLayoutPositionModeControl.module.scss
    LayoutCustomization/components/TbpnLayoutCustomizationContent/TbpnLayoutCustomizationContent.module.scss
    LayoutCustomization/components/ThumbnailsLayoutCustomizationContent/ThumbnailsLayoutCustomizationContent.module.scss
    LayoutCustomization/components/ThumbnailsPreviewsShapeControl/ThumbnailsPreviewsShapeControl.module.scss
LocalCameraPreview/   (1)
    LocalCameraPreview/components/SettingsModal/LocalCameraPreview.module.scss
LocalRecording/   (3)
    LocalRecording/components/LocalRecordingIndicator/LocalRecordingIndicator.module.scss
    LocalRecording/components/ParticipantStatusIndicator/ParticipantStatusIndicator.module.scss
    LocalRecording/components/RecordingDot/RecordingDot.module.scss
Player/   (37)
    Player/components/AddSource/AddSourceButton/AddSourceButton.module.scss
    Player/components/AddSource/AddSourceButtonWithPopover/AddSourceButtonWithPopover.module.scss
    Player/components/AddSource/AddSourcePopover/AddSourcePopover.module.scss
    Player/components/AddSource/AddSourcePopover/SourceOption/SourceOption.module.scss
    Player/components/Countdown/Countdown.module.scss
    Player/components/FullscreenButton/FullscreenButton.module.scss
    Player/components/GuestStreamStatusOverlay/GuestStreamStatusOverlay.module.scss
    Player/components/GuestStreamStatusOverlay/GuestWaitingForHostStatusLabel/GuestWaitingForHostStatusLabel.module.scss
    Player/components/InviteGuestsButton/InviteGuestsButtonWithPopover.module.scss
    Player/components/InviteGuestsButton/InviteGuestsPopover/InviteGuestsPopover.module.scss
    Player/components/InviteGuestsButton/InviteGuestsPopoverV2/InviteGuestsPopoverV2.module.scss
    Player/components/InviteGuestsButton/InviteGuestsSourcesButtonWithPopover/InviteGuestsSourcesButtonWithPopover.module.scss
    Player/components/MobileMenu/MobileMenu.module.scss
    Player/components/MobileMenu/MobileMenuButton/MobileMenuButton.module.scss
    Player/components/MobileMenuV2/MobileMenuV2.module.scss
    Player/components/OutgoingStreamModeSwitch/OutgoingStreamModeSwitch.module.scss
    Player/components/Player.module.scss
    Player/components/PlayerControls/MediaSelect/ButtonSegment.module.scss
    Player/components/PlayerControls/MediaSelect/MediaSelect.module.scss
    Player/components/PlayerControls/MobileDownloadButton/MobileDownloadButton.module.scss
    Player/components/PlayerControls/MobileRecordOnlyControls/MobileRecordOnlyControls.module.scss
    Player/components/PlayerControls/PermissionPopover/PermissionPopover.module.scss
    Player/components/PlayerControls/PlayerControls.module.scss
    Player/components/PlayerPreviewDndZone/PlayerPreviewDndZone.module.scss
    Player/components/ScreenSharing/AddScreenSharePlaceholder/AddScreenSharePlaceholder.module.scss
    Player/components/ScreenSharing/AddScreenSharePopover/AddScreenSharePopover.module.scss
    Player/components/ScreenSharing/ScreenSharePreviewPopover/ScreenSharePreviewPopover.module.scss
    Player/components/ScreenSharing/ScreenShareThumbnail/ScreenShareThumbnail.module.scss
    Player/components/ScreenSharing/ScreenSharingButton/ScreenSharingButton.module.scss
    Player/components/SettingsButton/SettingsButton.module.scss
    Player/components/SettingsButtonWithPopover/SettingsButtonWithPopover.module.scss
    Player/components/SkeletonLayoutControls/SkeletonLayoutControls.module.scss
    Player/components/ToggleCamera/ToggleCamera.module.scss
    Player/components/ToggleMicrophone/ToggleMicrophone.module.scss
    Player/components/ToggleScenesNotes/ToggleScenesNotes.module.scss
    Player/components/styles/buttonBadge.mixin.scss
    Player/components/styles/playerButton.mixin.scss
Preview/   (37)
    Preview/components/DualPreview/DualPreview.module.scss
    Preview/components/DualPreview/DualPreviewDestinations.module.scss
    Preview/components/EditWidgetsButton/EditWidgetsButton.module.scss
    Preview/components/HostPreviewContainer.editMode.module.scss
    Preview/components/LayoutPreview/LayoutPreview.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutFunction/LayoutFunction.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutHlsVideo/AnimatedPlayIcon/AnimatedPlayIcon.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutHlsVideo/CompactVideoControl/CompactVideoControl.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutHlsVideo/LayoutHlsVideo.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutHlsVideo/LayoutHlsVideoPlayer/LayoutHlsVideoPlayer.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutImage/LayoutImage.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutLocalVideo/LayoutLocalVideo.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaPlaceholder/CameraPlaceholder/CameraPlaceholder.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaPlaceholder/LayoutMediaPlaceholder.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaPlaceholder/MediaPlaceholder/MediaPlaceholder.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaPlaceholder/RtmpPlaceholder/RtmpCopyButton/RtmpCopyButton.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaPlaceholder/RtmpPlaceholder/RtmpPlaceholder.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaStream/LayoutMediaStream.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutMediaStream/MediaStreamEditAvatarControl/MediaStreamEditAvatarControl.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutParticipantNameImage/LayoutParticipantNameImage.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPresentation/LayoutPresentation.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPresentation/LayoutPresentationSlideControls/LayoutPresentationSlideControls.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPresentation/LayoutPresentationSource/LayoutPresentationSource.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPreviewGenericControls/DotsButton/DotsButton.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPreviewGenericControls/LayoutPreviewGenericControls.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPreviewGenericControls/MaximizeButton/MaximizeButton.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPreviewItem.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutPreviewSelfMutedIndication/LayoutPreviewSelfMutedIndication.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutRtmpSource/LayoutRtmpSource.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutSourceImage/LayoutSourceImage.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutSourceImage/LayoutSourceImageSource/LayoutSourceImageSource.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutVideoMediaPlaceholder/LayoutVideoMediaPlaceholder.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/LayoutVideoMediaPlaceholder/VideoMediaPlaceholderSource/VideoMediaPlaceholderSource.module.scss
    Preview/components/LayoutPreview/LayoutPreviewItem/common.module.scss
    Preview/components/LocalMediaStreamPreview/LocalMediaStreamPreview.module.scss
    Preview/components/Preview/Preview.constants.scss
    Preview/components/Preview/Preview.module.scss
PreviewStatusScreen/   (13)
    PreviewStatusScreen/components/PreviewStatusScreen/AccessingCamera/AccessingCamera.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/DualStreamingNotSupportedStatusScreen/DualStreamingNotSupportedStatusScreen.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/EcommerceProductPurchasesCount/EcommerceProductPurchasesCount.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/EcommerceProductViewsCount/EcommerceProductViewsCount.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/EndStreamTriggerScreen/EndStreamTriggerMobile/EndStreamTriggerMobile.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/EndStreamTriggerScreen/EndStreamTriggerScreen.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/EndStreamTriggerScreen/EndStreamTriggerVariantB/EndStreamTriggerVariantB.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/FeedbackForm/FeedbackForm.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/FeedbackScreen/FeedbackScreen.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/LiveStreamDuration/LiveStreamDuration.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/MessageScreens/MessageScreen.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/PreviewStatusScreen.module.scss
    PreviewStatusScreen/components/PreviewStatusScreen/ViewersCount/ViewersCount.module.scss
PrivateChat/   (4)
    PrivateChat/components/Message/Message.module.scss
    PrivateChat/components/Messages/Messages.module.scss
    PrivateChat/components/PrivateChat.module.scss
    PrivateChat/components/UnreadNotification/UnreadNotification.module.scss
PrivateChatV2/   (1)
    PrivateChatV2/PrivateChatV2.module.scss
PromotionToHost/   (2)
    PromotionToHost/PromotionToHostConfirmationModal/PromotionToHostConfirmationModal.module.scss
    PromotionToHost/PromotionToHostOfferModal/PromotionToHostOfferModal.module.scss
RecordingSettings/   (1)
    RecordingSettings/RecordingSettingsContent.module.scss
SceneCountdown/   (4)
    SceneCountdown/components/SceneCountdownContent/SceneCountdownContent.module.scss
    SceneCountdown/components/SceneCountdownCustomTimeSelect/SceneCountdownCustomTimeSelect.module.scss
    SceneCountdown/components/SceneCountdownSelect/SceneCountdownSelect.module.scss
    SceneCountdown/components/SceneCountdownSelectField/SceneCountdownSelectField.module.scss
ScenesNotes/   (1)
    ScenesNotes/components/SceneNote/SceneNote.module.scss
ScenesSidebar/   (26)
    ScenesSidebar/components/AddSceneButton/AddSceneButton.module.scss
    ScenesSidebar/components/AddScenePopover/AddSceneActions.module.scss
    ScenesSidebar/components/AddScenePopover/AddSceneActionsMenu/AddSceneActionsMenu.module.scss
    ScenesSidebar/components/AddVideoCard/AddVideoCard.module.scss
    ScenesSidebar/components/DraggableScenesList/DraggableScenesList.module.scss
    ScenesSidebar/components/SceneEditModePill/SceneEditModePill.module.scss
    ScenesSidebar/components/SceneEditModePreview/SceneEditModePreviewContainer.module.scss
    ScenesSidebar/components/SceneEditorsPresenceBadge/SceneEditorsPresenceBadge.module.scss
    ScenesSidebar/components/SceneItem/SceneItem.module.scss
    ScenesSidebar/components/SceneItemAttachedWebcamsBadge/SceneItemAttachedWebcamsBadge.module.scss
    ScenesSidebar/components/SceneItemDynamicThumbnail/SceneItemDynamicThumbnail.module.scss
    ScenesSidebar/components/SceneItemDynamicThumbnail/SceneItemDynamicThumbnailSource/SceneItemDynamicThumbnailSource.module.scss
    ScenesSidebar/components/SceneItemMenu/SceneItemMenu.module.scss
    ScenesSidebar/components/SceneItemMenu/SceneMenuOption/SceneMenuOption.module.scss
    ScenesSidebar/components/SceneItemPreview/SceneItemPreview.module.scss
    ScenesSidebar/components/SceneItemPreviewAutoSwitchBadge/SceneItemPreviewAutoSwitchBadge.module.scss
    ScenesSidebar/components/SceneItemPreviewCenteredCountdownBadge/SceneItemPreviewCenteredCountdownBadge.module.scss
    ScenesSidebar/components/SceneItemPreviewCountdownBadge/SceneItemPreviewCountdownBadge.module.scss
    ScenesSidebar/components/SceneItemPreviewMediaBadge/SceneItemPreviewMediaBadge.module.scss
    ScenesSidebar/components/SceneItemPreviewThumbnail/SceneItemPreviewThumbnail.module.scss
    ScenesSidebar/components/SceneProgressBar/SceneProgressBar.module.scss
    ScenesSidebar/components/SceneStatusOverlay/SceneStatusOverlay.module.scss
    ScenesSidebar/components/SceneTitleEditModal/SceneTitleEditModal.module.scss
    ScenesSidebar/components/ScenesLimitReachedModal/ScenesLimitReachedModal.module.scss
    ScenesSidebar/components/ScenesSidebar/ScenesSidebar.module.scss
    ScenesSidebar/components/ScenesSidebar/SkeletonScenes/SkeletonScenes.module.scss
Settings/   (21)
    Settings/components/SettingsModal/AudioSettingsForm/VolumeMeter/VolumeMeter.module.scss
    Settings/components/SettingsModal/GeneralSettingsForm/GeneralSettingsForm.module.scss
    Settings/components/SettingsModal/GreenScreenForm/GreenScreenForm.module.scss
    Settings/components/SettingsModal/GreenScreenForm/VirtualBackgrounds/VirtualBackgrounds.module.scss
    Settings/components/SettingsModal/ProfileSettingsForm/ProfileSettingsForm.module.scss
    Settings/components/SettingsModal/RecordingsSettingsForm/RecordingsSettings/RecordingsSettings.module.scss
    Settings/components/SettingsModal/RecordingsSettingsForm/RecordingsUpgradeTrigger/RecordingsUpgradeTrigger.module.scss
    Settings/components/SettingsModal/RevealOnClickComponent/RevealOnClickComponent.module.scss
    Settings/components/SettingsModal/SettingsAccordion/SettingsAccordionSection/SettingsAccordionSection.module.scss
    Settings/components/SettingsModal/SettingsBackToOldExperienceButton/SettingsBackToOldExperienceButton.module.scss
    Settings/components/SettingsModal/SettingsButton/SettingsButton.module.scss
    Settings/components/SettingsModal/SettingsInputField/SettingsInputField.module.scss
    Settings/components/SettingsModal/SettingsModal.module.scss
    Settings/components/SettingsModal/SettingsNewExperienceButton/SettingsNewExperienceButton.module.scss
    Settings/components/SettingsModal/SettingsSelectField/SettingsSelectField.module.scss
    Settings/components/SettingsModal/SettingsSliderField/SettingsSliderField.module.scss
    Settings/components/SettingsModal/SettingsTabButton/SettingsTabButton.module.scss
    Settings/components/SettingsModal/SettingsTogglikField/SettingsTogglikField.module.scss
    Settings/components/SettingsModal/Shortcuts/ShortcutRow/ShortcutRow.module.scss
    Settings/components/SettingsModal/Shortcuts/Shortcuts.module.scss
    Settings/components/SettingsModal/VideoSettingsForm/VideoSettingsForm.module.scss
Sidebar/   (13)
    Sidebar/components/GuestChat/GuestChat.module.scss
    Sidebar/components/GuestSidebar/GuestSidebar.module.scss
    Sidebar/components/HostSidebar/HostSidebar.module.scss
    Sidebar/components/HostSidebar/MusicStatus/MusicStatus.module.scss
    Sidebar/components/HostSidebarV2/HostSidebarV2.module.scss
    Sidebar/components/ImageSelect/ImageOption/ImageOption.module.scss
    Sidebar/components/ImageSelect/ImageSelect.module.scss
    Sidebar/components/ImageSelect/RemoveOption/RemoveOption.module.scss
    Sidebar/components/Info/Info.module.scss
    Sidebar/components/InfoTooltip/InfoTooltip.module.scss
    Sidebar/components/PaidGraphicPopper/PaidGraphicPopperContent/PaidGraphicPopperContent.module.scss
    Sidebar/components/ThemeSelect/ThemePreviewButton/ThemePreviewButton.module.scss
    Sidebar/components/ThemeSelect/ThemeSelect.module.scss
SourceImages/   (1)
    SourceImages/handleProcessingSourceImageFailedToast/handleProcessingSourceImageFailedToast.module.scss
SourcesDeck/   (33)
    SourcesDeck/components/ClientSources/AddNameButton/AddNameButton.module.scss
    SourcesDeck/components/ClientSources/ClientSources.module.scss
    SourcesDeck/components/ClientSources/HlsVideoSource/HlsVideoSourcePreview/HlsVideoSourcePreview.module.scss
    SourcesDeck/components/ClientSources/MediaStreamSource/MediaStreamAudioSourcePreview/MediaStreamAudioSourcePreview.module.scss
    SourcesDeck/components/ClientSources/MediaStreamSource/MediaStreamBaseSourcePreview/MediaStreamBaseSourcePreview.module.scss
    SourcesDeck/components/ClientSources/MediaStreamSource/MediaStreamBaseSourcePreview/PairsBadge/PairsBadge.module.scss
    SourcesDeck/components/ClientSources/PresentationSource/PresentationSourcePreview/PresentationSourcePreview.module.scss
    SourcesDeck/components/ClientSources/QualityIndicator/QualityIndicator.module.scss
    SourcesDeck/components/ClientSources/ScenesClientSources/ScenesClientSources.module.scss
    SourcesDeck/components/ClientSources/SlidingLimiter/SlidingLimiter.module.scss
    SourcesDeck/components/ClientSources/SourceControls/SourceControls.module.scss
    SourcesDeck/components/ClientSources/SourceIcon/SourceIcon.module.scss
    SourcesDeck/components/ClientSources/SourceMenu/SourceMenu.module.scss
    SourcesDeck/components/ClientSources/StreamSource/StreamSource.module.scss
    SourcesDeck/components/ClientSources/VideoPlayerControls/VideoPlayerControls.module.scss
    SourcesDeck/components/ParticipantJoinedPopover/ParticipantJoinedPopover.module.scss
    SourcesDeck/components/ScenesSources/ScenesNoOtherSourcesBanner/ScenesNoOtherSourcesBanner.module.scss
    SourcesDeck/components/ScenesSources/ScenesParticipantSources/SceneParticipantSourceAssignmentMenu/SceneParticipantSourceAssignmentMenu.module.scss
    SourcesDeck/components/ScenesSources/ScenesParticipantSources/ScenesParticipantMediaStreamSource/ScenesParticipantMediaStreamSource.module.scss
    SourcesDeck/components/ScenesSources/ScenesParticipantSources/ScenesParticipantPresentationSource/ScenesParticipantPresentationSource.module.scss
    SourcesDeck/components/ScenesSources/ScenesParticipantSources/ScenesParticipantSources.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesButtonWithPopover/ScenesSourcesButtonWithPopover.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesInviteGuests/CopyInviteLinkButton/CopyInviteLinkButton.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesInviteGuests/InviteGuestsMoreOptionsMenu/InviteGuestsMoreOptionsMenu.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesInviteGuests/ScenesSourcesInviteGuests.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPeopleAssignmentModeControl/ScenesSourcesPeopleAssignmentModeControl.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPopover/ScenesSourcesPopover.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPreviews/ScenesMediaStreamSourcePreview/ScenesMediaStreamSourcePreview.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPreviews/ScenesPresentationSourcePreview/ScenesPresentationSourcePreview.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPreviews/ScenesSourcesPreviews.module.scss
    SourcesDeck/components/ScenesSources/ScenesSourcesPreviews/utils.scss
    SourcesDeck/components/SkeletonSources/SkeletonSources.module.scss
    SourcesDeck/components/SourcesDeck/SourcesDeck.module.scss
Theme/   (2)
    Theme/themes-styles.scss
    Theme/themes-utils.scss
VirtualEventsChat/   (3)
    VirtualEventsChat/components/GuestVirtualEventsChat/GuestVirtualEventsChat.module.scss
    VirtualEventsChat/components/HostVirtualEventsChat/HostVirtualEventsChat.module.scss
    VirtualEventsChat/components/OverlayVirtualEventsChat/OverlayVirtualEventsChat.module.scss
Webinar/   (17)
    Webinar/components/AttendeesPanel/AttendeeRow/AttendeeRow.module.scss
    Webinar/components/AttendeesPanel/AttendeesList/AttendeesList.module.scss
    Webinar/components/AttendeesPanel/AttendeesPanel.module.scss
    Webinar/components/AttendeesPanel/CallInRequestsNotification/CallInRequestsNotification.module.scss
    Webinar/components/GuestWebinarActionButtons/GuestWebinarActionButtons.module.scss
    Webinar/components/GuestWebinarReplayPlayer/GuestWebinarReplayPlayer.module.scss
    Webinar/components/GuestWebinarWaitingOverlay/GuestWebinarWaitingOverlay.module.scss
    Webinar/components/PendingWebinarViewers/PendingViewerItem.module.scss
    Webinar/components/PendingWebinarViewers/PendingWebinarViewers.module.scss
    Webinar/components/StartWebinarConfirmationModal/StartWebinarConfirmationModal.module.scss
    Webinar/components/WebinarAudienceJoinModal/WebinarAudienceJoinModal.module.scss
    Webinar/components/WebinarAvatar/WebinarAvatar.module.scss
    Webinar/components/WebinarLiveCallInRequestToast/WebinarLiveCallInRequestToast.module.scss
    Webinar/components/WebinarLiveCallModal/WebinarLiveCallModal.module.scss
    Webinar/components/WebinarMoreOptionsMenu/WebinarMoreOptionsMenu.module.scss
    Webinar/components/WebinarViewerChatInput/WebinarViewerChatInput.module.scss
    Webinar/components/WebinarViewerInviteToStudioToast/WebinarViewerInviteToStudioToast.module.scss
Widgets/   (7)
    Widgets/components/WidgetForm/WidgetForm.module.scss
    Widgets/components/WidgetOption/WidgetFavicon.module.scss
    Widgets/components/WidgetOption/WidgetMoreOptionsMenu.module.scss
    Widgets/components/WidgetOption/WidgetOption.module.scss
    Widgets/components/WidgetUpgradePopover/WidgetUpgradePopover.module.scss
    Widgets/components/WidgetsContent/WidgetsContent.module.scss
    Widgets/components/WidgetsTabTitle/WidgetsTabTitle.module.scss
```

### 1.5 `scripts/entries/` — 14 groups / 165 files

```
BadJoinToken/   (1)
    BadJoinToken/BadJoinTokenPage/BadJoinTokenPage.module.scss
BlockedUrl/   (1)
    BlockedUrl/BlockedUrlPage/BlockedUrlPage.module.scss
CannotJoin/   (1)
    CannotJoin/CannotJoinPage/CannotJoinPage.module.scss
EventFinished/   (1)
    EventFinished/EventFinishedPage/EventFinishedPage.module.scss
Guest/   (9)
    Guest/GuestPage/GuestPage.module.scss
    Guest/GuestPage/GuestSourcesPreview/GuestSourcesPreview/GuestSourcesPreview.module.scss
    Guest/GuestPage/Headers/GuestHeader/GuestHeader.module.scss
    Guest/GuestPage/Headers/GuestVirtualEventHeader/GuestVirtualEventHeader.module.scss
    Guest/GuestPage/Headers/components/HeaderScheduledTime/HeaderScheduledTime.module.scss
    Guest/GuestPage/ScenesGuestSources/ScenesGuestLocalMediaStreamSource/ScenesGuestLocalMediaStreamSource.module.scss
    Guest/GuestPage/ScenesGuestSources/ScenesGuestSources/ScenesGuestSources.module.scss
    Guest/GuestPlayerHeading/GuestPlayerHeading.module.scss
    Guest/index.module.scss
Host/   (104)
    Host/HostPage/Brands/BrandFolderLogo/BrandFolderLogo.module.scss
    Host/HostPage/Brands/BrandItem/BrandItem.module.scss
    Host/HostPage/Brands/BrandLogo/BrandLogo.module.scss
    Host/HostPage/Brands/Brands.module.scss
    Host/HostPage/Brands/BrandsContent/BrandsContent.module.scss
    Host/HostPage/Brands/BrandsHead/BrandsHead.module.scss
    Host/HostPage/Headers/HostEventHeader/AddChannelsPlaceholderButton/AddChannelsPlaceholderButton.module.scss
    Host/HostPage/Headers/HostEventHeader/DualOutputAddChannelsPlaceholderButton/DualOutputAddChannelsPlaceholderButton.module.scss
    Host/HostPage/Headers/HostEventHeader/HostEventHeader.module.scss
    Host/HostPage/Headers/HostEventRecordOnlyHeader/HostEventRecordOnlyHeader.module.scss
    Host/HostPage/Headers/HostEventRecordOnlyHeader/RecordModeControls/RecordModePauseControl/RecordModePauseControl.module.scss
    Host/HostPage/Headers/HostEventRecordOnlyHeader/RecordModeControls/RecordModeRestartControl/RecordModeRestartControl.module.scss
    Host/HostPage/Headers/HostHeader/HostHeader.module.scss
    Host/HostPage/Headers/HostHeaderV2/Back.module.scss
    Host/HostPage/Headers/HostHeaderV2/Channels.module.scss
    Host/HostPage/Headers/HostHeaderV2/DownloadDropdown/DownloadDropdown.module.scss
    Host/HostPage/Headers/HostHeaderV2/HeaderMobile.module.scss
    Host/HostPage/Headers/HostHeaderV2/HostHeaderV2.module.scss
    Host/HostPage/Headers/HostHeaderV2/LiveClippingToggleRow.module.scss
    Host/HostPage/Headers/HostHeaderV2/LogoAndStatus.module.scss
    Host/HostPage/Headers/HostHeaderV2/MobileDrawer.module.scss
    Host/HostPage/Headers/HostHeaderV2/Schedule/Schedule.module.scss
    Host/HostPage/Headers/HostHeaderV2/SessionControls.module.scss
    Host/HostPage/Headers/HostHeaderV2/SettingsDropdown/LocalRecordingFields.module.scss
    Host/HostPage/Headers/HostHeaderV2/SettingsDropdown/SettingsDrodownButton.module.scss
    Host/HostPage/Headers/HostHeaderV2/SettingsDropdown/SettingsDropdown.module.scss
    Host/HostPage/Headers/HostHeaderV2/SettingsDropdown/SettingsSelect/SettingsSelect.module.scss
    Host/HostPage/Headers/HostHeaderV2/SettingsDropdown/UpgradePrompt/UpgradePrompt.module.scss
    Host/HostPage/Headers/HostHeaderV2/StreamDetails.module.scss
    Host/HostPage/Headers/HostHeaderV2/Timer.module.scss
    Host/HostPage/Headers/HostHeaderV2/UpgradeButton.module.scss
    Host/HostPage/Headers/HostHeaderV2/ViewersCountPopover/ViewersCountPopover.module.scss
    Host/HostPage/Headers/HostHeaderV2/WebinarSlackButton/WebinarSlackButton.module.scss
    Host/HostPage/Headers/HostPlaylistHeader/HostPlaylistHeader.module.scss
    Host/HostPage/Headers/HostRecordOnlyHeader/HostRecordOnlyHeader.module.scss
    Host/HostPage/Headers/HostVirtualEventHeader/HostVirtualEventHeader.module.scss
    Host/HostPage/Headers/components/AddFirstDestinationPopover/AddFirstDestinationPopover.module.scss
    Host/HostPage/Headers/components/BackButton/BackButton.module.scss
    Host/HostPage/Headers/components/EventPlaylistsButton/EventPlaylistsButton.module.scss
    Host/HostPage/Headers/components/HeaderCoBrandingTitle/HeaderCoBrandingTitle.module.scss
    Host/HostPage/Headers/components/HeaderGoProButton/HeaderGoProButton.module.scss
    Host/HostPage/Headers/components/HeaderRecordingName/HeaderRecordingName.module.scss
    Host/HostPage/Headers/components/HeaderStreamTitle/HeaderStreamTitle.module.scss
    Host/HostPage/Headers/components/PlaylistVideosDurationLimitExceededLabel/PlaylistVideosDurationLimitExceededLabel.module.scss
    Host/HostPage/Headers/components/PlaylistsEventCountdown/PlaylistsEventCountdown.module.scss
    Host/HostPage/Headers/components/RecordOnlyTitle/RecordOnlyTitle.module.scss
    Host/HostPage/Headers/components/RecordingButton/RecordingButton.module.scss
    Host/HostPage/Headers/components/RecordingButtonContainer/RecordingButtonWrapper.module.scss
    Host/HostPage/Headers/components/RecordingDropDown/RecordingDropDown.module.scss
    Host/HostPage/Headers/components/RecordingDropDown/RecordingDropDownPopover/RecordingDropDownContent/FirstRecordingPopoverItem/FirstRecordingPopoverItem.module.scss
    Host/HostPage/Headers/components/RecordingDropDown/RecordingDropDownPopover/RecordingDropDownContent/RecordingDropDownContent.module.scss
    Host/HostPage/Headers/components/RecordingDropDown/RecordingDropDownPopover/RecordingDropDownPopover.module.scss
    Host/HostPage/Headers/components/RecordingToggleDropdown/RecordingToggleDropdown.module.scss
    Host/HostPage/Headers/components/SelectDestinationPopover/SelectDestinationPopover.module.scss
    Host/HostPage/HostModals/EndStreamConfirmationModal/EndStreamConfirmationModal.module.scss
    Host/HostPage/HostModals/EndWebinarConfirmationModal/EndWebinarConfirmationModal.module.scss
    Host/HostPage/HostModals/GoLiveWithChannelErrorsConfirmationModal/GoLiveWithChannelErrorsConfirmationModal.module.scss
    Host/HostPage/HostModals/SecondScreenShareWarningModal/SecondScreenShareWarningModal.module.scss
    Host/HostPage/HostModals/StopRecordingConfirmationModal/StopRecordingConfirmationModal.module.scss
    Host/HostPage/HostPage.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/ContainPreview/ContainPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/CoverPreview/CoverPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/HalfScreenPreview/HalfScreenPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/PictureInPicturePreview/PictureInPicturePreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/ShowtimePreview/ShowtimePreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/SpotlightPreview/SpotlightPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/TbpnPreview/TbpnPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutPreviews/ThumbnailsPreview/ThumbnailsPreview.module.scss
    Host/HostPage/LayoutSwitch/LayoutSwitch.module.scss
    Host/HostPage/LiveStreamOrientationSwitch/LiveStreamOrientationSwitch.module.scss
    Host/HostPage/RecordingsTrigger/RecordingsTrigger.module.scss
    Host/HostPage/RecordingsTrigger/RecordingsTriggerPopover/RecordingsTriggerPopover.module.scss
    Host/HostStore/room/RoomHlsVideosStore/handleHlsVideoFailedStatus/handleHlsVideoFailedStatus.module.scss
    Host/OnboardingPage/AiChatMetrics.module.scss
    Host/OnboardingPage/OnboardingChat.module.scss
    Host/OnboardingPage/OnboardingChatSkeleton.module.scss
    Host/OnboardingPage/OnboardingIntro.module.scss
    Host/OnboardingPage/OnboardingOrbit.module.scss
    Host/OnboardingPage/OnboardingPage.module.scss
    Host/OnboardingPage/ServerChatUI/ChatHint.module.scss
    Host/OnboardingPage/ServerChatUI/ChatStatus.module.scss
    Host/OnboardingPage/ServerChatUI/IntentChips.module.scss
    Host/OnboardingPage/ServerChatUI/ResourcePicker.module.scss
    Host/OnboardingPage/SystemPromptDebugPanel.module.scss
    Host/OnboardingPage/UI/ActiveToolStatus.module.scss
    Host/OnboardingPage/UI/AudioOptionsPicker.module.scss
    Host/OnboardingPage/UI/BackgroundAsset.module.scss
    Host/OnboardingPage/UI/Composer/Attachments.module.scss
    Host/OnboardingPage/UI/Composer/Composer.module.scss
    Host/OnboardingPage/UI/Composer/ToolChip.module.scss
    Host/OnboardingPage/UI/FinishSetup.module.scss
    Host/OnboardingPage/UI/Questionnaire.module.scss
    Host/OnboardingPage/UI/ToolCallStatus.module.scss
    Host/OnboardingPage/UI/WidgetAsset.module.scss
    Host/WebsiteSdkOnbording/OnboardingTooltip/OnboardingTooltip.module.scss
    Host/components/BlackFridayCampaign/BlackFridayCampaignBanner.module.scss
    Host/components/GuestsCountUpgradeTrigger/GuestsCountUpgradeTrigger.module.scss
    Host/components/Header/Header.module.scss
    Host/components/HostBanner/HostBanner.module.scss
    Host/components/InviteGuestLinkRefreshConfirmationModal/InviteGuestLinkRefreshConfirmationModal.module.scss
    Host/components/MediaStreamPreview/MediaStreamPreview.module.scss
    Host/components/WatchPlaylistsTutorial/WatchPlaylistsTutorial.module.scss
    Host/components/onUserChangedToast/onUserChangedToast.module.scss
    Host/index.module.scss
Index/   (1)
    Index/index.module.scss
Login/   (1)
    Login/LoginPage/LoginPage.module.scss
NotFound/   (1)
    NotFound/NotFoundPage/NotFoundPage.module.scss
NotSupported/   (5)
    NotSupported/BaseNotSupportedFeature/BaseNotSupportedFeature.module.scss
    NotSupported/NotSupportedPage/NotSupportedGenericBrowser/NotSupportedGenericBrowser.module.scss
    NotSupported/NotSupportedPage/NotSupportedPage.module.scss
    NotSupported/NotSupportedPage/NotSupportediOSBrowser/NotSupportediOSBrowser.module.scss
    NotSupported/NotSupportedSafariVideo/NotSupportedSafariVideo.module.scss
Overlay/   (36)
    Overlay/AlertsContainer/AlertContainer.module.scss
    Overlay/AlertsContainer/EcommerceViewedAlert/EcommerceViewedAlert.module.scss
    Overlay/CaptionContainer/AirCaption/AirCaption.module.scss
    Overlay/CaptionContainer/CaptionAvatar/CaptionAvatar.module.scss
    Overlay/CaptionContainer/CaptionContainer.module.scss
    Overlay/CaptionContainer/DefaultCaption/DefaultCaption.module.scss
    Overlay/CaptionContainer/EcommerceCaption/EcommerceCaption.module.scss
    Overlay/CaptionContainer/EcommerceCaption/EcommerceLayoutSwitchControl/EcommerceLayoutSwitchControl.module.scss
    Overlay/CaptionContainer/NewsCaption/NewsCaption.module.scss
    Overlay/CaptionContainer/RoundedCaption/RoundedCaption.module.scss
    Overlay/CaptionContainer/SpookyCaption/SpookyCaption.module.scss
    Overlay/CaptionContainer/XmasCaption/XmasCaption.module.scss
    Overlay/CaptionContainer/_rtl-mixins.scss
    Overlay/CaptionContainer/common/common.scss
    Overlay/CountdownSceneOverlayContainer/CountdownControls/CountdownControls.module.scss
    Overlay/CountdownSceneOverlayContainer/CountdownSceneOverlayContainer.module.scss
    Overlay/CountdownSceneOverlayContainer/CountdownSceneOverlayControlsContainer/CountdownSceneOverlayControls.module.scss
    Overlay/CountdownSceneOverlayContainer/CountdownSceneOverlayControlsContainer/CountdownSceneOverlayControlsSelect/CountdownSceneOverlayControlsSelect.module.scss
    Overlay/CountdownSceneOverlayContainer/CountdownToolbar/CountdownToolbar.module.scss
    Overlay/CountdownSceneOverlayContainer/RunCountdownButton/RunCountdownButton.module.scss
    Overlay/CountdownSceneOverlayContainer/TimeDisplay/TimeDisplay.module.scss
    Overlay/OverlayControls/ElementControlMenu/ElementControlMenu.module.scss
    Overlay/OverlayControls/ElementPositionSwitchControl/ElementPositionSwitchControl.module.scss
    Overlay/OverlayControls/GraphicsElementControls/GraphicsElementControls.module.scss
    Overlay/OverlayImage/OverlayImage.module.scss
    Overlay/StreamOverlay/BrowserSourceContainer/BrowserSourceContainer.module.scss
    Overlay/StreamOverlay/BrowserSourceThumbnail/BrowserSourceThumbnail.module.scss
    Overlay/StreamOverlay/ChatOverlay/ChatOverlay.module.scss
    Overlay/StreamOverlay/ChatOverlay/ChatOverlayControls/ChatOverlayControls.module.scss
    Overlay/StreamOverlay/ChatOverlay/ChatOverlayToolbar/ChatOverlayToolbar.module.scss
    Overlay/StreamOverlay/Frame/Frame.module.scss
    Overlay/StreamOverlay/StreamOverlay.module.scss
    Overlay/TickerCaption/ReactFastMarque.module.scss
    Overlay/TickerCaption/TickerCaption.module.scss
    Overlay/TickerCaption/TickerCaptionControls/TickerCaptionControls.module.scss
    Overlay/TickerCaption/TickerCaptionToolbar/TickerCaptionToolbar.module.scss
OverlayMode/   (2)
    OverlayMode/OverlayModePage/OverlayModePage.module.scss
    OverlayMode/index.module.scss
UploadLocalRecordings/   (1)
    UploadLocalRecordings/UploadPage/UploadPage.module.scss
WebinarUnavailable/   (1)
    WebinarUnavailable/WebinarUnavailablePage/WebinarUnavailablePage.module.scss
```

### 1.6 `scripts/styles/` — 9 groups / 9 files

```
aspectRatio.scss
colors.scss
common.scss
intercom.scss
reset.scss
scrollbar.scss
themes.module.scss
viewport.scss
zIndex.scss
```

### 1.7 `scripts/services/` — 1 groups / 1 files

```
Presentation/   (1)
    Presentation/handlePresentationFailedStatus/handlePresentationFailedStatus.module.scss
```

### 1.8 `scripts/assets/` — 1 groups / 1 files

```
fonts/   (1)
    fonts/fonts.scss
```

### 1.9 `node_modules/` — 3 groups / 11 files

```
@restream/   (9)
    @restream/auth/dist/components.css
    @restream/auth/dist/style.css
    @restream/chat-embed-themes/dist/chat-embed-themes.css
    @restream/e-commerce/dist/style.css
    @restream/styles/scss/media.scss
    @restream/styles/scss/outline.scss
    @restream/ui-kit/dist/style.css
    @restream/video-editor/dist/style.css
    @restream/website-dashboard-sdk/dist/style.css
cropperjs/   (1)
    cropperjs/dist/cropper.css
rc-dialog/   (1)
    rc-dialog/assets/bootstrap.css
```


---

## 2. Components recovered from CSS-module class names

CSS Modules compile to `ComponentName_element__hash`, and those class names are **not**
minified in the shipped CSS. Parsing them across all 24 production stylesheets
recovers the component inventory *independently* of the source maps — including
components whose SCSS was never published.

- Total class-name matches parsed: **23,106**
- Distinct components: **594**
- Known from recovered SCSS: **590**
- **Recovered ONLY from CSS class names (new): 4**

### 2.1 By domain


#### Widgets & on-stream graphics (56)

`Alert`, `AlertContainer`, `BackgroundAsset`, `BackgroundMusicContainer`, `BackgroundMusicContent`, `BackgroundMusicList`, `BrandFolderLogo`, `BrandItem`, `BrandLogo`, `Brands`, `BrandsContent`, `BrandsHead`, `CaptionAvatar`, `CaptionContainer`, `CaptionForm`, `CaptionOption`, `CaptionSelect`, `CaptionsContent`, `CaptionsSection`, `Countdown`, `CountdownAutoSwitchToast`, `CountdownBackgroundColorPicker`, `CountdownColorPicker`, `CountdownControls`, `CountdownSceneOverlayContainer`, `CountdownSceneOverlayControls`, `CountdownSceneOverlayControlsSelect`, `CountdownToolbar`, `Frame`, `LogoAndStatus`, `OverlayImage`, `OverlayMode` *, `OverlayModePage`, `OverlayVirtualEventsChat`, `PromotionToHostConfirmationModal`, `PromotionToHostOfferModal`, `QrCodeForm`, `QrCodeOption`, `QrCodeOverlay`, `QrCodeSelect`, `QrCodesContent`, `QrCodesSection`, `Questionnaire`, `TickerCaption`, `TickerCaptionControls`, `TickerCaptionToolbar`, `TickerSpeedControl`, `Timer`, `WidgetAsset`, `WidgetFavicon`, `WidgetForm`, `WidgetMoreOptionsMenu`, `WidgetOption`, `WidgetUpgradePopover`, `WidgetsContent`, `WidgetsTabTitle`

#### AI (5)

`AiChatMetrics`, `AiSceneActivityShimmer`, `AirCaption`, `OnboardingChat`, `OnboardingChatSkeleton`

#### Stage, canvas & layout (73)

`LayoutFunction`, `LayoutHlsVideo`, `LayoutHlsVideoPlayer`, `LayoutImage`, `LayoutLocalVideo`, `LayoutMediaPlaceholder`, `LayoutMediaStream`, `LayoutParticipantNameImage`, `LayoutPresentation`, `LayoutPresentationSlideControls`, `LayoutPresentationSource`, `LayoutPreview`, `LayoutPreviewGenericControls`, `LayoutPreviewItem`, `LayoutPreviewSelfMutedIndication`, `LayoutRtmpSource`, `LayoutSourceImage`, `LayoutSourceImageSource`, `LayoutSwitch`, `LayoutVideoMediaPlaceholder`, `PipLayoutCustomizationContent`, `PipLayoutPositionModeControl`, `Preview`, `PreviewStatusScreen`, `PreviewsPositionControl`, `PreviewsShapeControl`, `SceneCountdownContent`, `SceneCountdownCustomTimeSelect`, `SceneCountdownSelect`, `SceneCountdownSelectField`, `SceneEditModeOnboardingModal`, `SceneEditModePill`, `SceneEditModePip` *, `SceneEditModePreviewContainer`, `SceneEditorsPresenceBadge`, `SceneItem`, `SceneItemAttachedWebcamsBadge`, `SceneItemDynamicThumbnail`, `SceneItemDynamicThumbnailSource`, `SceneItemMenu`, `SceneItemPreview`, `SceneItemPreviewAutoSwitchBadge`, `SceneItemPreviewCenteredCountdownBadge`, `SceneItemPreviewCountdownBadge`, `SceneItemPreviewMediaBadge`, `SceneItemPreviewThumbnail`, `SceneMenuOption`, `SceneNote`, `SceneParticipantSourceAssignmentMenu`, `SceneProgressBar`, `SceneStatusOverlay`, `SceneTitleEditModal`, `ScenesClientSources`, `ScenesGuestLocalMediaStreamSource`, `ScenesGuestSources`, `ScenesLimitReachedModal`, `ScenesMediaStreamSourcePreview`, `ScenesMobilePlaceholder`, `ScenesNewExperienceButton`, `ScenesNoOtherSourcesBanner`, `ScenesParticipantMediaStreamSource`, `ScenesParticipantPresentationSource`, `ScenesParticipantSources`, `ScenesPresentationSourcePreview`, `ScenesSidebar`, `ScenesSourcesButtonWithPopover`, `ScenesSourcesInviteGuests`, `ScenesSourcesPeopleAssignmentModeControl`, `ScenesSourcesPopover`, `ScenesSourcesPreviews`, `SpotlightLayoutCustomizationContent`, `SpotlightLayoutPositionModeControl`, `SpotlightPreview`

#### Sources & inputs (22)

`BrowserSourceContainer`, `BrowserSourceThumbnail`, `CameraPlaceholder`, `CameraSettingsForm`, `ExtraCameraContent`, `ExtraCameraForm`, `ExtraCameraSettingsStep`, `RtmpCopyButton`, `RtmpPlaceholder`, `RtmpSource`, `RtmpSourceContent`, `ScreenSharePreviewPopover`, `ScreenShareThumbnail`, `ScreenSharingButton`, `ScreenSharingModal`, `SourceControls`, `SourceIcon`, `SourceImageNewFunctionalityModal`, `SourceMaximizedAlert`, `SourceMenu`, `SourceOption`, `SourcesDeck`

#### Participants & guests (47)

`Avatar`, `AvatarItem`, `AvatarsModal`, `Guest` *, `GuestAddedSourceToast`, `GuestChat`, `GuestHeader`, `GuestPage`, `GuestPairsOnboardingPopover`, `GuestPlayerHeading`, `GuestSidebar`, `GuestSourcesPreview`, `GuestStreamStatusOverlay`, `GuestVirtualEventHeader`, `GuestVirtualEventsChat`, `GuestWaitingForHostStatusLabel`, `GuestWebinarActionButtons`, `GuestWebinarReplayPlayer`, `GuestWebinarWaitingOverlay`, `GuestsCountUpgradeTrigger`, `Host` *, `HostBanner`, `HostChat`, `HostEventHeader`, `HostEventRecordOnlyHeader`, `HostHeader`, `HostHeaderV2`, `HostPage`, `HostPlaylistHeader`, `HostRecordOnlyHeader`, `HostSidebar`, `HostSidebarV2`, `HostVideoSceneAutoSwitchMutedToast`, `HostVirtualEventHeader`, `HostVirtualEventsChat`, `InviteGuestLinkRefreshConfirmationModal`, `InviteGuestsButtonWithPopover`, `InviteGuestsMoreOptionsMenu`, `InviteGuestsPopover`, `InviteGuestsPopoverV2`, `InviteGuestsSourcesButtonWithPopover`, `ParticipantJoinedPopover`, `ParticipantNamesToggleControl`, `ParticipantScreenShareNamesToggleControl`, `ParticipantStatusIndicator`, `ParticipantsList`, `ParticipantsNamesIntroPopover`

#### Chat (18)

`ChatHint`, `ChatMessage`, `ChatMessagesComingSoonBanner`, `ChatOverlay`, `ChatOverlayControls`, `ChatOverlayCustomizationContent`, `ChatOverlayPreview`, `ChatOverlaySelect`, `ChatOverlaySliderControl`, `ChatOverlayToggleControl`, `ChatOverlayToolbar`, `ChatStatus`, `ChatTabs`, `ChatText`, `Message`, `MessageScreen`, `MessageScroller`, `Messages`

#### Media & presentations (43)

`HlsPlayerStatus`, `HlsVideoSourcePreview`, `ImageOption`, `ImageSelect`, `ImageUploadProcessingLoader`, `MediaPlaceholder`, `MediaSelect`, `MediaStreamAudioSourcePreview`, `MediaStreamBaseSourcePreview`, `MediaStreamEditAvatarControl`, `MediaStreamPreview`, `Player`, `PlayerControls`, `PlayerPreviewDndZone`, `PlaylistVideosDurationLimitExceededLabel`, `PlaylistsEventCountdown`, `PresentationCard`, `PresentationSourcePreview`, `PresentationsContent`, `SlideControls`, `Slider`, `SliderV2`, `SlidersButton`, `ThumbnailsLayoutCustomizationContent`, `ThumbnailsPreview`, `ThumbnailsPreviewsShapeControl`, `UploadPage`, `UploadingAvatarItem`, `UploadingRecordingsToast`, `VideoAutoSwitchNotification`, `VideoAutoSwitchToast`, `VideoClipPlayingToast`, `VideoClips`, `VideoMediaPlaceholderSource`, `VideoPlayerControls`, `VideoRecordingsCallouts`, `VideoSceneAutoSwitchToast`, `VideoSettingsForm`, `VideoSettingsModal`, `VideoStorageStepPublicUpload`, `VideoStorageToastContainer`, `VideoStorageVideoStep`, `VideoUploader`

#### Recording & clips (21)

`RecordModePauseControl`, `RecordModeRestartControl`, `RecordModeSwitchButtonWrapper`, `RecordOnlyTitle`, `RecordingBlock`, `RecordingBlockAccordion`, `RecordingButton`, `RecordingButtonWrapper`, `RecordingDot`, `RecordingDropDown`, `RecordingDropDownContent`, `RecordingDropDownPopover`, `RecordingPaidFeatureModal`, `RecordingSettingsContent`, `RecordingToggleDropdown`, `RecordingTrialEndedModal`, `RecordingTrialWarningModal`, `RecordingsSettings`, `RecordingsTrigger`, `RecordingsTriggerPopover`, `RecordingsUpgradeTrigger`

#### Audio (8)

`AudioItem`, `AudioOnlyOnboardingPopover`, `AudioOptionsPicker`, `MusicNewExperienceBanner`, `MusicStatus`, `VolumeControl`, `VolumeMeter`, `VolumeMuteControl`

#### Video effects (2)

`GreenScreenForm`, `VirtualBackgrounds`

#### Destinations & channels (3)

`Channels`, `StreamDetails`, `StreamSource`

#### Schedule & events (5)

`EventFinishedPage`, `EventPlaylistsButton`, `EventSummaryCard`, `Schedule`, `TimeDisplay`

#### Settings & shortcuts (18)

`Kbd`, `QualityIndicator`, `SettingsAccordionSection`, `SettingsBackToOldExperienceButton`, `SettingsButton`, `SettingsButtonWithPopover`, `SettingsDrodownButton`, `SettingsDropdown`, `SettingsInputField`, `SettingsModal`, `SettingsNewExperienceButton`, `SettingsSelect`, `SettingsSelectField`, `SettingsSliderField`, `SettingsTabButton`, `SettingsTogglikField`, `ShortcutRow`, `Shortcuts`

#### Billing & plans (3)

`UpgradeButton`, `UpgradePrompt`, `UpgradePromptCard`

#### Dialogs & shells (10)

`Header`, `HeaderCoBrandingTitle`, `HeaderGoProButton`, `HeaderMobile`, `HeaderRecordingName`, `HeaderScheduledTime`, `HeaderStreamTitle`, `Popover`, `Popper`, `Tabs`

#### UI primitives (14)

`ButtonSegment`, `ButtonTooltipContent`, `ButtonWithTooltip`, `ProgressBar`, `SelectDestinationPopover`, `SkeletonLayoutControls`, `SkeletonScenes`, `SkeletonSources`, `SwitchControl`, `Toast`, `ToggleCamera`, `ToggleIcon`, `ToggleMicrophone`, `ToggleScenesNotes`

#### Other (246)

`AccessingCamera`, `ActionButtons`, `ActiveToolStatus`, `AddAvatarItem`, `AddChannelsPlaceholderButton`, `AddFirstDestinationPopover`, `AddNameButton`, `AddSceneActions`, `AddSceneActionsMenu`, `AddSceneButton`, `AddScreenSharePlaceholder`, `AddScreenSharePopover`, `AddSourceButton`, `AddSourceButtonWithPopover`, `AddSourceHomeStep`, `AddSourceModal`, `AddSourcePopover`, `AddVideoCard`, `AllowCameraPermission`, `AlreadyStreamingPopover`, `AnimatedPlayIcon`, `AnimatedResetIcon`, `AnimatedStarsIcon`, `Attachments`, `AttendeeRow`, `AttendeesList`, `AttendeesPanel`, `AuthModal`, `AutoSwitchOnboardingPopover`, `AutoSwitchPromoPopover`, `Back`, `BackButton`, `BadJoinTokenPage`, `BaseDialog`, `BaseNotSupportedFeature`, `BaseStreamDescription`, `BaseTipModal`, `BlackFridayCampaignBanner`, `BlockedUrlPage`, `Bubble`, `CallInRequestsNotification`, `CannotJoinPage`, `ClientSources`, `ColorPicker`, `ColorSwatch`, `CommerceContainer`, `CompactVideoControl`, `Composer`, `ConnectExtraCameraDevice`, `ContainLayoutCustomizationContent`, `ContainLayoutSourceShapeControl`, `ContainPreview`, `CopyButton`, `CopyInput`, `CopyInviteLinkButton`, `CoverLayoutCustomizationContent`, `CoverPreview`, `CustomFontsNewExperienceBanner`, `CustomMusicContent`, `CustomMusicCopyrightWarningModal`, `CustomMusicDndZone`, `CustomMusicItem`, `CustomMusicItemMenu`, `CustomMusicList`, `CustomMusicNewFunctionalityModal`, `CustomMusicUploadButton`, `CustomizationLayoutElementTypeSwitch`, `CustomizationNotSupportedAlert`, `CustomizationResetButton`, `DefaultCaption`, `DelayedUnmountComponent`, `DeniedCameraPermission`, `DeprecatedBadge`, `DevAiSpendPanel`, `DevFloatingPanel`, `DevFormFromCodec`, `DevInputField`, `DevNumInputField`, `DevPositionPad`, `DevSceneEditingPresencePanel`, `DevSelectField`, `DevTogglikField`, `DndOverlayZone`, `DotsButton`, `DownloadDropdown`, `DraggableCaptionList`, `DraggableQrCodeList`, `DraggableQrCodeWrapper`, `DraggableScenesList`, `DraggableWrapper`, `DualOutputAddChannelsPlaceholderButton`, `DualOutputTrialModal`, `DualPreview`, `DualPreviewDestinations`, `DualStreamingNotSupportedStatusScreen`, `EcommerceCaption`, `EcommerceLayoutSwitchControl`, `EcommerceProductPurchasesCount`, `EcommerceProductViewsCount`, `EcommerceViewedAlert`, `EdgePositionControl`, `EditEventTitleModal`, `EditNameModal`, `EditRecordingNameModal`, `EditWidgetsButton`, `ElementControlMenu`, `ElementPositionSwitchControl`, `EndStreamConfirmationModal`, `EndStreamTriggerMobile`, `EndStreamTriggerScreen`, `EndStreamTriggerVariantB`, `EndWebinarConfirmationModal`, `ExceptionPage`, `FeedbackForm`, `FeedbackScreen`, `FinishSetup`, `FirstRecordingPopoverItem`, `FontSelect`, `FontSelectItem`, `FullscreenButton`, `GeneralSettingsForm`, `GoLiveWithChannelErrorsConfirmationModal`, `GoLiveWithEventsOverlapConfirmationModal`, `GoLiveWithoutChannelsConfirmationModal`, `GradientBorder`, `GraphicsContent`, `GraphicsDndZone`, `GraphicsElementControls`, `GraphicsSection`, `GraphicsSections`, `GraphicsUploadAction`, `HalfScreenAlignmentControl`, `HalfScreenLayoutCustomizationContent`, `HalfScreenPreview`, `InactivityWarningModal`, `Info`, `InfoTooltip`, `IntentChips`, `InteractionControols`, `JoinScreen`, `JumpingDots`, `LandscapeWarningModal`, `LightDropdownMenu`, `LiveClippingBadge`, `LiveClippingToggleRow`, `LiveStreamDuration`, `LiveStreamOrientationSwitch`, `Loader`, `LoadingBook`, `LoadingText`, `LocalCameraPlaceholder`, `LocalCameraPreview`, `LocalMediaStreamPreview`, `LocalRecordingFields`, `LocalRecordingIndicator`, `LocalVideoStep`, `LoginPage`, `MaxExtraCamerasLimitExceeded`, `MaximizeButton`, `MobileDownloadButton`, `MobileDrawer`, `MobileMenu`, `MobileMenuButton`, `MobileMenuContainer`, `MobileMenuV2`, `MobileRecordOnlyControls`, `MultipleSwitchControl`, `NewsCaption`, `NoAvatarItem`, `NotEnoughSourcesAlert`, `NotFoundPage`, `NotSupportedGenericBrowser`, `NotSupportedPage`, `NotSupportedSafariVideo`, `NotSupportediOSBrowser`, `OnboardingIntro`, `OnboardingOrbit`, `OnboardingPage`, `OnboardingTooltip`, `OpacityInput`, `OptionActions`, `OutgoingStreamModeSwitch`, `PaidGraphicPopperContent`, `PairsBadge`, `PendingViewerItem`, `PendingWebinarViewers`, `PermissionPopover`, `PictureInPicturePreview`, `PinnedMessagesButton`, `PinnedMessagesList`, `PositionPicker`, `PrivateChat`, `PrivateChatV2`, `ProfileSettingsForm`, `ReactFastMarque`, `RemoveOption`, `ResourcePicker`, `RestartRecordingConfirmationModal`, `RevealOnClickComponent`, `RoundedCaption`, `RunCountdownButton`, `SecondScreenShareWarningModal`, `SelfMutedIndicator`, `SessionControls`, `ShownMessagesList`, `ShowtimeAlignmentControl`, `ShowtimeLayoutCustomizationContent`, `ShowtimePreview`, `SimpleSlider`, `SimpleVideoControl`, `SlidingLimiter`, `SpookyCaption`, `Sprintf`, `StartWebinarConfirmationModal`, `StepTransition`, `StopRecordingConfirmationModal`, `StreamOverlay`, `StudioRecordingModal`, `SystemPromptDebugPanel`, `TbpnLayoutCustomizationContent`, `TbpnPreview`, `ThemePreviewButton`, `ThemeSelect`, `Togglik`, `TogglikField`, `ToolCallStatus`, `ToolChip`, `UnreadNotification`, `VerticalTabs`, `ViewersCount`, `ViewersCountPopover`, `VirtualEventMessage`, `VirtualEventMessages`, `WatchPlaylistsTutorial`, `WatchPlaylistsTutorialModal`, `WebinarAudienceJoinModal`, `WebinarAvatar`, `WebinarEventInfo`, `WebinarLiveCallInRequestToast`, `WebinarLiveCallModal`, `WebinarMoreOptionsMenu`, `WebinarSlackButton`, `WebinarUnavailablePage`, `WebinarViewerChatInput`, `WebinarViewerInviteToStudioToast`, `XmasCaption`


`*` = present only in CSS class names, absent from the recovered SCSS.

### 2.2 Every component with its elements

| component | elements | n |
|---|---|---:|
| `AccessingCamera` | `accessingText` `allowButton` `allowWebcamButtons` `isMinimal` `linkButton` `root` | 6 |
| `ActionButtons` | `actionButton` `actionButtonDesktopOnly` `actionButtonFinish` `actionButtonLeaveEvent` `actionButtonMobileIcon` `actionButtonPill` `actionButtonPillPrimary` `actionButtonText` `aside` `centered` `draftEventScheduleButton` `hidden` `hiddenOnMobile` `iconOnly` … | 31 |
| `ActiveToolStatus` | `label` `root` | 2 |
| `AddAvatarItem` | `background` `button` `icon` `image` `root` | 5 |
| `AddChannelsPlaceholderButton` | `icon` `root` `text` | 3 |
| `AddFirstDestinationPopover` | `header` `root` | 2 |
| `AddNameButton` | `root` | 1 |
| `AddSceneActions` | `menuPopover` `mobileMenuTitle` `mobileMenuWrapper` | 3 |
| `AddSceneActionsMenu` | `button` `buttonIcon` `buttonLabelNew` `isMenuMode` `root` | 5 |
| `AddSceneButton` | `addSceneButton` `addSceneButtonWrapper` `addSceneIcon` `addSceneText` `disabled` `iconOnly` `mobileLayout` | 7 |
| `AddScreenSharePlaceholder` | `hidden` `root` | 2 |
| `AddScreenSharePopover` | `dropdown` `dropdownItem` `hidden` `icon` `label` | 5 |
| `AddSourceButton` | `badge` `icon` `isActive` `isFullscreen` `root` `tooltip` | 6 |
| `AddSourceButtonWithPopover` | `badge` `button` `icon` `isActive` `isFullscreen` `isInactive` `menuPopover` `tooltip` | 8 |
| `AddSourceHomeStep` | `icon` `list` `option` `root` `title` | 5 |
| `AddSourceModal` | `root` | 1 |
| `AddSourcePopover` | `hidden` `isCollapsable` `root` `showMoreButton` `showMoreGroup` | 5 |
| `AddVideoCard` | `hidden` `plusIcon` `popoverContainer` `root` `tooltip` `tooltipContainer` | 6 |
| `AiChatMetrics` | `aiChatMetrics` `aiChatMetricsItem` `aiChatMetricsTool` `aiChatMetricsTooltip` `aiChatMetricsTrigger` | 5 |
| `AiSceneActivityShimmer` | `isActive` `isSweeping` `surfaceDark` `surfaceLight` `sweep` `sweepTrack` | 6 |
| `AirCaption` | `animatedContainer` `avatar` `centeredAuthor` `compactControls` `controls` `isEnterDone` `isFocused` `isPortrait` `isPreview` `overlay` `preview` `primary` `root` `secondary` … | 16 |
| `Alert` | `actionButton` `column` `description` `icon` `isBanner` `isInfo` `isInfoWarning` `isWarning` `lightSurface` `root` `title` `withTitle` | 12 |
| `AlertContainer` | `root` | 1 |
| `AllowCameraPermission` | `button` `canvas` `text` | 3 |
| `AlreadyStreamingPopover` | `icon` `root` `text` `title` | 4 |
| `AnimatedPlayIcon` | `icon` | 1 |
| `AnimatedResetIcon` | `root` | 1 |
| `AnimatedStarsIcon` | `icon` | 1 |
| `Attachments` | `image` `item` `placeholder` `placeholderIcon` `remove` `removeIcon` `strip` `thumb` `typeLabel` | 9 |
| `AttendeeRow` | `avatar` `info` `menuButton` `name` `root` `slackIcon` `status` `title` | 8 |
| `AttendeesList` | `countLabel` `emptyState` `emptyStateIcon` `list` `listInner` `listSection` `rowWrapper` | 7 |
| `AttendeesPanel` | `content` `copyButton` `inviteLine` `inviteText` `linkRow` `root` `upgradeCtaButton` `upgradeCtaIcon` `upgradeCtaText` `upgradeLink` | 10 |
| `AudioItem` | `button` `content` `exclusiveIconHover` `exclusiveIconWrapper` `icon` `isChristmasTheme` `isHalloweenTheme` `isValentinesTheme` `item` `loading` `neighbors` `premium` `root` `selected` … | 22 |
| `AudioOnlyOnboardingPopover` | `arrow` `closeButton` `header` `linkButton` `root` `text` `title` `titleWrapper` | 8 |
| `AudioOptionsPicker` | `bar` `barFill` `barsRow` `card` `cardHeader` `cardHeaderIcon` `cards` `header` `pickButton` `playPause` `player` `root` `skipButton` `tags` … | 18 |
| `AuthModal` | `container` `content` `footer` `footerButton` `form` `fromTitle` `root` `signupDisclaimer` `signupDisclaimerLink` | 9 |
| `AutoSwitchOnboardingPopover` | `bold` `closeButton` `closeButtonIcon` `contentRoot` `description` `descriptionList` `header` `image` `title` | 9 |
| `AutoSwitchPromoPopover` | `badge` `bold` `closeButton` `closeButtonIcon` `contentRoot` `description` `header` `image` `title` | 9 |
| `Avatar` | `fallback` `image` `root` | 3 |
| `AvatarItem` | `button` `buttonBackground` `close` `image` `root` | 5 |
| `AvatarsModal` | `baseDialog` | 1 |
| `Back` | `backButton` `chevron` | 2 |
| `BackButton` | `icon` `root` | 2 |
| `BackgroundAsset` | `applyButton` `applyOverlay` `footer` `logoLayout` `openIcon` `openLabel` `openRow` `preview` `previewGenerating` `previewLogoBackdrop` `previewLogoForeground` `previewMedia` `previewReveal` `previewRevealChild` … | 23 |
| `BackgroundMusicContainer` | `alert` `isMobile` | 2 |
| `BackgroundMusicContent` | `collapsableSection` `mobileLayout` | 2 |
| `BackgroundMusicList` | `root` `shouldShowMobileLayout` | 2 |
| `BadJoinTokenPage` | `button` `header` `heading` `root` | 4 |
| `BaseDialog` | `back` `close` `controlButton` `icon` | 4 |
| `BaseNotSupportedFeature` | `content` `icon` `root` | 3 |
| `BaseStreamDescription` | `description` `root` `title` | 3 |
| `BaseTipModal` | `button` `description` `media` `outlined` `title` | 5 |
| `BlackFridayCampaignBanner` | `content` `hiddenOnMobile` `hiddenOnTablet` `isCyberMonday` `mobileOnly` `root` `text` | 7 |
| `BlockedUrlPage` | `button` `header` `heading` `root` | 4 |
| `BrandFolderLogo` | `back` `front` `frontMaskClosed` `frontMaskOpen` `icon` `isActive` `root` | 7 |
| `BrandItem` | `action` `cancel` `dirty` `icon` `info` `input` `isActionable` `isAdding` `isBlurred` `isEditing` `isRemoving` `isSelectable` `isSelected` `name` … | 17 |
| `BrandLogo` | `image` `imageWrapper` `isActive` `root` | 4 |
| `Brands` | `popover` | 1 |
| `BrandsContent` | `addNewLogo` `divider` `isActive` `isAnotherActive` `root` `title` | 6 |
| `BrandsHead` | `canControl` `compactMode` `entity` `folderLogo` `icon` `iconContainer` `inline` `isHidden` `label` `leftStick` `logo` `name` `root` `textContainer` | 14 |
| `BrowserSourceContainer` | `iframeTransform` `isVisible` `moreOptionsMenu` `zoomButton` `zoomButtonIcon` `zoomControlsContainer` `zoomControlsWrapper` `zoomLabel` | 8 |
| `BrowserSourceThumbnail` | `root` | 1 |
| `Bubble` | `plain` `root` `tinted` | 3 |
| `ButtonSegment` | `dark` `fullscreen` `icon` `light` `root` `trigger` | 6 |
| `ButtonTooltipContent` | `hotkey` `key` `tooltip` | 3 |
| `ButtonWithTooltip` | `button` | 1 |
| `CallInRequestsNotification` | `arrow` `avatarWrapper` `avatars` `button` `root` `text` | 6 |
| `CameraPlaceholder` | `button` `buttonContent` `buttonIcon` `buttonText` `buttons` `content` `contentEnter` `contentEnterActive` `contentExit` `contentExitActive` `createdIcon` `heading` `selectButton` `spinnerIcon` | 14 |
| `CameraSettingsForm` | `field` `horisontalFieldset` `moreSettingsButton` `moreSettingsContainer` `secondaryFieldset` `settingsContainer` | 6 |
| `CannotJoinPage` | `button` `header` `heading` `root` | 4 |
| `CaptionAvatar` | `avatar` `platformIcon` `root` | 3 |
| `CaptionContainer` | `airBackground` `isShown` `root` | 3 |
| `CaptionForm` | `actionButton` `cancelButton` `counterContainer` `errors` `footer` `hasError` `input` `invalid` `isCaption` `limit` `textarea` | 11 |
| `CaptionOption` | `action` `actions` `actionsButton` `button` `contentWrapper` `dragHandle` `dragHandleIcon` `forceHide` `isDragging` `isListDragging` `isOpenDeleteConfirmation` `isOpenPopover` `isSelected` `primaryText` … | 16 |
| `CaptionSelect` | `addForm` `root` `scenesMode` | 3 |
| `CaptionsContent` | `info` `loader` `mobileLayout` `root` | 4 |
| `CaptionsSection` | `accordion` `addButton` `content` `contentWrapper` `heading` `info` `isExpanded` `left` `plainTitleWrapper` `plusIcon` `right` `root` `scenesMode` `title` … | 15 |
| `Channels` | `addChannelButton` `addChannelIcon` `addChannelsPlaceholderButton` `channelsLabel` `channelsScheduleWrapper` `channelsWrapper` `channelsWrapperNoChannels` `eventDestinationsSummary` `touch` | 9 |
| `ChatHint` | `body` `capability` `configuration` `icon` `message` `root` `source` `suggestion` | 8 |
| `ChatMessage` | `author` `avatar` `avatarWrapper` `button` `content` `dragHandle` `dragHandleIcon` `isDraggable` `isDragging` `isPinned` `label` `message` `overlay` `pinButton` … | 18 |
| `ChatMessagesComingSoonBanner` | `icon` `root` `text` | 3 |
| `ChatOverlay` | `chat` `chatContainer` `chatFrameInner` `fade-enter` `fade-enter-active` `fade-exit` `fade-exit-active` `hidden` `placeholder` `placeholderIcon` `placeholderText` `root` `settingsButtonContainer` | 13 |
| `ChatOverlayControls` | `active` `controlButton` `controlIcon` `demoButton` `demoButtonActive` `demoIcon` `demoIconContainer` `dropdown` `dropdownIcon` `dropdownItem` `dropdownLabel` `popover` `root` `selectContent` … | 18 |
| `ChatOverlayCustomizationContent` | `blink` `control` `loading` `previewContainer` `root` `sectionTitle` `select` `selectContent` `toggleSection` `toggleTitle` | 10 |
| `ChatOverlayPreview` | `chatContainer` `demoChatText` `footer` `header` `root` `sideText` `touchesBottom` `touchesLeft` `touchesRight` `touchesTop` | 10 |
| `ChatOverlaySelect` | `content` `group` `hidden` `item` `itemLoadingIndicator` `itemSelectedIndicator` `itemText` `label` `root` `selectScrollButton` `selectScrollButtonArrow` `separator` `tooltip` `tooltipTrigger` … | 21 |
| `ChatOverlaySliderControl` | `control` `controlContent` `controlLabel` | 3 |
| `ChatOverlayToggleControl` | `activeOption` `alignEnd` `control` `controlContent` `controlLabel` `inline` `inlineSwitch` `option` `optionContent` `optionText` `switch` | 11 |
| `ChatOverlayToolbar` | `root` | 1 |
| `ChatStatus` | `icon` `iconFailed` `label` `labelTerminal` `root` `spinner` | 6 |
| `ChatTabs` | `badge` `badgeHidden` `option` `root` `starIcon` `tabContent` `tabLabel` | 7 |
| `ChatText` | `image` | 1 |
| `ClientSources` | `controls` `header` `name` `participant` `qualityIndicator` `sources` | 6 |
| `ColorPicker` | `eyeDropper` `hex` `input` `inputWrapper` `isLight` `isOpen` `popover` `root` `scenesMode` `swatch` `swatches` | 11 |
| `ColorSwatch` | `isLight` `root` | 2 |
| `CommerceContainer` | `mobileLayout` `root` `scenesMode` `toggleWrapper` | 4 |
| `CompactVideoControl` | `bottom` `center` `controlButton` `controlIcon` `isShown` `muteButton` `muteButtonIcon` `root` `time` `timeline` `timelineContent` `timelineWrapper` `top` | 13 |
| `Composer` | `attachButton` `composer` `composerActions` `composerActionsLeft` `composerDock` `composerDragOver` `composerFileDrag` `composerFooter` `composerHint` `composerHintIcon` `composerHintIconGlyph` `composerHintShimmer` `composerHintText` `composerHintWarning` … | 60 |
| `ConnectExtraCameraDevice` | `button` `canvas` `text` | 3 |
| `ContainLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `root` `toggleControlContent` | 6 |
| `ContainLayoutSourceShapeControl` | `activeOption` `option` `optionContent` `root` `rotated` `shapeIcon` `switch` `tabletOrBelow` `userIcon` | 9 |
| `ContainPreview` | `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 5 |
| `CopyButton` | `copyIcon` `hidden` `icon` `iconContainer` `root` | 5 |
| `CopyInput` | `focused` `root` | 2 |
| `CopyInviteLinkButton` | `blue` `content` `contentEnter` `contentEnterActive` `contentExit` `contentExitActive` `copiedIcon` `createdIcon` `icon` `light` `root` `secondary` `spinnerIcon` `xIcon` | 14 |
| `Countdown` | `backdrop` `count` `invisible` `live` `portraitOrientation` `root` | 6 |
| `CountdownAutoSwitchToast` | `actionButton` `progress` | 2 |
| `CountdownBackgroundColorPicker` | `content` `currentColor` `currentColorButton` `defaultColorButton` `extraControls` `eyeDropperButton` `fullInput` `fullInputMode` `fullWidth` `hidden` `input` `isDefaultBackground` `isOpen` `label` … | 24 |
| `CountdownColorPicker` | `active` `autoColorButton` `content` `currentColor` `currentColorButton` `extraControls` `eyeDropperButton` `fullInput` `fullInputMode` `input` `inputWrapper` `isOpen` `label` `picker` … | 21 |
| `CountdownControls` | `countdownFrameInner` | 1 |
| `CountdownSceneOverlayContainer` | `bottomPosition` `countdownControls` `countdownControlsButtons` `countdownControlsContent` `countdownControlsIcon` `countdownControlsOverlay` `countdownCustomControls` `countdownFontControl` `countdownSizeControl` `forceRevealControls` `hasSmallControlsSpace` `isMedium` `isNotSelectedOverlay` `isPortraitOrientation` … | 16 |
| `CountdownSceneOverlayControls` | `active` `autoswitchIcon` `controlButton` `controlIcon` `musicIcon` `musicIconNotification` `musicIconNotificationSvg` `root` `selectContent` `uploadMusicButton` | 10 |
| `CountdownSceneOverlayControlsSelect` | `arrowIcon` `input` `inputBackground` `inputIcon` `inputText` `inputWrapper` | 6 |
| `CountdownToolbar` | `root` | 1 |
| `CoverLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `root` | 5 |
| `CoverPreview` | `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 5 |
| `CustomFontsNewExperienceBanner` | `isHidden` | 1 |
| `CustomMusicContent` | `collapsableSection` `mobileLayout` | 2 |
| `CustomMusicCopyrightWarningModal` | `actionButton` `baseDialog` `baseDialogWrap` `checkbox` `checkboxIcon` `checkboxInput` `checkboxLabel` `confirm` `confirmContainer` `icon` `iconOverlay` `iconWrapper` `isHidden` `link` … | 17 |
| `CustomMusicDndZone` | `contentWrapper` `isDraggedOver` `isDraggedOverBody` `overlay` `root` | 5 |
| `CustomMusicItem` | `actionConfirmationButton` `actionConfirmationIcon` `actionConfirmationIconWrapper` `actionConfirming` `brokenTrackIcon` `brokenTrackLabel` `controls` `deleteAction` `dragHandle` `dragHandleIcon` `dragWrapper` `draggable` `hidden` `isActive` … | 37 |
| `CustomMusicItemMenu` | `button` `buttonIcon` `buttonText` `isOpen` `menuButton` `menuPopover` `popover` `removeButton` | 8 |
| `CustomMusicList` | `musicList` `noMusicPlaceholderButton` `noMusicPlaceholderIcon` `noMusicPlaceholderText` `noMusicPlaceholderTitle` `root` | 6 |
| `CustomMusicNewFunctionalityModal` | `button` `buttons` `closeButton` `closeCrossButton` `content` `description` `hidden` `image` `root` `title` `tooltip` | 11 |
| `CustomMusicUploadButton` | `root` | 1 |
| `CustomizationLayoutElementTypeSwitch` | `activeOption` `optionContent` `optionTitle` `root` `switch` `tabletOrBelow` | 6 |
| `CustomizationNotSupportedAlert` | `hidden` `tooltip` `tooltipTrigger` | 3 |
| `CustomizationResetButton` | `root` | 1 |
| `DefaultCaption` | `animatedContainer` `avatar` `centeredAuthor` `compactControls` `controls` `isEnterDone` `isFocused` `isPortrait` `isPreview` `noBorder` `overlay` `preview` `primary` `root` … | 17 |
| `DelayedUnmountComponent` | `hidden` | 1 |
| `DeniedCameraPermission` | `button` `canvas` `description` `link` `text` | 5 |
| `DeprecatedBadge` | `badge` | 1 |
| `DevAiSpendPanel` | `body` `bodyToolbar` `clearButton` `collapsed` `creditsResetButton` `creditsRow` `creditsSummary` `empty` `error` `eventCost` `eventDetails` `eventDetailsLabel` `eventDetailsRow` `eventModel` … | 32 |
| `DevFloatingPanel` | `content` `draggable` `handleContainer` `handleIcon` `isActive` `modal` `modalContent` `root` `settingsButton` | 9 |
| `DevFormFromCodec` | `form` `sectionHeader` | 2 |
| `DevInputField` | `input` `inputContainer` `label` `root` | 4 |
| `DevNumInputField` | `controls` `input` `inputContainer` `inputDrag` `isDragging` `label` `root` `sliderBackdrop` | 8 |
| `DevPositionPad` | `dot` `info` `isDragging` `label` `pad` `padContainer` `root` | 7 |
| `DevSceneEditingPresencePanel` | `cell` `checkbox` `clear` `corner` `empty` `scene` `status` `table` `title` `user` | 10 |
| `DevSelectField` | `isSelected` `label` `option` `options` `root` | 5 |
| `DevTogglikField` | `controls` `label` `root` | 3 |
| `DndOverlayZone` | `isDraggedOver` `root` | 2 |
| `DotsButton` | `icon` `isActive` `root` | 3 |
| `DownloadDropdown` | `chevron` `content` `menuIcon` `menuItem` `menuItemDescription` `menuItemText` `menuItemTitle` `menuItemTitleRow` `newBadge` `popover` `trigger` `triggerLabel` `triggerOpen` `upgradeBadge` | 14 |
| `DraggableCaptionList` | `listContainer` | 1 |
| `DraggableQrCodeList` | `listContainer` | 1 |
| `DraggableQrCodeWrapper` | `container` | 1 |
| `DraggableScenesList` | `listContainer` | 1 |
| `DraggableWrapper` | `container` `noMargin` | 2 |
| `DualOutputAddChannelsPlaceholderButton` | `addButton` `root` `section` `sectionIcon` | 4 |
| `DualOutputTrialModal` | `body` `closeButton` `ctaButton` `ctaRow` `featureIcon` `featureItem` `featureList` `featureSection` `featureTitle` `footerEmphasis` `footerText` `header` `root` `skipButton` … | 18 |
| `DualPreview` | `addChannelsButton` `addChannelsButtonIcon` `addChannelsButtonLabel` `addChannelsButtonLabelFull` `column` `columnsWrapper` `contentWrapper` `hiddenLivePreview` `hideButton` `landscape` `landscapeTitleCell` `overlayHideButton` `overlayIcon` `portrait` … | 31 |
| `DualPreviewDestinations` | `addChannelsLabel` `addChannelsLabelText` `destinationsButton` `eventDestinationsSummary` `plusIcon` | 5 |
| `DualStreamingNotSupportedStatusScreen` | `button` `buttonRow` `content` `description` `header` `heading` `icon` `root` `rowButton` `upgradeButton` `upgradeButtonContent` | 11 |
| `EcommerceCaption` | `animatedContainer` `content` `decreased` `description` `effect` `interaction` `interactionOverlay` `interactionPrimaryButton` `interactiveControls` `interactiveControlsContainer` `isPortrait` `level` `line` `lines` … | 31 |
| `EcommerceLayoutSwitchControl` | `leftOption` `optionButton` `optionIcon` `root` `selectedOption` `sidebarMode` `sidebarOption` `sidebarOptionText` `switchContent` | 9 |
| `EcommerceProductPurchasesCount` | `icon` `root` | 2 |
| `EcommerceProductViewsCount` | `icon` `root` | 2 |
| `EcommerceViewedAlert` | `content` `effect` `icon` `line` `lines` `message` `root` | 7 |
| `EdgePositionControl` | `cell` `flippedY` `icon` `root` `rotatedCCW` `rotatedCW` `selected` | 7 |
| `EditEventTitleModal` | `baseDialog` `button` `buttonsSection` `form` `red` `root` `textInput` `textLengthHint` `title` | 9 |
| `EditNameModal` | `baseDialog` `button` `buttonsSection` `fieldLabel` `fieldLabelOptional` `form` `red` `root` `textInput` `textLengthHint` `title` | 11 |
| `EditRecordingNameModal` | `baseDialog` `buttonsSection` `cancelButton` `form` `inputLabel` `red` `root` `submitButton` `textInput` `textLengthHint` `title` | 11 |
| `EditWidgetsButton` | `button` `icon` `isActive` `root` | 4 |
| `ElementControlMenu` | `popoverButton` `popoverButtonIcon` `popoverButtonShortcut` `popoverButtonText` `switchButton` `switchButtonIcon` `switchPopover` | 7 |
| `ElementPositionSwitchControl` | `logoPositionOption` `newBadge` `optionIcon` `root` `sidebarMode` `switchContent` | 6 |
| `EndStreamConfirmationModal` | `baseDialog` `buttons` `confirmButton` `dismissButton` `eventCard` `root` `subtitle` `title` | 8 |
| `EndStreamTriggerMobile` | `heading` `headingConfetti` `root` `upgradeButton` | 4 |
| `EndStreamTriggerScreen` | `closeButton` `contentContainer` `mobile` `root` `skipButton` `variantA` | 6 |
| `EndStreamTriggerVariantB` | `checkIcon` `heading` `image` `list` `root` `upgradeButton` | 6 |
| `EndWebinarConfirmationModal` | `baseDialog` `buttons` `confirmButton` `dismissButton` `eventCard` `note` `root` `subtitle` `title` | 9 |
| `EventFinishedPage` | `header` `heading` `root` | 3 |
| `EventPlaylistsButton` | `hidden` `icon` `isShown` `loader` `noMargin` `primary` `root` `text` | 8 |
| `EventSummaryCard` | `badge` `badgeIcon` `cover` `details` `divider` `meta` `root` `time` `title` | 9 |
| `ExceptionPage` | `content` `heading` `root` `supportLink` | 4 |
| `ExtraCameraContent` | `content` `root` `title` | 3 |
| `ExtraCameraForm` | `button` `preview` | 2 |
| `ExtraCameraSettingsStep` | `button` `root` `title` `togglikField` | 4 |
| `FeedbackForm` | `button` `input` `root` | 3 |
| `FeedbackScreen` | `contentContainer` `heading` `ratingButton` `ratingButton--bad` `root` `skipButton` | 6 |
| `FinishSetup` | `body` `finishButton` `finishIcon` `footer` `header` `headerIcon` `headerLabel` `keepChattingButton` `root` `summary` | 10 |
| `FirstRecordingPopoverItem` | `firstRecordingContentItem` `firstRecordingContentItemHeader` `firstRecordingContentItemIconContainer` `firstRecordingContentItemText` | 4 |
| `FontSelect` | `content` `group` `header` `hidden` `label` `root` `selectScrollButton` `selectScrollButtonArrow` `separator` `tooltip` `tooltipTrigger` `topArrow` `trigger` `triggerArrow` … | 18 |
| `FontSelectItem` | `item` `itemLoadingIndicator` `itemSelectedIndicator` `itemText` `newBadge` | 5 |
| `Frame` | `content` `contentClip` `dragOverlay` `guideHorizontal` `guideVertical` `isHighlighted` `isInteractive` `isSelected` `noChrome` `resizeHandle` `resizeHandleBottom` `resizeHandleBottomLeft` `resizeHandleBottomRight` `resizeHandleDebug` … | 30 |
| `FullscreenButton` | `button` `isEntered` `root` | 3 |
| `GeneralSettingsForm` | `isUpgrade` `nameTitleRow` `root` `tip` `upgradeLink` | 5 |
| `GoLiveWithChannelErrorsConfirmationModal` | `baseDialog` `buttons` `channelsList` `confirmButton` `content` `root` `title` | 7 |
| `GoLiveWithEventsOverlapConfirmationModal` | `baseDialog` `baseDialogWrap` `buttons` `confirmButton` `content` `dismissButton` `root` `title` | 8 |
| `GoLiveWithoutChannelsConfirmationModal` | `baseDialog` `buttons` `confirmButton` `content` `dismissButton` `root` `title` | 7 |
| `GradientBorder` | `content` `root` | 2 |
| `GraphicsContent` | `editGlobalThemeButton` `editGlobalThemeButtonContainer` `hidden` `mobileLayout` | 4 |
| `GraphicsDndZone` | `contentWrapper` `isDraggedOver` `isDraggedOverBody` `overlay` `root` | 5 |
| `GraphicsElementControls` | `button` `buttonLabel` `defaultButtonLabel` `icon` | 4 |
| `GraphicsSection` | `accordion` `badge` `content` `contentWrapper` `heading` `isCompactMode` `isExpanded` `left` `root` `section` `triangleArrowIcon` | 11 |
| `GraphicsSections` | `alert` `backgroundImages` `componentOffset` `defaultGraphicsToggleSection` `fontSelectContent` `hidden` `isWithHalloween` `newBadge` `overlayImages` `primaryColorSubSection` `section` `specialEventFontSuggestionButton` `stingers` `subSection` … | 19 |
| `GraphicsUploadAction` | `button` `hide` `plusIcon` | 3 |
| `GreenScreenForm` | `button` `confirmationBox` `confirmationBoxIcon` `confirmationBoxSection` `label` `link` `tip` | 7 |
| `Guest` | `dialogToastContainer` `mainToastContainer` `root` | 3 |
| `GuestAddedSourceToast` | `actionLinkButton` | 1 |
| `GuestChat` | `iframe` `placeholder` `placeholderIcon` `placeholderText` `root` | 5 |
| `GuestHeader` | `center` `destinations` `destinationsLoading` `destinationsPlaceholder` `destinationsPlaceholderText` `divider` `left` `logo` `right` `root` `scheduledTime` `studioLogo` `studioLogoActive` `title` … | 15 |
| `GuestPage` | `controls` `controlsPanel` `fakeControls` `header` `isFullscreen` `isHidden` `isJoinScreen` `isUniversalHeader` `isWebinarPreview` `noPrivateChat` `player` `privateChat` `privateChatV2` `root` … | 24 |
| `GuestPairsOnboardingPopover` | `bold` `closeButton` `closeButtonIcon` `contentRoot` `description` `linkButton` `title` | 7 |
| `GuestPlayerHeading` | `divider` `heading` `logo` `root` `title` | 5 |
| `GuestSidebar` | `button` `chatContainer` `chatIframe` `guestPageV2` `iconLabel` `root` `sourcesDeck` `sourcesDeckTab` `sourcesDeckTabContent` `tabComposition` `tabHeader` `tabHeaderCloseButton` `tabSonarIndicator` `unreadMessages` … | 15 |
| `GuestSourcesPreview` | `button` `highlightAnimation` `isGreyedOut` `noPermissionsContainer` `participantInfo` `participantName` `participantStatus` `root` `sourcePreview` `sourcesCount` `sourcesCountContainer` `video` `videoContainer` | 13 |
| `GuestStreamStatusOverlay` | `background` `content` `eventOwner` `eventOwnerAvatar` `eventOwnerAvatarText` `eventOwnerName` `eventTitle` `header` `noPointerEvents` `root` | 10 |
| `GuestVirtualEventHeader` | `divider` `left` `right` `root` `title` | 5 |
| `GuestVirtualEventsChat` | `message` `messagesList` | 2 |
| `GuestWaitingForHostStatusLabel` | `content` `contentText` `root` | 3 |
| `GuestWebinarActionButtons` | `bottom` `secondary` | 2 |
| `GuestWebinarReplayPlayer` | `closeButton` `error` `errorTitle` `player` `root` | 5 |
| `GuestWebinarWaitingOverlay` | `actionSlot` `background` `calendarPlusIcon` `content` `countdownText` `countdownValue` `eventOwner` `eventOwnerAvatar` `eventOwnerAvatarText` `eventOwnerName` `eventSchedule` `eventScheduleIcon` `eventTitle` `header` … | 24 |
| `GuestsCountUpgradeTrigger` | `link` | 1 |
| `HalfScreenAlignmentControl` | `activeOption` `option` `optionContent` `optionIcon` `root` `switch` `tabletOrBelow` | 7 |
| `HalfScreenLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `controlLandscapeOnlyLabel` `root` | 6 |
| `HalfScreenPreview` | `alignRight` `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 6 |
| `Header` | `backIconWrapper` `badge` `logoWrapper` `restreamWordmark` `root` | 5 |
| `HeaderCoBrandingTitle` | `divider` `eventTitle` `isExtended` `logoIcon` `logoLink` `logoTitle` `root` | 7 |
| `HeaderGoProButton` | `gradientButton` `gradientButtonContent` `gradientButtonText` | 3 |
| `HeaderMobile` | `mobileLiveEndAnchor` `mobileLiveMenuAnchor` `mobileLiveViewportCenter` `mobileLiveViewportCenterContent` `mobileLiveViewportRow` | 5 |
| `HeaderRecordingName` | `clickable` `editButton` `subtitle` `title` `titleWrapper` | 5 |
| `HeaderScheduledTime` | `icon` `label` `root` | 3 |
| `HeaderStreamTitle` | `clickable` `editButton` `subtitle` `title` `titleWrapper` | 5 |
| `HlsPlayerStatus` | `root` | 1 |
| `HlsVideoSourcePreview` | `controls` `remainedTime` `remainedTimeTooltip` `root` `seekBar` `videoPlayerControls` `volumeControl` | 7 |
| `Host` | `dialogToastContainer` `mainToastContainer` `root` | 3 |
| `HostBanner` | `content` `dismissButton` `dismissIcon` `dismissible` `error` `icon` `linkButton` `root` `slackStreaming` `text` | 10 |
| `HostChat` | `chatContainer` `chatIframe` `chatIframeContainer` `chatOptions` `chatOptionsRight` `chatSettingsButton` `chatSettingsButtonActive` `chatSettingsIcon` `chatTabsContainer` `comingSoonBanner` `emptyState` `fade-enter` `fade-enter-active` `fade-exit` … | 27 |
| `HostEventHeader` | `addChannelsPlaceholderButton` `endedEventTip` `eventCountdown` `eventCountdownText` `eventDestinationsSummary` `eventDestinationsSummaryWrapper` `hidden` `root` `tooltip` `withBFCMBanner` | 10 |
| `HostEventRecordOnlyHeader` | `centerDescription` `centerText` `downloadRecordingsButton` `recordingName` `recordingTriggerWrapper` `root` `withAnimationDelay` `withBFCMBanner` | 8 |
| `HostHeader` | `destinationsSummary` `groupItem` `hidden` `isDestinationPopoverOpen` `recordingTriggerWrapper` `root` `tooltip` | 7 |
| `HostHeaderV2` | `centerLogoAndStatus` `hidden` `isLive` `isSmall` `root` | 5 |
| `HostPage` | `brands` `controls` `controlsFloating` `controlsLeftPart` `controlsNoWrap` `enter` `enterActive` `exit` `exitActive` `fakeControls` `headerV2Mobile` `hidden` `hideSourceDeck` `isFullscreen` … | 33 |
| `HostPlaylistHeader` | `downloadRecordingsButton` `endedEventTip` `eventDestinationsSummary` `eventDestinationsSummaryPlaceholder` `eventDestinationsSummaryText` `eventDestinationsSummaryWrapper` `hidden` `noRightMargin` `playlistCountdown` `playlistCountdownText` `recordingTriggerWrapper` `root` `tooltip` `viewStreamButtonWrapper` | 14 |
| `HostRecordOnlyHeader` | `groupItem` `recordingTriggerWrapper` `root` | 3 |
| `HostSidebar` | `animate` `attendeesTabContent` `badge` `badgeGroup` `chatUnreadMessagesNotification` `chatUnreadMessagesNotificationIcon` `content` `customMusicNewEnterActive` `customMusicNewExitActive` `decreasedSize` `disableCornerShadows` `greenBadge` `guestsUnreadMessagesNotificationIcon` `halloween2023Icon` … | 73 |
| `HostSidebarV2` | `animate` `attendeesTabContent` `badge` `badgeGroup` `chatUnreadMessagesNotification` `chatUnreadMessagesNotificationIcon` `content` `customIntercomButton` `customMusicNewEnterActive` `customMusicNewExitActive` `decreasedSize` `disableCornerShadows` `greenBadge` `guestsUnreadMessagesNotificationIcon` … | 69 |
| `HostVideoSceneAutoSwitchMutedToast` | `linkButton` | 1 |
| `HostVirtualEventHeader` | `endedEventTip` `root` | 2 |
| `HostVirtualEventsChat` | `hideChatMessageButton` `hideChatMessageButtonContainer` `message` `messagesList` `root` `selected` `slide-in-enter` `slide-in-enter-active` `slide-in-exit` `slide-in-exit-active` | 10 |
| `ImageOption` | `action` `button` `button--isSelected` `buttonTooltipTrigger` `failedIcon` `hiddenTooltip` `isCover` `isLight` `new` `progressBar` `removeButton` `root` | 12 |
| `ImageSelect` | `container` `dropzone` `gridItem` `hide` `isLight` `loader` `root` `scenesMode` `uploadButton` | 9 |
| `ImageUploadProcessingLoader` | `isCompact` `progressBar` `root` `title` | 4 |
| `InactivityWarningModal` | `baseDialog` `description` `root` `timer` `title` | 5 |
| `Info` | `icon` `tooltip` | 2 |
| `InfoTooltip` | `icon` `root` `tooltip` `warning` | 4 |
| `IntentChips` | `chip` `root` | 2 |
| `InteractionControols` | `bottom` `bottomRight` `button` `buttonText` `center` `content` `cursorGrab` `delayShow` `disableShadow` `forceShow` `icon` `iconAction` `interactionButton` `isSelectedOverlay` … | 26 |
| `InviteGuestLinkRefreshConfirmationModal` | `baseDialog` `buttons` `confirmButton` `content` `dismissButton` `root` `title` | 7 |
| `InviteGuestsButtonWithPopover` | `icon` `isActive` `isFullscreen` `root` | 4 |
| `InviteGuestsMoreOptionsMenu` | `active` `confirmationButtonfocus-visible` `confirmationButtons` `confirmationItem` `content` `menuItem` `menuItemButton` `moreOptionsButton` `popover` `withConfirmation` | 10 |
| `InviteGuestsPopover` | `hasPairs` `hasPairsToggle` `headerLoader` `hint` `noPairsToggle` `popover` `refreshButton` `refreshLoader` `root` `title` `upgrade` | 11 |
| `InviteGuestsPopoverV2` | `content` `contentButtons` `copyInput` `copyInputActionButton` `copyInputActionButtonAnimated` `copyInputActionButtonPrimary` `header` `headerLoader` `isHidden` `isUpgrade` `noBorderRadius` `noBottomPadding` `pairs` `pairsToggle` … | 23 |
| `InviteGuestsSourcesButtonWithPopover` | `inviteGuestsButton` `inviteGuestsIcon` `inviteGuestsText` `newStyle` `plusIcon` | 5 |
| `JoinScreen` | `actionBox` `actionSmallHint` `actionSmallText` `avatar` `avatarImage` `avatarText` `box` `boxContainer` `boxEnter` `boxEnterActive` `boxExit` `boxExitActive` `boxTransition` `button` … | 63 |
| `JumpingDots` | `dot1` `dot2` `dot3` | 3 |
| `Kbd` | `group` `kbd` | 2 |
| `LandscapeWarningModal` | `goLiveButton` `modalBody` `modalFooter` `modalHeaderSubtitle` `modalHeaderTitle` `root` `switchToPortraitButton` `video` | 8 |
| `LayoutFunction` | `controls` `root` `source` `sourceContainer` `withBlur` `withControls` | 6 |
| `LayoutHlsVideo` | `animationContainer` `autoSwitchNotificationWrapper` `canvas` `clickable` `controls` `cover` `customizationActive` `draggable` `fade-enter` `fade-enter-active` `fade-exit` `fade-exit-active` `isDragged` `isDraggedOver` … | 37 |
| `LayoutHlsVideoPlayer` | `overlay` `player` `playerContainer` `root` | 4 |
| `LayoutImage` | `cropContainer` `image` `root` `sourceContainer` | 4 |
| `LayoutLocalVideo` | `animationContainer` `canvas` `clickable` `controls` `cover` `customizationActive` `draggable` `isDragged` `isDraggedOver` `isFocused` `isShown` `noBottomBorder` `noPadding` `root` … | 18 |
| `LayoutMediaPlaceholder` | `clickable` `controls` `cover` `customizationActive` `draggable` `fadeEnter` `fadeEnterActive` `fadeExit` `fadeExitActive` `hidden` `isDragged` `isDraggedOver` `isFocused` `mediaPlaceholder` … | 20 |
| `LayoutMediaStream` | `canvas` `clickable` `controls` `cover` `customizationActive` `draggable` `editAvatarControl` `isDragged` `isDraggedOver` `isFocused` `isMirrored` `root` `selfMutedIndication` `sourceContainer` | 14 |
| `LayoutParticipantNameImage` | `compactControls` `controlsButtonLabel` `controlsOverlay` `cropContainer` `image` `root` `showControlLabels` `sourceContainer` | 8 |
| `LayoutPresentation` | `clickable` `controls` `cover` `customizationActive` `draggable` `fixedToLeft` `hoverBlur` `isActive` `isDragged` `isDraggedOver` `isFocused` `isShown` `presentation` `presentationControls` … | 19 |
| `LayoutPresentationSlideControls` | `activePage` `buttonIcon` `forwardButton` `hidden` `info` `infoWrapper` `option` `root` `select` `selectArrow` `selectBackground` `selectWrapper` `tooltip` `totalPages` | 14 |
| `LayoutPresentationSource` | `imageLoader` `rootEnter` `rootEnterActive` `rootExit` `rootExitActive` `status` `statusEnter` `statusEnterActive` `statusExit` `statusExitActive` `statusFilename` `statusRoot` `statusText` | 13 |
| `LayoutPreview` | `root` `withShadow` | 2 |
| `LayoutPreviewGenericControls` | `audioOnlyItem` `bottomCentralButtons` `button` `buttonIcon` `buttonNewBadge` `buttonTitle` `contentEnter` `contentEnterActive` `contentExit` `contentExitActive` `customizeButton` `customizeButtonWrapper` `divider` `dropdown` … | 47 |
| `LayoutPreviewItem` | `root` | 1 |
| `LayoutPreviewSelfMutedIndication` | `indicationContainer` `isHidden` `root` `selfMutedIndicator` `selfMutedIndicatorIcon` `selfMutedIndicatorRoot` | 6 |
| `LayoutRtmpSource` | `canvas` `clickable` `controls` `cover` `customizationActive` `draggable` `isDragged` `isDraggedOver` `isFocused` `root` `sourceContainer` | 11 |
| `LayoutSourceImage` | `clickable` `controls` `cover` `customizationActive` `draggable` `hoverBlur` `image` `isDragged` `isDraggedOver` `isFocused` `root` `sourceContainer` `withBlur` `withShadow` | 14 |
| `LayoutSourceImageSource` | `inProgressImage` `rootEnter` `rootEnterActive` `rootExitActive` `shouldHide` `shouldRevealProgress` `source` `status` `statusEnter` `statusExit` `statusExitActive` `statusFilename` `statusRoot` `statusText` … | 15 |
| `LayoutSwitch` | `active` `button` `buttonContainer` `buttonWrapper` `compact` `hidden` `icon` `layoutCustomizationButton` `layoutModifiedBadge` `newBadge` `portrait` `root` `scrollRoot` `scrollViewport` … | 16 |
| `LayoutVideoMediaPlaceholder` | `clickable` `customizationActive` `draggable` `sourceContainer` `withBlur` `withTransparency` | 6 |
| `LightDropdownMenu` | `checkboxItem` `content` `hasIcon` `isBoxCheck` `isDanger` `isPersistent` `item` `label` `radioItem` `separator` `subTrigger` | 11 |
| `LiveClippingBadge` | `badge` | 1 |
| `LiveClippingToggleRow` | `infoIcon` `infoTrigger` `liveContent` `liveIcon` `liveRoot` `liveSubtitle` `liveSubtitleLink` `liveTitleRow` `settingsLabel` `settingsToggleRow` `tooltipContent` `tooltipLink` | 12 |
| `LiveStreamDuration` | `root` | 1 |
| `LiveStreamOrientationSwitch` | `active` `button` `buttonContainer` `hidden` `root` `tooltip` | 6 |
| `Loader` | `ring` | 1 |
| `LoadingBook` | `book` `isCompactMode` `page` `root` | 4 |
| `LoadingText` | `root` | 1 |
| `LocalCameraPlaceholder` | `avatar` `root` | 2 |
| `LocalCameraPreview` | `localPreview` | 1 |
| `LocalMediaStreamPreview` | `isLoading` `isNonPlayable` `loader` `root` | 4 |
| `LocalRecordingFields` | `container` `field` | 2 |
| `LocalRecordingIndicator` | `check` `content` `dot` `error` `loader` `root` `text` | 7 |
| `LocalVideoStep` | `actionButton` `checkbox` `checkboxIcon` `checkboxInput` `checkboxLabel` `confirm` `confirmContainer` `icon` `iconOverlay` `iconWrapper` `isHidden` `link` `root` `subtitle` … | 15 |
| `LoginPage` | `root` | 1 |
| `LogoAndStatus` | `elapsedTime` `logoAndStatus` `logoContainer` `resolutionIndicator` `scheduledCountdown` `scheduledCountdownContainer` `scheduledCountdownValue` `statContainer` `studioLogo` `studioLogoActive` `studioLogoCompact` | 11 |
| `MaxExtraCamerasLimitExceeded` | `button` `canvas` `text` | 3 |
| `MaximizeButton` | `icon` `isActive` `root` | 3 |
| `MediaPlaceholder` | `addSourcesButton` `buttonText` `buttons` `content` `heading` `hidden` `icon` `smallestButtonText` `tooltipTrigger` | 9 |
| `MediaSelect` | `checkbox` `content` `dark` `fullscreen` `highlight` `item` `itemText` `overlay` | 8 |
| `MediaStreamAudioSourcePreview` | `exclusiveButton` `exclusiveContainer` `mediaStream` `topLeft` `volumeControl` | 5 |
| `MediaStreamBaseSourcePreview` | `linkButton` `mediaStream` `oldProgressBar` `pairsBadge` `slider` `videoPlayerControls` `volumeControl` `warning` `withVideoControls` | 9 |
| `MediaStreamEditAvatarControl` | `editAvatarButton` `editAvatarText` `largeSourceEditAvatarButton` `lightGradient` `root` | 5 |
| `MediaStreamPreview` | `grayscaleVideo` `isHidden` `isMirrored` `loaderBackground` `loaderBackgroundVisible` | 5 |
| `Message` | `alignEnd` `author` `isFullscreen` `me` `message` `others` `root` `text` | 8 |
| `MessageScreen` | `button` `buttons` `gradientButton` `gradientButtonContent` `gradientButtonText` `messageScreen` `outlinedButton` `primary` | 8 |
| `MessageScroller` | `button` `content` `root` `spacer` `viewport` `viewportScrolledFromBottom` `viewportScrolledFromTop` | 7 |
| `Messages` | `bottom` `description` `isFullscreen` `noMessages` `noMessagesContainer` `root` | 6 |
| `MobileDownloadButton` | `icon` `menuIcon` `menuItem` `menuItemButton` `menuItemDescription` `menuItemText` `menuItemTitle` `menuItemTitleRow` `menuList` `shimmerIcon` `triggerButton` | 11 |
| `MobileDrawer` | `chevron` `drawerBackButton` `drawerBackdrop` `drawerCloseCircle` `drawerContent` `drawerHandle` `drawerLogoMark` `drawerMenuRow` `drawerMenuRowChevron` `drawerMenuRowEnd` `drawerMenuRowLabel` `drawerMenuRowValueMuted` `drawerPopup` `drawerTopBar` … | 16 |
| `MobileMenu` | `brandOption` `brandsHead` `button` `buttonBadge` `hidden` `mainOptions` `option` `options` | 8 |
| `MobileMenuButton` | `badge` `icon` `isFullscreen` `isInactive` `isLight` `notification` `root` | 7 |
| `MobileMenuContainer` | `close` `content` `icon` `isOpen` `mask` `menu` `title` | 7 |
| `MobileMenuV2` | `backdrop` `closeButton` `content` `handle` `header` `hidden` `infoText` `localRecordingDrawers` `menuAction` `menuActionButton` `menuActionChevron` `menuActionLabel` `menuActions` `modeLabel` … | 46 |
| `MobileRecordOnlyControls` | `isPaused` `root` `spinner` | 3 |
| `MultipleSwitchControl` | `disabled` `hidden` `light` `option` `optionContainer` `root` `tooltip` | 7 |
| `MusicNewExperienceBanner` | `isHidden` | 1 |
| `MusicStatus` | `backgroundMusicNotificationIcon` `musicPausedIcon` `musicPausedNotification` `root` | 4 |
| `NewsCaption` | `animatedContainer` `avatar` `centeredAuthor` `compactControls` `contentText` `controls` `isEnterDone` `isFocused` `isFullWidth` `isPortrait` `isPreview` `overlay` `preview` `primaryText` … | 17 |
| `NoAvatarItem` | `abbreviation` `background` `button` `placeholder` `root` | 5 |
| `NotEnoughSourcesAlert` | `animatedAlert` `linkButton` | 2 |
| `NotFoundPage` | `button` `heading` `root` | 3 |
| `NotSupportedGenericBrowser` | `browser` `browserLink` `browserTitle` `browsers` `heading` `root` `text` | 7 |
| `NotSupportedPage` | `root` | 1 |
| `NotSupportedSafariVideo` | `root` | 1 |
| `NotSupportediOSBrowser` | `block` `heading` `indents` `laptopIcon` `linkIcon` `list` `listItem` `root` `safariIcon` `shareMoreIcon` `text` | 11 |
| `OnboardingChat` | `chatContent` `chatScroller` `configWarning` `emptyState` `emptyStateAction` `emptyStateActionArrow` `emptyStateActionIcon` `emptyStateActionLabel` `emptyStateActions` `emptyStateBody` `emptyStateHeader` `emptyStateMarkIcon` `emptyStateStart` `emptyStateSuggestions` … | 43 |
| `OnboardingChatSkeleton` | `error` `errorMessage` `errorRetryButton` `root` `spinner` | 5 |
| `OnboardingIntro` | `debugPanelWrap` `divider` `form` `icon` `iconProduct` `input` `inputWrap` `inputWrapLoading` `kickstartButton` `label` `root` `submitIcon` `submitSpinner` | 13 |
| `OnboardingOrbit` | `card` `cardSelected` `item` `itemImage` `orbit` `scene` | 6 |
| `OnboardingPage` | `bottomGlow` `bottomGlowChatRevealed` `column` `footer` `logo` `root` `skipButton` `useHuntLinkButton` `useHuntLinkIcon` | 9 |
| `OnboardingTooltip` | `desc` `progress` `step` `title` | 4 |
| `OpacityInput` | `input` `inputContainer` `inputDrag` `isDragging` `root` | 5 |
| `OptionActions` | `alwaysOnScreen` `confirmationButton` `delete` `edit` `hide` `menu` `open` `root` `title` | 9 |
| `OutgoingStreamModeSwitch` | `aspectRatio` `betaBadge` `button` `buttonWithNotification` `checkboxCheckIcon` `checkboxItem` `chevronIcon` `chevronIconActive` `orientationIcon` `upgradeBadge` | 10 |
| `OverlayImage` | `in` `out` `root` `shouldCover` `visible` | 5 |
| `OverlayMode` | `root` | 1 |
| `OverlayModePage` | `root` | 1 |
| `OverlayVirtualEventsChat` | `root` | 1 |
| `PaidGraphicPopperContent` | `button` `heading` `root` `withBackgroundUrl` | 4 |
| `PairsBadge` | `root` | 1 |
| `ParticipantJoinedPopover` | `accept` `acceptGroup` `acceptGroupButton` `acceptMenuTrigger` `acceptMenuTriggerWrap` `acceptPrimary` `arrow` `arrowMotion` `arrowSvg` `avatar` `avatarFallback` `avatarOverflow` `avatarVideoContainer` `avatarVideoRoot` … | 30 |
| `ParticipantNamesToggleControl` | `activeOption` `alignEnd` `control` `controlContent` `controlLabel` `option` `optionContent` `optionText` `switch` | 9 |
| `ParticipantScreenShareNamesToggleControl` | `activeOption` `alignEnd` `control` `controlContent` `controlLabel` `option` `optionContent` `optionText` `switch` | 9 |
| `ParticipantStatusIndicator` | `avatar` `avatarImage` `avatarText` `avatarWrapper` `icon` `iconOverlay` `name` `root` `status` | 9 |
| `ParticipantsList` | `avatar` `avatarFallback` `avatarWrapper` `avatars` `participantsList` `title` | 6 |
| `ParticipantsNamesIntroPopover` | `badge` `bold` `closeButton` `contentRoot` `description` `header` `headerContent` `image` `title` | 9 |
| `PendingViewerItem` | `acceptButton` `actions` `hidden` `info` `item` `itemRow` `name` `question` `questionText` `rejectButton` `tooltip` | 11 |
| `PendingWebinarViewers` | `acceptAllButton` `clip` `content` `footer` `footerText` `header` `headerCount` `hidden` `list` `root` `tooltip` | 11 |
| `PermissionPopover` | `accept` `arrow` `button` `buttons` `close` `closeIcon` `description` `deviceIcon` `header` `microphoneIcon` `overlay` `popup` | 12 |
| `PictureInPicturePreview` | `compactMode` `fixToBottom` `fixToTop` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 7 |
| `PinnedMessagesButton` | `container` `fade-enter` `fade-enter-active` `fade-exit` `fade-exit-active` `hidden` `label` `pinnedCount` `root` `rotated` | 10 |
| `PinnedMessagesList` | `listContainer` `root` | 2 |
| `PipLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `controlLandscapeOnlyLabel` `root` `withTopLabelPosition` | 7 |
| `PipLayoutPositionModeControl` | `activeOption` `option` `optionContent` `optionText` | 4 |
| `Player` | `areControlsHidden` `background` `blackout` `controlsWrapper` `dualOutputTransition` `editAvatarButton` `flexColumn` `forceFullArea` `header` `hidden` `isChangingOrientation` `isDualOutput` `isFullscreen` `isGuestView` … | 42 |
| `PlayerControls` | `baseDialog` `dropdown` `inviteGuestsButtonContainer` `isFullscreen` `isGuestView` `justifyEnd` `justifyStart` `mobileMenuButton` `root` `screenSharingButtonContainer` `settings` | 11 |
| `PlayerPreviewDndZone` | `contentWrapper` `isDraggedOver` `isDraggedOverBody` `overlay` `root` | 5 |
| `PlaylistVideosDurationLimitExceededLabel` | `buttonLink` `root` `text` | 3 |
| `PlaylistsEventCountdown` | `countdown` `root` `text` | 3 |
| `Popover` | `arrow` `contentEnter` `contentEnterActive` `contentExit` `contentExitActive` `fitContent` `insideRcDialog` `popover` | 8 |
| `Popper` | `children` `contentEnter` `contentEnterActive` `contentExit` `contentExitActive` `root` | 6 |
| `PositionPicker` | `centerIcon` `container` `containerFree` `flippedX` `flippedY` `indicatorFree` `option` `positionIcon` `positionKnob` `rotatedCCW` `rotatedCW` `selected` | 12 |
| `PresentationCard` | `actionText` `actionsButton` `actionsMenuContainer` `aspectRatioContent` `aspectRatioParent` `description` `dropdown` `dropdownItem` `errorIcon` `errorState` `failedContainer` `isActionsPopoverOpen` `isFailed` `isLoading` … | 29 |
| `PresentationSourcePreview` | `failedContainer` `isDisabled` `isFocused` `loadingBorders` `loadingPlaceholder` `loadingPlaceholderContent` `loadingPlaceholderText` `overlay` `root` `slideControls` `thumbnail` | 11 |
| `PresentationsContent` | `button` `description` `driveButton` `emptyPlaceholderContainer` `emptyPlaceholderImage` `list` `root` `scrollContainer` `title` `uploadButtons` | 10 |
| `Preview` | `audioLayout` `background` `dualPreviewWrapper` `editWidgets` `editWidgetsActive` `enter` `enterActive` `exit` `exitActive` `fullscreen` `isHidden` `isTransparentBackground` `layoutPreviewEnter` `layoutPreviewEnterActive` … | 24 |
| `PreviewStatusScreen` | `badge` `badgeTooltipTrigger` `badges` `button` `buttons` `dualOutput` `hidden` `liveBadge` `liveSonar` `messageScreen` `newDesign` `outlinedButton` `pcapPlaybackBadge` `previewBadge` … | 26 |
| `PreviewsPositionControl` | `positionButton` `positionButtonCircle` `positionButtonDot` `positionButtonLabel` `root` `selected` | 6 |
| `PreviewsShapeControl` | `activeOption` `option` `optionContent` `root` `rotated` `shapeIcon` `userIcon` | 7 |
| `PrivateChat` | `chatToggle` `content` `footer` `header` `headerDetails` `headerText` `hidden` `icon` `input` `inverted` `isFullList` `isFullscreen` `open` `replyArea` … | 17 |
| `PrivateChatV2` | `author` `avatar` `backdrop` `button` `buttonContent` `buttonRoot` `chatIcon` `closeButton` `content` `darkTheme` `defaultVariant` `emptyState` `emptyStateText` `fullscreen` … | 46 |
| `ProfileSettingsForm` | `avatarLabel` `avatarsList` `buttonBackground` `close` `error` `errorContainer` `message` `wrap` | 8 |
| `ProgressBar` | `infiniteProgressBar` `progressBar` | 2 |
| `PromotionToHostConfirmationModal` | `baseDialog` `buttons` `confirmButton` `content` `dismissButton` `root` `title` | 7 |
| `PromotionToHostOfferModal` | `baseDialog` `buttons` `confirmButton` `content` `dismissButton` `root` `title` | 7 |
| `QrCodeForm` | `actionButton` `cancelButton` `counterContainer` `error` `errors` `field` `footer` `hasError` `hasWarning` `input` `limit` `togglik` `warning` | 13 |
| `QrCodeOption` | `action` `actions` `actionsButton` `actionsMenuContainer` `button` `contentWrapper` `dragHandle` `dragHandleIcon` `forceHide` `hide` `image` `isDragging` `isListDragging` `isOpenDeleteConfirmation` … | 20 |
| `QrCodeOverlay` | `container` `image` `imageBox` `interactiveQrCodeControls` `isDisabled` `isFocused` `main` `overlay` `root` `title` | 10 |
| `QrCodeSelect` | `addForm` `root` `scenesMode` | 3 |
| `QrCodesContent` | `info` `loader` `root` | 3 |
| `QrCodesSection` | `accordion` `addButton` `content` `contentWrapper` `heading` `info` `isExpanded` `left` `plusIcon` `root` `scenesMode` `title` `triangleArrowIcon` | 13 |
| `QualityIndicator` | `icon` `root` | 2 |
| `Questionnaire` | `badge` `badgeDraft` `badgeSelected` `body` `continueButton` `footer` `generatingBody` `generatingDots` `generatingLabel` `header` `headerCounter` `headerIcon` `headerLabel` `headerLeft` … | 30 |
| `ReactFastMarque` | `container` `marquee` `overlay` | 3 |
| `RecordModePauseControl` | `icon` `isCompactMode` `noMargin` `root` `withIcon` | 5 |
| `RecordModeRestartControl` | `icon` `isCompactMode` `noMargin` `root` `withIcon` | 5 |
| `RecordModeSwitchButtonWrapper` | `arrow` `arrowButton` `content` `contentButton` `contentRoot` `description` `isActive` `menuPopover` `root` `title` `upgradeBadge` | 11 |
| `RecordOnlyTitle` | `root` `title` | 2 |
| `RecordingBlock` | `block` `clickableFile` `dropdownBlockItem` `dropdownIcon` `expandedClient` `file` `fileData` `fileInfo` `fileName` `fileNameBadge` `folder` `getClipsButton` `icon` `isDisabled` … | 16 |
| `RecordingBlockAccordion` | `accordion` `buttonIconWrapper` `chevronIcon` `content` `contentWrapper` `headingBadge` `headingButton` `headingIconContent` `headingIconWrapper` `headingTitle` `isExpanded` `recordingBlock` `recordingFile` | 13 |
| `RecordingButton` | `button` `disabledAnimation` `isActive` `withRightElement` | 4 |
| `RecordingButtonWrapper` | `recordingButtonSquare` | 1 |
| `RecordingDot` | `recordingDot` | 1 |
| `RecordingDropDown` | `active` `buttonIcon` | 2 |
| `RecordingDropDownContent` | `dropDown` `dropDownHeaderBadge` `dropDownItemIcon` `dropDownItemIconWrapper` `dropdownItem` `dropdownItemContent` `dropdownItemHeader` `firstRecordingContentButton` `firstRecordingContentCloseButton` `firstRecordingContentHeader` `firstRecordingContentHeaderWrapper` `firstRecordingContentItem` `firstRecordingContentWrapper` `upgradeBadge` | 14 |
| `RecordingDropDownPopover` | `popover` `popoverArrow` | 2 |
| `RecordingPaidFeatureModal` | `button` `description` `media` `root` `title` | 5 |
| `RecordingSettingsContent` | `betaBadge` `infoButton` `localRecording` `localRecordingOptions` `localRecordingsSection` `participantActionIcon` `participantContent` `participantName` `participantNameRow` `participantRow` `recordingIndicator` `recordingParticipants` `recordingRow` `recordingRowContent` … | 22 |
| `RecordingToggleDropdown` | `checkbox` `contentItem` `contentItemButton` `contentItemButtonWrapper` `contentItemContainer` `contentItemDesc` `contentItemReadonly` `contentRoot` `downloadButton` `dropdownButton` `dropdownButtonIcon` `dropdownButtonText` `multipleSwitchControl` `participantStatuses` … | 21 |
| `RecordingTrialEndedModal` | `actions` `description` `root` `title` `upgradeButton` | 5 |
| `RecordingTrialWarningModal` | `actionButton` `actions` `bold` `description` `extra` `root` `secondaryButton` `title` | 8 |
| `RecordingsSettings` | `extraTopMargin` `infoBox` `infoBoxLink` `infoBoxText` `infoIcon` `infoRow` `infoText` `localRecordingsToggle` `radioGroup` `radioOption` `recordingModeSection` `root` `section` `sectionHeading` … | 16 |
| `RecordingsTrigger` | `field` `fieldLabel` `fieldLabelWrapper` `hidden` `input` `popoverContent` `root` `subtitle` `tooltip` `withGradient` `withSubtitle` | 11 |
| `RecordingsTriggerPopover` | `button` `header` `root` | 3 |
| `RecordingsUpgradeTrigger` | `description` `heading` `heroImage` `image` `newBadge` `root` `tabTrigger` `tabs` `tabsList` `textContent` | 10 |
| `RemoveOption` | `icon` `root` | 2 |
| `ResourcePicker` | `card` `meta` `name` `origin` `root` `thumbnail` `thumbnailImage` `thumbnailPlaceholder` | 8 |
| `RestartRecordingConfirmationModal` | `baseDialog` `buttons` `content` `dismissButton` `root` `title` | 6 |
| `RevealOnClickComponent` | `button` | 1 |
| `RoundedCaption` | `animatedText` `author` `authorText` `avatar` `avatarClassName` `compactControls` `controls` `isEnterDone` `isFocused` `isPortrait` `isPreview` `overlay` `platformIconClassName` `preview` … | 18 |
| `RtmpCopyButton` | `copyButton` `copyButtonIcon` | 2 |
| `RtmpPlaceholder` | `animated` `compactMode` `connectButton` `connectButtonWrapper` `content` `copyButtonWrapper` `copyForm` `copyFormWrapper` `copyInput` `copyInputElementClassName` `copyInputFocus` `copyLabel` `description` `descriptionLearnMore` … | 23 |
| `RtmpSource` | `about` `copyButton` `copyForm` `copyLabel` `description` `externalLink` `link` `refreshButton` `refreshButtonHint` `refreshLoader` `rtmpWarning` `strong` | 12 |
| `RtmpSourceContent` | `actionButton` `graphics` `iconWrapper` `link` `newTitle` `root` `rtmpInfo` `subtitle` `title` | 9 |
| `RunCountdownButton` | `isLight` `replayButtonLargeText` `replayButtonSmallText` `replayIcon` `root` | 5 |
| `SceneCountdownContent` | `autoSwitchToggle` `controlsRow` `fontSelect` `fontSelectContent` `fontSelectInfoTooltip` `label` `musicIcon` `musicIconNotification` `musicIconNotificationSvg` `musicSelectContent` `musicVolume` `timerSelectContent` `toggleInfo` `toggleSection` … | 16 |
| `SceneCountdownCustomTimeSelect` | `applyButton` `controls` `controlsSlide` `controlsSlideInner` `iconUp` `root` `separator` `stepper` `stepperButton` `stepperIcon` `timeInput` `timeInputWrapper` | 12 |
| `SceneCountdownSelect` | `content` `group` `hidden` `item` `itemLoadingIndicator` `itemSelectedIndicator` `itemText` `label` `root` `selectScrollButton` `selectScrollButtonArrow` `separator` `tooltip` `tooltipTrigger` … | 21 |
| `SceneCountdownSelectField` | `hidden` `input` `inputContainer` `inputIcon` `inputText` `label` `option` | 7 |
| `SceneEditModeOnboardingModal` | `actions` `content` `description` `root` `tryEditModeButton` `video` | 6 |
| `SceneEditModePill` | `actions` `animatedBar` `button` `heightClip` `icon` `primaryButton` `root` `sceneName` `secondaryButton` `separator` `status` | 11 |
| `SceneEditModePip` | `closeButton` `frame` | 2 |
| `SceneEditModePreviewContainer` | `preview` `root` | 2 |
| `SceneEditorsPresenceBadge` | `avatar` `avatarWrapper` `cursor` `flyout` `flyoutFixed` `initials` `inner` `isExpanded` `name` `overflow` `root` `separator` `status` | 13 |
| `SceneItem` | `activeBadge` `animate` `controls` `dragHandleIcon` `dragWrapper` `editingAnts` `editingAntsRect` `editingBadge` `editingBadgeIcon` `editingCardRing` `editingCardRingRect` `fullWidth` `header` `hidden` … | 45 |
| `SceneItemAttachedWebcamsBadge` | `attachedWebcamName` `root` | 2 |
| `SceneItemDynamicThumbnail` | `chatOverlay` `chatOverlayIcon` `isVisible` `rightOverlay` `rightOverlayIcon` `root` | 6 |
| `SceneItemDynamicThumbnailSource` | `nameAbbreviation` `nameAbbreviationText` `noBorder` `root` `staticThumbnail` `thumbnail` `withOutline` | 7 |
| `SceneItemMenu` | `autoSwitchContainer` `autoSwitchControl` `checkbox` `isCollapsed` `isDisabled` `isHidden` `menuButton` `menuButtonActive` `menuPopover` `mobileMenuButton` `mobileMenuButtonIcon` `moreIcon` `optionButton` `popover` … | 18 |
| `SceneItemPreview` | `background` `blackBackground` `chatOverlay` `chatOverlayIcon` `isLeft` `logo` `name` `overlay` `root` `thumbnail` `thumbnailWrapper` | 11 |
| `SceneItemPreviewAutoSwitchBadge` | `root` | 1 |
| `SceneItemPreviewCenteredCountdownBadge` | `isBackgroundBright` `root` | 2 |
| `SceneItemPreviewCountdownBadge` | `alternativeBorder` `autoSwitchBadge` `badgeIcon` `badgeIconWrapper` `duration` `durationText` `hidden` `isBadgeStyling` `presentationMediaText` `root` | 10 |
| `SceneItemPreviewMediaBadge` | `alternativeBorder` `autoSwitchBadge` `badgeIcon` `badgeIconWrapper` `hidden` `isBadgeStyling` `presentationMediaText` `previewVideoDuration` `previewVideoDurationText` `root` | 10 |
| `SceneItemPreviewThumbnail` | `isAllLayoutsStyle` `isCinemaLayout` `isContainLayout` `isCountdown` `isCoverLayout` `isHalfScreenLayout` `isInProgress` `isPipLayout` `isPlaceholder` `isShowtimeLayout` `isThumbnailsLayout` `mediaProcessing` `mediaProcessingProgressBar` `mediaProcessingTitle` … | 20 |
| `SceneMenuOption` | `betaChip` `icon` `iconGlyph` `info` `root` `shortcut` `title` | 7 |
| `SceneNote` | `button` `content` `counterEnter` `counterEnterActive` `counterExit` `counterExitActive` `isPreviewMode` `menu` `root` `textArea` `wordCounter` | 11 |
| `SceneParticipantSourceAssignmentMenu` | `badge` `editingBadge` `menuButton` `menuContent` `menuItemBadgeWrapper` `onAirBadge` | 6 |
| `SceneProgressBar` | `noTransition` `progressBar` | 2 |
| `SceneStatusOverlay` | `overlay` | 1 |
| `SceneTitleEditModal` | `baseDialog` `buttonsSection` `form` `red` `textInput` `textLengthHint` `title` | 7 |
| `ScenesClientSources` | `controls` `dataContainer` `header` `isActive` `isDisabled` `maximizeButton` `maximizeIcon` `mediaStreamPreview` `moreButton` `moreButtonActive` `name` `newStyle` `noVideoFeed` `participant` … | 25 |
| `ScenesGuestLocalMediaStreamSource` | `content` `controls` `isActive` `isGlossyMode` `isGreyedOut` `linkButton` `localMediaStreamPreview` `moreButton` `name` `noPermissionsContainer` `root` `source` `sourceKind` `top` … | 16 |
| `ScenesGuestSources` | `backstageInfo` `root` `source` `sources` | 4 |
| `ScenesLimitReachedModal` | `button` `buttonsSection` `primary` `root` `title` | 5 |
| `ScenesMediaStreamSourcePreview` | `content` `contentOverlay` `contentWrapper` `dimmedOverlay` `indicator` `indicatorIcon` `isGlossyMode` `isGreyedOut` `isSelfMutedIndicator` `isShown` `isVerticalSource` `root` `selfMutedIndicator` `video` … | 16 |
| `ScenesMobilePlaceholder` | `description` `placeholderButton` `placeholderTooltip` `placeholderTooltipArrow` `placeholderTooltipContent` `root` `textDivider` `title` | 8 |
| `ScenesNewExperienceButton` | `content` `icon` `root` `text` | 4 |
| `ScenesNoOtherSourcesBanner` | `linkButton` `root` `title` | 3 |
| `ScenesParticipantMediaStreamSource` | `centerControls` `content` `controls` `dimmedOverlay` `dropdown-enter` `dropdown-enter-active` `dropdown-exit` `dropdown-exit-active` `isActive` `isGlossyMode` `isShown` `linkButton` `maximizeButton` `maximizeIcon` … | 36 |
| `ScenesParticipantPresentationSource` | `bottomControls` `controls` `guestMode` `isActive` `isDisabled` `isGlossyMode` `maximizeButton` `maximizeIcon` `mediaStreamPreview` `moreButton` `name` `presentationFailedIcon` `presentationStatusText` `presentationStatusThumbnail` … | 27 |
| `ScenesParticipantSources` | `sources` | 1 |
| `ScenesPresentationSourcePreview` | `content` `greyedOut` `isGlossyMode` `isVerticalSource` `root` `sourceImage` | 6 |
| `ScenesSidebar` | `headerRow` `mobileLayout` `root` `scenes` `title` `withHeaderContent` `wrapper` | 7 |
| `ScenesSourcesButtonWithPopover` | `appearWithDelay` `content` `expandButton` `isForceHidden` `isFullscreenMode` `isLeftSidebarMode` `isOpen` `isRightSidebarMode` `isShown` `popover` `previewsButton` `root` | 12 |
| `ScenesSourcesInviteGuests` | `copyLinkLightButton` `copyLinkLightIcon` `moreOptionsGlossyButton` `moreOptionsGlossyButtonActive` `root` `title` `top` `upgradeButton` `upgradeContentLoader` | 9 |
| `ScenesSourcesPeopleAssignmentModeControl` | `optionContent` `optionText` `root` `title` | 4 |
| `ScenesSourcesPopover` | `actions` `animateHighlight` `content` `expandButton` `expandButtonIcon` `forceHide` `forceShow` `isContentOnlyMode` `isExpanded` `isGlossyMode` `isSourcesTabMode` `root` `source` `sources` … | 18 |
| `ScenesSourcesPreviews` | `addGuestCircle` `isGlossyMode` `root` `sourcePreview` `sourcesCounter` `sourcesCounterEnter` `sourcesCounterEnterActive` `sourcesCounterExit` `sourcesCounterExitActive` `verticalSources` | 10 |
| `Schedule` | `calendarIcon` `checkbox` `checkboxLabel` `checkboxRow` `chevron` `content` `doneButton` `field` `fieldLabel` `footer` `infoIcon` `inputButton` `inputIcon` `popover` … | 21 |
| `ScreenSharePreviewPopover` | `destructive` `dropdown` `dropdownItem` `icon` `label` | 5 |
| `ScreenShareThumbnail` | `hoverOverlay` `menuOpen` `nonInteractive` `offAir` `offAirOverlay` `root` `video` | 7 |
| `ScreenSharingButton` | `hidden` `icon` `iconButton` `isActive` `isDisabled` `isFullscreen` `isHidden` `isHovered` `isInactive` `placeholderLayer` `placeholderStub` `root` `shareLayer` `shouldForcePlaceholder` … | 18 |
| `ScreenSharingModal` | `block` `optionDetails` `optionInput` `optionTitle` | 4 |
| `SecondScreenShareWarningModal` | `baseDialog` `checkbox` `checkboxContainer` `checkboxIcon` `checkboxInput` `checkboxLabel` `checkboxText` `confirmButton` `content` `icon` `iconOverlay` `iconWrapper` `isHidden` `root` … | 15 |
| `SelectDestinationPopover` | `header` `root` | 2 |
| `SelfMutedIndicator` | `icon` `indicator` `root` | 3 |
| `SessionControls` | `actionButton` `actionButtonWrapper` `buttonLabel` `goLive` `hotkeyActive` `iconButton` `iconButtonRecording` `live` `progressFill` `record` `recordControlSpinner` `recordDot` `recordingDot` `recordingDotPaused` … | 25 |
| `SettingsAccordionSection` | `button` `chevronIcon` `content` `contentWrapper` `isExpanded` `root` | 6 |
| `SettingsBackToOldExperienceButton` | `button` `buttonIcon` `hidden` `root` `tooltip` `tooltipTrigger` | 6 |
| `SettingsButton` | `badge` `content` `icon` `isActive` `isFullscreen` `isGhost` `isInactive` `isJoinScreen` `isLight` `noBorder` `root` | 11 |
| `SettingsButtonWithPopover` | `arrowContainer` `bold` `closeButton` `content` `link` `popover` `root` `text` `title` | 9 |
| `SettingsDrodownButton` | `chevron` `trigger` `triggerBottom` `triggerContent` `triggerMode` `triggerOpen` `triggerResolution` `triggerTop` | 8 |
| `SettingsDropdown` | `betaChip` `contentWrapper` `divider` `dropdownContent` `infoIcon` `infoTrigger` `nestedFields` `positioner` `proBadge` `proBadgeIcon` `proLabel` `recordingCard` `recordingIcon` `recordingRow` … | 25 |
| `SettingsInputField` | `hidden` `input` `label` `labelWithBadge` `tooltip` `tooltipContent` | 6 |
| `SettingsModal` | `accordion` `accordionEmbedSettingsButtonWrapper` `content` `embedSettingsButtonIconWrapper` `embedSettingsButtonWrapper` `field` `header` `root` `secondaryFieldset` `sidebar` `stickyPreview` `tabContent` `tabs` | 13 |
| `SettingsNewExperienceButton` | `bold` `button` `buttonIcon` `hidden` `info` `root` `tooltip` `tooltipTrigger` | 8 |
| `SettingsSelect` | `icon` `item` `itemIndicator` `itemText` `label` `list` `popup` `positioner` `root` `trigger` `value` | 11 |
| `SettingsSelectField` | `hidden` `info` `input` `label` `labelWithBadge` `tooltip` `tooltipContent` | 7 |
| `SettingsSliderField` | `label` `sliderBackdrop` | 2 |
| `SettingsTabButton` | `chevronIcon` `content` `icon` `isActive` `root` | 5 |
| `SettingsTogglikField` | `highlight` `info` `inlineInfo` `label` `root` `toggle` | 6 |
| `ShortcutRow` | `buttons` `root` `shortcutButton` | 3 |
| `Shortcuts` | `heading` `section` `shortcutRow` | 3 |
| `ShownMessagesList` | `root` | 1 |
| `ShowtimeAlignmentControl` | `activeOption` `option` `optionContent` `optionIcon` `root` `rotated` `switch` `tabletOrBelow` | 8 |
| `ShowtimeLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `controlLandscapeOnlyLabel` `root` | 6 |
| `ShowtimePreview` | `alignRight` `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `moreThanTwoSources` `root` | 7 |
| `SimpleSlider` | `hoverTooltip` `isControlProhibited` `root` `shouldHideThumb` `wrapper` | 5 |
| `SimpleVideoControl` | `actionButton` `active` `autoswitchIcon` `button` `buttonIcon` `checkIcon` `checkbox` `content` `controlButton` `controlIcon` `currentTime` `dropdown` `dropdownIcon` `dropdownIconNew` … | 49 |
| `SkeletonLayoutControls` | `layout` `root` | 2 |
| `SkeletonScenes` | `header` `name` `root` `source` | 4 |
| `SkeletonSources` | `header` `icon` `name` `participant` `source` | 5 |
| `SlideControls` | `activePage` `arrow` `button` `info` `isMinimized` `isScenesMode` `reverseRight` `root` `totalPages` | 9 |
| `Slider` | `backdrop` `hoverTooltip` `input` `progress` `root` `withHoverOnlyThumb` | 6 |
| `SliderV2` | `bar` `icon` `knob` `label` `root` `track` | 6 |
| `SlidersButton` | `icon` `isActive` `root` | 3 |
| `SlidingLimiter` | `coloredBar` `green` `isBlurred` `isCompactMode` `isControlProhibited` `isInactive` `isVisible` `rangeOutput` `red` `root` `slider` `volumeBar` `volumeBars` `yellow` | 14 |
| `SourceControls` | `button` `controls` `isActive` `item` | 4 |
| `SourceIcon` | `icon` | 1 |
| `SourceImageNewFunctionalityModal` | `button` `buttons` `closeButton` `closeCrossButton` `content` `description` `hidden` `image` `root` `title` `tooltip` | 11 |
| `SourceMaximizedAlert` | `animatedAlert` `linkButton` | 2 |
| `SourceMenu` | `hidden` `icon` `inputMenuContent` `menuButton` `menuButtonActive` `menuItemTooltipTrigger` `moreIcon` | 7 |
| `SourceOption` | `badge` `button` `chevronIcon` `content` `description` `descriptionSubTitle` `descriptionTitle` `hidden` `icon` `iconGlyph` `info` `isHidden` `isHighlighted` `newBadge` … | 17 |
| `SourcesDeck` | `inviteGuests` `inviteGuestsButton` `isFullscreen` `isHidden` `isScenesMode` `mobileLayout` `participants` `root` `sceneSidebar` `scenesMode` `withPairsToggle` `withoutPadding` `wrapper` | 13 |
| `SpookyCaption` | `animatedText` `author` `authorText` `avatar` `avatarClassName` `controls` `isEnterDone` `isFocused` `isPortrait` `isPreview` `longText` `overlay` `platformIconClassName` `preview` … | 18 |
| `SpotlightLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `controlLandscapeOnlyLabel` `root` `withTopLabelPosition` | 7 |
| `SpotlightLayoutPositionModeControl` | `activeOption` `option` `optionContent` `optionText` `root` `switch` `tabletOrBelow` | 7 |
| `SpotlightPreview` | `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 5 |
| `Sprintf` | `button` `link` | 2 |
| `StartWebinarConfirmationModal` | `baseDialog` `buttons` `confirmButton` `dismissButton` `eventCard` `root` `subtitle` `title` | 8 |
| `StepTransition` | `stepContainer` `stepEnterActiveLeft` `stepEnterActiveRight` `stepEnterDoneLeft` `stepEnterDoneRight` `stepEnterLeft` `stepEnterRight` `stepExitActiveRight` `stepExitDoneLeft` `stepExitDoneRight` `stepExitLeft` `stepExitRight` `stepsContainer` | 13 |
| `StopRecordingConfirmationModal` | `baseDialog` `confirmButton` `content` `dismissButton` `root` `title` | 6 |
| `StreamDetails` | `editIcon` `streamTitleText` | 2 |
| `StreamOverlay` | `airThemeBackground` `alert` `bottomOffset` `browserSource` `captionContainer` `chatControls` `chatControlsButton` `chatControlsOverlay` `chatOverlayContainer` `chatOverlayPlaceholder` `container` `ecommerceProduct` `ecommerceProductContainer` `fade-enter` … | 58 |
| `StreamSource` | `christmasTheme` `disabled` `guestMode` `noVideoFeed` `overlay` `preview` `root` `thumbnail` `video` `videoContainer` | 10 |
| `StudioRecordingModal` | `footerText` `icon` `linkButton` `loader` `recording` `recordingName` `recordingTitle` `recordings` `root` `title` `upgradeProposal` `upgradeTrigger` | 12 |
| `SwitchControl` | `hidden` `option` `right` `root` `selected` `tooltip` | 6 |
| `SystemPromptDebugPanel` | `actionButton` `actionsFooter` `backdrop` `closeButton` `content` `creditsResetButton` `creditsRow` `devTag` `experimentalBadge` `gatewayRadioGroup` `gatewayRadioOption` `gatewayTradeoff` `gatewayTradeoffSlider` `handle` … | 59 |
| `Tabs` | `content` `hidden` `hiddenOnMobile` `scrollView` `tab` `tab--active` `tabs` `withForcedScrollbar` | 8 |
| `TbpnLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `root` `withTopLabelPosition` | 6 |
| `TbpnPreview` | `compactMode` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` | 4 |
| `ThemePreviewButton` | `animatedCaption` `compactDesign` `halloween2023Icon` `imageCaption` `newBadge` `root` `scenesMode` `selected` `xmas2023Icon` | 9 |
| `ThemeSelect` | `compactDesign` `root` | 2 |
| `ThumbnailsLayoutCustomizationContent` | `alignEnd` `control` `controlContent` `controlLabel` `controlLandscapeOnlyLabel` `positionPickerTabletOrBelow` `root` `withTopLabelPosition` | 8 |
| `ThumbnailsPreview` | `compactMode` `fixToBottom` `fixToLeft` `fixToRight` `fixToTop` `icon` `layoutModifiedBadge` `layoutModifiedBadgeIcon` `root` | 9 |
| `ThumbnailsPreviewsShapeControl` | `activeOption` `option` `optionContent` `root` `rotated` `shapeIcon` `switch` `tabletOrBelow` `userIcon` | 9 |
| `TickerCaption` | `compactControls` `controls` `gpuTicker` `hideBackground` `layout` `root` `ticker` `tickerItem` `tickerWrap` | 9 |
| `TickerCaptionControls` | `button` `buttonLabel` `icon` | 3 |
| `TickerCaptionToolbar` | `container` `root` | 2 |
| `TickerSpeedControl` | `control` `controlIcon` `controlIconWrapper` `hidden` `isExpanded` `isSidebarMode` `root` | 7 |
| `TimeDisplay` | `minutes` `root` `seconds` `shadow` | 4 |
| `Timer` | `elapsedTime` `statContainer` | 2 |
| `Toast` | `actionLinkButton` `bold` `customToast` `icon` `key` `message` `root` `text` `textIcon` `title` `titleText` `tooltipLink` | 12 |
| `ToggleCamera` | `hasSegment` `icon` `isFullscreen` `isHidden` `isInactive` `isJoinScreen` `isLight` `root` | 8 |
| `ToggleIcon` | `offIcon` `onIcon` `root` | 3 |
| `ToggleMicrophone` | `hasSegment` `icon` `isFullscreen` `isHidden` `isInactive` `isJoinScreen` `isLight` `root` | 8 |
| `ToggleScenesNotes` | `isFullscreen` `isHidden` `isInactive` `isLight` `root` | 5 |
| `Togglik` | `checkbox` `root` `slider` | 3 |
| `TogglikField` | `isToggleAtEnd` `root` `toggle` | 3 |
| `ToolCallStatus` | `rowLabel` `toolError` `toolErrorIcon` `toolResult` `toolResultBody` `toolResultCheck` `toolResultSummary` `toolStatus` `toolStatusWithIcon` | 9 |
| `ToolChip` | `chip` `chipIcon` `chipIconButton` `chipLabel` `chipRemovable` `chipScene` `chipSceneSelected` `chipSelected` `chipWidget` `chipWidgetSelected` | 10 |
| `UnreadNotification` | `backgroundMusicWrapper` `eqBar1` `eqBar2` `eqBar3` `infinite` `innerText` `noAnimation` `root` `unreadEnter` `unreadEnterActive` `unreadExit` `unreadExitActive` | 12 |
| `UpgradeButton` | `buttonLabel` `crownIcon` `goProPill` | 3 |
| `UpgradePrompt` | `checkbox` `checkboxLabel` `checkboxRow` | 3 |
| `UpgradePromptCard` | `closeButton` `upgradeButtonPrimary` `upgradeButtonSecondary` `upgradeButtons` `upgradeDescription` `upgradePrompt` `upgradeTitle` | 7 |
| `UploadPage` | `alertCircleIcon` `alertIcon` `avatar` `avatarError` `avatarNoRecordings` `avatarSuccess` `checkIcon` `container` `copyright` `description` `descriptionError` `footer` `footerButton` `recordingFile` … | 20 |
| `UploadingAvatarItem` | `background` `root` | 2 |
| `UploadingRecordingsToast` | `content` `icon` `progress` `text` | 4 |
| `VerticalTabs` | `bottomTabButtonsContainer` `bottomTabsContainer` `closed` `collapsable` `content` `contentFillWrapper` `contentWrapper` `darkMode` `disabledTab` `extraTopButtonContainer` `hidden` `isHidden` `lightDarkMode` `root` … | 22 |
| `VideoAutoSwitchNotification` | `autoSwitchNotification` `notificationButton` `notificationIcon` `notificationRightPart` `notificationText` | 5 |
| `VideoAutoSwitchToast` | `actionButton` `progress` | 2 |
| `VideoClipPlayingToast` | `dash` `progress` `remainedTime` | 3 |
| `VideoClips` | `scenesMode` `uploadButton` | 2 |
| `VideoMediaPlaceholderSource` | `animatedBackground` `animationWrapper` `button` `buttonDescription` `buttonWrapper` `buttons` `compactMode` `content` `hidden` `icon` `root` | 11 |
| `VideoPlayerControls` | `button` `item` `root` | 3 |
| `VideoRecordingsCallouts` | `semiBold` `text` | 2 |
| `VideoSceneAutoSwitchToast` | `actionButton` `progress` | 2 |
| `VideoSettingsForm` | `beautifyRow` `beautifySlider` `beautifySliderBackdrop` `beautifyToggle` `newBadge` `resetButton` | 6 |
| `VideoSettingsModal` | `root` `title` | 2 |
| `VideoStorageStepPublicUpload` | `button` `description` `header` `root` `title` `uploadButtonEnter` `uploadButtonExit` `uploadButtonExitActive` | 8 |
| `VideoStorageToastContainer` | `root` `toast` | 2 |
| `VideoStorageVideoStep` | `bodyVideoStep` `modalHeader` `rootVideoStep` | 3 |
| `VideoUploader` | `progressBar` `progressBarGrey` `root` `title` | 4 |
| `ViewersCount` | `channels` `counterContainer` `icon` `item` | 4 |
| `ViewersCountPopover` | `channelIcon` `channelName` `channelRow` `channelViewers` `channels` `eyeIcon` `popup` `viewerCount` `webinarIcon` | 9 |
| `VirtualBackgrounds` | `button` `buttonContainer` `isBlur` `root` | 4 |
| `VirtualEventMessage` | `author` `avatar` `body` `root` `text` `time` | 6 |
| `VirtualEventMessages` | `newMessagesButton` `root` | 2 |
| `VolumeControl` | `hidden` `isCompactMode` `muteButton` `muteWrapper` `root` `sliderWrapper` `tooltipArrow` | 7 |
| `VolumeMeter` | `circle` `green` `root` | 3 |
| `VolumeMuteControl` | `alternativeIcon` `muteButton` `mutedIcon` `root` | 4 |
| `WatchPlaylistsTutorial` | `icon` `root` `text` | 3 |
| `WatchPlaylistsTutorialModal` | `content` `help` `helpAction` `helpText` `root` `video` | 6 |
| `WebinarAudienceJoinModal` | `baseDialog` `button` `buttonIcon` `card` `cardDescription` `cardTitle` `cards` `connectSlackButton` `content` `copyLinkButton` `globeIcon` `iconCircle` `root` `slackCard` … | 18 |
| `WebinarAvatar` | `fallback` `root` `solidFill` | 3 |
| `WebinarEventInfo` | `addToCalendarButton` `addToCalendarIcon` `cover` `dateTime` `description` `host` `hostAvatar` `hostAvatarText` `hostName` `hostText` `livePill` `pills` `root` `title` | 14 |
| `WebinarLiveCallInRequestToast` | `acceptButton` `actions` `closeButton` `content` `info` `name` `reviewButton` `root` `subtitle` | 9 |
| `WebinarLiveCallModal` | `allowButton` `audioOnly` `baseDialog` `body` `bodyContent` `buttons` `charCount` `confirmButton` `controls` `dismissButton` `failed` `failedCancel` `field` `fieldLabel` … | 26 |
| `WebinarMoreOptionsMenu` | `active` `callInsInfoIcon` `callInsLabel` `confirmationButton` `confirmationButtons` `confirmationItem` `content` `isDarkSurface` `menuItem` `menuItemButton` `menuItemText` `moreOptionsButton` `popover` `withConfirmation` | 14 |
| `WebinarSlackButton` | `root` `slackIcon` `touch` | 3 |
| `WebinarUnavailablePage` | `header` `heading` `root` | 3 |
| `WebinarViewerChatInput` | `input` `root` `sendButton` `sendIcon` | 4 |
| `WebinarViewerInviteToStudioToast` | `actions` `content` `declineButton` `info` `joinButton` `name` `root` `subtitle` | 8 |
| `WidgetAsset` | `applyButton` `applyOverlay` `footer` `iframe` `iframeFrame` `iframeFrameHidden` `openIcon` `openLabel` `openRow` `preview` `root` `rootGenerating` `shaderOverlay` `shaderOverlayChild` … | 19 |
| `WidgetFavicon` | `botIcon` `favicon` `placeholder` | 3 |
| `WidgetForm` | `actionButton` `button` `cancelButton` `error` `errors` `footer` `hasError` `input` | 8 |
| `WidgetMoreOptionsMenu` | `content` `icon` `item` `popover` `shortcut` `trigger` `triggerActive` | 7 |
| `WidgetOption` | `action` `actions` `actionsButton` `button` `cancelButton` `confirmTitle` `contentWrapper` `deleteButton` `dragHandle` `dragHandleIcon` `editButton` `forceHide` `isConfirmingDelete` `isDraggable` … | 33 |
| `WidgetUpgradePopover` | `anchor` `popper` | 2 |
| `WidgetsContent` | `addForm` `aiAssistantButton` `aiAssistantIcon` `draggableLayerItem` `emptyState` `emptyStateIcon` `emptyStateText` `inlineLayersBackButton` `inlineLayersButton` `inlineLayersIcon` `key` `layerDragHandle` `layerItem` `list` … | 28 |
| `WidgetsTabTitle` | `backButton` `gradientText` `icon` `mode` `title` `toggleButton` `widgetsModeTitleEnter` `widgetsModeTitleEnterActive` `widgetsModeTitleExit` `widgetsModeTitleExitActive` | 10 |
| `XmasCaption` | `animatedText` `author` `authorText` `avatar` `avatarClassName` `chatMessage` `controls` `isEnterDone` `isFocused` `isPortrait` `isPreview` `overlay` `platformIconClassName` `preview` … | 17 |
