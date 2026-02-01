import PropTypes from 'prop-types';
import './Card.css';

/**
 * Composant Card réutilisable
 * @param {node} children - Contenu de la carte
 * @param {string} title - Titre de la carte (optionnel)
 * @param {string} className - Classes CSS additionnelles
 * @param {function} onClick - Fonction appelée au clic (rend la carte cliquable)
 */
const Card = ({ children, title, className = '', onClick, ...props }) => {
  const cardClass = `
    card
    ${onClick ? 'card-clickable' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClass} onClick={onClick} {...props}>
      {title && <h3 className="card-title">{title}</h3>}
      <div className="card-content">{children}</div>
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func
};

export default Card