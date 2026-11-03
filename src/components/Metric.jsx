import Icon from "./Icon";

export default function Metric({ icon, label, value }) {
  return (
    <div className="metric">
      <Icon name={icon} />
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
    </div>
  );
}
