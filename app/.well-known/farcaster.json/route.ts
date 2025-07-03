function withValidProperties(
  properties: Record<string, undefined | string | string[]>,
) {
  return Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => {
      if (Array.isArray(value)) {
        return value.length > 0;
      }
      return !!value;
    }),
  );
}

export async function GET() {
  const URL = process.env.NEXT_PUBLIC_URL;

  return Response.json({
    accountAssociation: {
      "accountAssociation": {
        "header": "",
        "payload": "",
        "signature": ""
      },
      "frame": {
        "version": "1",
        "name": "HowToBase Academy",
        "iconUrl": "https://how-to-base.vercel.app//icon.png",
        "splashImageUrl": "https://how-to-base.vercel.app//splash.png",
        "splashBackgroundColor": "#000000",
        "homeUrl": "https://how-to-base.vercel.app/",
        "webhookUrl": "https://how-to-base.vercel.app//api/webhook",
        "heroImageUrl": "https://how-to-base.vercel.app//hero.png",
        "ogTitle": "HowToBase",
        "ogImageUrl": "https://how-to-base.vercel.app//hero.png"
      }
    }
    frame: withValidProperties({
      version: "1",
      name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME,
      subtitle: process.env.NEXT_PUBLIC_APP_SUBTITLE,
      description: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
      screenshotUrls: [],
      iconUrl: process.env.NEXT_PUBLIC_APP_ICON,
      splashImageUrl: process.env.NEXT_PUBLIC_APP_SPLASH_IMAGE,
      splashBackgroundColor: process.env.NEXT_PUBLIC_SPLASH_BACKGROUND_COLOR,
      homeUrl: URL,
      webhookUrl: `${URL}/api/webhook`,
      primaryCategory: process.env.NEXT_PUBLIC_APP_PRIMARY_CATEGORY,
      tags: [],
      heroImageUrl: process.env.NEXT_PUBLIC_APP_HERO_IMAGE,
      tagline: process.env.NEXT_PUBLIC_APP_TAGLINE,
      ogTitle: process.env.NEXT_PUBLIC_APP_OG_TITLE,
      ogDescription: process.env.NEXT_PUBLIC_APP_OG_DESCRIPTION,
      ogImageUrl: process.env.NEXT_PUBLIC_APP_OG_IMAGE,
    }),
  });
}
