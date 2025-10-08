import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const state = searchParams.get('state');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(error);
        }

        if (!state || !code) {
          throw new Error('Missing required parameters');
        }

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Call the appropriate OAuth edge function to exchange code for tokens
        const { data, error: functionError } = await supabase.functions.invoke(
          `oauth-${state}`,
          {
            body: { code, userId: user.id }
          }
        );

        if (functionError) {
          throw functionError;
        }

        setStatus('success');
        setMessage(`Successfully connected to ${state}!`);
        
        toast({
          title: "Success",
          description: `Your ${state} account has been connected!`,
        });

        setTimeout(() => {
          navigate('/');
        }, 2000);

      } catch (error: any) {
        console.error('OAuth callback error:', error);
        setStatus('error');
        setMessage(error.message || 'Failed to connect account');
        
        toast({
          title: "Connection Failed",
          description: error.message || 'Failed to connect your account',
          variant: "destructive",
        });

        setTimeout(() => {
          navigate('/');
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            {status === 'loading' && 'Connecting Account'}
            {status === 'success' && 'Connected Successfully'}
            {status === 'error' && 'Connection Failed'}
          </CardTitle>
          <CardDescription className="text-center">
            {message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          {status === 'loading' && (
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
          )}
          {status === 'success' && (
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          )}
          {status === 'error' && (
            <XCircle className="h-16 w-16 text-destructive" />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OAuthCallback;
