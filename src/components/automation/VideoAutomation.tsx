import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Youtube, Instagram, ArrowRight, Hash, Link as LinkIcon, Play, Loader2, Trash2 } from "lucide-react";

interface VideoAutomationProps {
  userId: string;
}

export const VideoAutomation = ({ userId }: VideoAutomationProps) => {
  const { toast } = useToast();
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState<"single" | "hashtag">("single");
  const [fromPlatform, setFromPlatform] = useState<"youtube" | "instagram">("youtube");
  const [toPlatform, setToPlatform] = useState<"instagram" | "youtube">("instagram");
  const [useAi, setUseAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState<any[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);

  useEffect(() => {
    fetchAutomationRules();
  }, [userId]);

  const fetchAutomationRules = async () => {
    const { data, error } = await supabase
      .from('automation_rules')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching rules:', error);
    } else {
      setRules(data || []);
    }
    setLoadingRules(false);
  };

  const handleCreateAutomation = async () => {
    if (!sourceUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a video URL or hashtag",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // For single video, verify it exists using YouTube API
      if (sourceType === "single" && fromPlatform === "youtube") {
        const { data: videoData, error: videoError } = await supabase.functions.invoke('fetch-youtube-video', {
          body: { videoUrl: sourceUrl }
        });

        if (videoError) throw new Error("Could not verify video URL");
      }

      const { error } = await supabase
        .from('automation_rules')
        .insert({
          user_id: userId,
          name: `${fromPlatform} to ${toPlatform} - ${sourceType}`,
          source_platform: fromPlatform,
          target_platforms: [toPlatform],
          source_type: sourceType,
          source_identifier: sourceUrl,
          use_ai_captions: useAi,
          status: 'active'
        });

      if (error) throw error;

      toast({
        title: "Automation Created!",
        description: `Videos from ${fromPlatform} will be automatically posted to ${toPlatform}`,
      });

      setSourceUrl("");
      fetchAutomationRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create automation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    const { error } = await supabase
      .from('automation_rules')
      .delete()
      .eq('id', ruleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete automation",
        variant: "destructive",
      });
    } else {
      toast({ title: "Automation deleted" });
      fetchAutomationRules();
    }
  };

  const toggleRuleStatus = async (ruleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    
    const { error } = await supabase
      .from('automation_rules')
      .update({ status: newStatus })
      .eq('id', ruleId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      });
    } else {
      fetchAutomationRules();
    }
  };

  const handleRunAutomation = async (ruleId: string) => {
    try {
      const { error } = await supabase.functions.invoke('execute-automation', {
        body: { automationId: ruleId, userId }
      });

      if (error) throw error;

      toast({
        title: "Automation Running",
        description: "Your content is being posted to the selected platforms.",
      });

      fetchAutomationRules();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to run automation",
        variant: "destructive",
      });
    }
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
                    Hashtag Feed (Coming Soon)
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
                      YouTube
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
                      Instagram (Coming Soon)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* URL Input */}
          <div className="space-y-2">
            <Label htmlFor="source-url">
              {sourceType === "single" ? "YouTube Video URL" : "Hashtag"}
            </Label>
            <Input
              id="source-url"
              placeholder={
                sourceType === "single"
                  ? "https://youtube.com/shorts/... or https://youtu.be/..."
                  : "#trending"
              }
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
            />
          </div>

          {/* AI Captions Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-border">
            <div className="space-y-0.5">
              <Label>Use AI to Generate Captions</Label>
              <p className="text-xs text-muted-foreground">
                Automatically create engaging captions for each platform
              </p>
            </div>
            <Switch checked={useAi} onCheckedChange={setUseAi} />
          </div>

          <Button 
            onClick={handleCreateAutomation} 
            className="w-full bg-gradient-primary"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
          {loadingRules ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rules.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No automations yet. Create your first automation above to get started!
            </p>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="p-4 rounded-lg border border-border bg-secondary/50 transition-smooth hover:bg-secondary"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      {rule.source_platform === "youtube" ? (
                        <Youtube className="w-5 h-5 text-red-500" />
                      ) : (
                        <Instagram className="w-5 h-5 text-pink-500" />
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      {rule.target_platforms[0] === "youtube" ? (
                        <Youtube className="w-5 h-5 text-red-500" />
                      ) : (
                        <Instagram className="w-5 h-5 text-pink-500" />
                      )}
                    </div>
                    <Badge variant={rule.status === "active" ? "default" : "secondary"}>
                      {rule.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{rule.name}</p>
                  <p className="text-xs text-muted-foreground truncate mb-3">
                    {rule.source_identifier}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="bg-gradient-primary"
                      onClick={() => handleRunAutomation(rule.id)}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Run Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleRuleStatus(rule.id, rule.status)}
                    >
                      {rule.status === 'active' ? 'Pause' : 'Resume'}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VideoAutomation;
