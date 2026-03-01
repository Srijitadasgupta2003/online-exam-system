import { useState, useEffect } from 'react';
import api from '../../api/axios';

const TransactionHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      // Fetches all PAID enrollments from the backend
      const res = await api.get('/enrollments/status/PAID');
      setHistory(res.data);
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
        Transaction History
      </h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #eee' }}>
            <th style={{ padding: '12px 8px' }}>Student</th>
            <th style={{ padding: '12px 8px' }}>Course</th>
            <th style={{ padding: '12px 8px' }}>Method</th>
            <th style={{ padding: '12px 8px' }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {history.length > 0 ? (
            history.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px 8px' }}>{item.studentName}</td>
                <td style={{ padding: '12px 8px' }}>{item.courseTitle}</td>
                <td style={{ padding: '12px 8px' }}>
                  {}
                  <span style={{ 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    color: item.paymentMode === 'UPI' ? '#2a9d8f' : '#e76f51',
                    backgroundColor: item.paymentMode === 'UPI' ? '#d1f0eb' : '#fbe4e1',
                    fontFamily: 'monospace'
                  }}>
                    {item.paymentMode === 'UPI' ? 'UPI' : 'Verified Cash'}
                  </span>
                </td>
                <td style={{ padding: '12px 8px' }}>
                  {new Date(item.enrollmentDate).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                No successful transactions found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;