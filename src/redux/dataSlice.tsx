import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchRadio,
    fetchBooks,
    fetchMovies,
    fetchPodcasts,
    fetchChannels,
    fetchActs2,
    getAllFalgs,
    fetchMostListenedRadios,
    fetchTopUSARadios,
    fetchSavedRadios,
    fetchMostListenedPodcasts,
    fetchNewNoteworthyPodcasts,
    fetchSubscribedPodcasts
} from "../services/dataService";

export const fetchInitialData = createAsyncThunk(
    "data/fetchInitialData",
    async (userId?: string) => {
        const [
            radio,
            books,
            Countries,
            movies,
            podcasts,
            channels,
            acts2,
            mostListenedRadios,
            topUSARadios,
            savedRadios,
            mostListenedPodcasts,
            newNoteworthyPodcasts,
            subscribedPodcasts
        ] = await Promise.all([
            fetchRadio(),
            fetchBooks(),
            getAllFalgs(),
            fetchMovies(),
            fetchPodcasts(),
            fetchChannels(),
            fetchActs2(),
            fetchMostListenedRadios(),
            fetchTopUSARadios(),
            fetchSavedRadios(userId),
            fetchMostListenedPodcasts(),
            fetchNewNoteworthyPodcasts(),
            fetchSubscribedPodcasts(userId)
        ]);

        return {
            radio,
            books,
            Countries,
            movies,
            podcasts,
            channels,
            acts2,
            mostListenedRadios,
            topUSARadios,
            savedRadios,
            mostListenedPodcasts,
            newNoteworthyPodcasts,
            subscribedPodcasts
        };
    }
);

export const refreshSavedRadios = createAsyncThunk(
    "data/refreshSavedRadios",
    async (userId: string) => {
        const savedRadios = await fetchSavedRadios(userId);
        return savedRadios;
    }
);


const dataSlice = createSlice({
    name: "data",
    initialState: {
        radio: [] as any[],
        books: [] as any[],
        Countries: [] as any[],
        movies: [] as any[],
        podcasts: [] as any[],
        channels: [] as any[],
        acts2: [] as any[],
        mostListenedRadios: [] as any[],
        topUSARadios: [] as any[],
        savedRadios: [] as any[],
        mostListenedPodcasts: [] as any[],
        newNoteworthyPodcasts: [] as any[],
        subscribedPodcasts: [] as any[],
        selectedCountry: null as string | null, // null = "All Countries"
        loading: false
    },
    reducers: {
        setSelectedCountry: (state, action) => {
            state.selectedCountry = action.payload;
        },
        clearData: (state) => {
            state.radio = [];
            state.books = [];
            state.Countries = [];
            state.movies = [];
            state.podcasts = [];
            state.channels = [];
            state.acts2 = [];
            state.mostListenedRadios = [];
            state.topUSARadios = [];
            state.savedRadios = [];
            state.mostListenedPodcasts = [];
            state.newNoteworthyPodcasts = [];
            state.subscribedPodcasts = [];
            state.selectedCountry = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchInitialData.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchInitialData.fulfilled, (state, action) => {
                state.loading = false;
                Object.assign(state, action.payload);
            })
            .addCase(fetchInitialData.rejected, (state) => {
                state.loading = false;
            })
            .addCase(refreshSavedRadios.fulfilled, (state, action) => {
                state.savedRadios = action.payload;
            });
    }
});

export const { setSelectedCountry, clearData } = dataSlice.actions;

// Selector for filtered radio based on selected country
export const getFilteredRadio = (state: any) => {
    const { radio, selectedCountry } = state.data;

    // If no country selected, return all radio stations
    if (!selectedCountry) {
        return radio;
    }

    // Filter radio by selected country (type field)
    return radio.filter((r: any) =>
        r.type?.toLowerCase() === selectedCountry.toLowerCase()
    );
};

export default dataSlice.reducer;
