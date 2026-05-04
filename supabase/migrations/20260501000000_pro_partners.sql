-- ═══════════════════════════════════════════════════════════════
-- Table pro_partners : joueurs professionnels partenaires SMG
-- Date  : 2026-05-01
-- Notes : RLS adaptée au pattern admin du projet (admin_users +
--         service_role bypass). La fonction set_updated_at est
--         créée si elle n'existe pas (CREATE OR REPLACE).
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1) Trigger function set_updated_at (idempotent)
-- ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ───────────────────────────────────────────────────────────────
-- 2) Table pro_partners
-- ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pro_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identité
  slug TEXT UNIQUE NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  photo_url TEXT,

  -- Statut affiché (ex: "Pro Tour", "LET Tour", "Coach Pro", "Challenge Tour")
  statut_label TEXT NOT NULL,

  -- Palmarès court (ex: "Vainqueur Open de France 2024")
  palmares_court TEXT,

  -- Hero du profil
  citation_hero TEXT,
  description_courte TEXT,

  -- Stats : JSON array [{value, label}]
  stats JSONB DEFAULT '[]'::jsonb,

  -- Setup tournoi
  setup_tournoi TEXT,

  -- Mot de recommandation du pro
  recommandation_text TEXT,
  recommandation_produit TEXT,

  -- Liens externes
  instagram_url TEXT,

  -- Lien vers le compte vendeur (annonces du pro)
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Couleurs du gradient hero
  gradient_color_1 TEXT DEFAULT '#143818',
  gradient_color_2 TEXT DEFAULT '#1B5E20',
  gradient_color_3 TEXT DEFAULT '#C5A028',

  -- Affichage
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ───────────────────────────────────────────────────────────────
-- 3) Indexes
-- ───────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_pro_partners_slug
  ON public.pro_partners(slug);

CREATE INDEX IF NOT EXISTS idx_pro_partners_active_order
  ON public.pro_partners(is_active, display_order)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_pro_partners_profile
  ON public.pro_partners(profile_id)
  WHERE profile_id IS NOT NULL;

-- ───────────────────────────────────────────────────────────────
-- 4) Trigger updated_at
-- ───────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS pro_partners_set_updated_at ON public.pro_partners;
CREATE TRIGGER pro_partners_set_updated_at
  BEFORE UPDATE ON public.pro_partners
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ───────────────────────────────────────────────────────────────
-- 5) RLS (Row Level Security)
--    Note : admin du projet utilise table admin_users (auth custom)
--    + écritures via service_role qui bypass RLS automatiquement.
--    On ne crée donc QUE la lecture publique des actifs ; pas de
--    policy d'écriture (= tout bloqué pour anon/authenticated, mais
--    service_role passe à travers).
-- ───────────────────────────────────────────────────────────────
ALTER TABLE public.pro_partners ENABLE ROW LEVEL SECURITY;

-- Idempotent : drop avant recreate
DROP POLICY IF EXISTS "pro_partners_public_read_active" ON public.pro_partners;
CREATE POLICY "pro_partners_public_read_active"
  ON public.pro_partners
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- ───────────────────────────────────────────────────────────────
-- 6) Commentaires (documentation)
-- ───────────────────────────────────────────────────────────────
COMMENT ON TABLE  public.pro_partners IS
  'Joueurs professionnels partenaires affichés sur /joueurs-partenaires';
COMMENT ON COLUMN public.pro_partners.slug IS
  'URL slug, ex: julien-grillon';
COMMENT ON COLUMN public.pro_partners.profile_id IS
  'Lien vers compte vendeur Supabase pour récupérer ses annonces';
COMMENT ON COLUMN public.pro_partners.stats IS
  'JSON array: [{value, label}] - ex: [{"value":"12","label":"Victoires"}]';
