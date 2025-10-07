import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, Upload, Send, Instagram, Facebook, Twitter } from "lucide-react";
import { FaPinterest } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

export const SocialComposer = () => {
  const { toast } = useToast();
  const [content, setContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState({
    instagram: true,
    facebook: true,
    twitter: true,
    pinterest: false,
    threads: false,
  });

  const handleGenerateContent = async () => {
    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      setContent(
        "🚀 Exciting news! We're launching something amazing today. Stay tuned for updates! ✨\n\n#NewProduct #Innovation #Tech"
      );
      setIsGenerating(false);
      toast({
        title: "Content Generated!",
        description: "AI has created your social media post",
      });
    }, 2000);
  };

  const handlePost = () => {
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

    toast({
      title: "Posted Successfully!",
      description: `Your content has been posted to ${platforms.join(", ")}`,
    });
  };

  const togglePlatform = (platform: keyof typeof selectedPlatforms) => {
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
            Content Creator
          </CardTitle>
          <CardDescription>
            Generate AI-powered content or write your own post
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* AI Generation */}
          <div className="space-y-3">
            <Label>AI Content Generator</Label>
            <div className="flex gap-2">
              <Input placeholder="Describe what you want to post about..." />
              <Button
                onClick={handleGenerateContent}
                disabled={isGenerating}
                className="bg-gradient-primary"
              >
                {isGenerating ? (
                  <>Generating...</>
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
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              {content.length} characters
            </p>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Add Media (Optional)</Label>
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-smooth cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload images or videos
              </p>
              <input type="file" className="hidden" accept="image/*,video/*" multiple />
            </div>
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
          <div className="space-y-4">
            <PlatformCheckbox
              icon={<Instagram className="w-5 h-5 text-pink-500" />}
              label="Instagram"
              checked={selectedPlatforms.instagram}
              onCheckedChange={() => togglePlatform("instagram")}
            />
            <PlatformCheckbox
              icon={<Facebook className="w-5 h-5 text-blue-600" />}
              label="Facebook"
              checked={selectedPlatforms.facebook}
              onCheckedChange={() => togglePlatform("facebook")}
            />
            <PlatformCheckbox
              icon={<Twitter className="w-5 h-5 text-sky-500" />}
              label="Twitter"
              checked={selectedPlatforms.twitter}
              onCheckedChange={() => togglePlatform("twitter")}
            />
            <PlatformCheckbox
              icon={<FaPinterest className="w-5 h-5 text-red-600" />}
              label="Pinterest"
              checked={selectedPlatforms.pinterest}
              onCheckedChange={() => togglePlatform("pinterest")}
            />
            <PlatformCheckbox
              icon={<SiThreads className="w-5 h-5" />}
              label="Threads"
              checked={selectedPlatforms.threads}
              onCheckedChange={() => togglePlatform("threads")}
            />
          </div>

          <Button onClick={handlePost} className="w-full bg-gradient-primary" size="lg">
            <Send className="w-4 h-4 mr-2" />
            Post to All Selected Platforms
          </Button>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-sm mb-2">Platform Requirements:</h4>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Connect your accounts in Settings first</li>
              <li>• Character limits apply per platform</li>
              <li>• Video formats may vary</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface PlatformCheckboxProps {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onCheckedChange: () => void;
}

const PlatformCheckbox = ({ icon, label, checked, onCheckedChange }: PlatformCheckboxProps) => {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-secondary/50 transition-smooth">
      <Checkbox checked={checked} onCheckedChange={onCheckedChange} id={label} />
      <label
        htmlFor={label}
        className="flex items-center gap-2 flex-1 cursor-pointer"
      >
        {icon}
        <span className="font-medium">{label}</span>
      </label>
    </div>
  );
};
