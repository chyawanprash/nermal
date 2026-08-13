import { getVersion } from '@tauri-apps/api/app';
import { compareVersions } from '$lib/utils/version';

const REPO = 'chyawanprash/nermalist';
const LATEST_RELEASE_API = `https://api.github.com/repos/${REPO}/releases/latest`;
const LAST_CHECK_KEY = 'nermal:last-update-check';
const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

export type UpdateStatus = 'idle' | 'checking' | 'up-to-date' | 'available' | 'error';

interface LatestReleaseResponse {
  tag_name: string;
  html_url: string;
}

/** Checks the latest GitHub release against the running app version. No auto-download — just surfaces a link. */
class UpdateState {
  status = $state<UpdateStatus>('idle');
  currentVersion = $state<string | null>(null);
  latestVersion = $state<string | null>(null);
  releaseUrl = $state<string | null>(null);
  dismissed = $state(false);

  async loadCurrentVersion(): Promise<string> {
    this.currentVersion ??= await getVersion();
    return this.currentVersion;
  }

  async check(): Promise<void> {
    this.status = 'checking';
    try {
      const current = await this.loadCurrentVersion();

      const res = await fetch(LATEST_RELEASE_API, {
        headers: { Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) throw new Error(`GitHub API returned ${res.status}`);

      const release: LatestReleaseResponse = await res.json();
      const latest = release.tag_name;

      this.latestVersion = latest;
      this.releaseUrl = release.html_url;
      localStorage.setItem(LAST_CHECK_KEY, String(Date.now()));

      this.status = compareVersions(latest, current) > 0 ? 'available' : 'up-to-date';
    } catch {
      this.status = 'error';
    }
  }

  /** Checks at most once per CHECK_INTERVAL_MS, so app launches don't hammer the GitHub API. */
  async checkIfDue(): Promise<void> {
    const last = Number(localStorage.getItem(LAST_CHECK_KEY) ?? 0);
    if (Date.now() - last < CHECK_INTERVAL_MS) return;
    await this.check();
  }

  dismiss() {
    this.dismissed = true;
  }
}

export const updateState = new UpdateState();
