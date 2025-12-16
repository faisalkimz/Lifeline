import React from 'react';
import { Badge } from '../../components/ui/Badge';
// Import a PDF viewer if available

const PRIMARY = '#14b8a6';

/**
 * CandidateProfileDrawer: Shows full candidate profile (by WorkPay design)
 * - Drawer or modal with resume preview
 */
export default function CandidateProfileDrawer({ candidate, open, onClose }) {
  if (!candidate) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0, right: open ? 0 : -520,
      bottom: 0,
      width: 420,
      background: '#fff',
      boxShadow: 'rgba(20,184,166,0.14) -8px 0 32px 0',
      zIndex: 2001,
      transition: 'right 0.36s cubic-bezier(0.4,0,0.2,1)',
      padding: 32,
      fontFamily: 'Inter, sans-serif',
    }}>
      <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 24, fontSize: 24, color: PRIMARY, background: 'none', border: 'none', cursor: 'pointer' }}>&times;</button>
      <h2 style={{ color: PRIMARY, fontWeight: 800, fontSize: 24 }}>{candidate.name}</h2>
      <div style={{ marginTop: 8, marginBottom: 16 }}>
        <span style={{ fontWeight: 600 }}>{candidate.email}</span><br/>
        <span>{candidate.phone}</span>
      </div>
      <div style={{ marginBottom: 16 }}>
        {candidate.skills.map(skill => (
          <Badge key={skill} style={{ background: 'rgba(20,184,166,.1)', color: PRIMARY, fontWeight: 600, marginRight: 6 }}>{skill}</Badge>
        ))}
      </div>
      <div style={{ marginBottom: 18 }}>
        <Badge style={{ background: PRIMARY, color: 'white', fontWeight: 600 }}>{candidate.status}</Badge>
      </div>
      <h4 style={{ color: PRIMARY, marginTop: 24 }}>Resume</h4>
      {/* Placeholder for resume preview */}
      {candidate.resume ? (
        <a href={candidate.resume} target="_blank" rel="noopener noreferrer" style={{ color: PRIMARY, fontWeight: 600 }}>Open PDF</a>
      ) : (
        <div style={{ fontStyle: 'italic', color: '#888', marginTop: 8 }}>No resume uploaded</div>
      )}
    </div>
  );
}
