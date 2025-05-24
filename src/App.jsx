import React, { useState, useRef } from 'react';
import './App.css';    
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const CHART_TYPES = [
  { type: 'bar', label: 'Bar', icon: '📊' },
  { type: 'line', label: 'Line', icon: '📈' },
  { type: 'pie', label: 'Pie', icon: '🥧' },
  { type: 'doughnut', label: 'Donut', icon: '🍩' },
  { type: 'radar', label: 'Radar', icon: '🎯' }
];

const COLORS = [
  { bg: 'rgba(99, 102, 241, 0.7)', border: 'rgba(99, 102, 241, 1)' },
  { bg: 'rgba(6, 182, 212, 0.7)', border: 'rgba(6, 182, 212, 1)' },
  { bg: 'rgba(244, 63, 94, 0.7)', border: 'rgba(244, 63, 94, 1)' },
  { bg: 'rgba(34, 197, 94, 0.7)', border: 'rgba(34, 197, 94, 1)' },
  { bg: 'rgba(168, 85, 247, 0.7)', border: 'rgba(168, 85, 247, 1)' },
  { bg: 'rgba(251, 146, 60, 0.7)', border: 'rgba(251, 146, 60, 1)' },
  { bg: 'rgba(236, 72, 153, 0.7)', border: 'rgba(236, 72, 153, 1)' },
  { bg: 'rgba(14, 165, 233, 0.7)', border: 'rgba(14, 165, 233, 1)' }
];

function App() {
  const [chartType, setChartType] = useState('bar');
  const [data, setData] = useState([]);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState('');
  const [datasetName, setDatasetName] = useState('Dataset');
  const [isLoading, setIsLoading] = useState(false);
  const chartRef = useRef(null);

  const chartData = {
    labels: data.map(item => item.label),
    datasets: [
      {
        label: datasetName || 'Dataset',
        data: data.map(item => item.value),
        backgroundColor: data.map((_, index) => COLORS[index % COLORS.length].bg),
        borderColor: data.map((_, index) => COLORS[index % COLORS.length].border),
        borderWidth: 2,
        tension: 0.4,
        fill: chartType === 'radar',
        pointBackgroundColor: data.map((_, index) => COLORS[index % COLORS.length].border),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: chartType === 'line' ? 6 : 4,
        pointHoverRadius: chartType === 'line' ? 8 : 6
      }
    ]
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'Inter, system-ui, sans-serif',
            weight: '500'
          },
          color: '#475569'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: 'rgba(148, 163, 184, 0.3)',
        borderWidth: 1,
        cornerRadius: 12,
        displayColors: true,
        padding: 12,
        callbacks: {
          title: function (tooltipItems) {
            return tooltipItems[0].label;
          },
          label: function (context) {
            return `Value: ${context.parsed.y || context.parsed}`;
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutCubic'
    },
    onClick: (event, elements) => {
      if (elements.length > 0) {
        const index = elements[0].index;
        removeData(index);
      }
    }
  };

  const radarOptions = {
    ...commonOptions,
    scales: {
      r: {
        beginAtZero: true,
        suggestedMin: 0,
        angleLines: {
          display: true,
          color: 'rgba(148, 163, 184, 0.2)',
          lineWidth: 1
        },
        grid: {
          circular: true,
          color: 'rgba(148, 163, 184, 0.2)',
          lineWidth: 1
        },
        pointLabels: {
          font: {
            size: 11,
            family: 'Inter, system-ui, sans-serif',
            weight: '500'
          },
          color: '#475569',
          padding: 15
        },
        ticks: {
          backdropColor: 'transparent',
          font: {
            size: 9,
            family: 'Inter, system-ui, sans-serif'
          },
          color: '#94a3b8',
          z: 1,
          count: 5,
          showLabelBackdrop: false,
          stepSize: Math.max(...data.map(item => item.value)) / 5 || 1
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6,
        borderWidth: 2
      },
      line: {
        borderWidth: 2,
        tension: 0.1
      }
    }
  };

  const barLineOptions = {
    ...commonOptions,
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { family: 'Inter, system-ui, sans-serif', size: 11 },
          color: '#64748b'
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1
        },
        ticks: {
          font: { family: 'Inter, system-ui, sans-serif', size: 11 },
          color: '#64748b'
        }
      }
    }
  };

  const addData = async () => {
    if (label.trim() && value.trim() && !isNaN(parseFloat(value))) {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 200));
      setData(prev => [...prev, { id: Date.now(), label: label.trim(), value: parseFloat(value) }]);
      setLabel('');
      setValue('');
      setIsLoading(false);
    }
  };

  const removeData = (index) => {
    setData(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllData = () => {
    setData([]);
  };

  const downloadChart = () => {
    const chart = chartRef.current;
    if (chart) {
      const url = chart.toBase64Image();
      const link = document.createElement('a');
      link.href = url;
      link.download = `${datasetName || 'chart'}.png`;
      link.click();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') addData();
  };

  const renderChart = () => {
    if (data.length === 0) {
      return <div className="empty-state"><div className="icon">📊</div><h3>No Data Yet</h3><p>Add some data points to see your chart come to life!</p></div>;
    }

    const commonProps = {
      data: chartData,
      options: chartType === 'radar' ? radarOptions : (chartType === 'pie' || chartType === 'doughnut') ? commonOptions : barLineOptions,
      ref: chartRef
    };

    switch (chartType) {
      case 'line': return <Line {...commonProps} />;
      case 'pie': return <Pie {...commonProps} />;
      case 'doughnut': return <Doughnut {...commonProps} />;
      case 'radar': return <Radar {...commonProps} />;
      default: return <Bar {...commonProps} />;
    }
  };

  return (
    <div className="app">
      <div className="container">
        <div className="header">
          <h1>Live Chart Generator</h1>
          <p>Create beautiful, interactive charts with real-time data visualization</p>
        </div>

        <div className="main-content">
          <div className="chart-section" data-charttype={chartType}>
            <div className="chart-container">{renderChart()}</div>
          </div>

          <div className="controls-panel">
            <div className="controls-section">
              <h3 className="section-title">Chart Type</h3>
              <div className="chart-types">
                {CHART_TYPES.map(({ type, label, icon }) => (
                  <button key={type} className={`chart-type-btn ${chartType === type ? 'active' : ''}`} onClick={() => setChartType(type)} title={label}>
                    <div>{icon}</div><span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="controls-section">
              <h3 className="section-title">Dataset Name</h3>
              <input type="text" className="form-input" value={datasetName} onChange={(e) => setDatasetName(e.target.value)} placeholder="e.g., Sales Report" />
            </div>

            <div className="controls-section">
              <h3 className="section-title">Add Data</h3>
              <div className="form-group">
                <label className="form-label">Label</label>
                <input type="text" className="form-input" value={label} onChange={(e) => setLabel(e.target.value)} onKeyPress={handleKeyPress} placeholder="e.g., Sales Q1" disabled={isLoading} />
              </div>
              <div className="form-group">
                <label className="form-label">Value</label>
                <input type="number" className="form-input" value={value} onChange={(e) => setValue(e.target.value)} onKeyPress={handleKeyPress} placeholder="e.g., 150" step="any" disabled={isLoading} />
              </div>
              <button className={`btn btn-primary ${isLoading ? 'loading' : ''}`} onClick={addData} disabled={!label.trim() || !value.trim() || isNaN(parseFloat(value)) || isLoading}>{isLoading ? 'Adding...' : 'Add Data Point'}</button>
            </div>

            <div className="controls-section">
              <button className="btn btn-secondary" onClick={downloadChart}>📥 Download Chart as PNG</button>
            </div>

            {data.length > 0 && (
              <div className="controls-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 className="section-title" style={{ margin: 0, border: 'none', padding: 0 }}>Data Points ({data.length})</h3>
                  <button className="btn btn-secondary" onClick={clearAllData} style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.8rem' }}>Clear All</button>
                </div>
                <div className="data-list">
                  {data.map((item, index) => (
                    <div key={item.id} className="data-item">
                      <div className="data-item-content">
                        <div className="data-item-label">{item.label}</div>
                        <div className="data-item-value">{item.value}</div>
                      </div>
                      <button className="btn-remove" onClick={() => removeData(index)} title="Remove this data point">×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
