import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://resumeforge.dev";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/templates", "/features", "/how-it-works"],
        disallow: ["/dashboard", "/editor", "/api"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
