import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './AppShell'
import { RequireAuth } from './RequireAuth'
import { StudioPage } from '../studio/StudioPage'
import { JoinPage } from '../pages/JoinPage'
import { SignInPage } from '../pages/SignInPage'
import { HomePage } from '../pages/HomePage'
import { ToolsPage } from '../pages/ToolsPage'
import { ToolDetailPage } from '../pages/ToolDetailPage'
import { AccountPage } from '../pages/settings/AccountPage'
import { StreamingSetupPage } from '../pages/settings/StreamingSetupPage'
import { PullLinksPage } from '../pages/settings/PullLinksPage'
import { ClipsPage } from '../pages/settings/ClipsPage'
import { SpeedTestPage } from '../pages/settings/SpeedTestPage'
import { DeveloperGuidePage } from '../pages/developers/DeveloperGuidePage'
import { DeveloperAppsPage } from '../pages/developers/DeveloperAppsPage'

/* Vite injects the configured base; strip the trailing slash for the router. */
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '')

export function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        {/* Studio renders full-bleed, outside the dashboard shell. */}
        <Route path="/studio" element={<RequireAuth><StudioPage /></RequireAuth>} />
        <Route path="/studio/:roomId" element={<RequireAuth><StudioPage /></RequireAuth>} />

        {/* Sign in stands alone - no shell, no auth required to reach it. */}
        <Route path="/signin" element={<SignInPage />} />

        {/* Guests get their own light page, outside the dashboard shell. */}
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/:roomId" element={<JoinPage />} />

        <Route element={<RequireAuth><AppShell /></RequireAuth>}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/tools" element={<ToolsPage />} />
          <Route path="/tools/:slug" element={<ToolDetailPage />} />

          <Route path="/settings" element={<Navigate to="/settings/account" replace />} />
          <Route path="/settings/account" element={<AccountPage />} />
          <Route path="/settings/streaming-setup" element={<StreamingSetupPage />} />
          <Route path="/settings/pull-links" element={<PullLinksPage />} />
          <Route path="/settings/clips" element={<ClipsPage />} />
          <Route path="/settings/speed-test" element={<SpeedTestPage />} />

          <Route path="/developers" element={<DeveloperGuidePage />} />
          <Route path="/developers/apps" element={<DeveloperAppsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
