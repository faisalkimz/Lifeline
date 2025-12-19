import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileText, Send, Download, Loader2, Sparkles } from 'lucide-react';
import { useCreateOfferMutation, useGenerateOfferPdfMutation } from '../../store/api';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';

const OfferLetterModal = ({ isOpen, onClose, application }) => {
    const [createOffer, { isLoading: isCreating }] = useCreateOfferMutation();
    const [generatePdf, { isLoading: isGenerating }] = useGenerateOfferPdfMutation();
    const [step, setStep] = useState('form'); // form, preview
    const [offerData, setOfferData] = useState({
        salary_offered: '',
        start_date: '',
        expiry_date: '',
        content: `Dear ${application?.candidate?.first_name || 'Candidate'},\n\nWe are pleased to offer you the position of ${application?.job_title || 'Software Engineer'} at our company. We were impressed by your background and experience, and we believe you will be a valuable addition to our team.\n\nYour starting salary will be UGX [Salary] per year. Your official start date will be [Date].\n\nPlease let us know your decision by [Expiry Date]. We look forward to having you on board!`
    });
    const [generatedOffer, setGeneratedOffer] = useState(null);

    const handleCreate = async () => {
        try {
            const data = {
                ...offerData,
                application: application.id,
                content: offerData.content
                    .replace('[Salary]', offerData.salary_offered)
                    .replace('[Date]', offerData.start_date)
                    .replace('[Expiry Date]', offerData.expiry_date)
            };
            const result = await createOffer(data).unwrap();
            setGeneratedOffer(result);
            setStep('preview');
            toast.success('Offer letter drafted!');
        } catch (error) {
            toast.error('Failed to create offer letter.');
        }
    };

    const handleGeneratePdf = async () => {
        try {
            const result = await generatePdf(generatedOffer.id).unwrap();
            toast.success('PDF generated successfully!');
            window.open(getMediaUrl(result.pdf_url), '_blank');
        } catch (error) {
            toast.error('Failed to generate PDF.');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-[2.5rem] border-none shadow-2xl">
                <div className="bg-primary-600 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
                        <FileText className="h-40 w-40" />
                    </div>
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary-200" />
                            Draft Digital Offer
                        </DialogTitle>
                        <p className="text-primary-100 text-sm font-bold uppercase tracking-widest mt-2">{application?.candidate?.full_name} • {application?.job_title}</p>
                    </DialogHeader>
                </div>

                <div className="p-10 space-y-8 bg-white max-h-[70vh] overflow-y-auto">
                    {step === 'form' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Salary Package (UGX)</label>
                                    <Input
                                        type="number"
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                                        value={offerData.salary_offered}
                                        onChange={e => setOfferData({ ...offerData, salary_offered: e.target.value })}
                                        placeholder="e.g. 120,000,000"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Start Date</label>
                                    <Input
                                        type="date"
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                                        value={offerData.start_date}
                                        onChange={e => setOfferData({ ...offerData, start_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Offer Expiry</label>
                                <Input
                                    type="date"
                                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl font-bold"
                                    value={offerData.expiry_date}
                                    onChange={e => setOfferData({ ...offerData, expiry_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-1">Contract Content Templates</label>
                                <textarea
                                    className="w-full h-48 bg-slate-50 border border-slate-100 rounded-2xl p-5 font-bold focus:bg-white focus:ring-4 focus:ring-primary-500/10 transition-all outline-none resize-none"
                                    value={offerData.content}
                                    onChange={e => setOfferData({ ...offerData, content: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-8 text-center py-10">
                            <div className="bg-primary-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Download className="h-10 w-10 text-primary-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase italic">Offer Encrypted & Ready</h3>
                                <p className="text-slate-500 mt-2 font-medium italic">The digital asset has been generated. You can now download the PDF or sync it with the candidate's portal.</p>
                            </div>
                            <Button
                                onClick={handleGeneratePdf}
                                disabled={isGenerating}
                                className="h-14 px-10 bg-black hover:bg-slate-900 rounded-2xl font-black uppercase tracking-widest italic"
                            >
                                {isGenerating ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Download className="h-5 w-5 mr-3" />}
                                Download PDF Package
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="p-10 bg-slate-50 border-t border-slate-100">
                    <Button variant="ghost" onClick={onClose} className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest italic text-slate-400 hover:text-slate-600">
                        Abort Mission
                    </Button>
                    {step === 'form' && (
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="h-14 px-10 bg-primary-600 hover:bg-primary-700 rounded-2xl font-black uppercase tracking-widest italic"
                        >
                            {isCreating ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : <Send className="h-5 w-5 mr-3" />}
                            Generate & Finalize
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OfferLetterModal;
