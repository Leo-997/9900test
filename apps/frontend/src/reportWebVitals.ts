import {
  onCLS, onFCP, onINP, onLCP, onTTFB, type MetricType,
} from 'web-vitals';

const reportWebVitals = (onPerfEntry?: (data: MetricType) => void): void => {
  if (onPerfEntry) {
    onCLS(onPerfEntry);
    onINP(onPerfEntry);
    onFCP(onPerfEntry);
    onLCP(onPerfEntry);
    onTTFB(onPerfEntry);
  }
};

export default reportWebVitals;
