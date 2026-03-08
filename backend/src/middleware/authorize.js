// backend/src/middleware/authorize.js — S3 (Membre 8)
// Middleware d'authentification JWT et contrôle des rôles
// Source : docs/roles.md (A3, L1)
//
// Usage dans les routes :
//   router.get('/',           authentifier, handler)              // Connexion requise
//   router.patch('/status',   authentifier, autoriser('gestionnaire'), handler)  // Gestionnaire requis
//
const jwt  = require('jsonwebtoken');
const { User } = require('../entities');

/**
 * Middleware d'authentification.
 * Vérifie le token Bearer et attache req.user = { id, nom_complet, email, role }
 *
 * @returns 401 si token absent, invalide, expiré ou compte introuvable
 */
async function authentifier(req, res, next) {
  const authHeader = req.headers['authorization'];

  // ── 1. Vérifier la présence du header ─────────────────────────
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: "Token d'authentification manquant.",
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // ── 2. Vérifier et décoder le token ───────────────────────
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: 'uqo-requests', // Doit correspondre au issuer dans login.js
    });

    // ── 3. Vérifier que l'utilisateur existe toujours en DB ───
    // (le compte pourrait avoir été supprimé après l'émission du token)
    const user = await User.findByPk(decoded.sub, {
      attributes: ['id', 'nom_complet', 'email', 'role'],
    });

    if (!user) {
      return res.status(401).json({ error: 'Compte introuvable.' });
    }

    // ── 4. Attacher l'utilisateur à la requête ────────────────
    req.user = user.toJSON();
    next();

  } catch (err) {
    // Distinguer les cas d'erreur JWT pour des messages précis
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expiré. Veuillez vous reconnecter.',
      });
    }
    return res.status(401).json({ error: 'Token invalide.' });
  }
}

/**
 * Middleware de restriction par rôle.
 * Doit être utilisé APRÈS authentifier().
 *
 * @param {...string} roles - Rôles autorisés ('utilisateur', 'gestionnaire')
 * @returns Middleware Express qui retourne 403 si le rôle n'est pas autorisé
 *
 * @example
 * // Route réservée aux gestionnaires
 * router.patch('/:id/status', authentifier, autoriser('gestionnaire'), async (req, res) => {...})
 *
 * @example
 * // Route ouverte à tous les rôles (inutile dans ce cas, mais possible)
 * router.get('/', authentifier, autoriser('utilisateur', 'gestionnaire'), handler)
 */
function autoriser(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Accès refusé. Rôle requis : ${roles.join(' ou ')}. Votre rôle actuel : "${req.user.role}".`,
      });
    }
    next();
  };
}

module.exports = { authentifier, autoriser };
