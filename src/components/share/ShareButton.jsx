import React, { useEffect, useMemo, useState } from "react";
import { Share2, Copy, Mail, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

const SITE_URL = "https://www.swingmarketgolf.com";
const DEFAULT_MESSAGE = "Voici une annonce intéressante que j'ai vu sur SwingMarketGolf : ";

function buildProductUrl(product) {
  const slug = product?.slug || product?.id;
  return `${SITE_URL}/product/${slug}`;
}

function isMobileViewport() {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

const WhatsAppIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.057 21.785h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.889-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884zm8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.473-8.413z" />
  </svg>
);

const MessengerIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.652V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.26L19.752 8l-6.561 6.963z" />
  </svg>
);

const TelegramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
);

const FacebookIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
);

const TwitterIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const CHANNELS = [
  {
    key: "whatsapp",
    label: "WhatsApp",
    Icon: WhatsAppIcon,
    color: "#25D366",
    bg: "#E8F8EE",
  },
  {
    key: "messenger",
    label: "Messenger",
    Icon: MessengerIcon,
    color: "#0084FF",
    bg: "#E5F2FF",
  },
  {
    key: "telegram",
    label: "Telegram",
    Icon: TelegramIcon,
    color: "#0088CC",
    bg: "#E0F2FB",
  },
  {
    key: "sms",
    label: "SMS",
    Icon: MessageSquare,
    color: "#34C759",
    bg: "#E8F8EE",
  },
  {
    key: "email",
    label: "Email",
    Icon: Mail,
    color: "#C5A028",
    bg: "#FAF3DA",
  },
  {
    key: "instagram",
    label: "Instagram",
    Icon: InstagramIcon,
    color: "#E1306C",
    bg: "linear-gradient(135deg, #FCE6F0 0%, #F3E0F8 100%)",
  },
  {
    key: "facebook",
    label: "Facebook",
    Icon: FacebookIcon,
    color: "#1877F2",
    bg: "#E5EFFE",
  },
  {
    key: "twitter",
    label: "X",
    Icon: TwitterIcon,
    color: "#000000",
    bg: "#EFEFEF",
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    Icon: LinkedInIcon,
    color: "#0A66C2",
    bg: "#E1EDF8",
  },
  {
    key: "copy_link",
    label: "Copier",
    Icon: Copy,
    color: "#173404",
    bg: "#E8F0E2",
  },
];

async function trackShare({ product, channel, currentUser, variant }) {
  try {
    await supabase.from("share_events").insert({
      product_id: product?.id,
      user_id: currentUser?.id || null,
      channel,
      referrer_url: typeof window !== "undefined" ? window.location.href : null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      is_anonymous: !currentUser,
      metadata: {
        variant,
        has_native_share:
          typeof navigator !== "undefined" && !!navigator.share,
      },
    });
  } catch (err) {
    console.warn("[ShareButton] tracking failed", err);
  }
}

async function copyToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn("[ShareButton] clipboard API failed", err);
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    return true;
  } catch (err) {
    console.warn("[ShareButton] fallback clipboard failed", err);
    return false;
  }
}

export default function ShareButton({ product, variant = "compact", className = "" }) {
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setCurrentUser(data?.session?.user || null);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mql = window.matchMedia("(max-width: 768px)");
    const update = () => setIsMobile(mql.matches);
    update();
    if (mql.addEventListener) {
      mql.addEventListener("change", update);
      return () => mql.removeEventListener("change", update);
    }
    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  const productUrl = useMemo(() => buildProductUrl(product), [product]);
  const shareMessage = DEFAULT_MESSAGE;
  const fullText = shareMessage + productUrl;

  const handleChannel = async (channelKey) => {
    setOpen(false);
    trackShare({ product, channel: channelKey, currentUser, variant });

    const encodedUrl = encodeURIComponent(productUrl);
    const encodedMessage = encodeURIComponent(shareMessage);
    const encodedFull = encodeURIComponent(fullText);
    const isMobileNow = isMobileViewport();

    switch (channelKey) {
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedFull}`, "_blank", "noopener,noreferrer");
        break;
      case "messenger": {
        const target = isMobileNow
          ? `fb-messenger://share?link=${encodedUrl}`
          : `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        window.open(target, "_blank", "noopener,noreferrer");
        break;
      }
      case "telegram":
        window.open(
          `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "sms":
        window.location.href = `sms:?&body=${encodedFull}`;
        break;
      case "email":
        window.location.href = `mailto:?subject=${encodeURIComponent(
          "Annonce SwingMarketGolf"
        )}&body=${encodedFull}`;
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          "_blank",
          "noopener,noreferrer"
        );
        break;
      case "instagram": {
        const ok = await copyToClipboard(productUrl);
        toast({
          title: ok ? "Lien copié" : "Copie impossible",
          description: ok
            ? "Collez-le dans votre story Instagram"
            : "Copiez l'URL depuis la barre d'adresse.",
        });
        break;
      }
      case "copy_link": {
        const ok = await copyToClipboard(productUrl);
        toast({
          title: ok ? "Lien copié !" : "Copie impossible",
          description: ok ? productUrl : "Copiez l'URL depuis la barre d'adresse.",
        });
        break;
      }
      default:
        break;
    }
  };

  const handleTriggerClick = async (e) => {
    if (
      isMobileViewport() &&
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function"
    ) {
      e.preventDefault();
      e.stopPropagation();
      trackShare({ product, channel: "native_share", currentUser, variant });
      try {
        await navigator.share({
          title: product?.title || "SwingMarketGolf",
          text: shareMessage,
          url: productUrl,
        });
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.warn("[ShareButton] native share failed", err);
          setOpen(true);
        }
      }
      return;
    }
    setOpen((v) => !v);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleTriggerClick}
          className={`rounded-full border-[#173404] text-[#173404] hover:bg-[#173404]/5 font-semibold ${className}`}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Partager
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] p-4 border border-[#E5E0D5] rounded-2xl shadow-[0_12px_32px_-8px_rgba(0,0,0,0.12)]"
        style={{ background: "#FAF8F3" }}
      >
        <div className="mb-3">
          <p className="text-sm font-semibold text-[#042C53]">Partager cette annonce</p>
          <p className="text-[11px] text-[#5F5E5A] mt-0.5 truncate">{productUrl}</p>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {CHANNELS.map(({ key, label, Icon, color, bg }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleChannel(key)}
              className="group flex flex-col items-center gap-1 p-1.5 rounded-xl bg-white border border-[#EFEAE0] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md hover:scale-[1.05]"
              aria-label={`Partager via ${label}`}
            >
              <span
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </span>
              <span className="text-[10px] font-medium text-[#5F5E5A] leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
