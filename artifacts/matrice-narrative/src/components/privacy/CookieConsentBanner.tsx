import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "matrice_cookie_consent_v1";

type ConsentState = {
  essential: true;
  analytics: boolean;
  decidedAt: string;
};

function saveConsent(analytics: boolean) {
  const value: ConsentState = {
    essential: true,
    analytics,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent("matrice:cookie-consent", { detail: value }));
}

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    setVisible(!window.localStorage.getItem(STORAGE_KEY));
  }, []);

  if (!visible) return null;

  function choose(analyticsEnabled: boolean) {
    saveConsent(analyticsEnabled);
    setVisible(false);
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-[220] border-t border-matrice-sable bg-white px-4 py-4 text-matrice-encre shadow-2xl shadow-black/15 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold">Choix des cookies</p>
          <p className="mt-1 text-sm leading-6 text-matrice-encre/70">
            Les cookies essentiels restent actifs pour l'authentification et la securite. Les cookies analytics sont
            desactives par defaut et ne seront charges qu'avec ton accord.
          </p>
          {customizing ? (
            <label className="mt-3 flex items-start gap-3 rounded-xl border border-matrice-sable bg-matrice-ivoire/70 p-3 text-sm">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(event) => setAnalytics(event.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="block font-medium">Analytics</span>
                <span className="block text-matrice-encre/65">Mesure d'audience non essentielle, off par defaut.</span>
              </span>
            </label>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:pt-1">
          <Button variant="outline" onClick={() => choose(false)}>
            Refuser
          </Button>
          {customizing ? (
            <Button onClick={() => choose(analytics)}>
              Enregistrer
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => setCustomizing(true)}>
              Personnaliser
            </Button>
          )}
          <Button onClick={() => choose(true)}>
            Accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
