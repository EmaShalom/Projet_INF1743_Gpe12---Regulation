import PropTypes from 'prop-types';
import './Select.css';

/**
 * Composant Select réutilisable
 * @param {string} label - Label du champ
 * @param {string} name - Nom du champ
 * @param {string} value - Valeur sélectionnée
 * @param {function} onChange - Fonction appelée au changement
 * @param {array} options - Liste des options [{value, label}]
 * @param {string} error - Message d'erreur
 * @param {boolean} required - Champ requis
 * @param {boolean} disabled - Champ désactivé
 */
const Select = ({
  label,
  name,
  value,
  onChange,
  options = [],
  error,
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const selectClass = `
    select
    ${error ? 'select-error' : ''}
    ${disabled ? 'select-disabled' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="select-group">
      {label && (
        <label htmlFor={name} className="select-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={selectClass}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      
      {error && (
        <span className="select-error-message">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

Select.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string
};

export default Select