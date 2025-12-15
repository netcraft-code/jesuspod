import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchRadio,
    fetchBooks,
    fetchMovies,
    fetchPodcasts,
    fetchChannels,
    fetchActs2,
    getAllFalgs
} from "../services/dataService";

export const fetchInitialData = createAsyncThunk(
    "data/fetchInitialData",
    async () => {
        const [
            radio,
            books,
            Countries,
            movies,
            podcasts,
            channels,
            acts2
        ] = await Promise.all([
            fetchRadio(),
            fetchBooks(),
            getAllFalgs(),
            fetchMovies(),
            fetchPodcasts(),
            fetchChannels(),
            fetchActs2()
        ]);

        return { radio, books, Countries, movies, podcasts, channels, acts2 };
    }
);

const dataSlice = createSlice({
    name: "data",
    initialState: {
        radio: [],
        books: [],
        Countries: [],
        movies: [],
        podcasts: [],
        channels: [],
        acts2: [],
        loading: false
    },
    reducers: {
        clearData: (state) => {
            state.radio = [];
            state.books = [];
            state.Countries = [];
            state.movies = [];
            state.podcasts = [];
            state.channels = [];
            state.acts2 = [];
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
            });
    }
});

export const { clearData } = dataSlice.actions;
export default dataSlice.reducer;
