import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterCard?: string;
  twitterSite?: string;
  twitterCreator?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = 'Sistema de aluguel de veículos com gestão completa de clientes, veículos e aluguéis.',
  keywords = 'aluguel de veículos, locadora, gestão de frotas, aluguel de carros',
  ogImage = '/logo.png',
  ogUrl = window.location.href,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterSite = '@carrental',
  twitterCreator = '@carrental',
}) => {
  const siteTitle = `${title} | Car Rental`;

  return (
    <Helmet>
      {/* Título e Meta Tags Básicas */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={twitterSite} />
      <meta name="twitter:creator" content={twitterCreator} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Outras Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={ogUrl} />
    </Helmet>
  );
}; 