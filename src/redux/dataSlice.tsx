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
    fetchSubscribedPodcasts,
    fetchLiveVideos,
    fetchMostWatchedChannels,
    fetchTopUSAChannels,
    fetchSavedChannels,
    fetchMostReadBooks,
    fetchTopUSABooks,
    fetchSavedBooks,
    fetchMostWatchedMovies,
    fetchSavedMovies,
    fetchSavedPodcasts
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
            subscribedPodcasts,
            liveVideos,
            mostWatchedChannels,
            topUSAChannels,
            savedChannels,
            mostReadBooks,
            topUSABooks,
            savedBooks,
            mostWatchedMovies,
            savedMovies,
            savedPodcasts
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
            fetchSubscribedPodcasts(userId),
            fetchLiveVideos(),
            fetchMostWatchedChannels(),
            fetchTopUSAChannels(),
            fetchSavedChannels(userId),
            fetchMostReadBooks(),
            fetchTopUSABooks(),
            fetchSavedBooks(userId),
            fetchMostWatchedMovies(),
            fetchSavedMovies(userId),
            fetchSavedPodcasts(userId)
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
            subscribedPodcasts,
            liveVideos,
            mostWatchedChannels,
            topUSAChannels,
            savedChannels,
            mostReadBooks,
            topUSABooks,
            savedBooks,
            mostWatchedMovies,
            savedMovies,
            savedPodcasts
        };
    }
);

export const refreshSavedBooks = createAsyncThunk(
    "data/refreshSavedBooks",
    async (userId: string) => {
        const savedBooks = await fetchSavedBooks(userId);
        return savedBooks;
    }
);

export const refreshSavedMovies = createAsyncThunk(
    "data/refreshSavedMovies",
    async (userId: string) => {
        const savedMovies = await fetchSavedMovies(userId);
        return savedMovies;
    }
);

export const refreshSavedRadios = createAsyncThunk(
    "data/refreshSavedRadios",
    async (userId: string) => {
        const savedRadios = await fetchSavedRadios(userId);
        return savedRadios;
    }
);

export const refreshSavedChannels = createAsyncThunk(
    "data/refreshSavedChannels",
    async (userId: string) => {
        const savedChannels = await fetchSavedChannels(userId);
        return savedChannels;
    }
);

export const refreshSavedPodcasts = createAsyncThunk(
    "data/refreshSavedPodcasts",
    async (userId: string) => {
        const savedPodcasts = await fetchSavedPodcasts(userId);
        return savedPodcasts;
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
        savedPodcasts: [] as any[],
        channels: [] as any[],
        acts2: [] as any[],
        mostListenedRadios: [] as any[],
        topUSARadios: [] as any[],
        savedRadios: [] as any[],
        mostListenedPodcasts: [] as any[],
        newNoteworthyPodcasts: [] as any[],
        subscribedPodcasts: [] as any[],
        liveVideos: [] as any[],
        mostWatchedChannels: [] as any[],
        topUSAChannels: [] as any[],
        savedChannels: [] as any[],
        mostReadBooks: [] as any[],
        topUSABooks: [] as any[],
        savedBooks: [] as any[],
        mostWatchedMovies: [] as any[],
        savedMovies: [] as any[],
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
            state.savedPodcasts = [];
            state.channels = [];
            state.acts2 = [];
            state.mostListenedRadios = [];
            state.topUSARadios = [];
            state.savedRadios = [];
            state.mostListenedPodcasts = [];
            state.newNoteworthyPodcasts = [];
            state.subscribedPodcasts = [];
            state.liveVideos = [];
            state.mostWatchedChannels = [];
            state.topUSAChannels = [];
            state.savedChannels = [];
            state.selectedCountry = null;
            state.savedChannels = [];
            state.mostReadBooks = [];
            state.topUSABooks = [];
            state.savedBooks = [];
            state.mostWatchedMovies = [];
            state.savedMovies = [];
            state.selectedCountry = null;
        },
        toggleChannelSaveState: (state, action) => {
            const { channelId, userId } = action.payload;

            // Helper to toggle star array
            const toggleStar = (item: any) => {
                if (!item.star) item.star = [];
                const index = item.star.indexOf(userId);
                if (index > -1) {
                    item.star.splice(index, 1); // Unsave
                } else {
                    item.star.push(userId); // Save
                }
            };

            // Update in all lists
            const listsToUpdate = [
                state.mostWatchedChannels,
                state.topUSAChannels,
                state.channels,
                state.savedChannels // Also update savedChannels immediately if present
            ];

            listsToUpdate.forEach(list => {
                const channel = list.find((c: any) => c.id === channelId || c._id === channelId);
                if (channel) {
                    toggleStar(channel);
                }
            });
        },
        toggleBookSaveState: (state, action) => {
            const { bookId, userId } = action.payload;

            const toggleStar = (item: any) => {
                if (!item.star) item.star = [];
                const index = item.star.indexOf(userId);
                if (index > -1) {
                    item.star.splice(index, 1);
                } else {
                    item.star.push(userId);
                }
            };

            const listsToUpdate = [
                state.mostReadBooks,
                state.topUSABooks,
                state.books,
                state.savedBooks
            ];

            listsToUpdate.forEach(list => {
                const book = list.find((b: any) => b.id === bookId || b._id === bookId);
                if (book) {
                    toggleStar(book);
                }
            });
        },
        toggleMovieSaveState: (state, action) => {
            const { movieId, userId } = action.payload;

            const toggleStar = (item: any) => {
                if (!item.star) item.star = [];
                const index = item.star.indexOf(userId);
                if (index > -1) {
                    item.star.splice(index, 1);
                } else {
                    item.star.push(userId);
                }
            };

            const listsToUpdate = [
                state.mostWatchedMovies,
                state.movies,
                state.savedMovies
            ];

            listsToUpdate.forEach(list => {
                const movie = list.find((m: any) => m.id === movieId || m._id === movieId);
                if (movie) {
                    toggleStar(movie);
                }
            });
        },
        togglePodcastSaveState: (state, action) => {
            const { podcastId, userId } = action.payload;

            // Helper to toggle star array (Favorites)
            const toggleStar = (item: any) => {
                if (!item.star) item.star = [];
                const index = item.star.indexOf(userId);
                if (index > -1) {
                    item.star.splice(index, 1);
                } else {
                    item.star.push(userId);
                }
            };

            const listsToUpdate = [
                state.mostListenedPodcasts,
                state.newNoteworthyPodcasts,
                state.podcasts,
                state.savedPodcasts // Update savedPodcasts
            ];

            listsToUpdate.forEach(list => {
                const podcast = list.find((p: any) => p.id === podcastId || p._id === podcastId);
                if (podcast) {
                    toggleStar(podcast);
                }
            });
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
            })
            .addCase(refreshSavedChannels.fulfilled, (state, action) => {
                state.savedChannels = action.payload;
            })
            .addCase(refreshSavedBooks.fulfilled, (state, action) => {
                state.savedBooks = action.payload;
            })
            .addCase(refreshSavedMovies.fulfilled, (state, action) => {
                state.savedMovies = action.payload;
            })
            .addCase(refreshSavedPodcasts.fulfilled, (state, action) => {
                state.savedPodcasts = action.payload;
            });
    }
});

export const { setSelectedCountry, clearData, toggleChannelSaveState, toggleBookSaveState, toggleMovieSaveState, togglePodcastSaveState } = dataSlice.actions;

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

// Selector for filtered channels based on selected country
export const getFilteredChannels = (state: any) => {
    const { channels, selectedCountry } = state.data;

    // If no country selected or "Global", return all
    if (!selectedCountry || selectedCountry === "Global") {
        return channels;
    }

    // Filter channels by selected country (type field)
    return channels.filter((c: any) =>
        c.type?.toLowerCase() === selectedCountry.toLowerCase()
    );
};

// Selector for filtered books
export const getFilteredBooks = (state: any) => {
    const { books, selectedCountry } = state.data;

    if (!selectedCountry || selectedCountry === "Global") {
        return books;
    }

    // Filter books by country (using 'type' or 'country' field)
    return books.filter((b: any) =>
        b.type?.toLowerCase() === selectedCountry.toLowerCase()
    );
};

export default dataSlice.reducer;
