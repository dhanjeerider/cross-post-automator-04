# Usage Examples

This document provides practical examples of using the newly enabled OAuth and API features.

## Table of Contents
1. [YouTube API](#youtube-api)
2. [Imgbb Image Upload](#imgbb-image-upload)
3. [Pinterest OAuth](#pinterest-oauth)
4. [AI Caption Generation](#ai-caption-generation)

---

## YouTube API

### Search for Videos

```typescript
import { searchYouTubeVideos } from '@/utils/youtube';

// Search for videos about React
const videos = await searchYouTubeVideos('React tutorial', 10);

videos.forEach(video => {
  console.log(`Title: ${video.title}`);
  console.log(`Channel: ${video.channelTitle}`);
  console.log(`Thumbnail: ${video.thumbnail}`);
  console.log(`Published: ${video.publishedAt}`);
  console.log('---');
});
```

### Get Videos from a Channel

```typescript
import { getChannelVideos } from '@/utils/youtube';

// Get latest videos from a specific channel
const channelId = 'UC_x5XG1OV2P6uZZ5FSM9Ttw'; // Example channel ID
const videos = await getChannelVideos(channelId, 20);

console.log(`Found ${videos.length} videos from channel`);
```

### Search by Hashtag

```typescript
import { getVideosByHashtag } from '@/utils/youtube';

// Find videos with a specific hashtag
const videos = await getVideosByHashtag('shorts', 15);

videos.forEach(video => {
  console.log(`#shorts video: ${video.title}`);
});
```

---

## Imgbb Image Upload

### Upload from File Input

```typescript
import { uploadToImgbb } from '@/utils/imgbb';

// In a file input handler
const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  const file = event.target.files?.[0];
  if (!file) return;

  try {
    const result = await uploadToImgbb(file);
    
    console.log('Image uploaded!');
    console.log('URL:', result.url);
    console.log('Display URL:', result.displayUrl);
    console.log('Size:', result.size, 'bytes');
    
    // Use the URL in your posts
    setImageUrl(result.url);
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Upload from Base64

```typescript
import { uploadToImgbb } from '@/utils/imgbb';

// If you have a base64 string (e.g., from canvas)
const canvas = document.getElementById('myCanvas') as HTMLCanvasElement;
const base64 = canvas.toDataURL('image/png').split(',')[1];

const result = await uploadToImgbb(base64);
console.log('Canvas image uploaded:', result.url);
```

### Complete Image Upload Component Example

```typescript
import { useState } from 'react';
import { uploadToImgbb } from '@/utils/imgbb';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const { toast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadToImgbb(file);
      setImageUrl(result.url);
      toast({
        title: 'Success!',
        description: 'Image uploaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
      {imageUrl && <img src={imageUrl} alt="Uploaded" />}
    </div>
  );
}
```

---

## Pinterest OAuth

### Initiate Pinterest Connection

Users can connect Pinterest from the Settings page:

1. Navigate to Settings
2. Click "Connect" on Pinterest
3. Authorize the app on Pinterest
4. Automatically redirected back after authorization

### Programmatic Connection Check

```typescript
import { supabase } from '@/integrations/supabase/client';

// Check if user has Pinterest connected
async function isPinterestConnected(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'pinterest')
    .eq('is_active', true)
    .single();

  return !error && !!data;
}

// Usage
const connected = await isPinterestConnected(currentUser.id);
if (connected) {
  console.log('Pinterest is connected!');
} else {
  console.log('Please connect Pinterest in Settings');
}
```

### Get Connected Pinterest Account

```typescript
async function getPinterestAccount(userId: string) {
  const { data, error } = await supabase
    .from('connected_accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('platform', 'pinterest')
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Pinterest not connected');
  }

  return {
    username: data.platform_username,
    connectedAt: data.connected_at,
    lastUsed: data.last_used_at,
  };
}
```

---

## AI Caption Generation

### Generate Caption for a Post

The Gemini AI caption generation is available through the Supabase edge function:

```typescript
import { supabase } from '@/integrations/supabase/client';

async function generateCaption(
  title: string,
  description: string,
  platform: 'instagram' | 'youtube' | 'facebook' | 'tiktok' | 'pinterest'
) {
  const { data, error } = await supabase.functions.invoke('generate-ai-caption', {
    body: {
      title,
      description,
      platform,
    },
  });

  if (error) throw error;
  return data.caption;
}

// Usage
const caption = await generateCaption(
  'My Amazing Video',
  'This is a tutorial about React hooks and state management',
  'instagram'
);

console.log('Generated caption:', caption);
```

### Generate Captions for Multiple Platforms

```typescript
async function generateMultiPlatformCaptions(title: string, description: string) {
  const platforms = ['instagram', 'youtube', 'facebook', 'tiktok', 'pinterest'] as const;
  
  const captions = await Promise.all(
    platforms.map(async (platform) => {
      const caption = await generateCaption(title, description, platform);
      return { platform, caption };
    })
  );

  return captions;
}

// Usage
const allCaptions = await generateMultiPlatformCaptions(
  'My Amazing Video',
  'This is a tutorial about React'
);

allCaptions.forEach(({ platform, caption }) => {
  console.log(`\n${platform.toUpperCase()}:`);
  console.log(caption);
});
```

---

## Complete Workflow Example

Here's a complete example that combines multiple features:

```typescript
import { searchYouTubeVideos } from '@/utils/youtube';
import { uploadToImgbb } from '@/utils/imgbb';
import { supabase } from '@/integrations/supabase/client';

async function crossPostVideo(youtubeUrl: string) {
  // 1. Fetch video details from YouTube
  const videos = await searchYouTubeVideos('your search query', 1);
  const video = videos[0];

  // 2. Download and upload thumbnail to Imgbb
  const thumbnailResponse = await fetch(video.thumbnail);
  const thumbnailBlob = await thumbnailResponse.blob();
  const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' });
  const uploadedImage = await uploadToImgbb(thumbnailFile);

  // 3. Generate AI caption
  const { data: captionData } = await supabase.functions.invoke('generate-ai-caption', {
    body: {
      title: video.title,
      description: video.description,
      platform: 'instagram',
    },
  });

  // 4. Create the post
  const postData = {
    title: video.title,
    description: captionData.caption,
    imageUrl: uploadedImage.url,
    sourceUrl: youtubeUrl,
  };

  console.log('Ready to post:', postData);
  return postData;
}

// Usage
const post = await crossPostVideo('https://youtube.com/watch?v=...');
```

---

## Error Handling Best Practices

Always wrap API calls in try-catch blocks:

```typescript
import { uploadToImgbb } from '@/utils/imgbb';
import { useToast } from '@/hooks/use-toast';

function MyComponent() {
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      // Your API call here
      const result = await uploadToImgbb(file);
      
      toast({
        title: 'Success',
        description: 'Operation completed',
      });
    } catch (error) {
      console.error('Error:', error);
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return <button onClick={handleAction}>Upload</button>;
}
```

---

## Environment Variables

Remember to set these in your Supabase Dashboard for edge functions:

```bash
GEMINI_API_KEY=AIzaSyCyN_yWroef3t0yPWy-feJc89s_7Nrh-dc
YOUTUBE_API_KEY=AIzaSyDMJDSiqd78g52t6W0F0BAMUij5xSynDe0
PINTEREST_API_KEY=04b6e23cec2502fb538fec9319f644d262811caf
IMGBB_API_KEY=2a21aa2a66d64db0c276f6498bf56364
```

---

## Rate Limiting Considerations

Be mindful of API rate limits:

- **YouTube API**: 10,000 units per day (each search costs ~100 units)
- **Imgbb**: Check your account limits
- **Gemini AI**: Based on your API key tier
- **Pinterest**: Rate limits vary by endpoint

Implement caching and debouncing for better efficiency.

---

## Next Steps

1. Build UI components that use these utilities
2. Implement posting functionality for each platform
3. Add scheduling features
4. Create analytics dashboard
5. Implement content moderation

For more details, see `OAUTH_SETUP.md`.
