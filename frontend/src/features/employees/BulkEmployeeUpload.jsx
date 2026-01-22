import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useCreateEmployeeMutation, useGetDepartmentsQuery } from '../../store/api';
import {
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle,
    Users, Sparkles, Loader2, AlertCircle, ArrowRight, FileCheck, Edit, Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';
import { cn } from '../../utils/cn';

const BulkEmployeeUpload = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [results, setResults] = useState(null);
    const [selectedDepartment, setSelectedDepartment] = useState('');
    const [createEmployee] = useCreateEmployeeMutation();
    const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery();

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
        // Get department name for template if selected
        const departmentName = selectedDepartment 
            ? departments.find(d => d.id === parseInt(selectedDepartment))?.name || ''
            : 'Engineering'; // Default example
        
        const templateData = [
            {
                'First Name*': 'Sarah',
                'Last Name*': 'Johnson',
                'Email*': 'sarah.johnson@company.com',
                'Phone': '+256700000000',
                'Job Title': 'Software Engineer',
                'Department': departmentName || 'Select from available departments',
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

        // Create main data sheet
        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Data');

        // Create departments reference sheet
        if (departments.length > 0) {
            const deptData = departments.map(dept => ({
                'Department ID': dept.id,
                'Department Name': dept.name,
                'Code': dept.code || ''
            }));
            const deptWs = XLSX.utils.json_to_sheet(deptData);
            XLSX.utils.book_append_sheet(wb, deptWs, 'Available Departments');
        }

        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 10 },
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
        // Use selected department from UI if provided, otherwise use department from Excel
        let departmentValue = selectedDepartment 
            ? departments.find(d => d.id === parseInt(selectedDepartment))?.name 
            : (row['Department'] || row['department'] || null);
        
        return {
            first_name: row['First Name*'] || row['first_name'],
            last_name: row['Last Name*'] || row['last_name'],
            email: row['Email*'] || row['email'],
            phone: row['Phone'] || row['phone'] || null,
            job_title: row['Job Title'] || row['job_title'] || null,
            department: departmentValue,
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

            // Check for duplicate emails in the upload batch
            const emailSet = new Set();
            const duplicateEmails = new Set();

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const employeeData = mapEmployeeData(row);
                
                // Check for duplicates in batch
                if (employeeData.email) {
                    if (emailSet.has(employeeData.email.toLowerCase())) {
                        duplicateEmails.add(employeeData.email.toLowerCase());
                    } else {
                        emailSet.add(employeeData.email.toLowerCase());
                    }
                }
            }

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const employeeData = mapEmployeeData(row);
                const validationErrors = validateEmployee(employeeData);

                // Check if email is duplicate in this batch
                if (employeeData.email && duplicateEmails.has(employeeData.email.toLowerCase())) {
                    validationErrors.push('Duplicate email in upload file');
                }

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
                    
                    // Extract detailed error message with better parsing
                    let errorMessage = 'Failed to create employee';
                    
                    // Log full error for debugging (use JSON.stringify to see full object)
                    console.error(`Row ${i + 2} Full Error:`, JSON.stringify(error, null, 2));
                    console.error(`Row ${i + 2} Error Data:`, JSON.stringify(error.data, null, 2));
                    console.error(`Row ${i + 2} Employee Data Sent:`, JSON.stringify(employeeData, null, 2));
                    
                    // RTK Query error format: {status: number, data: {...}, error: string}
                    const errorData = error.data;
                    
                    if (errorData) {
                        // Handle different error formats
                        if (typeof errorData === 'string') {
                            // Check if it's HTML (backend not deployed with middleware yet)
                            if (errorData.includes('<!doctype html>') || errorData.includes('<html')) {
                                errorMessage = 'Backend returned HTML error. Please deploy backend changes.';
                            } else {
                                errorMessage = errorData;
                            }
                        } else if (errorData.detail) {
                            errorMessage = errorData.detail;
                        } else if (errorData.message) {
                            errorMessage = errorData.message;
                        } else if (typeof errorData === 'object' && errorData !== null) {
                            // Extract all validation errors, not just the first
                            const errorMessages = [];
                            const errorKeys = Object.keys(errorData);
                            
                            errorKeys.forEach(key => {
                                const fieldError = errorData[key];
                                if (Array.isArray(fieldError)) {
                                    fieldError.forEach(msg => {
                                        errorMessages.push(`${key}: ${msg}`);
                                    });
                                } else if (typeof fieldError === 'string') {
                                    errorMessages.push(`${key}: ${fieldError}`);
                                } else if (typeof fieldError === 'object' && fieldError !== null) {
                                    errorMessages.push(`${key}: ${JSON.stringify(fieldError)}`);
                                }
                            });
                            
                            if (errorMessages.length > 0) {
                                errorMessage = errorMessages.slice(0, 3).join('; '); // Show first 3 errors
                                if (errorMessages.length > 3) {
                                    errorMessage += ` (+${errorMessages.length - 3} more)`;
                                }
                            } else {
                                // If no specific errors found, show the whole object
                                errorMessage = JSON.stringify(errorData);
                            }
                        }
                    } else if (error.error) {
                        errorMessage = error.error;
                    } else if (error.status === 'PARSING_ERROR') {
                        errorMessage = 'Server returned invalid response. Backend may need to be deployed.';
                    } else if (error.status) {
                        errorMessage = `Server error (${error.status}). Check console for details.`;
                    }
                    
                    uploadResults.details.push({
                        row: i + 2,
                        name: `${employeeData.first_name || 'Unknown'} ${employeeData.last_name || ''}`,
                        status: 'failed',
                        error: errorMessage
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
        setSelectedDepartment('');
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col bg-white">
                <div className="bg-white px-8 py-6 flex items-center gap-4 border-b border-slate-100">
                    <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 shadow-sm">
                        <Users className="h-6 w-6 text-slate-600" />
                    </div>
                    <div>
                        <DialogTitle className="text-2xl font-bold text-slate-900 tracking-tight">
                            Add Your Team
                        </DialogTitle>
                        <p className="text-slate-500 mt-1 font-medium text-sm">
                            Let's get everyone onboarded in one go!
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10">
                    {!results ? (
                        <div className="max-w-2xl mx-auto space-y-12">
                            {/* Simple, Human Introduction */}
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-slate-900">How to get started</h3>
                                <p className="text-slate-500 leading-relaxed">
                                    The quickest way to add your team is by using a spreadsheet.
                                    Download our template, fill in your employee details, and upload it back here.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 gap-10">
                                {/* Department Selector */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 rounded-2xl p-6">
                                    <div className="flex items-start gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            <Building2 className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-sm font-bold text-slate-900 mb-2">
                                                Default Department (Optional)
                                            </label>
                                            <p className="text-xs text-slate-600 mb-3">
                                                Select a department to apply to all employees in this upload. You can also specify departments individually in the Excel file.
                                            </p>
                                            <select
                                                value={selectedDepartment}
                                                onChange={(e) => setSelectedDepartment(e.target.value)}
                                                className="w-full rounded-lg border-2 border-blue-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                disabled={departmentsLoading}
                                            >
                                                <option value="">No default (use Excel file values)</option>
                                                {departments.map((dept) => (
                                                    <option key={dept.id} value={dept.id}>
                                                        {dept.name} {dept.code ? `(${dept.code})` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                            {departments.length === 0 && !departmentsLoading && (
                                                <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                                                    <AlertCircle className="h-3 w-3" />
                                                    No departments found. Create departments first or leave blank.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Instructions List */}
                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">1</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Download the template</p>
                                            <p className="text-sm text-slate-500 mt-1 mb-3">
                                                A pre-formatted Excel file with all the columns you'll need.
                                                {departments.length > 0 && (
                                                    <span className="block mt-1 text-xs text-blue-600">
                                                        📋 Includes a "Available Departments" sheet for reference
                                                    </span>
                                                )}
                                            </p>
                                            <button
                                                onClick={downloadTemplate}
                                                className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
                                            >
                                                <Download className="h-4 w-4" />
                                                Get template.xlsx
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">2</div>
                                        <div>
                                            <p className="font-semibold text-slate-900">Add your people</p>
                                            <p className="text-sm text-slate-500 mt-1">
                                                Only <span className="text-slate-900 font-medium">Name and Email</span> are required for now.
                                                {selectedDepartment && (
                                                    <span className="block mt-1 text-xs text-blue-600">
                                                        ✓ All employees will be assigned to: <strong>{departments.find(d => d.id === parseInt(selectedDepartment))?.name}</strong>
                                                    </span>
                                                )}
                                                You can always update phone numbers and IDs later in their profiles.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Clean Upload Area */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Ready to upload</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300 p-12 text-center",
                                        file
                                            ? "bg-emerald-50/30 border-emerald-200"
                                            : "bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-white"
                                    )}>
                                        <input
                                            type="file"
                                            id="file-upload"
                                            accept=".xlsx,.xls,.csv"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        <label htmlFor="file-upload" className="cursor-pointer block">
                                            {file ? (
                                                <div className="space-y-4">
                                                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                                                        <FileCheck className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">{file.name}</p>
                                                        <p className="text-sm text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.preventDefault(); setFile(null); }}
                                                        className="text-xs font-bold text-rose-500 hover:underline"
                                                    >
                                                        Remove file
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-4">
                                                    <div className="h-16 w-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto text-slate-400 group-hover:text-slate-600 transition-colors">
                                                        <Upload className="h-8 w-8" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-slate-900">Drop your file here</p>
                                                        <p className="text-sm text-slate-500 mt-1">or click to browse from your computer</p>
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Excel or CSV</p>
                                                </div>
                                            )}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                <div className="flex gap-4 p-8 bg-slate-50 border-t border-slate-100">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={uploading}
                        className="flex-1 h-14 text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-[10px] rounded-2xl hover:bg-white transition-all"
                    >
                        {results ? 'Close' : 'Cancel'}
                    </Button>
                    {!results && (
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-[2] h-14 bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase tracking-widest text-[10px] rounded-2xl shadow-2xl shadow-slate-900/20 gap-3 transition-all enabled:hover:-translate-y-1 disabled:opacity-50"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 text-emerald-400" />
                                    Sync Your Team
                                    <ArrowRight className="h-3 w-3 opacity-50" />
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
