import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Your News",
    short_name: "Your News",
    description: "Bilingual English and Kannada digital news.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#c00000",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }]
  };
}
