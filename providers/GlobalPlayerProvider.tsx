import { RefObject, useEffect, useState, useCallback, useMemo } from 'react';
import { WebView } from 'react-native-webview';
import createContextHook from '@nkzw/create-context-hook';
import { globalPlayerManager, GlobalPlayerState } from '@/lib/player/GlobalPlayerManager';
import { UniversalPlayerController } from '@/lib/player/UniversalPlayerController';

interface GlobalPlayerContextValue extends GlobalPlayerState {
  loadVideo: (url: string) => boolean;
  setWebViewRef: (ref: RefObject<WebView> | null) => void;
  setPlaylist: (urls: string[], startIndex?: number) => void;
  playNext: () => Promise<boolean>;
  playPrevious: () => Promise<boolean>;
  getCurrentPlayer: () => UniversalPlayerController | null;
}

export const [GlobalPlayerProvider, useGlobalPlayer] = createContextHook(() => {
  const [state, setState] = useState<GlobalPlayerState>(() => globalPlayerManager.getState());

  useEffect(() => {
    console.log('[GlobalPlayerProvider] Subscribing to player state changes');

    const unsubscribe = globalPlayerManager.subscribe((newState) => {
      console.log('[GlobalPlayerProvider] State updated:', newState);
      setState(newState);
    });

    return () => {
      console.log('[GlobalPlayerProvider] Unsubscribing from player state changes');
      unsubscribe();
    };
  }, []);

  const loadVideo = useCallback((url: string): boolean => {
    return globalPlayerManager.loadVideo(url);
  }, []);

  const setWebViewRef = useCallback((ref: RefObject<WebView> | null): void => {
    globalPlayerManager.setWebViewRef(ref);
  }, []);

  const setPlaylist = useCallback((urls: string[], startIndex: number = 0): void => {
    globalPlayerManager.setPlaylist(urls, startIndex);
  }, []);

  const playNext = useCallback(async (): Promise<boolean> => {
    return await globalPlayerManager.playNext();
  }, []);

  const playPrevious = useCallback(async (): Promise<boolean> => {
    return await globalPlayerManager.playPrevious();
  }, []);

  const getCurrentPlayer = useCallback((): UniversalPlayerController | null => {
    return globalPlayerManager.getCurrentPlayer();
  }, []);

  return useMemo(() => ({
    ...state,
    loadVideo,
    setWebViewRef,
    setPlaylist,
    playNext,
    playPrevious,
    getCurrentPlayer,
  }), [state, loadVideo, setWebViewRef, setPlaylist, playNext, playPrevious, getCurrentPlayer]);
});
