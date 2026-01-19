import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useCreateEmployeeMutation } from '../../store/api';
import {
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle,
    Users, Sparkles, Loader2, AlertCircle, ArrowRight, FileCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

const BulkEmployeeUpload = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [createEmployee] = useCreateEmployeeMutation();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.match(/\.(xlsx|xls|csv)$/)) {
                toast.error('Please upload an Excel or CSV file');
                return;
            }
            setFile(selectedFile);
            setResults(null);
        }
    };

    const downloadTemplate = () => {
        const templateData = [
            {
                'First Name*': 'Sarah',
                'Last Name*': 'Johnson',
                'Email*': 'sarah.johnson@company.com',
                'Phone': '+256700000000',
                'Job Title': 'Software Engineer',
                'Department': 'Engineering',
                'Date of Birth': '1990-01-15',
                'Gender': 'Female',
                'Address': '123 Main St, Kampala',
                'Emergency Contact Name': 'John Johnson',
                'Emergency Contact Phone': '+256700000001',
                'Hire Date': '2024-01-01',
                'Salary': '5000000',
                'Bank Name': 'Stanbic Bank',
                'Bank Account Number': '1234567890',
                'National ID': 'CM12345678901',
                'NSSF Number': 'F123456789',
                'TIN Number': '1234567890'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Template');

        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
            { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
            { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 15 }
        ];

        XLSX.writeFile(wb, 'employee_upload_template.xlsx');
        toast.success('Template downloaded! 📥');
    };

    const parseExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    const mapEmployeeData = (row) => {
        return {
            first_name: row['First Name*'] || row['first_name'],
            last_name: row['Last Name*'] || row['last_name'],
            email: row['Email*'] || row['email'],
            phone: row['Phone'] || row['phone'] || null,
            job_title: row['Job Title'] || row['job_title'] || null,
            department: row['Department'] || row['department'] || null,
            date_of_birth: row['Date of Birth'] || row['date_of_birth'] || null,
            gender: row['Gender'] || row['gender'] || null,
            address: row['Address'] || row['address'] || null,
            emergency_contact_name: row['Emergency Contact Name'] || row['emergency_contact_name'] || null,
            emergency_contact_phone: row['Emergency Contact Phone'] || row['emergency_contact_phone'] || null,
            join_date: row['Hire Date'] || row['hire_date'] || null,
            basic_salary: row['Salary'] || row['salary'] || null,
            bank_name: row['Bank Name'] || row['bank_name'] || null,
            bank_account_number: row['Bank Account Number'] || row['bank_account_number'] || null,
            national_id: row['National ID'] || row['national_id'] || null,
            nssf_number: row['NSSF Number'] || row['nssf_number'] || null,
            tin_number: row['TIN Number'] || row['tin_number'] || null,
        };
    };

    const validateEmployee = (employee) => {
        const errors = [];
        if (!employee.first_name) errors.push('First name is required');
        if (!employee.last_name) errors.push('Last name is required');
        if (!employee.email) errors.push('Email is required');
        if (employee.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employee.email)) {
            errors.push('Invalid email format');
        }
        return errors;
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploading(true);
        const uploadResults = {
            total: 0,
            successful: 0,
            failed: 0,
            details: []
        };

        try {
            const data = await parseExcelFile(file);
            uploadResults.total = data.length;

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const employeeData = mapEmployeeData(row);
                const validationErrors = validateEmployee(employeeData);

                if (validationErrors.length > 0) {
                    uploadResults.failed++;
                    uploadResults.details.push({
                        row: i + 2,
                        name: `${employeeData.first_name || 'Unknown'} ${employeeData.last_name || ''}`,
                        status: 'failed',
                        error: validationErrors.join(', ')
                    });
                    continue;
                }

                try {
                    await createEmployee(employeeData).unwrap();
                    uploadResults.successful++;
                    uploadResults.details.push({
                        row: i + 2,
                        name: `${employeeData.first_name} ${employeeData.last_name}`,
                        status: 'success',
                        error: null
                    });
                } catch (error) {
                    uploadResults.failed++;
                    uploadResults.details.push({
                        row: i + 2,
                        name: `${employeeData.first_name} ${employeeData.last_name}`,
                        status: 'failed',
                        error: error.data?.message || error.data?.email?.[0] || 'Failed to create employee'
                    });
                }
            }

            setResults(uploadResults);

            if (uploadResults.successful > 0) {
                toast.success(`🎉 Successfully uploaded ${uploadResults.successful} employee(s)!`);
                onSuccess?.();
            }
            if (uploadResults.failed > 0) {
                toast.error(`❌ Failed to upload ${uploadResults.failed} employee(s)`);
            }
        } catch (error) {
            toast.error('Failed to process file');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setFile(null);
        setResults(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-200">
                            <Users className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-bold text-slate-900">
                                Add Your Team
                            </DialogTitle>
                            <p className="text-sm text-slate-600 mt-1">
                                Let's get everyone onboarded in one go!
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pt-6">
                    {!results ? (
                        <>
                            {/* Step 1: Download Template */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">1</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-emerald-900 mb-2 text-lg">Grab the cheat sheet</h3>
                                        <p className="text-sm text-emerald-700 mb-4 leading-relaxed">
                                            We made a simple spreadsheet for you. It has all the columns set up perfectly, so you don't have to guess.
                                        </p>
                                        <Button
                                            onClick={downloadTemplate}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-lg shadow-emerald-200 transition-all hover:shadow-emerald-300 hover:-translate-y-0.5"
                                        >
                                            <Download className="h-4 w-4" />
                                            Download Spreadsheet
                                        </Button>
                                    </div>
                                    <FileSpreadsheet className="h-16 w-16 text-emerald-300 opacity-80" />
                                </div>
                            </motion.div>

                            {/* Step 2: Fill In Data */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">2</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-blue-900 mb-2 text-lg">Fill in the blank spots</h3>
                                        <ul className="text-sm text-blue-700 space-y-2">
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>Names and emails are the most important bits.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>Don't know their phone number yet? No stress, leave it blank.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                <span>Whether it's 5 or 500 people, we can handle it!</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Step 3: Upload File */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="h-10 w-10 rounded-xl bg-purple-500 flex items-center justify-center flex-shrink-0">
                                        <span className="text-white font-bold">3</span>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-purple-900 mb-1 text-lg">Drop it right here</h3>
                                        <p className="text-sm text-purple-700">
                                            Once you're done, drag that file here and watch the magic happen.
                                        </p>
                                    </div>
                                </div>

                                <div className="border-2 border-dashed border-purple-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-purple-50/50 transition-all cursor-pointer bg-white">
                                    <input
                                        type="file"
                                        id="file-upload"
                                        accept=".xlsx,.xls,.csv"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <label htmlFor="file-upload" className="cursor-pointer block">
                                        {file ? (
                                            <div className="space-y-3">
                                                <FileCheck className="h-16 w-16 text-emerald-500 mx-auto" />
                                                <div>
                                                    <p className="text-lg font-bold text-slate-900">{file.name}</p>
                                                    <p className="text-sm text-slate-600 mt-1">
                                                        {(file.size / 1024).toFixed(2)} KB • Ready to upload
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setFile(null);
                                                    }}
                                                    className="text-slate-500 hover:text-slate-700"
                                                >
                                                    Pick a different file
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                <Upload className="h-16 w-16 text-purple-400 mx-auto" />
                                                <div>
                                                    <p className="text-lg font-semibold text-slate-900 mb-1">
                                                        Tap to browse or just drop your file
                                                    </p>
                                                    <p className="text-sm text-slate-600">
                                                        We accept Excel (.xlsx) and CSV files
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </motion.div>
                        </>
                    ) : (
                        /* Results View */
                        <AnimatePresence>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="space-y-6"
                            >
                                {/* Summary Cards */}
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl p-6 text-center">
                                        <p className="text-4xl font-bold text-slate-900 mb-2">{results.total}</p>
                                        <p className="text-sm font-medium text-slate-600">Total Records</p>
                                    </div>
                                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 text-center">
                                        <p className="text-4xl font-bold text-emerald-600 mb-2">{results.successful}</p>
                                        <p className="text-sm font-medium text-emerald-700">✓ Successful</p>
                                    </div>
                                    <div className="bg-rose-50 border-2 border-rose-200 rounded-2xl p-6 text-center">
                                        <p className="text-4xl font-bold text-rose-600 mb-2">{results.failed}</p>
                                        <p className="text-sm font-medium text-rose-700">✗ Failed</p>
                                    </div>
                                </div>

                                {/* Detailed Results */}
                                <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white">
                                    <div className="bg-slate-50 px-6 py-4 border-b-2 border-slate-200">
                                        <h3 className="font-bold text-slate-900 text-lg">Upload Details</h3>
                                    </div>
                                    <div className="max-h-80 overflow-y-auto">
                                        {results.details.map((detail, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${detail.status === 'success' ? 'bg-white hover:bg-emerald-50/30' : 'bg-rose-50/50'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    {detail.status === 'success' ? (
                                                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                                            <CheckCircle className="h-5 w-5 text-emerald-600" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-xl bg-rose-100 flex items-center justify-center">
                                                            <XCircle className="h-5 w-5 text-rose-600" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-900">
                                                            Row {detail.row}: {detail.name}
                                                        </p>
                                                        {detail.error && (
                                                            <p className="text-xs text-rose-600 mt-1 flex items-center gap-1">
                                                                <AlertCircle className="h-3 w-3" />
                                                                {detail.error}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t-2 border-slate-200">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={uploading}
                        className="flex-1 h-12 text-slate-600 hover:text-slate-900 font-semibold"
                    >
                        {results ? 'Close' : 'Cancel'}
                    </Button>
                    {!results && (
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-1 h-12 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold shadow-lg shadow-primary-200 gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Processing {file?.name}...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-5 w-5" />
                                    Upload Team
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default BulkEmployeeUpload;
