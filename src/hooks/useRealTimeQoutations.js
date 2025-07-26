// hooks/useRealTimeQuotation.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { quotationEngine } from '../utils/calculations';

export const useRealTimeQuotation = (formData) => {
  const [quotation, setQuotation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculationHistory, setCalculationHistory] = useState([]);
  const debounceRef = useRef(null);
  const previousFormDataRef = useRef(null);

  // Debounced calculation function
  const debouncedCalculate = useCallback((data) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      setIsCalculating(true);
      
      try {
        const result = quotationEngine.calculateQuotation(data);
        setQuotation(result);
        
        // Add to history
        setCalculationHistory(prev => [...prev.slice(-9), {
          timestamp: Date.now(),
          quotation: result,
          formSnapshot: { ...data }
        }]);
        
      } catch (error) {
        console.error('Calculation error:', error);
      } finally {
        setIsCalculating(false);
      }
    }, 300); // 300ms debounce
  }, []);

  // Effect to trigger calculation when form data changes
  useEffect(() => {
    // Only calculate if we have minimum required data
    const hasMinimumData = formData.projectType && formData.industry;
    
    if (hasMinimumData) {
      // Check if relevant fields have changed
      const relevantFields = [
        'projectType', 'industry', 'timeline', 'coreFeatures', 
        'advancedFeatures', 'designType', 'numberOfPages'
      ];
      
      const hasChanged = relevantFields.some(field => 
        JSON.stringify(formData[field]) !== 
        JSON.stringify(previousFormDataRef.current?.[field])
      );

      if (hasChanged || !quotation) {
        debouncedCalculate(formData);
        previousFormDataRef.current = { ...formData };
      }
    }
  }, [formData, debouncedCalculate, quotation]);

  // Force recalculation
  const forceRecalculate = useCallback(() => {
    if (formData.projectType && formData.industry) {
      setIsCalculating(true);
      const result = quotationEngine.calculateQuotation(formData, true);
      setQuotation(result);
      setIsCalculating(false);
    }
  }, [formData]);

  // Get calculation insights
  const getInsights = useCallback(() => {
    if (!quotation) return null;

    return {
      priceRange: {
        min: Math.round(quotation.costs.final * 0.8),
        max: Math.round(quotation.costs.final * 1.2)
      },
      confidence: quotation.confidence,
      risks: quotation.risks,
      recommendations: generateRecommendations(quotation, formData)
    };
  }, [quotation, formData]);

  return {
    quotation,
    isCalculating,
    calculationHistory,
    forceRecalculate,
    getInsights
  };
};

function generateRecommendations(quotation, formData) {
  const recommendations = [];

  if (quotation.confidence < 0.7) {
    recommendations.push({
      type: 'warning',
      message: 'Consider providing more project details for accurate pricing'
    });
  }

  if (quotation.metrics.complexity > 2.0) {
    recommendations.push({
      type: 'info',
      message: 'Consider breaking this into phases for better risk management'
    });
  }

  if (quotation.timeline.requested < quotation.timeline.optimal * 0.8) {
    recommendations.push({
      type: 'caution',
      message: 'Timeline may be too aggressive - consider extending for quality'
    });
  }

  return recommendations;
}
