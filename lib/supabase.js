import { createClient } from "@supabase/supabase-js";

// Client Supabase ADMIN (clé service_role), strictement SERVEUR — ce
// fichier ne doit jamais être importé depuis un composant "use client".
// La clé service_role contourne toutes les policies RLS de Supabase :
// c'est exactement pourquoi l'upload passe par la route API (validation
// Zero Trust côté serveur, cf. avatarSchema) plutôt qu'un upload direct
// depuis le navigateur avec une clé exposée.

export const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
);
