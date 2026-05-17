import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
// 1. Chỉ lấy nút quay lại từ lucide
import { ArrowLeft } from 'lucide-react'; 
// 2. Lấy logo Apple từ react-icons
import { FaApple } from 'react-icons/fa'; 

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if(email && password) {
      alert('Đăng nhập thành công!');
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div style={{ marginBottom: '20px', fontSize: '14px' }}>
          <Link to="/" style={{ color: '#787878', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <ArrowLeft size={16} /> Quay lại trang chủ
          </Link>
        </div>
        
        <h2 style={{ fontSize: '24px', marginBottom: '5px' }}>Đăng nhập</h2>
        <p style={{ color: '#787878', fontSize: '13px', marginBottom: '25px' }}>Để trải nghiệm Hand-Me-On tốt nhất</p>

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Email của bạn" />
          </div>
          <div className="input-group">
            <label>Mật khẩu</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mật khẩu" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>ĐĂNG NHẬP</button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#787878', fontSize: '13px' }}>hoặc</div>

        <button className="btn-apple" onClick={() => navigate('/')}>
          {/* 3. Đổi thẻ ở đây */}
          <FaApple size={22} style={{ marginRight: '8px' }} /> Sign in with Apple
        </button>
      </div>
    </div>
  );
}
