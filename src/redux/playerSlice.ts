// src/redux/playerSlice.ts
import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface PlayerState {
  currentChannel: any | null;
  currentEpisode: any | null;
  isPlaying: boolean;
  audioUrl: string;
}

const initialState: PlayerState = {
  currentChannel: null,
  currentEpisode: null,
  isPlaying: false,
  audioUrl: "",
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    setChannel(state, action: PayloadAction<any>) {
      state.currentChannel = action.payload;
    },
    setEpisode(state, action: PayloadAction<any>) {
      state.currentEpisode = action.payload;
      state.audioUrl = action.payload?.enclosure?.url || "";
      state.isPlaying = true;
    },
    togglePlay(state) {
      state.isPlaying = !state.isPlaying;
    },
    stopPlayer(state) {
      state.isPlaying = false;
      state.audioUrl = "";
      state.currentEpisode = null;
    },
  },
});

export const {
  setChannel,
  setEpisode,
  togglePlay,
  stopPlayer,
} = playerSlice.actions;

export default playerSlice.reducer;
