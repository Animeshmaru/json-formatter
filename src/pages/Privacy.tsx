import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Server, Eye, Cookie, Wifi, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="gap-2 mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Formatter
          </Button>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Privacy Policy</h1>
            <p className="text-muted-foreground">Your data never leaves your browser</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Server className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">No Server</h3>
                <p className="text-sm text-muted-foreground">
                  This tool runs entirely in your browser. There is no backend server processing
                  your data. Your JSON never leaves your device.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Eye className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">No Tracking</h3>
                <p className="text-sm text-muted-foreground">
                  We don't use any analytics, tracking pixels, or third-party scripts. Your usage
                  patterns are never monitored or recorded.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">No Cookies</h3>
                <p className="text-sm text-muted-foreground">
                  We don't set any cookies. Your preferences and tabs are stored in localStorage,
                  which stays on your device and is never transmitted anywhere.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Wifi className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Works Offline</h3>
                <p className="text-sm text-muted-foreground">
                  Once loaded, this tool works completely offline. You can disconnect from the
                  internet and continue using all features without any limitations.
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-card border border-border">
            <div className="flex items-start gap-3">
              <Lock className="h-5 w-5 text-success mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Local Storage Only</h3>
                <p className="text-sm text-muted-foreground">
                  All your data (tabs, preferences, JSON content) is stored only in your browser's
                  localStorage. Clear your browser data to remove everything.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 rounded-lg bg-muted text-center">
          <p className="text-sm text-muted-foreground">
            <strong className="text-foreground">Summary:</strong> We can't see your data because we
            literally have no way to receive it. This is a static, client-side application with
            zero backend infrastructure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
