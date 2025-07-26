import React, { useState } from 'react';
import PropTypes from 'prop-types';
import '../ui/styles/TimelineVisualizer.css';

const TimelineVisualizer = ({ timeline, phases = [] }) => { // ✅ Default empty array
  const [viewMode, setViewMode] = useState('timeline');

  // ✅ Safety checks for undefined/null data
  if (!timeline || !phases) {
    return (
      <div className="timeline-visualizer">
        <div className="timeline-error">
          <i className="fas fa-exclamation-triangle"></i>
          <p>Timeline data not available</p>
        </div>
      </div>
    );
  }

  // ✅ Ensure phases is an array
  const safePhases = Array.isArray(phases) ? phases : [];

  const getDateString = (weekOffset) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + (weekOffset * 7));
    return startDate.toLocaleDateString();
  };

  return (
    <div className="timeline-visualizer">
      <div className="timeline-header">
        <h3>
          <i className="fas fa-project-diagram"></i>
          Project Timeline Visualization
        </h3>
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
          >
            <i className="fas fa-list"></i>
            Timeline View
          </button>
          <button
            className={`view-btn ${viewMode === 'gantt' ? 'active' : ''}`}
            onClick={() => setViewMode('gantt')}
          >
            <i className="fas fa-chart-bar"></i>
            Gantt View
          </button>
        </div>
      </div>

      {viewMode === 'timeline' && (
        <div className="timeline-view">
          <div className="timeline-summary">
            <div className="summary-item">
              <i className="fas fa-calendar-alt"></i>
              <span>Total Duration: {timeline.totalWeeks || timeline.recommended || 0} weeks</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-play"></i>
              <span>Start Date: {timeline.startDate || 'TBD'}</span>
            </div>
            <div className="summary-item">
              <i className="fas fa-flag-checkered"></i>
              <span>End Date: {timeline.endDate || 'TBD'}</span>
            </div>
          </div>

          <div className="timeline-phases">
            {safePhases.length > 0 ? (
              safePhases.map((phase, index) => {
                const isLastPhase = index === safePhases.length - 1;
                
                return (
                  <div key={index} className="timeline-phase">
                    <div className="phase-connector">
                      <div className="phase-dot"></div>
                      {!isLastPhase && <div className="connector-line"></div>}
                    </div>
                    
                    <div className="phase-content">
                      <div className="phase-header">
                        <h4 className="phase-title">
                          Phase {index + 1}: {phase.name || `Phase ${index + 1}`}
                        </h4>
                        <div className="phase-meta">
                          <span className="phase-duration">
                            <i className="fas fa-clock"></i>
                            {phase.duration || 1} weeks
                          </span>
                          <span className="phase-dates">
                            {getDateString(phase.startWeek || 0)} - {getDateString(phase.endWeek || 1)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="phase-description">
                        {phase.description || 'Phase description not available'}
                      </p>
                      
                      {phase.deliverables && Array.isArray(phase.deliverables) && (
                        <div className="phase-deliverables">
                          <h5>Key Deliverables:</h5>
                          <div className="deliverables-grid">
                            {phase.deliverables.map((deliverable, idx) => (
                              <div key={idx} className="deliverable-item">
                                <i className="fas fa-check-circle"></i>
                                <span>{deliverable}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {phase.milestones && Array.isArray(phase.milestones) && phase.milestones.length > 0 && (
                        <div className="phase-milestones">
                          <h5>Milestones:</h5>
                          <div className="milestones-list">
                            {phase.milestones.map((milestone, idx) => (
                              <div key={idx} className="milestone-item">
                                <i className="fas fa-flag"></i>
                                <span>{milestone.name}</span>
                                <span className="milestone-date">
                                  Week {milestone.week}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="no-phases">
                <i className="fas fa-info-circle"></i>
                <p>No phases available. Generate quotation to see project timeline.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewMode === 'gantt' && (
        <div className="gantt-view">
          {safePhases.length > 0 ? (
            <>
              <div className="gantt-header">
                <div className="gantt-row header-row">
                  <div className="gantt-phase-name">Phase</div>
                  <div className="gantt-timeline">
                    {Array.from({ length: timeline.totalWeeks || timeline.recommended || 8 }, (_, i) => (
                      <div key={i} className="week-header">
                        W{i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="gantt-body">
                {safePhases.map((phase, index) => (
                  <div key={index} className="gantt-row">
                    <div className="gantt-phase-name">
                      <span className="phase-number">{index + 1}</span>
                      <span className="phase-title">{phase.name || `Phase ${index + 1}`}</span>
                      <span className="phase-duration-small">
                        {phase.duration || 1}w
                      </span>
                    </div>
                    
                    <div className="gantt-timeline">
                      {Array.from({ length: timeline.totalWeeks || timeline.recommended || 8 }, (_, weekIndex) => {
                        const isInPhase = weekIndex >= (phase.startWeek || 0) && 
                                        weekIndex < (phase.startWeek || 0) + (phase.duration || 1);
                        const isFirstWeek = weekIndex === (phase.startWeek || 0);
                        const isLastWeek = weekIndex === (phase.startWeek || 0) + (phase.duration || 1) - 1;
                        
                        return (
                          <div
                            key={weekIndex}
                            className={`gantt-week ${isInPhase ? 'in-phase' : ''} ${isFirstWeek ? 'first-week' : ''} ${isLastWeek ? 'last-week' : ''}`}
                          >
                            {isInPhase && (
                              <div className="phase-bar">
                                {isFirstWeek && (
                                  <span className="phase-start-label">
                                    {phase.name || `Phase ${index + 1}`}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-phases">
              <i className="fas fa-info-circle"></i>
              <p>No timeline data available. Generate quotation to see Gantt chart.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

TimelineVisualizer.propTypes = {
  timeline: PropTypes.object,
  phases: PropTypes.array
};

export default TimelineVisualizer;
