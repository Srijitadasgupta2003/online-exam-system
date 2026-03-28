import { useState, useEffect, useRef } from 'react';
import api from '../../api/axios';

const QRCodeSettings = () => {
  const [qrExists, setQrExists] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    checkQRCode();
  }, []);

  const checkQRCode = async () => {
    try {
      const res = await api.get('/admin/qr-code/exists');
      setQrExists(res.data.exists);
    } catch (err) {
      console.error("Failed to check QR code status", err);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!['image/png', 'image/jpeg'].includes(file.type)) {
        setMessage('Only PNG and JPEG files are allowed');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
      setMessage('');
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files[0];
    if (!file) {
      setMessage('Please select a file first');
      return;
    }

    setUploading(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      await api.post('/admin/qr-code', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setMessage('QR code uploaded successfully!');
      setQrExists(true);
      setPreview(null);
      fileInputRef.current.value = '';
    } catch (err) {
      setMessage(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleClearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="card p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-white mb-2">Payment QR Code</h2>
      <p className="text-sm text-gray-400 mb-6">
        Upload your UPI QR code. Students will see this when choosing UPI payment.
      </p>

      {/* Current QR Code */}
      {qrExists && !preview && (
        <div className="mb-6">
          <p className="text-sm text-gray-400 mb-2">Current QR Code:</p>
          <img 
            src={`${api.defaults.baseURL}/admin/qr-code/image`} 
            alt="Current QR Code" 
            className="w-48 h-48 object-contain bg-gray-700 p-2 rounded-lg border border-gray-600"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Upload Form */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {qrExists ? 'Replace QR Code' : 'Upload QR Code'}
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            onChange={handleFileSelect}
            className="input-field cursor-pointer"
          />
          <p className="text-xs text-gray-500 mt-1">PNG or JPEG, max 5MB</p>
        </div>

        {/* Preview */}
        {preview && (
          <div>
            <p className="text-sm text-gray-400 mb-2">Preview:</p>
            <div className="relative inline-block">
              <img 
                src={preview} 
                alt="QR Code Preview" 
                className="w-48 h-48 object-contain bg-gray-700 p-2 rounded-lg border border-gray-600"
              />
              <button
                onClick={handleClearPreview}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={uploading || !preview}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading ? 'Uploading...' : qrExists ? 'Replace QR Code' : 'Upload QR Code'}
        </button>

        {/* Message */}
        {message && (
          <p className={`text-sm ${message.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default QRCodeSettings;
