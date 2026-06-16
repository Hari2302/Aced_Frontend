import { useEffect } from "react";

const ensureMetaTag = (selector, attrs) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) =>
      tag.setAttribute(key, value),
    );
    document.head.appendChild(tag);
  }
  return tag;
};

const ensureLinkTag = (selector, attrs) => {
  let tag = document.head.querySelector(selector);
  if (!tag) {
    tag = document.createElement("link");
    Object.entries(attrs).forEach(([key, value]) =>
      tag.setAttribute(key, value),
    );
    document.head.appendChild(tag);
  }
  return tag;
};

const Seo = ({
  title,
  description,
  keywords,
  path = "/",
  image = "/vite.svg",
  noIndex = false,
  structuredData = [],
}) => {
  useEffect(() => {
    const siteName = "Kongu Neet Academy";
    const siteUrl = (
      import.meta.env.VITE_SITE_URL || "https://konguneetacademy.com"
    ).replace(/\/+$/, "");
    const canonicalUrl = `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
    const pageTitle = title ? `${title} | ${siteName}` : siteName;
    const imageUrl = image.startsWith("http")
      ? image
      : `${siteUrl}${image.startsWith("/") ? image : `/${image}`}`;

    document.title = pageTitle;

    ensureMetaTag('meta[name="description"]', {
      name: "description",
    }).setAttribute("content", description || "");
    ensureMetaTag('meta[name="keywords"]', { name: "keywords" }).setAttribute(
      "content",
      keywords || "",
    );
    ensureMetaTag('meta[name="robots"]', { name: "robots" }).setAttribute(
      "content",
      noIndex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    );

    ensureMetaTag('meta[property="og:type"]', {
      property: "og:type",
    }).setAttribute("content", "website");
    ensureMetaTag('meta[property="og:title"]', {
      property: "og:title",
    }).setAttribute("content", pageTitle);
    ensureMetaTag('meta[property="og:description"]', {
      property: "og:description",
    }).setAttribute("content", description || "");
    ensureMetaTag('meta[property="og:url"]', {
      property: "og:url",
    }).setAttribute("content", canonicalUrl);
    ensureMetaTag('meta[property="og:site_name"]', {
      property: "og:site_name",
    }).setAttribute("content", siteName);
    ensureMetaTag('meta[property="og:image"]', {
      property: "og:image",
    }).setAttribute("content", imageUrl);

    ensureMetaTag('meta[name="twitter:card"]', {
      name: "twitter:card",
    }).setAttribute("content", "summary_large_image");
    ensureMetaTag('meta[name="twitter:title"]', {
      name: "twitter:title",
    }).setAttribute("content", pageTitle);
    ensureMetaTag('meta[name="twitter:description"]', {
      name: "twitter:description",
    }).setAttribute("content", description || "");
    ensureMetaTag('meta[name="twitter:image"]', {
      name: "twitter:image",
    }).setAttribute("content", imageUrl);

    ensureLinkTag('link[rel="canonical"]', { rel: "canonical" }).setAttribute(
      "href",
      canonicalUrl,
    );

    const scriptId = "seo-json-ld";
    const existing = document.getElementById(scriptId);
    if (existing) existing.remove();

    if (Array.isArray(structuredData) && structuredData.length > 0) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      script.text = JSON.stringify(
        structuredData.length === 1 ? structuredData[0] : structuredData,
      );
      document.head.appendChild(script);
    }
  }, [title, description, keywords, path, image, noIndex, structuredData]);

  return null;
};

export default Seo;
