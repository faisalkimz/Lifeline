import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../components/ui/Dialog';
import {
    FileText, Download, Eye, Upload, FolderOpen,
    File, FileImage, FileType2, Loader2, Clock, Calendar,
    CheckCircle, AlertCircle
} from 'lucide-react';
import { useGetEmployeeDocumentsQuery, useCreateEmployeeDocumentMutation } from '../../store/api';
import { getMediaUrl } from '../../config/api';
import toast from 'react-hot-toast';

const MyDocumentsPage = () => {
    const [showUploadDialog, setShowUploadDialog] = useState(false);
    const [selectedDocument, setSelectedDocument] = useState(null);

    const { data: documentsData, isLoading } = useGetEmployeeDocumentsQuery({ my_documents: true });
    const [uploadDocument, { isLoading: isUploading }] = useCreateEmployeeDocumentMutation();

    const documents = Array.isArray(documentsData) ? documentsData : (documentsData?.results || []);

    const [uploadForm, setUploadForm] = useState({
        title: '',
        document_type: 'other',
        file: null
    });

    const documentTypes = [
        { value: 'id_card', label: 'National ID Card' },
        { value: 'passport', label: 'Passport' },
        { value: 'contract', label: 'Employment Contract' },
        { value: 'certificate', label: 'Academic Certificate' },
        { value: 'nssf', label: 'NSSF Card' },
        { value: 'medical', label: 'Medical Certificate' },
        { value: 'recommendation', label: 'Recommendation Letter' },
        { value: 'other', label: 'Other Document' }
    ];

    const getFileIcon = (fileName) => {
        const ext = fileName?.split('.').pop()?.toLowerCase();
        if (['pdf'].includes(ext)) return <FileType2 className="h-8 w-8 text-red-500" />;
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return <FileImage className="h-8 w-8 text-blue-500" />;
        return <File className="h-8 w-8 text-slate-400" />;
    };

    const getStatusBadge = (status) => {
        const styles = {
            verified: 'bg-emerald-100 text-emerald-700',
            pending: 'bg-yellow-100 text-yellow-700',
            expired: 'bg-red-100 text-red-700',
            rejected: 'bg-red-100 text-red-700'
        };
        return styles[status] || 'bg-slate-100 text-slate-700';
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadForm(prev => ({ ...prev, file }));
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!uploadForm.file) {
            toast.error('Please select a file');
            return;
        }

        const formData = new FormData();
        formData.append('title', uploadForm.title);
        formData.append('document_type', uploadForm.document_type);
        formData.append('file', uploadForm.file);

        try {
            await uploadDocument(formData).unwrap();
            toast.success('Document uploaded successfully!');
            setShowUploadDialog(false);
            setUploadForm({ title: '', document_type: 'other', file: null });
        } catch (error) {
            toast.error(error?.data?.error || 'Failed to upload document');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'N/A';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
            </div>
        );
    }

    // Group documents by type
    const groupedDocs = documents.reduce((acc, doc) => {
        const type = doc.document_type || 'other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(doc);
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Documents</h1>
                    <p className="text-gray-600 mt-2">Manage your personal and employment documents</p>
                </div>
                <Button onClick={() => setShowUploadDialog(true)} className="gap-2">
                    <Upload className="h-4 w-4" />
                    Upload Document
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                                <FileText className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Documents</p>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">{documents.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                <CheckCircle className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified</p>
                                <p className="text-2xl font-black text-emerald-600 tracking-tight">
                                    {documents.filter(d => d.status === 'verified').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-100">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending</p>
                                <p className="text-2xl font-black text-yellow-600 tracking-tight">
                                    {documents.filter(d => d.status === 'pending').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                                <AlertCircle className="h-6 w-6 text-red-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Expired</p>
                                <p className="text-2xl font-black text-red-600 tracking-tight">
                                    {documents.filter(d => d.status === 'expired').length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Documents Grid */}
            {documents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {documents.map((doc) => (
                        <Card
                            key={doc.id}
                            className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden hover:shadow-2xl transition-all cursor-pointer group"
                            onClick={() => setSelectedDocument(doc)}
                        >
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-4 bg-slate-50 rounded-2xl group-hover:bg-slate-100 transition-colors">
                                        {getFileIcon(doc.file)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-900 truncate">{doc.title}</h3>
                                        <p className="text-xs text-slate-500 mt-1 capitalize">
                                            {doc.document_type?.replace('_', ' ') || 'Document'}
                                        </p>
                                        <div className="flex items-center gap-2 mt-3">
                                            <Badge className={`${getStatusBadge(doc.status)} rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest`}>
                                                {doc.status || 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(doc.uploaded_at)}
                                    </span>
                                    <span>{formatFileSize(doc.file_size)}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed border-4 border-slate-100 bg-slate-50/30">
                    <CardContent className="py-20 text-center">
                        <FolderOpen className="h-16 w-16 mx-auto mb-4 text-slate-200" />
                        <h3 className="text-xl font-bold text-slate-900">No Documents Yet</h3>
                        <p className="text-slate-500 mt-2 max-w-md mx-auto">
                            Upload your important documents such as ID cards, contracts, and certificates for safekeeping.
                        </p>
                        <Button onClick={() => setShowUploadDialog(true)} className="mt-6 gap-2">
                            <Upload className="h-4 w-4" />
                            Upload Your First Document
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Upload Dialog */}
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogContent className="max-w-lg p-0 border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    <DialogHeader className="bg-slate-900 p-8 text-white">
                        <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                            <Upload className="h-5 w-5 text-primary-400" />
                            Upload Document
                        </DialogTitle>
                        <p className="text-slate-400 text-sm mt-1">Add a new document to your file</p>
                    </DialogHeader>

                    <form onSubmit={handleUpload} className="p-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Title</label>
                            <input
                                type="text"
                                value={uploadForm.title}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="e.g., National ID Card"
                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-primary-500 outline-none transition-all"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Document Type</label>
                            <select
                                value={uploadForm.document_type}
                                onChange={(e) => setUploadForm(prev => ({ ...prev, document_type: e.target.value }))}
                                className="w-full h-12 px-4 border-2 border-slate-100 rounded-xl bg-slate-50 focus:bg-white focus:border-primary-500 outline-none transition-all"
                            >
                                {documentTypes.map(type => (
                                    <option key={type.value} value={type.value}>{type.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select File</label>
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:border-primary-300 transition-colors">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <Upload className="h-10 w-10 mx-auto mb-3 text-slate-300" />
                                    {uploadForm.file ? (
                                        <p className="font-bold text-emerald-600">{uploadForm.file.name}</p>
                                    ) : (
                                        <>
                                            <p className="font-bold text-slate-600">Click to select a file</p>
                                            <p className="text-xs text-slate-400 mt-1">PDF, JPG, PNG, DOC up to 10MB</p>
                                        </>
                                    )}
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setShowUploadDialog(false)} className="rounded-xl">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isUploading} className="rounded-xl gap-2">
                                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                {isUploading ? 'Uploading...' : 'Upload Document'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Document Details Dialog */}
            <Dialog open={!!selectedDocument} onOpenChange={() => setSelectedDocument(null)}>
                <DialogContent className="max-w-lg p-0 border-none shadow-2xl rounded-[2rem] overflow-hidden">
                    {selectedDocument && (
                        <>
                            <DialogHeader className="bg-slate-900 p-8 text-white">
                                <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
                                    {getFileIcon(selectedDocument.file)}
                                    <span className="truncate">{selectedDocument.title}</span>
                                </DialogTitle>
                            </DialogHeader>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                        <p className="font-bold text-slate-900 capitalize mt-1">
                                            {selectedDocument.document_type?.replace('_', ' ')}
                                        </p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                        <Badge className={`${getStatusBadge(selectedDocument.status)} mt-1`}>
                                            {selectedDocument.status || 'Active'}
                                        </Badge>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uploaded</p>
                                        <p className="font-bold text-slate-900 mt-1">{formatDate(selectedDocument.uploaded_at)}</p>
                                    </div>
                                    <div className="bg-slate-50 rounded-xl p-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">File Size</p>
                                        <p className="font-bold text-slate-900 mt-1">{formatFileSize(selectedDocument.file_size)}</p>
                                    </div>
                                </div>

                                {selectedDocument.expiry_date && (
                                    <div className={`p-4 rounded-xl ${new Date(selectedDocument.expiry_date) < new Date() ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                                        <p className="text-xs font-bold text-slate-600">
                                            {new Date(selectedDocument.expiry_date) < new Date() ? '⚠️ Expired on' : '📅 Expires on'}: {formatDate(selectedDocument.expiry_date)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter className="p-8 pt-0 gap-3">
                                <Button variant="outline" onClick={() => setSelectedDocument(null)} className="rounded-xl">
                                    Close
                                </Button>
                                <Button
                                    onClick={() => window.open(getMediaUrl(selectedDocument.file), '_blank')}
                                    className="rounded-xl gap-2"
                                >
                                    <Eye className="h-4 w-4" />
                                    View Document
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        const link = document.createElement('a');
                                        link.href = getMediaUrl(selectedDocument.file);
                                        link.download = selectedDocument.title;
                                        link.click();
                                    }}
                                    className="rounded-xl gap-2"
                                >
                                    <Download className="h-4 w-4" />
                                    Download
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default MyDocumentsPage;
