import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Youtube, Instagram, ArrowRight, Hash, Link as LinkIcon, Play } from "lucide-react";

export const VideoAutomation = () => {
  const { toast } = useToast();
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<"single" | "hashtag">("single");
  const [fromPlatform, setFromPlatform] = useState<"youtube" | "instagram">("youtube");
  const [toPlatform, setToPlatform] = useState<"instagram" | "youtube">("instagram");

  const handleCreateAutomation = () => {
    if (!sourceUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL or hashtag",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Automation Created!",
      description: `Videos from ${fromPlatform} will be automatically posted to ${toPlatform}`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Configuration Card */}
      <Card className="border-border shadow-card transition-smooth hover:shadow-elevated">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5 text-primary" />
            Video Cross-Post Automation
          </CardTitle>
          <CardDescription>
            Automatically repost videos between YouTube Shorts and Instagram Reels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Type */}
          <div className="space-y-2">
            <Label>Source Type</Label>
            <Select value={sourceType} onValueChange={(v) => setSourceType(v as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" />
                    Single Video URL
                  </div>
                </SelectItem>
                <SelectItem value="hashtag">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Hashtag Feed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Platform Direction */}
          <div className="space-y-2">
            <Label>Automation Direction</Label>
            <div className="flex items-center gap-3">
              <Select value={fromPlatform} onValueChange={(v) => setFromPlatform(v as any)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube Shorts
                    </div>
                  </SelectItem>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram Reels
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <ArrowRight className="w-5 h-5 text-muted-foreground" />

              <Select value={toPlatform} onValueChange={(v) => setToPlatform(v as any)}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">
                    <div className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram Reels
                    </div>
                  </SelectItem>
                  <SelectItem value="youtube">
                    <div className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube Shorts
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="source-url">
              {sourceType === "single" ? "Video URL" : "Hashtag or Channel URL"}
            </Label>
            <Input
              id="source-url"
              placeholder={
                sourceType === "single"
                  ? "https://youtube.com/shorts/..."
                  : "#trending or channel URL"
              }
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          <Button onClick={handleCreateAutomation} className="w-full bg-gradient-primary">
            Create Automation
          </Button>
        </CardContent>
      </Card>

      {/* Active Automations */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Active Automations</CardTitle>
          <CardDescription>Your running video automation rules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <AutomationItem
              from="youtube"
              to="instagram"
              source="#fitness"
              status="active"
              postsCount={12}
            />
            <AutomationItem
              from="instagram"
              to="youtube"
              source="Single Video"
              status="paused"
              postsCount={1}
            />
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Create your first automation above to get started
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

interface AutomationItemProps {
  from: "youtube" | "instagram";
  to: "youtube" | "instagram";
  source: string;
  status: "active" | "paused";
  postsCount: number;
}

const AutomationItem = ({ from, to, source, status, postsCount }: AutomationItemProps) => {
  return (
    <div className="p-4 rounded-lg border border-border bg-secondary/50 transition-smooth hover:bg-secondary">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {from === "youtube" ? (
            <Youtube className="w-5 h-5 text-red-500" />
          ) : (
            <Instagram className="w-5 h-5 text-pink-500" />
          )}
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
          {to === "youtube" ? (
            <Youtube className="w-5 h-5 text-red-500" />
          ) : (
            <Instagram className="w-5 h-5 text-pink-500" />
          )}
          <div className="ml-2">
            <p className="font-medium text-sm">{source}</p>
            <p className="text-xs text-muted-foreground">{postsCount} videos posted</p>
          </div>
        </div>
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status}
        </Badge>
      </div>
    </div>
  );
};
