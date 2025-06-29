import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const normalizeSpotifyTrack = (track) => ({
  key: track.id,
  title: track.name,
  subtitle: track.artists?.map((a) => a.name).join(', '),
  images: {
    coverart: track.album?.images?.[0]?.url || '',
  },
  hub: {
    actions: [
      {}, // placeholder
      { uri: track.preview_url }, // preview link
    ],
  },
  artists: track.artists?.map((a) => ({ adamid: a.id })),
});

export const shazamCoreApi = createApi({
  reducerPath: 'shazamCoreApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://spotify23.p.rapidapi.com',
    prepareHeaders: (headers) => {
      headers.set('X-RapidAPI-Key', import.meta.env.VITE_SHAZAM_CORE_RAPID_API_KEY);
      headers.set('X-RapidAPI-Host', 'spotify23.p.rapidapi.com');
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getTopCharts: builder.query({
      query: () => 'playlist_tracks/?id=37i9dQZEVXbMDoHDwVN2tF&limit=20',
      transformResponse: (res) => res?.items?.map((item) => normalizeSpotifyTrack(item.track)),
    }),
    getSongsByGenre: builder.query({
      query: (genre) => `search/?q=${genre}&type=tracks&limit=10`,
      transformResponse: (res) => res?.tracks?.items?.map((item) => normalizeSpotifyTrack(item.data)),
    }),
    getSongsByCountry: builder.query({
      query: (countryCode) => 'playlist_tracks/?id=37i9dQZEVXbL0GavIqMTeb&limit=20',
      transformResponse: (res) => res?.items?.map((item) => normalizeSpotifyTrack(item.track)),
    }),
    getSongsBySearch: builder.query({
      query: (searchTerm) => `search/?q=${searchTerm}&type=tracks&limit=10`,
      transformResponse: (res) =>
        res?.tracks?.items?.map((item) => ({
          key: item.data.id,
          title: item.data.name,
          subtitle: item.data.artists?.map((a) => a.name).join(', '),
          images: {
            coverart: item.data.album?.images?.[0]?.url || '',
          },
          hub: {
            actions: [{}, { uri: item.data.preview_url }],
          },
          artists: item.data.artists?.map((a) => ({ adamid: a.id })),
        })),
    }),
    getArtistDetails: builder.query({
      query: (artistId) => `artist_overview/?id=${artistId}`,
    }),
    getSongDetails: builder.query({
      query: ({ songid }) => `tracks/?ids=${songid}`,
      transformResponse: (res) => normalizeSpotifyTrack(res.tracks[0]),
    }),
    getSongRelated: builder.query({
      query: ({ songid }) => `recommendations/?seed_tracks=${songid}&limit=10`,
      transformResponse: (res) => res.tracks?.map((track) => normalizeSpotifyTrack(track)),
    }),
  }),
});

export const {
  useGetTopChartsQuery,
  useGetSongsByGenreQuery,
  useGetSongsByCountryQuery,
  useGetSongsBySearchQuery,
  useGetArtistDetailsQuery,
  useGetSongDetailsQuery,
  useGetSongRelatedQuery,
} = shazamCoreApi;
