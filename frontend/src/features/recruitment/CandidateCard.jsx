import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { cn } from '../../utils/cn';

export function CandidateCard({ candidate, onClick }) {
  const fullName = candidate.full_name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown Candidate';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-3xl p-6 border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex-1 mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors truncate pr-2">
            {fullName}
          </h3>
          <Badge variant="outline" className={cn("capitalize border-0 font-bold",
            candidate.status === 'hired' ? 'bg-emerald-50 text-emerald-700' :
              candidate.status === 'rejected' ? 'bg-red-50 text-red-700' :
                'bg-slate-100 text-slate-600'
          )}>
            {candidate.status?.replace(/_/g, ' ') || 'New'}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
          <span className="truncate max-w-[180px]">{candidate.email}</span>
          {candidate.phone && (
            <>
              <span className="text-slate-300">•</span>
              <span>{candidate.phone}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 4).map((skill, i) => (
              <Badge key={i} className="bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100 font-medium px-2 py-1 rounded-lg text-xs">
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-slate-400 italic">No skills listed</span>
          )}
          {Array.isArray(candidate.skills) && candidate.skills.length > 4 && (
            <Badge className="bg-slate-50 text-slate-500 border-transparent px-2 py-1 rounded-lg text-xs">
              +{candidate.skills.length - 4}
            </Badge>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Source</span>
        <span className="text-xs text-slate-700 font-bold capitalize">
          {candidate.source === 'career_page' ? 'Applied' : candidate.source}
        </span>
      </div>
    </div>
  );
}
