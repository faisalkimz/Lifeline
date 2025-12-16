import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Input } from '../../components/ui/Input';
import { Table } from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
// import a PDF viewer and other custom components as needed

// Design constants for WorkPay palette (for inline styles if no tailwind)
const PRIMARY = '#14b8a6';
const SIDEBAR_BG = '#0f172a';

/**
 * Candidate Management Page (WorkPay Design)
 * - Strictly by WorkPay UI standards, NO AI-LOOKING CODE!
 */
const sampleCandidates = [
  {
    id: 1,
    name: 'Sarah Mirembe',
    email: 'sarah.mirembe@example.com',
    phone: '+256-770-123456',
    skills: ['Django', 'React', 'Recruitment'],
    status: 'Screening',
    resume: '',
  },
];

export default function CandidateManagementPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <div style={{ padding: 32, maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ color: PRIMARY, fontWeight: 800, fontSize: 32, marginBottom: 4, fontFamily: 'Inter, sans-serif', letterSpacing: '-0.02em' }}>
            Candidates
          </h1>
          <div style={{ height: 4, width: 60, background: PRIMARY, borderRadius: 8, marginBottom: -8 }} />
        </div>
        <Button style={{ background: PRIMARY, fontWeight: 600 }} onClick={() => setAddOpen(true)}>
          + Add Candidate
        </Button>
      </header>
      <Card style={{ boxShadow: '0 4px 32px 0 rgba(20,184,166,0.06)', padding: 0 }}>
        <Table
          head={[
            'Name',
            'Email',
            'Phone',
            'Skills',
            'Status',
          ]}
          body={sampleCandidates.map(c => [
            <span style={{ fontWeight: 600 }}>{c.name}</span>,
            c.email,
            c.phone,
            <span>{c.skills.map(skill => (
              <Badge key={skill} style={{ background: 'rgba(20,184,166,.1)', color: PRIMARY, marginRight: 4 }}>{skill}</Badge>
            ))}</span>,
            <Badge style={{ background: PRIMARY, color: 'white', fontWeight: 600 }}>{c.status}</Badge>,
          ])}
        />
      </Card>
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Candidate" style={{ fontFamily: 'Inter, sans-serif', maxWidth: 480 }}>
        <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input label="Full Name" required />
          <Input label="Email" type="email" required />
          <Input label="Phone Number" required />
          <Input label="Skills (comma-separated)" />
          <Input label="Resume (PDF upload)" type="file" accept=".pdf" />
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" style={{ background: PRIMARY }}>Save</Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
