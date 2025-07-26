// Analytics utility for tracking quotation calculator usage and performance
import { formatCurrency } from './formatters';

class AnalyticsEngine {
  constructor() {
    this.events = [];
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  // Track form interactions
  trackFormEvent(eventType, stepNumber, fieldName, value = null) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'form_interaction',
      eventType,
      stepNumber,
      fieldName,
      value,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Track quotation generation
  trackQuotationGenerated(formData, quotationResult) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'quotation_generated',
      projectType: formData.projectType,
      industry: formData.industry,
      budgetRange: formData.budgetRange,
      timeline: formData.timeline,
      totalCost: quotationResult.totals?.totalCost || 0,
      totalHours: quotationResult.totals?.totalHours || 0,
      phasesCount: quotationResult.phases?.length || 0,
      technologiesUsed: this.extractTechnologies(formData),
      featuresSelected: this.extractFeatures(formData)
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Track user engagement
  trackUserEngagement(action, context = {}) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'user_engagement',
      action,
      context,
      timeOnPage: Date.now() - this.startTime
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Track conversion events
  trackConversion(conversionType, value = null) {
    const event = {
      id: this.generateEventId(),
      sessionId: this.sessionId,
      timestamp: Date.now(),
      type: 'conversion',
      conversionType,
      value,
      sessionDuration: Date.now() - this.startTime
    };

    this.events.push(event);
    this.sendToAnalytics(event);
  }

  // Extract technologies from form data
  extractTechnologies(formData) {
    const technologies = [];
    
    if (formData.programmingLanguage?.length) {
      technologies.push(...formData.programmingLanguage);
    }
    if (formData.frontendFramework?.length) {
      technologies.push(...formData.frontendFramework);
    }
    if (formData.backendFramework?.length) {
      technologies.push(...formData.backendFramework);
    }
    if (formData.databaseType?.length) {
      technologies.push(...formData.databaseType);
    }
    
    return technologies;
  }

  // Extract features from form data
  extractFeatures(formData) {
    const features = [];
    
    if (formData.coreFeatures?.length) {
      features.push(...formData.coreFeatures);
    }
    if (formData.advancedFeatures?.length) {
      features.push(...formData.advancedFeatures);
    }
    if (formData.securityFeatures?.length) {
      features.push(...formData.securityFeatures);
    }
    
    return features;
  }

  // Generate analytics reports
  generateReport(timeframe = '30d') {
    const filteredEvents = this.filterEventsByTimeframe(timeframe);
    
    return {
      summary: this.generateSummaryReport(filteredEvents),
      quotations: this.generateQuotationReport(filteredEvents),
      userBehavior: this.generateUserBehaviorReport(filteredEvents),
      technology: this.generateTechnologyReport(filteredEvents),
      conversion: this.generateConversionReport(filteredEvents)
    };
  }

  generateSummaryReport(events) {
    const totalSessions = new Set(events.map(e => e.sessionId)).size;
    const quotationEvents = events.filter(e => e.type === 'quotation_generated');
    
    return {
      totalSessions,
      totalQuotations: quotationEvents.length,
      conversionRate: totalSessions > 0 ? (quotationEvents.length / totalSessions * 100).toFixed(2) : 0,
      avgSessionDuration: this.calculateAverageSessionDuration(events),
      totalRevenuePotential: quotationEvents.reduce((sum, e) => sum + (e.totalCost || 0), 0)
    };
  }

  generateQuotationReport(events) {
    const quotationEvents = events.filter(e => e.type === 'quotation_generated');
    
    const byProjectType = this.groupBy(quotationEvents, 'projectType');
    const byIndustry = this.groupBy(quotationEvents, 'industry');
    const byBudgetRange = this.groupBy(quotationEvents, 'budgetRange');
    
    return {
      totalQuotations: quotationEvents.length,
      averageValue: this.calculateAverage(quotationEvents, 'totalCost'),
      averageHours: this.calculateAverage(quotationEvents, 'totalHours'),
      projectTypeDistribution: this.calculateDistribution(byProjectType),
      industryDistribution: this.calculateDistribution(byIndustry),
      budgetDistribution: this.calculateDistribution(byBudgetRange),
      popularTechnologies: this.getPopularTechnologies(quotationEvents),
      popularFeatures: this.getPopularFeatures(quotationEvents)
    };
  }

  generateUserBehaviorReport(events) {
    const formEvents = events.filter(e => e.type === 'form_interaction');
    const stepAnalysis = this.analyzeStepCompletion(formEvents);
    
    return {
      totalFormInteractions: formEvents.length,
      stepCompletionRates: stepAnalysis.completionRates,
      dropOffPoints: stepAnalysis.dropOffPoints,
      averageTimePerStep: stepAnalysis.averageTimePerStep,
      mostEditedFields: this.getMostEditedFields(formEvents),
      deviceBreakdown: this.getDeviceBreakdown(events)
    };
  }

  generateTechnologyReport(events) {
    const quotationEvents = events.filter(e => e.type === 'quotation_generated');
    
    return {
      languagePopularity: this.getTechnologyPopularity(quotationEvents, 'programmingLanguage'),
      frameworkPopularity: this.getTechnologyPopularity(quotationEvents, 'frontendFramework'),
      databasePopularity: this.getTechnologyPopularity(quotationEvents, 'databaseType'),
      technologyCombinations: this.getPopularTechnologyCombinations(quotationEvents)
    };
  }

  generateConversionReport(events) {
    const conversionEvents = events.filter(e => e.type === 'conversion');
    
    return {
      totalConversions: conversionEvents.length,
      conversionsByType: this.groupBy(conversionEvents, 'conversionType'),
      conversionFunnel: this.calculateConversionFunnel(events),
      timeToConversion: this.calculateTimeToConversion(events)
    };
  }

  // Utility methods
  generateEventId() {
    return 'event_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  filterEventsByTimeframe(timeframe) {
    const now = Date.now();
    const timeframes = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000
    };
    
    const cutoff = now - (timeframes[timeframe] || timeframes['30d']);
    return this.events.filter(event => event.timestamp >= cutoff);
  }

  groupBy(array, key) {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  }

  calculateAverage(array, key) {
    if (array.length === 0) return 0;
    const sum = array.reduce((total, item) => total + (item[key] || 0), 0);
    return (sum / array.length).toFixed(2);
  }

  calculateDistribution(groupedData) {
    const total = Object.values(groupedData).reduce((sum, group) => sum + group.length, 0);
    const distribution = {};
    
    Object.keys(groupedData).forEach(key => {
      distribution[key] = {
        count: groupedData[key].length,
        percentage: total > 0 ? ((groupedData[key].length / total) * 100).toFixed(2) : 0
      };
    });
    
    return distribution;
  }

  sendToAnalytics(event) {
    // Send to Google Analytics
    if (typeof gtag !== 'undefined') {
      gtag('event', event.type, {
        event_category: 'Quotation Calculator',
        event_label: event.eventType || event.action,
        value: event.value
      });
    }

    // Send to custom analytics endpoint
    if (process.env.REACT_APP_ANALYTICS_ENDPOINT) {
      fetch(process.env.REACT_APP_ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.warn('Analytics tracking failed:', error);
      });
    }

    // Store in localStorage for debugging
    if (process.env.NODE_ENV === 'development') {
      const stored = JSON.parse(localStorage.getItem('quotation_analytics') || '[]');
      stored.push(event);
      localStorage.setItem('quotation_analytics', JSON.stringify(stored.slice(-100))); // Keep last 100 events
    }
  }

  // Export data for analysis
  exportData(format = 'json') {
    const data = {
      sessionId: this.sessionId,
      events: this.events,
      summary: this.generateReport()
    };

    if (format === 'csv') {
      return this.convertToCSV(this.events);
    }
    
    return JSON.stringify(data, null, 2);
  }

  convertToCSV(events) {
    if (events.length === 0) return '';
    
    const headers = Object.keys(events[0]);
    const csvContent = [
      headers.join(','),
      ...events.map(event => 
        headers.map(header => 
          JSON.stringify(event[header] || '')
        ).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}

// Create singleton instance
export const analytics = new AnalyticsEngine();

// Export utility functions
export const trackFormStep = (stepNumber, action = 'view') => {
  analytics.trackFormEvent(action, stepNumber);
};

export const trackFieldChange = (stepNumber, fieldName, value) => {
  analytics.trackFormEvent('field_change', stepNumber, fieldName, value);
};

export const trackQuotationGenerated = (formData, quotationResult) => {
  analytics.trackQuotationGenerated(formData, quotationResult);
};

export const trackConversion = (type, value) => {
  analytics.trackConversion(type, value);
};

export const getAnalyticsReport = (timeframe) => {
  return analytics.generateReport(timeframe);
};

export default analytics;
