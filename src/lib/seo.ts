import { Metadata } from "next";

// ==========================================
// SEO CONSTANTS
// ==========================================

export const SITE_CONFIG = {
  name: "إديو سنتر",
  nameEn: "EduCenter",
  description: "منصة إديو سنتر - أكبر منصة تعليمية في مصر. نوفر تعليم متميز للمراحل الابتدائية والإعدادية والثانوية مع أفضل المعلمين.",
  descriptionEn: "EduCenter - Egypt's largest educational platform. Providing excellent education for Primary, Preparatory, and Secondary stages.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://educenter.com",
  ogImage: "/og-image.png",
  twitterImage: "/twitter-image.png",
  locale: "ar_EG",
  type: "website",
  keywords: [
    "تعليم",
    "دروس خصوصية",
    "معلمين",
    "مصر",
    "مدرسة",
    "ثانوية عامة",
    "إعدادي",
    "ابتدائي",
    "فيزياء",
    "رياضيات",
    "كيمياء",
    "أونلاين",
    "إديو سنتر",
    "EduCenter",
    "education",
    "tutoring",
    "Egypt",
  ],
};

// ==========================================
// TYPES
// ==========================================

export interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article";
  noIndex?: boolean;
  canonical?: string;
}

// ==========================================
// METADATA GENERATOR
// ==========================================

export function generateMetadata({
  title,
  description,
  keywords = [],
  image,
  url,
  type = "website",
  noIndex = false,
  canonical,
}: SEOProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_CONFIG.name}`
    : SITE_CONFIG.name;
  
  const fullDescription = description || SITE_CONFIG.description;
  const fullImage = image || SITE_CONFIG.ogImage;
  const fullUrl = url ? `${SITE_CONFIG.url}${url}` : SITE_CONFIG.url;
  const allKeywords = [...SITE_CONFIG.keywords, ...keywords];

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords.join(", "),
    authors: [{ name: SITE_CONFIG.name }],
    creator: SITE_CONFIG.name,
    publisher: SITE_CONFIG.name,
    metadataBase: new URL(SITE_CONFIG.url),
    alternates: {
      canonical: canonical || fullUrl,
      languages: {
        "ar-EG": fullUrl,
      },
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: fullUrl,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: type,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: fullDescription,
      images: [fullImage],
      creator: "@educenter",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

// ==========================================
// STRUCTURED DATA GENERATORS
// ==========================================

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.name,
    nameEn: SITE_CONFIG.nameEn,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/logo.png`,
    description: SITE_CONFIG.description,
    address: {
      "@type": "PostalAddress",
      addressCountry: "EG",
      addressLocality: "Cairo",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      availableLanguage: ["Arabic", "English"],
    },
    sameAs: [
      "https://www.facebook.com/educenter",
      "https://www.twitter.com/educenter",
      "https://www.instagram.com/educenter",
    ],
  };
}

export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };
}

export function generateCourseSchema({
  name,
  description,
  provider,
  url,
}: {
  name: string;
  description: string;
  provider: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    url: `${SITE_CONFIG.url}${url}`,
  };
}

export function generateFAQSchema(questions: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

export function generateLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_CONFIG.name,
    image: `${SITE_CONFIG.url}/logo.png`,
    url: SITE_CONFIG.url,
    telephone: "+20-XXX-XXX-XXXX",
    address: {
      "@type": "PostalAddress",
      streetAddress: "القاهرة",
      addressLocality: "القاهرة",
      addressRegion: "القاهرة",
      postalCode: "12345",
      addressCountry: "EG",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 30.0444,
      longitude: 31.2357,
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: "09:00",
      closes: "22:00",
    },
  };
}
