import PropTypes from 'prop-types'
import './Input.css'

const Input = ({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder = '',
  error,
  required = false
}) => {
  return (
    <div className="input-group">
      {label && (
        <label className="input-label">
          {label} {required && '*'}
        </label>
      )}

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input ${error ? 'input-error' : ''}`}
      />

      {error && <span className="error-text">{error}</span>}
    </div>
  )
}

Input.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  required: PropTypes.bool
}

export default Input