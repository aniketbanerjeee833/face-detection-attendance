export default function Badge({ status }) {
  const map = {
    present: { label: 'Present', cls: 'badge--present' },
    late:    { label: 'Late',    cls: 'badge--late' },
    absent:  { label: 'Absent', cls: 'badge--absent' },
  };
  const { label, cls } = map[status] || { label: status, cls: '' };
  return <span className={`badge ${cls}`}>{label}</span>;
}
