import type { AppError, AppScreen } from '$lib/types/app';

/** Top-level app state: which screen is showing, and the current error/loading state. */
class AppState {
  screen = $state<AppScreen>('no-vault');
  isInitializing = $state(true);
  isLoading = $state(false);
  loadingLabel = $state<string | null>(null);
  error = $state<AppError | null>(null);

  goTo(screen: AppScreen) {
    this.screen = screen;
    this.error = null;
  }

  startLoading(label?: string) {
    this.isLoading = true;
    this.loadingLabel = label ?? null;
  }

  stopLoading() {
    this.isLoading = false;
    this.loadingLabel = null;
  }

  setError(error: AppError) {
    this.error = error;
  }

  clearError() {
    this.error = null;
  }
}

export const appState = new AppState();
