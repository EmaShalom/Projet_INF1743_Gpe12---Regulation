// frontend/src/components/ErrorMessage.jsx — I3 (Membre 8)
// Gestion centralisée des erreurs API côté interface utilisateur
//
// Exporte 3 éléments :
//   1. extraireMessageErreur(error)  — traduit les erreurs Axios en message lisible
//   2. <ErrorMessage error={...} />  — bandeau d'erreur rouge (affiché si error ≠ null)
//   3. <ChampErreur erreur="..." />  — message rouge sous un champ de formulaire

/**
 * Traduit une erreur Axios en message lisible pour l'utilisateur.
 * Couvre les codes HTTP courants et les erreurs réseau.
 *
 * @param {Error|null} error - Erreur Axios ou null
 * @returns {string} Message lisible
 */
export function extraireMessageErreur(error) {
  if (!error) return 'Une erreur inconnue est survenue.';

  // Réponse du serveur reçue (le serveur a répondu, même avec une erreur)
  if (error.response) {
    const { status, data } = error.response;
    switch (status) {
      case 400:
        return data?.error || 'Données invalides. Vérifiez les champs du formulaire.';
      case 401:
        return data?.error || 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return data?.error || "Accès refusé. Vous n'avez pas les permissions nécessaires.";
      case 404:
        return data?.error || 'Ressource introuvable.';
      case 409:
        return data?.error || 'Conflit : cette ressource existe déjà.';
      case 500:
        return 'Erreur serveur interne. Veuillez réessayer plus tard.';
      default:
        return data?.error || `Erreur inattendue (code ${status}).`;
    }
  }

  // Requête envoyée mais pas de réponse (timeout, serveur éteint)
  if (error.request) {
    return 'Impossible de contacter le serveur. Vérifiez votre connexion.';
  }

  // Erreur lors de la configuration de la requête
  return error.message || 'Une erreur est survenue.';
}

/**
 * Bandeau d'erreur rouge.
 * Ne s'affiche pas si error est null/undefined.
 *
 * @param {{ error: Error|string|null, className?: string }} props
 *
 * @example
 * const [erreurApi, setErreurApi] = useState(null);
 * // ...
 * <ErrorMessage error={erreurApi} />
 */
export default function ErrorMessage({ error, className = '' }) {
  if (!error) return null;

  const message = typeof error === 'string'
    ? error
    : extraireMessageErreur(error);

  return (
    <div
      role="alert"
      className={className}
      style={{
        background:   '#FEF2F2',
        border:       '1px solid #FECACA',
        borderRadius: 6,
        color:        '#DC2626',
        padding:      '10px 14px',
        fontSize:     14,
        marginBottom: 12,
        lineHeight:   1.5,
      }}
    >
      ⚠️ {message}
    </div>
  );
}

/**
 * Erreur sous un champ de formulaire.
 * Ne s'affiche pas si erreur est null/undefined/"".
 *
 * @param {{ erreur: string|null }} props
 *
 * @example
 * <input type="text" ... />
 * <ChampErreur erreur={erreurs.nom_complet} />
 */
export function ChampErreur({ erreur }) {
  if (!erreur) return null;
  return (
    <span style={{
      color:     '#DC2626',
      fontSize:  12,
      marginTop: 4,
      display:   'block',
    }}>
      {erreur}
    </span>
  );
}
