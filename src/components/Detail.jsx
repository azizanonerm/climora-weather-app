import Icon from "./Icon";

export default function Detail({ icon, label, value, hint }) {
  return (
    <div className="detail-card card">
      <div className="detail-icon">
        <Icon name={icon} />
      </div>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <span>{hint}</span>
      </div>
    </div>
  );
}
