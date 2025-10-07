import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Key, Youtube, Instagram, Facebook, Twitter, Shield } from "lucide-react";
import { FaPinterest } from "react-icons/fa";
import { SiThreads } from "react-icons/si";

export const Settings = () => {
  const { toast } = useToast();

  const handleConnect = (platform: string) => {
    toast({
      title: "Opening Authorization",
      description: `Connecting to ${platform}...`,
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* API Keys */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            Platform API Keys
          </CardTitle>
          <CardDescription>
            Securely stored and encrypted
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <ApiKeyInput
              label="YouTube Data API Key"
              icon={<Youtube className="w-4 h-4 text-red-500" />}
              placeholder="Enter your YouTube API key"
              status="not-connected"
            />
            <ApiKeyInput
              label="Instagram Graph API"
              icon={<Instagram className="w-4 h-4 text-pink-500" />}
              placeholder="Requires Facebook Business account"
              status="not-connected"
            />
            <ApiKeyInput
              label="Twitter API Key"
              icon={<Twitter className="w-4 h-4 text-sky-500" />}
              placeholder="Requires paid Twitter API access"
              status="not-connected"
            />
          </div>

          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
            <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              API Setup Requirements
            </h4>
            <ul className="text-xs text-muted-foreground space-y-2">
              <li>• <strong>YouTube:</strong> Create project in Google Cloud Console</li>
              <li>• <strong>Instagram:</strong> Facebook Business account + app review</li>
              <li>• <strong>Twitter:</strong> Paid API access required for posting</li>
              <li>• <strong>Facebook:</strong> Facebook Developer account needed</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Platform Connections */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle>Platform Connections</CardTitle>
          <CardDescription>Connect your social media accounts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PlatformConnection
            icon={<Youtube className="w-5 h-5 text-red-500" />}
            name="YouTube"
            status="disconnected"
            onConnect={() => handleConnect("YouTube")}
          />
          <PlatformConnection
            icon={<Instagram className="w-5 h-5 text-pink-500" />}
            name="Instagram"
            status="disconnected"
            onConnect={() => handleConnect("Instagram")}
          />
          <PlatformConnection
            icon={<Facebook className="w-5 h-5 text-blue-600" />}
            name="Facebook"
            status="disconnected"
            onConnect={() => handleConnect("Facebook")}
          />
          <PlatformConnection
            icon={<Twitter className="w-5 h-5 text-sky-500" />}
            name="Twitter"
            status="disconnected"
            onConnect={() => handleConnect("Twitter")}
          />
          <PlatformConnection
            icon={<FaPinterest className="w-5 h-5 text-red-600" />}
            name="Pinterest"
            status="disconnected"
            onConnect={() => handleConnect("Pinterest")}
          />
          <PlatformConnection
            icon={<SiThreads className="w-5 h-5" />}
            name="Threads"
            status="disconnected"
            onConnect={() => handleConnect("Threads")}
          />
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card className="border-border shadow-card lg:col-span-2">
        <CardHeader>
          <CardTitle>Automation Settings</CardTitle>
          <CardDescription>Configure how your automations behave</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <SettingToggle
              label="Auto-post on discovery"
              description="Automatically post new videos as they're found"
              defaultChecked
            />
            <SettingToggle
              label="Preserve original captions"
              description="Keep the original video captions when cross-posting"
              defaultChecked
            />
            <SettingToggle
              label="Add watermark"
              description="Add your branding to reposted videos"
              defaultChecked={false}
            />
            <SettingToggle
              label="Email notifications"
              description="Get notified when automations run"
              defaultChecked
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

interface ApiKeyInputProps {
  label: string;
  icon: React.ReactNode;
  placeholder: string;
  status: "connected" | "not-connected";
}

const ApiKeyInput = ({ label, icon, placeholder, status }: ApiKeyInputProps) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-2">
          {icon}
          {label}
        </Label>
        <Badge variant={status === "connected" ? "default" : "secondary"}>
          {status === "connected" ? "Connected" : "Not Connected"}
        </Badge>
      </div>
      <div className="flex gap-2">
        <Input type="password" placeholder={placeholder} />
        <Button variant="secondary">Save</Button>
      </div>
    </div>
  );
};

interface PlatformConnectionProps {
  icon: React.ReactNode;
  name: string;
  status: "connected" | "disconnected";
  onConnect: () => void;
}

const PlatformConnection = ({ icon, name, status, onConnect }: PlatformConnectionProps) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/50 transition-smooth">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground">
            {status === "connected" ? "Account connected" : "Not connected"}
          </p>
        </div>
      </div>
      <Button
        variant={status === "connected" ? "secondary" : "default"}
        size="sm"
        onClick={onConnect}
        className={status === "disconnected" ? "bg-gradient-primary" : ""}
      >
        {status === "connected" ? "Disconnect" : "Connect"}
      </Button>
    </div>
  );
};

interface SettingToggleProps {
  label: string;
  description: string;
  defaultChecked: boolean;
}

const SettingToggle = ({ label, description, defaultChecked }: SettingToggleProps) => {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
};
