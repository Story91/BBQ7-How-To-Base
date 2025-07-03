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
      header: "eyJmaWQiOjM0MDY3OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDc2MjExZGEyNEFFZGFmOTEzQTc3OTVFODE0RTU5MDExY2RCQzQyNjQifQ",
      payload: "eyJkb21haW4iOiJob3ctdG8tYmFzZS52ZXJjZWwuYXBwIn0",
      signature: "ajpO9rZapfYXjiUCMHuFf5QPngS3IJ0S6kMw/AiOPS4ak9Qo2hygriJNuQVe14VXL8tA6Kgu5XqTHYFskcULMRw="
    },
    frame: {
      version: "1",
      name: "HowToBase Academy",
      iconUrl: "https://how-to-base.vercel.app/icon.png",
      splashImageUrl: "https://how-to-base.vercel.app/splash.png",
      splashBackgroundColor: "#000000",
      homeUrl: "https://how-to-base.vercel.app/",
      webhookUrl: "https://how-to-base.vercel.app/api/webhook",
      heroImageUrl: "https://how-to-base.vercel.app/hero.png",
      ogTitle: "HowToBase",
      ogImageUrl: "https://how-to-base.vercel.app/hero.png"
    }
  });
}
