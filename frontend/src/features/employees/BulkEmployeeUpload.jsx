import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import { useCreateEmployeeMutation } from '../../store/api';
import {
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle, AlertTriangle, Users, Info
} from 'lucide-react';
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
        // Create template data
        const templateData = [
            {
                'First Name*': 'John',
                'Last Name*': 'Doe',
                'Email*': 'john.doe@example.com',
                'Phone': '+256700000000',
                'Job Title': 'Software Engineer',
                'Department': 'Engineering',
                'Date of Birth': '1990-01-15',
                'Gender': 'Male',
                'Address': '123 Main St, Kampala',
                'Emergency Contact Name': 'Jane Doe',
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

        // Set column widths
        ws['!cols'] = [
            { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 },
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 10 },
            { wch: 30 }, { wch: 20 }, { wch: 20 }, { wch: 15 },
            { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 },
            { wch: 15 }, { wch: 15 }
        ];

        XLSX.writeFile(wb, 'employee_upload_template.xlsx');
        toast.success('Template downloaded successfully');
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
            hire_date: row['Hire Date'] || row['hire_date'] || null,
            salary: row['Salary'] || row['salary'] || null,
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
                        row: i + 2, // +2 because Excel is 1-indexed and has header row
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
                toast.success(`Successfully uploaded ${uploadResults.successful} employee(s)`);
                onSuccess?.();
            }
            if (uploadResults.failed > 0) {
                toast.error(`Failed to upload ${uploadResults.failed} employee(s)`);
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
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="h-6 w-6 text-blue-600" />
                        Bulk Employee Upload
                    </DialogTitle>
                    <p className="text-sm text-gray-600 mt-1">
                        Upload multiple employees at once using an Excel or CSV file
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-6 pt-4">
                    {/* Instructions */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-blue-900 mb-2">Instructions</h3>
                                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                                    <li>Download the template file to see the required format</li>
                                    <li>Fill in employee data (required fields marked with *)</li>
                                    <li>Upload the completed file to import employees</li>
                                    <li>Nullable fields will be skipped if left empty</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Template Download */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-center gap-3">
                            <FileSpreadsheet className="h-8 w-8 text-green-600" />
                            <div>
                                <h3 className="font-semibold text-gray-900">Employee Template</h3>
                                <p className="text-sm text-gray-600">Download the Excel template with sample data</p>
                            </div>
                        </div>
                        <Button onClick={downloadTemplate} variant="ghost" className="border border-gray-300">
                            <Download className="h-4 w-4 mr-2" />
                            Download Template
                        </Button>
                    </div>

                    {/* File Upload */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-all">
                        <input
                            type="file"
                            id="file-upload"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-900 mb-1">
                                {file ? file.name : 'Click to upload or drag and drop'}
                            </p>
                            <p className="text-xs text-gray-600">
                                Excel (.xlsx, .xls) or CSV files only
                            </p>
                        </label>
                    </div>

                    {/* Upload Results */}
                    {results && (
                        <div className="space-y-4">
                            {/* Summary */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-gray-900">{results.total}</p>
                                    <p className="text-xs text-gray-600 mt-1">Total Records</p>
                                </div>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-green-700">{results.successful}</p>
                                    <p className="text-xs text-green-700 mt-1">Successful</p>
                                </div>
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                                    <p className="text-2xl font-bold text-red-700">{results.failed}</p>
                                    <p className="text-xs text-red-700 mt-1">Failed</p>
                                </div>
                            </div>

                            {/* Detailed Results */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">Upload Details</h3>
                                </div>
                                <div className="max-h-64 overflow-y-auto">
                                    {results.details.map((detail, idx) => (
                                        <div
                                            key={idx}
                                            className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${detail.status === 'success' ? 'bg-white' : 'bg-red-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {detail.status === 'success' ? (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-red-600" />
                                                )}
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        Row {detail.row}: {detail.name}
                                                    </p>
                                                    {detail.error && (
                                                        <p className="text-xs text-red-600 mt-0.5">{detail.error}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                    <Button
                        variant="ghost"
                        onClick={handleClose}
                        disabled={uploading}
                        className="flex-1"
                    >
                        {results ? 'Close' : 'Cancel'}
                    </Button>
                    {!results && (
                        <Button
                            onClick={handleUpload}
                            disabled={!file || uploading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {uploading ? (
                                <>
                                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-4 w-4 mr-2" />
                                    Upload Employees
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
