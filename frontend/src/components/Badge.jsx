import './Badge.css'

const Badge = ({ status }) => {
  return <span className={`badge ${status}`}>{status}</span>
}

export default Badge