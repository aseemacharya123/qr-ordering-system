import React from 'react';
import { formatCurrency } from '../../utils/currency.js';

function RecommendationRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--color-border)' }}>
      <span className="small-tag">{label}</span>
      <span style={{ fontWeight: 700, fontSize: '0.88rem', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

function DayAnalysisList({ dayAnalysis }) {
  return (
    <div style={{ display: 'grid', gap: '10px' }}>
      {dayAnalysis.map((day) => (
        <div key={day.dayName} className="cart-item" style={{ display: 'block' }}>
          <div style={{ fontWeight: 700, marginBottom: '4px' }}>{day.dayName}</div>
          <div className="small-tag">
            Peak: {day.peakRevenueWindow.startLabel} – {day.peakRevenueWindow.endLabel}
            {day.lowDemandWindow && ` · Low: ${day.lowDemandWindow.startLabel} – ${day.lowDemandWindow.endLabel}`}
          </div>
        </div>
      ))}
    </div>
  );
}

function BreakAndClosureRecommendations({ operations }) {
  if (!operations || !operations.hasEnoughData) {
    return (
      <p className="state-message">
        Still collecting data — operational recommendations (break windows, closure impact, weekly off)
        need at least a week of order history to be reliable. Check back soon.
      </p>
    );
  }

  const { dayAnalysis, breakRecommendation, closureRecommendation, weeklyOffRecommendation, staffingGuidance } = operations;

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '12px' }}>Business Hours by Day</h3>
        <DayAnalysisList dayAnalysis={dayAnalysis} />
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Lunch Break Recommendation</h3>
        <RecommendationRow
          label="Owner (30 min)"
          value={`${breakRecommendation.ownerWindow.startLabel} – ${breakRecommendation.ownerWindow.endLabel}`}
        />
        <RecommendationRow
          label="Kitchen staff (45 min)"
          value={`${breakRecommendation.kitchenWindow.startLabel} – ${breakRecommendation.kitchenWindow.endLabel}`}
        />
        {breakRecommendation.staggeredSchedule.map((slot) => (
          <RecommendationRow
            key={slot.group}
            label={`Staggered — ${slot.group}`}
            value={`${slot.startLabel} – ${slot.endLabel}`}
          />
        ))}
        <p className="small-tag" style={{ marginTop: '8px' }}>
          Estimated revenue impact: only {breakRecommendation.impactPercent}% of total revenue.
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Temporary Closure Window</h3>
        <RecommendationRow
          label="Lowest-impact window"
          value={`${closureRecommendation.window.startLabel} – ${closureRecommendation.window.endLabel}`}
        />
        <RecommendationRow label="Estimated weekly loss" value={formatCurrency(closureRecommendation.estimatedWeeklyLoss)} />
        <RecommendationRow label="Estimated monthly loss" value={formatCurrency(closureRecommendation.estimatedMonthlyLoss)} />
        <p className="small-tag" style={{ marginTop: '8px' }}>
          Closing during this window would impact only {closureRecommendation.impactPercent}% of total revenue.
        </p>
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Weekly Off Recommendation</h3>
        <RecommendationRow
          label="Best day off"
          value={`${weeklyOffRecommendation.bestDay} (${weeklyOffRecommendation.bestDayImpactPercent}% impact)`}
        />
        <RecommendationRow
          label="Second best"
          value={`${weeklyOffRecommendation.secondBestDay} (${weeklyOffRecommendation.secondBestImpactPercent}% impact)`}
        />
        {weeklyOffRecommendation.worstDaysToAvoid.length > 0 && (
          <p className="small-tag" style={{ marginTop: '8px' }}>
            Avoid closing on {weeklyOffRecommendation.worstDaysToAvoid.map((day) => `${day.dayName} (${day.sharePercent}%)`).join(', ')} —
            these contribute the most weekly revenue.
          </p>
        )}
      </div>

      <div>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '4px' }}>Staffing Guidance</h3>
        <p className="small-tag" style={{ marginBottom: '6px' }}>Consider more staff during:</p>
        <p style={{ fontSize: '0.85rem', marginBottom: '10px' }}>
          {staffingGuidance.understaffedPeriods.map((p) => `${p.dayName} ${p.hourLabel}`).join(', ')}
        </p>
        <p className="small-tag" style={{ marginBottom: '6px' }}>Consider fewer staff during:</p>
        <p style={{ fontSize: '0.85rem' }}>
          {staffingGuidance.overstaffedPeriods.map((p) => `${p.dayName} ${p.hourLabel}`).join(', ')}
        </p>
      </div>
    </div>
  );
}

export default BreakAndClosureRecommendations;
