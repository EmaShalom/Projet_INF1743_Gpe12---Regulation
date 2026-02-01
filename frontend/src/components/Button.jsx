import PropTypes from 'prop-types';
import './Button.css';

/**
 * Composant Button réutilisable
 * @param {string} variant - Style du bouton: 'primary', 'secondary', 'danger', 'success'
 * @param {string} size - Taille: 'small', 'medium', 'large'
 * @param {boolean} disabled - Bouton désactivé
 * @param {boolean} loading - Afficher un spinner de chargement
 * @param {function} onClick - Fonction appelée au clic
 * @param {string} type - Type du bouton: 'button', 'submit', 'reset'
 * @param {node} children - Contenu du bouton
 * @param {string} className - Classes CSS additionnelles
 */
const Button = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  children,
  className = '',
  ...props
}) => {
  const handleClick = (e) => {
    if (!disabled && !loading && onClick) {
      onClick(e);
    }
  };

  const buttonClass = `
    btn 
    btn-${variant} 
    btn-${size} 
    ${disabled || loading ? 'btn-disabled' : ''} 
    ${loading ? 'btn-loading' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="btn-spinner"></span>
      )}
      <span className={loading ? 'btn-content-loading' : ''}>
        {children}
      </span>
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  onClick: PropTypes.func,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default Button