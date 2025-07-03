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
  // Use deployed URL as fallback
  const URL = "https://how-to-base.vercel.app";

  return Response.json({
    accountAssociation: {
      header: "eyJmaWQiOjM0MDY3OCwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDc2MjExZGEyNEFFZGFmOTEzQTc3OTVFODE0RTU5MDExY2RCQzQyNjQifQ",
      payload: "eyJkb21haW4iOiJob3ctdG8tYmFzZS52ZXJjZWwuYXBwIn0",
      signature: "ajpO9rZapfYXjiUCMHuFf5QPngS3IJ0S6kMw/AiOPS4ak9Qo2hygriJNuQVe14VXL8tA6Kgu5XqTHYFskcULMRw="
    },
    frame: {
      version: "1",
      name: "HowToBase Academy",
      iconUrl: `${URL}/icon.png`,
      imageUrl: `${URL}/hero.png`,
      buttonTitle: "Launch Academy",
      splashImageUrl: `${URL}/splash.png`,
      splashBackgroundColor: "#000000",
      homeUrl: `${URL}/`,
      webhookUrl: `${URL}/api/webhook`,
      heroImageUrl: `${URL}/hero.png`,
      subtitle: "Master Base Development",
      description: "Interactive Base ecosystem learning platform with hands-on OnchainKit, Paymaster, Spend Permissions tutorials. Build crypto skills gamified.",
      screenshotUrls: [`${URL}/screenshot.png`],
      primaryCategory: "developer-tools",
      tags: ["base", "blockchain", "education", "web3", "defi", "tutorials"],
      tagline: "Learn Base. Build Better.",
      ogTitle: "HowToBase Academy",
      ogDescription: "Master Base blockchain development through interactive tutorials and hands-on learning",
      ogImageUrl: `${URL}/hero.png`,
      castShareUrl: `${URL}/`
    }
  });
}
