import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileText, Send, Download, Loader2, Briefcase } from 'lucide-react';
import { useCreateOfferMutation, useGenerateOfferPdfMutation } from '../../store/api';
import toast from 'react-hot-toast';
import { getMediaUrl } from '../../config/api';
import { motion } from 'framer-motion';

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
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-2xl bg-white shadow-2xl border-0">
                {/* Header */}
                <div className="bg-white px-8 py-8 flex items-center gap-6 border-b border-slate-100">
                    <div className="h-14 w-14 rounded-2xl bg-violet-50 flex items-center justify-center border border-violet-100 shadow-sm">
                        <FileText className="h-7 w-7 text-violet-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight">
                            Let's make it official
                        </DialogTitle>
                        <p className="text-gray-500 mt-1 font-medium">
                            Draft an offer for {application?.candidate?.first_name || 'the candidate'}
                        </p>
                    </div>
                </div>

                <div className="p-8 space-y-8 max-h-[65vh] overflow-y-auto">
                    {step === 'form' ? (
                        <div className="space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">What's the starting salary? (UGX)</label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">UGX</div>
                                        <Input
                                            type="number"
                                            className="pl-12 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                            value={offerData.salary_offered}
                                            onChange={e => setOfferData({ ...offerData, salary_offered: e.target.value })}
                                            placeholder="e.g. 120,000,000"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-semibold text-gray-700">When do they start?</label>
                                    <Input
                                        type="date"
                                        className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        value={offerData.start_date}
                                        onChange={e => setOfferData({ ...offerData, start_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">When does this offer expire?</label>
                                <Input
                                    type="date"
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                    value={offerData.expiry_date}
                                    onChange={e => setOfferData({ ...offerData, expiry_date: e.target.value })}
                                />
                                <p className="text-xs text-gray-500">Usually 1-2 weeks from now gives them enough time.</p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <label className="text-sm font-semibold text-gray-700">Personalize the email</label>
                                    <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium">✨ Pro tip: Be warm and welcoming</span>
                                </div>
                                <textarea
                                    className="w-full h-48 p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-violet-500 focus:bg-white focus:border-transparent outline-none resize-none transition-all leading-relaxed"
                                    value={offerData.content}
                                    onChange={e => setOfferData({ ...offerData, content: e.target.value })}
                                />
                                <div className="flex gap-2 text-xs text-gray-400">
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">[Salary]</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">[Date]</span>
                                    <span className="px-2 py-1 bg-gray-100 rounded border border-gray-200">[Expiry Date]</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-gradient-to-br from-emerald-400 to-teal-500 h-24 w-24 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-emerald-200 rotate-3"
                            >
                                <Briefcase className="h-10 w-10 text-white" />
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Offer Letter Ready! 🎉</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                                    We've generated a beautiful PDF for you. Download it to review, then send it over to <span className="font-semibold text-gray-700">{application?.candidate?.first_name}</span>.
                                </p>
                            </div>
                            <Button
                                onClick={handleGeneratePdf}
                                disabled={isGenerating}
                                className="h-14 px-8 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 gap-3"
                            >
                                {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <Download className="h-5 w-5" />}
                                Download Confirmation PDF
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-8 py-6 bg-gray-50 border-t border-slate-100 flex justify-end gap-4">
                    <Button variant="ghost" onClick={onClose} className="text-gray-500 hover:text-gray-700 font-semibold">
                        Nevermind
                    </Button>
                    {step === 'form' && (
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-0.5"
                        >
                            {isCreating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Generate Offer
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OfferLetterModal;
