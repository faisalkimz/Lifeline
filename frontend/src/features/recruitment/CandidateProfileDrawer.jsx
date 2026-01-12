import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  X, Mail, Phone, MapPin, FileText, Download,
  Briefcase, GraduationCap, Calendar, Star,
  ExternalLink, Linkedin, Github, Globe,
  CheckCircle, Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import OfferLetterModal from './OfferLetterModal';
import { useGetApplicationsQuery } from '../../store/api';

const CandidateProfileDrawer = ({ candidate, open, onClose }) => {
  const [isOfferModalOpen, setIsOfferModalOpen] = React.useState(false);

  const { data: applications } = useGetApplicationsQuery();
  const applicationsArray = Array.isArray(applications) ? applications : (applications?.results || []);
  const application = applicationsArray.find(app => app.candidate?.id === candidate?.id);

  if (!candidate) return null;

  const getImageUrl = (path) => {
    return getMediaUrl(path);
  };

  const statusColors = {
    new: 'bg-primary-100 text-primary-700',
    screening: 'bg-purple-100 text-purple-700',
    interview: 'bg-orange-100 text-orange-700',
    offer: 'bg-yellow-100 text-yellow-700',
    hired: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-[50] transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[51] transition-transform duration-300 ease-in-out flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden">
              {candidate.photo ? (
                <img src={getImageUrl(candidate.photo)} alt={candidate.full_name} className="h-full w-full object-cover" />
              ) : (
                <span className="text-xl font-semibold text-gray-500">{candidate.first_name?.[0]}{candidate.last_name?.[0]}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">{candidate.first_name} {candidate.last_name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-sm text-gray-500">{candidate.current_position || 'Candidate'}</p>
                <span className="text-gray-300">•</span>
                <Badge className={cn("capitalize border-0", statusColors[candidate.status] || 'bg-gray-100 text-gray-700')}>
                  {candidate.status?.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5 text-gray-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                <Mail className="h-4 w-4 text-gray-400" />
                {candidate.email}
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone</p>
              <div className="flex items-center gap-2 text-sm text-gray-900 font-medium">
                <Phone className="h-4 w-4 text-gray-400" />
                {candidate.phone || 'N/A'}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-primary-600" /> Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-white border border-gray-200 text-gray-700 text-sm rounded-full">
                  {skill}
                </span>
              ))}
              {!candidate.skills?.length && <p className="text-sm text-gray-500 italic">No skills listed</p>}
            </div>
          </div>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-600" /> Experience
              </h3>
              <div className="pl-4 border-l-2 border-gray-100 space-y-4">
                <div className="relative">
                  <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-primary-600 border-2 border-white" />
                  <p className="text-sm font-semibold text-gray-900">{candidate.experience_years} Years</p>
                  <p className="text-xs text-gray-500 mt-0.5">Total Experience</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-primary-600" /> Education
              </h3>
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900 capitalize">{candidate.education_level?.replace('_', ' ') || 'Not Specified'}</p>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary-600" /> Documents
            </h3>
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Resume / CV</p>
                  <p className="text-xs text-gray-500">PDF Document</p>
                </div>
              </div>
              {candidate.resume ? (
                <Button variant="outline" size="sm" asChild>
                  <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-gray-400 italic">Not available</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex gap-3">
          <Button
            className="flex-1 bg-primary-600 hover:bg-primary-700"
            onClick={() => setIsOfferModalOpen(true)}
          >
            Generate Offer
          </Button>
          <Button variant="outline" className="flex-1">
            Schedule Interview
          </Button>
        </div>
      </div>

      {application && (
        <OfferLetterModal
          isOpen={isOfferModalOpen}
          onClose={() => setIsOfferModalOpen(false)}
          application={application}
        />
      )}
    </>
  );
};

export default CandidateProfileDrawer;
