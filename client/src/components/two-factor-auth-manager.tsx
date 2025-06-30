import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, ShieldCheck, ShieldX, Key, Copy, RefreshCw, Smartphone, AlertTriangle } from "lucide-react";

interface User {
  id: number;
  username: string;
  twoFactorEnabled: boolean;
}

interface SetupResponse {
  success: boolean;
  qrCode: string;
  backupCodes: string[];
  secret: string;
}

export default function TwoFactorAuthManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [password, setPassword] = useState('');
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [newBackupCodes, setNewBackupCodes] = useState<string[]>([]);

  // Get current user info
  const { data: userResponse } = useQuery<{ user: User }>({
    queryKey: ['/api/admin/me'],
  });

  const user = userResponse?.user;

  // Setup 2FA
  const setupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to setup 2FA');
      }
      
      return response.json();
    },
    onSuccess: (data: SetupResponse) => {
      setSetupData(data);
      setShowSetupDialog(true);
      toast({
        title: "2FA Setup",
        description: "Scan the QR code with your authenticator app",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enable 2FA
  const enableMutation = useMutation({
    mutationFn: async () => {
      if (!setupData || !verificationCode) {
        throw new Error('Setup data and verification code required');
      }

      const response = await fetch('/api/admin/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: verificationCode,
          secret: setupData.secret,
          backupCodes: setupData.backupCodes
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to enable 2FA');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] });
      setShowSetupDialog(false);
      setSetupData(null);
      setVerificationCode('');
      toast({
        title: "Success",
        description: "Two-factor authentication enabled successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to disable 2FA');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/me'] });
      setShowDisableDialog(false);
      setPassword('');
      toast({
        title: "Success",
        description: "Two-factor authentication disabled",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate new backup codes
  const generateBackupCodesMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/admin/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate backup codes');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setNewBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      toast({
        title: "Success",
        description: "New backup codes generated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Copied to clipboard",
    });
  };

  const copyAllBackupCodes = (codes: string[]) => {
    const allCodes = codes.join('\n');
    navigator.clipboard.writeText(allCodes);
    toast({
      title: "Copied",
      description: "All backup codes copied to clipboard",
    });
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              {user.twoFactorEnabled ? (
                <ShieldCheck className="h-8 w-8 text-green-600" />
              ) : (
                <ShieldX className="h-8 w-8 text-red-600" />
              )}
              <div>
                <h3 className="font-medium">
                  Two-Factor Authentication
                </h3>
                <p className="text-sm text-muted-foreground">
                  {user.twoFactorEnabled 
                    ? 'Your account is protected with 2FA' 
                    : 'Your account is not protected with 2FA'
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.twoFactorEnabled ? "default" : "secondary"}>
                {user.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {user.twoFactorEnabled ? (
                <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Disable 2FA
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                        Disable Two-Factor Authentication
                      </DialogTitle>
                      <DialogDescription>
                        This will remove the extra security from your account. Enter your password to confirm.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="disable-password">Current Password</Label>
                        <Input
                          id="disable-password"
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Enter your current password"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => disableMutation.mutate()}
                          disabled={!password || disableMutation.isPending}
                          variant="destructive"
                          className="flex-1"
                        >
                          {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
                        </Button>
                        <Button
                          onClick={() => setShowDisableDialog(false)}
                          variant="outline"
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              ) : (
                <Button
                  onClick={() => setupMutation.mutate()}
                  disabled={setupMutation.isPending}
                  className="flex items-center gap-2"
                >
                  <Smartphone className="h-4 w-4" />
                  {setupMutation.isPending ? 'Setting up...' : 'Enable 2FA'}
                </Button>
              )}
            </div>
          </div>

          {user.twoFactorEnabled && (
            <div className="space-y-3">
              <Alert>
                <Key className="h-4 w-4" />
                <AlertDescription>
                  Keep your backup codes in a safe place. You can use them to access your account if you lose your phone.
                </AlertDescription>
              </Alert>
              <Button
                onClick={() => generateBackupCodesMutation.mutate()}
                disabled={generateBackupCodesMutation.isPending}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                {generateBackupCodesMutation.isPending ? 'Generating...' : 'Generate New Backup Codes'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={setShowSetupDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Setup Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Follow these steps to enable 2FA on your account
            </DialogDescription>
          </DialogHeader>
          
          {setupData && (
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="font-medium mb-2">1. Scan QR Code</h3>
                <div className="flex justify-center mb-2">
                  <img src={setupData.qrCode} alt="2FA QR Code" className="border rounded" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-2">2. Enter Verification Code</h3>
                <Label htmlFor="verification-code">6-digit code from your app</Label>
                <Input
                  id="verification-code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="123456"
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
              </div>

              <div>
                <h3 className="font-medium mb-2">3. Save Backup Codes</h3>
                <div className="bg-gray-50 p-3 rounded border space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Backup Codes</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyAllBackupCodes(setupData.backupCodes)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs font-mono">
                    {setupData.backupCodes.map((code, index) => (
                      <div key={index} className="p-1 bg-white rounded border text-center">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Store these codes safely. You can use them to access your account if you lose your phone.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => enableMutation.mutate()}
                  disabled={!verificationCode || verificationCode.length !== 6 || enableMutation.isPending}
                  className="flex-1"
                >
                  {enableMutation.isPending ? 'Enabling...' : 'Enable 2FA'}
                </Button>
                <Button
                  onClick={() => setShowSetupDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Backup Codes</DialogTitle>
            <DialogDescription>
              These are your new backup codes. Save them in a secure location.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Backup Codes</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyAllBackupCodes(newBackupCodes)}
                >
                  <Copy className="h-4 w-4" />
                  Copy All
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                {newBackupCodes.map((code, index) => (
                  <div
                    key={index}
                    className="p-2 bg-white rounded border text-center cursor-pointer hover:bg-gray-50"
                    onClick={() => copyToClipboard(code)}
                  >
                    {code}
                  </div>
                ))}
              </div>
            </div>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your old backup codes are no longer valid. Make sure to save these new codes in a secure location.
              </AlertDescription>
            </Alert>
            
            <Button
              onClick={() => setShowBackupCodes(false)}
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}