// Server component: plain markup. AraminConsole turns data-ac elements into live components in the browser.
const STATS = [
  { label: 'Revenue', value: 48250, prefix: '$' },
  { label: 'New users', value: 1284 },
  { label: 'Orders', value: 392 },
];

export default function Stats() {
  return (
    <div className="ac-bento ac-stagger">
      {STATS.map((s) => (
        <div key={s.label} className="ac-card ac-span-xs-6 ac-span-md-4 ac-span-4">
          <div className="ac-card__body">
            <div className="ac-stat">
              <span className="ac-stat__label">{s.label}</span>
              <span className="ac-stat__value" data-ac="counter" data-to={s.value} data-prefix={s.prefix}>0</span>
            </div>
          </div>
        </div>
      ))}
      <div className="ac-card ac-span-md-12 ac-span-4">
        <div className="ac-card__body">
          <div
            className="ac-chart-slot"
            data-ac="chart"
            data-ac-config={JSON.stringify({ type: 'line', series: [{ name: 'Visits', data: [5, 9, 7, 14, 11, 18, 16] }] })}
          />
        </div>
      </div>
    </div>
  );
}
