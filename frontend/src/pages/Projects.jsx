import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../context/AuthContext';
import { Plus, Users } from 'lucide-react';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects/');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects/', newProject);
      setShowModal(false);
      setNewProject({ name: '', description: '' });
      fetchProjects();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  const filteredProjects = projects.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 className="text-4xl mb-2 text-white font-bold" style={{ letterSpacing: '-0.02em' }}>Projects</h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.1rem' }}>Manage your team projects and collaborate.</p>
        </div>
        {user?.role === 'admin' && (
          <button className="btn btn-primary hover-glow" onClick={() => setShowModal(true)}>
            <Plus size={20} /> New Project
          </button>
        )}
      </div>

      <div className="mb-6">
        <input 
          type="text" 
          className="input-field" 
          placeholder="Search projects..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: '400px' }}
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="glass-panel text-center" style={{ padding: '4rem' }}>
          <p className="text-muted mb-4">No projects found. Create one to get started.</p>
          {user?.role === 'admin' && (
             <button className="btn btn-primary" onClick={() => setShowModal(true)}>
               Create Project
             </button>
          )}
        </div>
      ) : (
        <div className="grid-cards">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="glass-panel" style={{ padding: '1.5rem', display: 'block', transition: 'all 0.2s', border: '1px solid transparent' }} onMouseOver={e => e.currentTarget.style.borderColor = 'var(--primary-color)'} onMouseOut={e => e.currentTarget.style.borderColor = 'transparent'}>
              <h3 className="text-xl font-bold mb-2">{project.name}</h3>
              <p className="text-muted text-sm mb-4" style={{ height: '40px', overflow: 'hidden' }}>{project.description || 'No description provided.'}</p>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <span className="text-sm text-muted">Created {new Date(project.created_at).toLocaleDateString()}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}>
                   <Users size={16} /> <span className="text-sm">Team</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '3rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
            <h2 className="text-3xl mb-6 font-bold" style={{ color: 'var(--text-main)', letterSpacing: '-0.02em' }}>Create New Project</h2>
            <form onSubmit={handleCreateProject}>
              <div className="input-group">
                <label className="input-label">Project Name</label>
                <input type="text" className="input-field" value={newProject.name} onChange={(e) => setNewProject({...newProject, name: e.target.value})} required />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input-field" rows="3" value={newProject.description} onChange={(e) => setNewProject({...newProject, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
