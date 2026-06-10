import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // react-leaflet ships ESM that Next can transpile directly; no extra config needed.
};

export default withNextIntl(nextConfig);
