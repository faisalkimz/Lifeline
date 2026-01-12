import React from 'react';
import { Badge } from '../../components/ui/Badge';

export function CandidateCard({ candidate, onClick }) {
  const fullName = candidate.full_name || `${candidate.first_name || ''} ${candidate.last_name || ''}`.trim() || 'Unknown Candidate';

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 truncate">
          {fullName}
        </h3>
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mb-4">
          <span className="truncate max-w-[150px]">{candidate.email}</span>
          {candidate.phone && (
            <>
              <span className="text-gray-300">•</span>
              <span>{candidate.phone}</span>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {Array.isArray(candidate.skills) && candidate.skills.length > 0 ? (
            candidate.skills.slice(0, 4).map((skill, i) => (
              <Badge key={i} className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-transparent font-medium px-2 py-0.5">
                {skill}
              </Badge>
            ))
          ) : (
            <span className="text-xs text-gray-400 italic">No skills listed</span>
          )}
          {Array.isArray(candidate.skills) && candidate.skills.length > 4 && (
            <Badge className="bg-gray-50 text-gray-500 border-transparent px-2 py-0.5">
              +{candidate.skills.length - 4}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
        <Badge variant="outline" className={`capitalize border-gray-200 ${candidate.status === 'hired' ? 'bg-green-50 text-green-700 border-green-200' :
            candidate.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
              'text-gray-600 bg-gray-50'
          }`}>
          {candidate.status?.replace(/_/g, ' ') || 'New'}
        </Badge>
        <span className="text-xs text-gray-400 font-medium capitalize">
          {candidate.source === 'career_page' ? 'Applied' : candidate.source}
        </span>
      </div>
    </div>
  );
}
