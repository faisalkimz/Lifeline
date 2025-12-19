import React from 'react';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  X, Mail, Phone, MapPin, FileText, Download,
  Briefcase, GraduationCap, Calendar, Star,
  ExternalLink, Linkedin, Github, Globe,
  ChevronRight, ArrowUpRight, Zap, Target, Award
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { getMediaUrl } from '../../config/api';
import OfferLetterModal from './OfferLetterModal';
import { useGetApplicationsQuery } from '../../store/api';

const CandidateProfileDrawer = ({ candidate, open, onClose }) => {
  const [isOfferModalOpen, setIsOfferModalOpen] = React.useState(false);

  // We need to find the application for this candidate to link the offer
  const { data: applications = [] } = useGetApplicationsQuery();
  const application = applications.find(app => app.candidate?.id === candidate?.id);

  if (!candidate) return null;

  const getImageUrl = (path) => {
    return getMediaUrl(path);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[2000] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl z-[2001] transition-transform duration-700 ease-[cubic-bezier(0.8,0,0.2,1)] overflow-y-auto",
          open ? "translate-x-0" : "translate-x-full"
        )}
        style={{ fontFamily: 'Inter, sans-serif' }}
      >
        {/* Header Section */}
        <div className="bg-slate-900 text-white p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Target className="h-40 w-40 text-white rotate-12" />
          </div>

          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all z-10"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="relative z-10 flex items-center gap-8">
            <div className="h-32 w-32 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-primary-600 p-1 shadow-2xl shadow-indigo-500/20">
              <div className="h-full w-full rounded-[2.3rem] bg-slate-900 overflow-hidden flex items-center justify-center border-4 border-slate-900">
                {candidate.photo ? (
                  <img src={getImageUrl(candidate.photo)} alt={candidate.full_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-4xl font-black italic">{candidate.first_name?.[0]}{candidate.last_name?.[0]}</span>
                )}
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h2 className="text-4xl font-black italic tracking-tighter uppercase tabular-nums">
                  {candidate.first_name} {candidate.last_name}
                </h2>
                <Badge className="bg-primary-500 text-white border-none rounded-xl font-black px-4 py-1.5 uppercase text-[10px] tracking-widest shadow-lg shadow-primary-500/30">
                  {candidate.status?.replace('_', ' ')}
                </Badge>
              </div>
              <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.3em] flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-primary-400" />
                {candidate.current_position || 'Open for Opportunities'}
              </p>
              <div className="flex gap-4 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  <Calendar className="h-3 w-3" /> Applied: {new Date(candidate.applied_at || Date.now()).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-widest">
                  <Zap className="h-3 w-3 text-amber-500" /> Score: {candidate.score || 85}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-12 space-y-12 bg-slate-50">
          {/* Tactical Info Grid */}
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Network Identity</p>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
                <div className="p-3 bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Primary Contact</p>
                  <p className="text-sm font-black text-slate-900">{candidate.email}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Comm Channel</p>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all hover:shadow-md group">
                <div className="p-3 bg-emerald-50 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Mobile Sync</p>
                  <p className="text-sm font-black text-slate-900">{candidate.phone || 'UNREGISTERED'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Registry */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
              <Zap className="h-4 w-4 text-emerald-500" /> Stack Competency
            </h3>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex flex-wrap gap-3">
                {candidate.skills?.map((skill, idx) => (
                  <span key={idx} className="px-5 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:scale-110 transition-transform cursor-default">
                    {skill}
                  </span>
                ))}
                {!candidate.skills?.length && <p className="text-slate-400 italic font-bold text-xs uppercase">No competence signatures detected.</p>}
              </div>
            </div>
          </div>

          {/* Experience & Education */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-indigo-500" /> Career History
              </h3>
              <div className="relative pl-8 space-y-10 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-200">
                <div className="relative">
                  <div className="absolute -left-[30px] top-1 h-6 w-6 rounded-full bg-white border-4 border-indigo-600 z-10" />
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{candidate.experience_years} Years Experience</p>
                    <h4 className="text-sm font-black text-slate-900 uppercase italic mt-1">{candidate.current_position || 'Professional'}</h4>
                    <p className="text-xs font-bold text-slate-500 mt-2 leading-relaxed">System-verified professional tenure across enterprise environments.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
                <GraduationCap className="h-4 w-4 text-indigo-500" /> Academic Credentials
              </h3>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Level</p>
                <h4 className="text-sm font-black text-slate-900 uppercase italic mt-1">{candidate.education_level?.replace('_', ' ') || 'CERTIFIED'}</h4>
                <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">
                  <Award className="h-3 w-3" /> Official verification pending
                </div>
              </div>
            </div>
          </div>

          {/* Digital Assets (Resume) */}
          <div className="space-y-4 pb-12">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-900 flex items-center gap-3">
              <FileText className="h-4 w-4 text-indigo-500" /> Asset Repository
            </h3>
            <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-900/20 flex items-center justify-between group">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-white/10 rounded-[1.5rem] group-hover:scale-110 transition-transform">
                  <FileText className="h-8 w-8 text-primary-400" />
                </div>
                <div>
                  <h4 className="font-black italic uppercase tracking-tighter text-xl">Resume_Master_v2.pdf</h4>
                  <p className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mt-1 italic">Type: Application/PDF • Size: 1.2 MB</p>
                </div>
              </div>
              {candidate.resume ? (
                <Button className="bg-white text-slate-900 hover:bg-slate-100 rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl" asChild>
                  <a href={candidate.resume} target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-2" /> Sync Asset
                  </a>
                </Button>
              ) : (
                <Badge className="bg-rose-500/20 text-rose-400 border-none font-black uppercase tracking-widest px-6 py-2 rounded-xl">Missing Asset</Badge>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t border-slate-100 pt-12 flex gap-4">
            <Button
              onClick={() => setIsOfferModalOpen(true)}
              className="flex-1 h-16 rounded-[2rem] bg-indigo-600 text-white font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-indigo-600/10 hover:bg-indigo-700"
            >
              Generate Offer
            </Button>
            <Button variant="ghost" className="h-16 w-16 p-0 rounded-[2rem] bg-rose-50 text-rose-600 hover:bg-rose-100">
              <ArrowUpRight className="h-6 w-6" />
            </Button>
          </div>
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
