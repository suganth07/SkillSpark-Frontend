import { Alert, Linking } from "react-native";

export const openYouTubeLink = async (url: string): Promise<void> => {
  try {
    const getVideoId = (url: string): string | null => {
      const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/v\/([^&\n?#]+)/,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const videoId = getVideoId(url);
    if (!videoId) {
      throw new Error("Could not extract video ID from URL");
    }
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    await Linking.openURL(youtubeUrl);
    
  } catch (error) {
    console.error("Error in openYouTubeLink:", error);
    Alert.alert(
      "YouTube Error",
      `Failed to open YouTube video: ${error instanceof Error ? error.message : String(error)}`,
      [{ text: "OK", style: "default" }]
    );
  }
};

export const openExternalLink = async (url: string): Promise<void> => {
  try {
    if (!url.match(/^https?:\/\//)) {
      url = `https://${url}`;
    }
    if (url.includes("youtube.com") || url.includes("youtu.be")) {
      await openYouTubeLink(url);
      return;
    }
    await Linking.openURL(url);
    
  } catch (error) {
    console.error("Error opening external link:", error);
    Alert.alert(
      "Link Error",
      `Failed to open link: ${error instanceof Error ? error.message : String(error)}`,
      [{ text: "OK", style: "default" }]
    );
  }
};
