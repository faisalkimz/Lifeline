import React from 'react';
import { Badge } from '../../components/ui/Badge';

const PRIMARY = '#14b8a6';

/**
 * CandidateCard: Used for card view or Kanban candidate summary (WorkPay spec)
 */
export function CandidateCard({ candidate, onClick }) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: 14,
        boxShadow: '0 2px 18px 0 rgba(20,184,166,0.06)',
        padding: 22,
        margin: 8,
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
        fontFamily: 'Inter, sans-serif',
      }}
      onClick={onClick}
    >
      <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 7, color: PRIMARY }}>{candidate.name}</div>
      <div style={{ fontSize: 13, color: '#374151', marginBottom: 7 }}>{candidate.email} <span style={{ color: '#14b8a680', marginLeft: 12 }}>{candidate.phone}</span></div>
      <div style={{ marginBottom: 7 }}>
        {candidate.skills.slice(0, 4).map(skill => (
          <Badge key={skill} style={{ background: 'rgba(20,184,166,.09)', color: PRIMARY, marginRight: 4 }}>{skill}</Badge>
        ))}
      </div>
      <Badge style={{ background: PRIMARY, color: 'white', fontWeight: 600 }}>{candidate.status}</Badge>
    </div>
  );
}
