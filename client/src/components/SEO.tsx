import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  type?: string;
  image?: string;
  jsonLd?: object;
  noIndex?: boolean;
}

const SITE_NAME = 'Talukder uPVC Fittings Ltd.';
const DEFAULT_DESCRIPTION = 'Bangladesh\'s leading manufacturer of uPVC pipes and fittings for water supply, drainage, and irrigation. BS-3505 certified, 100% virgin material.';
const BASE_URL = 'https://talukder-upvc.com';

export default function SEO({ title, description, canonical, type = 'website', image, jsonLd, noIndex }: SEOProps) {
  const pageTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const pageDesc = description || DEFAULT_DESCRIPTION;
  const pageUrl = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: BASE_URL,
    logo: `${BASE_URL}/LOGO/Talukder-uPVC-Fittings-LTD-1.png`,
    description: DEFAULT_DESCRIPTION,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Dhaka-Aricha Highway, Savar',
      addressLocality: 'Dhaka',
      addressCountry: 'BD',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+880-123-456-789',
      contactType: 'sales',
    },
  };

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDesc} />
      <link rel="canonical" href={pageUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDesc} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={pageUrl} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDesc} />
      {image && <meta name="twitter:image" content={image} />}

      {/* No Index */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* JSON-LD */}
      <script type="application/ld+json">{JSON.stringify(jsonLd || organizationSchema)}</script>
    </Helmet>
  );
}
