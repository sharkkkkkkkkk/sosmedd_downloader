'use client';

import { useState } from 'react';
import { Download, Link as LinkIcon, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { siInstagram, siYoutube, siX, siTiktok } from 'simple-icons/icons'

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // Auto-submit when a valid URL is pasted
  const handleInput = (e) => {
    const val = e.target.value;
    setUrl(val);

    // Simple basic check to avoid spamming on typing
    // If length > 15 and contains http, try to submit after short debounce or immediately if it looks like a paste
    if (val.length > 15 && (val.startsWith('http://') || val.startsWith('https://')) && !loading) {
      // Debounce slightly to allow full paste
      clearTimeout(window.submitTimeout);
      window.submitTimeout = setTimeout(() => {
        handleSubmit(null, val);
      }, 500);
    }
  };

  const handleSubmit = async (e, overrideUrl = null) => {
    if (e) e.preventDefault();
    const finalUrl = overrideUrl || url;
    if (!finalUrl) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: finalUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderResult = (data) => {
    if (!data) return null;

    const medias = data.medias || [];

    if (medias.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 mt-8">
          {medias.map((media, idx) => (
            media.url && (
              <Button
                asChild
                key={idx}
                size="lg"
                className="w-full h-16 text-lg font-bold shadow-lg hover:shadow-primary/20 transition-all active:scale-95 bg-primary hover:bg-primary/90"
              >
                <a
                  href={`/api/proxy-download?url=${encodeURIComponent(media.url)}&filename=video-${idx + 1}.${media.extension || 'mp4'}`}
                  download
                >
                  <Download className="w-5 h-5 mr-2" />
                  {media.quality || (media.extension ? media.extension.toUpperCase() : 'Download')}
                </a>
              </Button>
            )
          ))}
        </div>
      );
    }
    // Fallback for non-standard responses
    return null;
  };

  const SocialIcon = ({ icon }) => {
    // Invert black icons to white for dark mode visibility
    const color = icon.hex === '000000' ? 'FFFFFF' : icon.hex;

    return (
      <svg
        role="img"
        viewBox="0 0 24 24"
        className="w-8 h-8 fill-current"
        style={{ color: `#${color}` }}
      >
        <path d={icon.path} />
      </svg>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center p-4 sm:p-8 font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 w-full flex-1 flex flex-col items-center justify-center gap-8 py-8">

        {/* Header - Constrained */}
        <div className="w-full max-w-lg px-4 text-center space-y-4">
          <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-card to-background shadow-2xl mb-4 group hover:scale-105 transition-transform duration-300">
            <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl" />
            <Download className="w-10 h-10 text-primary drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
          </div>
          <div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-br from-white via-primary/50 to-primary">
              Sosmed Downloader
            </h1>
            <p className="text-muted-foreground text-lg max-w-xs mx-auto">
              Download videos from your favorite platforms.
            </p>
          </div>
        </div>

        {/* Scrolling Marquee - Full Width */}
        <div className="w-full overflow-hidden py-6 bg-transparent">
          <div className="flex select-none w-full">
            <motion.div
              className="flex gap-16 items-center flex-nowrap"
              initial={{ x: "-50%" }}
              animate={{ x: "0%" }}
              transition={{
                repeat: Infinity,
                ease: "linear",
                duration: 20
              }}
              style={{ width: "max-content", display: "flex", flexDirection: "row" }}
            >
              {[...Array(12)].map((_, i) => (
                <div key={i} className="flex gap-16 items-center px-4">
                  <SocialIcon icon={siInstagram} />
                  <SocialIcon icon={siYoutube} />
                  <SocialIcon icon={siX} />
                  <SocialIcon icon={siTiktok} />
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Form & Content - Constrained */}
        <div className="w-full max-w-lg px-4 flex flex-col gap-6 items-center">
          <Card className="w-full border-border/50 bg-card/60 backdrop-blur-md shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <CardContent className="pt-6 relative z-10">
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative group/input">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-secondary opacity-30 blur group-hover/input:opacity-50 transition duration-500 rounded-lg" />
                  <div className="relative bg-background rounded-lg flex items-center">
                    <LinkIcon className="absolute left-3 top-3.5 h-5 w-5 text-muted-foreground group-focus-within/input:text-primary transition-colors" />
                    <Input
                      type="url"
                      required
                      placeholder="Paste URL (IG, TikTok, X, YT)..."
                      className="h-12 pl-10 text-base bg-transparent border-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                      value={url}
                      onChange={handleInput}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-[0.98]"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : 'Get Video'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Status Messages */}
          {error && (
            <div className="w-full p-4 bg-destructive/10 border border-destructive/20 rounded-xl flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Results Area */}
          {result && renderResult(result)}

          {/* Promotion Section */}
          <div className="mt-6 text-center z-10 animate-in fade-in slide-in-from-bottom-3">
            <p className="text-slate-400 text-sm mb-3">
              Ingin belajar prompt-prompt AI keren?
            </p>
            <Button
              asChild
              variant="outline"
              className="rounded-full border-primary/50 text-primary hover:bg-primary hover:text-white transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.4)] group"
            >
              <a
                href="https://whatsapp.com/channel/0029Vb5dEP911ulSmdf6Ct2V"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span>Gabung Komunitas</span>
                <ExternalLink className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </a>
            </Button>
          </div>
        </div>
      </div>

      <footer className="py-8 text-center text-muted-foreground text-sm z-10 w-full mt-auto">
        <p className="opacity-70 mb-1">Secure • Fast • Serverless</p>
        <p className="font-semibold text-primary/80">Powered By Ksdhyaa</p>
      </footer>
    </div>
  );
}
