import React from 'react';

const DAY_ABBREVIATIONS = {
  Sunday: 'Sun',
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
};

const INTENSITY_STEPS = [0.12, 0.32, 0.52, 0.72, 1];

function intensityToOpacity(intensity) {
  const stepIndex = Math.min(
    INTENSITY_STEPS.length - 1,
    Math.floor(intensity * (INTENSITY_STEPS.length - 1) + 0.0001)
  );
  return INTENSITY_STEPS[stepIndex];
}

function shortHourLabel(hourLabel) {
  return hourLabel.replace(':00 ', '').replace('AM', 'a').replace('PM', 'p');
}

function OperationsSummary({ heatmap }) {
  if (!heatmap || heatmap.length === 0) {
    return <p className="state-message">Not enough data to show demand patterns yet.</p>;
  }

  const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const hourLabels = [...new Set(heatmap.map((entry) => entry.hourLabel))];

  const cellByDayHour = {};
  heatmap.forEach((entry) => {
    cellByDayHour[`${entry.dayName}__${entry.hourLabel}`] = entry;
  });

  return (
    <div>
      <div style={{ overflowX: 'auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: `36px repeat(${hourLabels.length}, 1fr)`, gap: '2px', minWidth: `${36 + hourLabels.length * 24}px` }}>
          <div />
          {hourLabels.map((hourLabel) => (
            <div
              key={hourLabel}
              style={{ fontSize: '9px', color: 'var(--color-text-faint)', textAlign: 'center' }}
            >
              {shortHourLabel(hourLabel)}
            </div>
          ))}

          {dayOrder.map((dayName) => (
            <React.Fragment key={dayName}>
              <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
                {DAY_ABBREVIATIONS[dayName]}
              </div>
              {hourLabels.map((hourLabel) => {
                const cell = cellByDayHour[`${dayName}__${hourLabel}`];
                const intensity = cell ? cell.intensity : 0;
                const opacity = intensityToOpacity(intensity);

                return (
                  <div
                    key={hourLabel}
                    title={cell ? `${dayName}, ${hourLabel}: ${cell.count} orders` : `${dayName}, ${hourLabel}`}
                    style={{
                      height: '18px',
                      borderRadius: '3px',
                      background: `rgba(255, 90, 54, ${opacity})`,
                    }}
                  />
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px' }}>
        <span className="small-tag">Less busy</span>
        <div style={{ display: 'flex', gap: '2px', flex: 1 }}>
          {INTENSITY_STEPS.map((opacity) => (
            <div
              key={opacity}
              style={{ height: '8px', flex: 1, borderRadius: '2px', background: `rgba(255, 90, 54, ${opacity})` }}
            />
          ))}
        </div>
        <span className="small-tag">More busy</span>
      </div>
    </div>
  );
}

export default OperationsSummary;
