import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Send, Instagram, Facebook, Loader2 } from "lucide-react";
import { FaPinterest } from "react-icons/fa";

interface SocialComposerProps {
  userId: string;
}

export const SocialComposer = ({ userId }: SocialComposerProps) => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchConnectedAccounts();
  }, [userId]);

  const fetchConnectedAccounts = async () => {
    const { data } = await supabase
      .from('connected_accounts')
      .select('platform')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (data) {
      setConnectedAccounts(data);
      const platforms: Record<string, boolean> = {};
      data.forEach(account => {
        platforms[account.platform] = false;
      });
      setSelectedPlatforms(platforms);
    }
  };

  const handleGenerateContent = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe what you want to post about",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke('generate-ai-caption', {
        body: { 
          title: prompt,
          description: "",
          platform: Object.keys(selectedPlatforms)[0] || "instagram"
        }
      });

      if (error) throw error;

      setContent(data.caption);
      toast({
        title: "Content Generated!",
        description: "AI has created your social media post",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePost = async () => {
    const platforms = Object.entries(selectedPlatforms)
      .filter(([_, selected]) => selected)
      .map(([platform]) => platform);

    if (platforms.length === 0) {
      toast({
        title: "No Platforms Selected",
        description: "Please select at least one platform to post to",
        variant: "destructive",
      });
      return;
    }

    if (!content.trim()) {
      toast({
        title: "No Content",
        description: "Please write or generate content first",
        variant: "destructive",
      });
      return;
    }

    // Post to each selected platform
    try {
      const postPromises = platforms.map(async (platform) => {
        const { data, error } = await supabase.functions.invoke('post-to-platform', {
          body: { 
            platform,
            content,
            userId
          }
        });

        if (error) throw error;
        return { platform, success: true };
      });

      const results = await Promise.allSettled(postPromises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (successful > 0) {
        toast({
          title: "Posted Successfully!",
          description: `Posted to ${successful} platform${successful > 1 ? 's' : ''}${failed > 0 ? `, ${failed} failed` : ''}`,
        });
      } else {
        toast({
          title: "Posting Failed",
          description: "Failed to post to all selected platforms",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to post content",
        variant: "destructive",
      });
    }
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Content Creator */}
      <Card className="border-border shadow-card transition-smooth hover:shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Content Creator
          </CardTitle>
          <CardDescription>
            Generate engaging content with AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Generation */}
          <div className="space-y-3">
            <Label>What do you want to post about?</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="e.g., My new product launch, fitness tips, travel photos..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="bg-gradient-primary"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <Label htmlFor="content">Your Content</Label>
            <Textarea
              id="content"
              placeholder="Write your post here or generate with AI..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={10}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Selector & Post */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Select Platforms</CardTitle>
          <CardDescription>Choose where to post your content</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connectedAccounts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">
                No platforms connected yet.
              </p>
              <p className="text-xs text-muted-foreground">
                Go to Settings to connect your social media accounts
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {connectedAccounts.map((account) => (
                  <PlatformCheckbox
                    key={account.platform}
                    platform={account.platform}
                    checked={selectedPlatforms[account.platform] || false}
                    onCheckedChange={() => togglePlatform(account.platform)}
                  />
                ))}
              </div>

              <Button onClick={handlePost} className="w-full bg-gradient-primary" size="lg">
                <Send className="w-4 h-4 mr-2" />
                Post to Selected Platforms
              </Button>
            </>
          )}

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-sm mb-2">Platform Requirements:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Connect your accounts in Settings first</li>
              <li>• Character limits apply per platform</li>
              <li>• Some platforms require approval for posting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PlatformCheckboxProps {
  platform: string;
  checked: boolean;
  onCheckedChange: () => void;
}

const PlatformCheckbox = ({ platform, checked, onCheckedChange }: PlatformCheckboxProps) => {
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-500" />;
      case 'facebook':
        return <Facebook className="w-5 h-5 text-blue-600" />;
      case 'pinterest':
        return <FaPinterest className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-smooth">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} id={platform} />
      <label
        htmlFor={platform}
        className="flex items-center gap-2 flex-1 cursor-pointer"
      >
        {getPlatformIcon(platform)}
        <span className="font-medium capitalize">{platform}</span>
      </label>
    </div>
  );
};

export default SocialComposer;
