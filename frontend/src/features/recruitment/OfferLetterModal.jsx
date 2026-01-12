import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { FileText, Send, Download, Loader2, Briefcase } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden rounded-xl bg-white shadow-xl border border-gray-100">
                <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            Draft Offer Letter
                        </DialogTitle>
                        <p className="text-sm text-gray-500 mt-1">
                            {application?.candidate?.full_name} • {application?.job_title}
                        </p>
                    </div>
                </div>

                <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    {step === 'form' ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Salary Package (UGX)</label>
                                    <Input
                                        type="number"
                                        className="bg-white"
                                        value={offerData.salary_offered}
                                        onChange={e => setOfferData({ ...offerData, salary_offered: e.target.value })}
                                        placeholder="e.g. 120,000,000"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Start Date</label>
                                    <Input
                                        type="date"
                                        className="bg-white"
                                        value={offerData.start_date}
                                        onChange={e => setOfferData({ ...offerData, start_date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Offer Expiry Date</label>
                                <Input
                                    type="date"
                                    className="bg-white"
                                    value={offerData.expiry_date}
                                    onChange={e => setOfferData({ ...offerData, expiry_date: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Letter Content</label>
                                <textarea
                                    className="w-full h-48 p-4 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-shadow"
                                    value={offerData.content}
                                    onChange={e => setOfferData({ ...offerData, content: e.target.value })}
                                />
                                <p className="text-xs text-gray-400">
                                    Use placeholders [Salary], [Date], [Expiry Date] for dynamic insertion.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-12 space-y-6">
                            <div className="bg-green-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto ring-4 ring-green-50/50">
                                <Briefcase className="h-10 w-10 text-green-600" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Offer Letter Ready</h3>
                                <p className="text-gray-500 mt-2 max-w-sm mx-auto">
                                    The offer letter has been successfully generated. You can now download the PDF or send it directly.
                                </p>
                            </div>
                            <Button
                                onClick={handleGeneratePdf}
                                disabled={isGenerating}
                                className="h-12 px-8 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold shadow-lg shadow-blue-200"
                            >
                                {isGenerating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Download className="h-5 w-5 mr-2" />}
                                Download Offer PDF
                            </Button>
                        </div>
                    )}
                </div>

                <DialogFooter className="px-8 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose} className="border-gray-200 text-gray-700 hover:bg-white text-base h-11 px-6">
                        Cancel
                    </Button>
                    {step === 'form' && (
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-11 px-6"
                        >
                            {isCreating ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Send className="h-4 w-4 mr-2" />}
                            Create Offer
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default OfferLetterModal;
