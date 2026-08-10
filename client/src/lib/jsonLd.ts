export function productJsonLd(product: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.productName,
    "image": product.images?.[0]?.fullPath ? [`http://localhost:3000${product.images[0].fullPath}`] : undefined,
    "description": product.description,
    "sku": product.productCode,
    "brand": {
      "@type": "Brand",
      "name": product.brandManufacturer || 'Talukder uPVC'
    }
  };
}

export function faqJsonLd(faqs: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `http://localhost:5173${item.url}`
    }))
  };
}
