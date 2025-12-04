export const users = [
  {
    id: "user-1",
    username: "atlas",
    name: "Atlas Gray",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=60",
    location: "Berlin, DE",
    bio: "Portrait & editorial photographer crafting luminous skin tones.",
    links: [
      { label: "Website", url: "https://atlasgray.photo" },
      { label: "Instagram", url: "https://instagram.com/atlas" },
    ],
    counters: { photos: 54, followers: 12800, following: 420 },
    isCreator: true,
  },
  {
    id: "user-2",
    username: "lumen",
    name: "Nova Lumen",
    avatar:
      "https://images.unsplash.com/photo-1506898667547-42e1c9c1c1b3?auto=format&fit=crop&w=200&q=60",
    location: "Reykjavik, IS",
    bio: "Nightscapes and aurora hunting. Long exposure enthusiast.",
    links: [{ label: "Portfolio", url: "https://lumen.fyi" }],
    counters: { photos: 68, followers: 8200, following: 310 },
    isCreator: true,
  },
  {
    id: "user-3",
    username: "vega",
    name: "Vega Shore",
    avatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=60",
    location: "San Francisco, US",
    bio: "Street photography, shadows, and reflections.",
    links: [{ label: "Twitter", url: "https://x.com/vegashore" }],
    counters: { photos: 39, followers: 5400, following: 270 },
    isCreator: false,
  },
];
