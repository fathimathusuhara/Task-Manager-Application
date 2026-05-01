import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { UserCircle, Mail, KeyRound, Building, Briefcase, MapPin, Phone, AlignLeft, Camera, CheckCircle2, Clock, FolderKanban, Activity } from 'lucide-react';
import api from '../api';

const Profile = () => {
  const { user, updateProfile, uploadPhoto } = useContext(AuthContext);
  const fileInputRef = useRef(null);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    department: user?.department || '',
    position: user?.position || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: user?.location || ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/users/me/stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    fetchStats();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      await uploadPhoto(file);
      setMessage({ text: 'Profile photo updated!', type: 'success' });
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: 'Failed to upload photo.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      
      await updateProfile(payload);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setFormData(prev => ({ ...prev, password: '' }));
      
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    } catch (err) {
      setMessage({ text: err.response?.data?.detail || 'Failed to update profile', type: 'error' });
    }
  };

  const API_URL = import.meta.env.DEV ? 'http://localhost:8000' : '';

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '4rem' }}>
      <div className="glass-panel" style={{ padding: '2.5rem' }}>
        
        {/* Header & Photo */}
        <div className="flex items-center gap-6 mb-8">
          <div 
            onClick={handlePhotoClick}
            style={{ 
              width: '100px', height: '100px', borderRadius: '50%', 
              background: user?.profile_photo ? `url(${API_URL}${user.profile_photo}) center/cover` : 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '2.5rem', fontWeight: 'bold', color: 'white',
              cursor: 'pointer', position: 'relative', overflow: 'hidden',
              boxShadow: 'var(--shadow-md)'
            }}
            className="hover-glow group"
          >
            {!user?.profile_photo && user?.username.charAt(0).toUpperCase()}
            
            <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} className="group-hover:opacity-100">
              <Camera size={24} color="white" />
            </div>
            {isUploading && (
              <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <div style={{ width: '20px', height: '20px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
            )}
          </div>
          <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
          
          <div>
            <h1 className="text-3xl font-bold">{user?.username}</h1>
            <p className="text-muted text-lg">{user?.position ? `${user.position} ${user.department ? `• ${user.department}` : ''}` : (user?.role === 'admin' ? 'Administrator' : 'Team Member')}</p>
          </div>
        </div>

        {/* Member Analytics Dashboard */}
        {stats && (
          <div className="mb-8" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Activity size={20} color="var(--primary-color)"/> Your Performance Analytics</h3>
            <div className="grid-cards" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
              <div className="glass-panel text-center" style={{ padding: '1.5rem', borderTop: '3px solid var(--success)' }}>
                <CheckCircle2 size={24} color="var(--success)" className="mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats.completed_tasks}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Completed Tasks</div>
              </div>
              
              <div className="glass-panel text-center" style={{ padding: '1.5rem', borderTop: '3px solid var(--warning, #f59e0b)' }}>
                <Clock size={24} color="var(--warning, #f59e0b)" className="mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats.pending_tasks}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Pending Tasks</div>
              </div>
              
              <div className="glass-panel text-center" style={{ padding: '1.5rem', borderTop: '3px solid var(--secondary-color)' }}>
                <FolderKanban size={24} color="var(--secondary-color)" className="mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats.total_projects}</div>
                <div className="text-xs text-muted uppercase tracking-wider">Total Projects</div>
              </div>

              <div className="glass-panel text-center" style={{ padding: '1.5rem', borderTop: '3px solid var(--primary-color)' }}>
                <Activity size={24} color="var(--primary-color)" className="mx-auto mb-2" />
                <div className="text-3xl font-bold">{stats.completion_rate}%</div>
                <div className="text-xs text-muted uppercase tracking-wider">Completion Rate</div>
              </div>
            </div>
          </div>
        )}

        {message.text && (
          <div className="animate-fade-in" style={{ padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '2rem', backgroundColor: message.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: message.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            {/* Account Details */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2"><KeyRound size={18} color="var(--primary-color)" /> Account Details</h3>
              <div className="input-group">
                <label className="input-label flex items-center gap-2"><UserCircle size={16} /> Username</label>
                <input type="text" name="username" className="input-field" value={formData.username} onChange={handleChange} required />
              </div>

              <div className="input-group">
                <label className="input-label flex items-center gap-2"><Mail size={16} /> Email Address</label>
                <input type="email" name="email" className="input-field" value={formData.email} onChange={handleChange} required />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label flex items-center gap-2"><KeyRound size={16} /> New Password (Optional)</label>
                <input type="password" name="password" className="input-field" placeholder="Leave blank to keep current" value={formData.password} onChange={handleChange} />
              </div>
            </div>

            {/* Professional Details */}
            <div className="glass-panel" style={{ padding: '1.5rem', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2"><Briefcase size={18} color="var(--secondary-color)" /> Professional Info</h3>
              <div className="input-group">
                <label className="input-label flex items-center gap-2"><Building size={16} /> Department</label>
                <input type="text" name="department" className="input-field" placeholder="e.g. Engineering" value={formData.department} onChange={handleChange} />
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label flex items-center gap-2"><Briefcase size={16} /> Position</label>
                <input type="text" name="position" className="input-field" placeholder="e.g. Senior Developer" value={formData.position} onChange={handleChange} />
              </div>
            </div>

            {/* Contact & Bio */}
            <div className="glass-panel" style={{ padding: '1.5rem', gridColumn: '1 / -1', border: '1px solid rgba(255, 255, 255, 0.05)', backgroundColor: 'rgba(30, 41, 59, 0.5)' }}>
              <h3 className="font-bold mb-4 flex items-center gap-2"><AlignLeft size={18} color="var(--success)" /> About & Contact</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label flex items-center gap-2"><Phone size={16} /> Phone Number</label>
                  <input type="text" name="phone" className="input-field" placeholder="+1 (555) 000-0000" value={formData.phone} onChange={handleChange} />
                </div>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label flex items-center gap-2"><MapPin size={16} /> Location</label>
                  <input type="text" name="location" className="input-field" placeholder="City, Country" value={formData.location} onChange={handleChange} />
                </div>
              </div>

              <div className="input-group" style={{ marginBottom: 0 }}>
                <label className="input-label flex items-center gap-2"><AlignLeft size={16} /> Bio</label>
                <textarea name="bio" className="input-field" rows="3" placeholder="Tell your team a little about yourself..." value={formData.bio} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '2.5rem', display: 'flex', justifyContent: 'flex-end' }}>
             <button type="submit" className="btn btn-primary hover-glow" style={{ padding: '0.75rem 2.5rem' }}>
               Save All Changes
             </button>
          </div>
        </form>
      </div>
      <style>{`
        .group:hover .group-hover\\:opacity-100 { opacity: 1 !important; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default Profile;
