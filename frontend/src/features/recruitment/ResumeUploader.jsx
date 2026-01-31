import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ResumeUploader = ({ onDataExtracted }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Validate file type
            const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(selectedFile.type)) {
                setError('Please upload a PDF or DOCX file');
                return;
            }

            // Validate file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }

            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUploadAndParse = async () => {
        if (!file) {
            setError('Please select a file first');
            return;
        }

        setIsParsing(true);
        setError(null);

        try {
            const formData = new FormData();
            formData.append('resume', file);

            const response = await fetch('/api/recruitment/candidates/parse_resume/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Failed to parse resume');
            }

            const result = await response.json();

            if (result.success !== false) {
                setParsedData(result);
                toast.success('Resume parsed successfully! 🎉');

                // Pass data to parent component
                if (onDataExtracted) {
                    onDataExtracted(result);
                }
            } else {
                throw new Error(result.error || 'Failed to parse resume');
            }
        } catch (err) {
            setError(err.message || 'Failed to parse resume');
            toast.error('Failed to parse resume');
        } finally {
            setIsParsing(false);
        }
    };

    const resetUploader = () => {
        setFile(null);
        setParsedData(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Upload Card */}
            <Card className="border-2 border-dashed border-slate-300 hover:border-primary-400 transition-colors">
                <CardContent className="p-8">
                    <div className="text-center">
                        <div className="mx-auto h-16 w-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center mb-4">
                            <Upload className="h-8 w-8 text-primary-600" />
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-2">Upload Resume</h3>
                        <p className="text-sm text-slate-600 mb-6">
                            Upload a PDF or DOCX resume to scan candidate information
                        </p>

                        {!file ? (
                            <div>
                                <label className="cursor-pointer">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={handleFileChange}
                                    />
                                    <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition-colors">
                                        <Upload className="h-4 w-4" />
                                        Choose File
                                    </div>
                                </label>
                                <p className="text-xs text-slate-500 mt-3">PDF or DOCX, max 5MB</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {/* File Info */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                                        <FileText className="h-6 w-6 text-primary-600" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <p className="font-semibold text-slate-900 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={resetUploader}
                                        className="text-slate-500 hover:text-slate-700"
                                    >
                                        Change
                                    </Button>
                                </div>

                                {/* Parse Button */}
                                <Button
                                    onClick={handleUploadAndParse}
                                    disabled={isParsing}
                                    className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-xl py-3 gap-2"
                                >
                                    {isParsing ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Parsing Resume...
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4" />
                                            Extract Information
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center gap-2 text-rose-700"
                            >
                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                <p className="text-sm">{error}</p>
                            </motion.div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Parsed Data Display */}
            <AnimatePresence>
                {parsedData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        <Card className="border-emerald-200 bg-emerald-50/50">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-emerald-900">Resume Parsed Successfully!</h3>
                                        <p className="text-sm text-emerald-700">Extracted information below</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {parsedData.first_name && (
                                        <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                            <p className="text-xs font-medium text-slate-600 mb-1">First Name</p>
                                            <p className="font-semibold text-slate-900">{parsedData.first_name}</p>
                                        </div>
                                    )}
                                    {parsedData.last_name && (
                                        <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                            <p className="text-xs font-medium text-slate-600 mb-1">Last Name</p>
                                            <p className="font-semibold text-slate-900">{parsedData.last_name}</p>
                                        </div>
                                    )}
                                    {parsedData.email && (
                                        <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                            <p className="text-xs font-medium text-slate-600 mb-1">Email</p>
                                            <p className="font-semibold text-slate-900">{parsedData.email}</p>
                                        </div>
                                    )}
                                    {parsedData.phone && (
                                        <div className="bg-white rounded-lg p-3 border border-emerald-100">
                                            <p className="text-xs font-medium text-slate-600 mb-1">Phone</p>
                                            <p className="font-semibold text-slate-900">{parsedData.phone}</p>
                                        </div>
                                    )}
                                </div>

                                {parsedData.skills && parsedData.skills.length > 0 && (
                                    <div className="mt-4 bg-white rounded-lg p-4 border border-emerald-100">
                                        <p className="text-xs font-medium text-slate-600 mb-2">Skills Found</p>
                                        <div className="flex flex-wrap gap-2">
                                            {parsedData.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 pt-4 border-t border-emerald-200">
                                    <p className="text-xs text-emerald-700">
                                        💡 The form fields have been auto-filled with this information. Review and edit as needed.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResumeUploader;
