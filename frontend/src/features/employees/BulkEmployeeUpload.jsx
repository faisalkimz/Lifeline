import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/Dialog';
import { Button } from '../../components/ui/Button';
import {
    useCreateEmployeeMutation,
    useGetDepartmentsQuery,
    useCreateSalaryStructureMutation,
    useGetEmployeesQuery
} from '../../store/api';
import {
    Upload, Download, FileSpreadsheet, CheckCircle, XCircle,
    Users, Loader2, AlertCircle, ArrowRight, FileCheck, Edit, Building2
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
    const [createSalaryStructure] = useCreateSalaryStructureMutation();
    const { data: departments = [], isLoading: departmentsLoading } = useGetDepartmentsQuery();
    const { data: allEmployeesData } = useGetEmployeesQuery();
    const allEmployees = allEmployeesData?.results || allEmployeesData || [];

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
            : (departments.length > 0 ? departments[0].name : 'HR & Administration');

        const today = new Date().toISOString().split('T')[0];
        const exampleBirthDate = new Date();
        exampleBirthDate.setFullYear(exampleBirthDate.getFullYear() - 25);
        const exampleBirthDateStr = exampleBirthDate.toISOString().split('T')[0];

        const templateData = [
            {
                // Identity
                'First Name*': 'MBABALI',
                'Middle Name': '',
                'Last Name*': 'FAISAL',
                'Email*': 'mbabalifaisal2@gmail.com',
                'Phone': '0000000000',
                'Date of Birth': '1990-01-01',
                'Gender': 'Other',
                'Marital Status': 'Single',

                // Employment
                'Job Title': 'Company Administrator',
                'Department': departmentName,
                'Manager Email': '',
                'Employment Type': 'Full Time',
                'Employment Status': 'Active',
                'Join Date': '2026-01-27',
                'Probation End Date': '',

                // Security / System Access
                'Create User Account? (Yes/No)': 'Yes',
                'Username': 'Kimz',
                'Password': 'Minimum8Chars',
                'Access Role': 'HR Manager',

                // Salary & Bank
                'Basic Salary': '0',
                'Housing Allowance': '0',
                'Transport Allowance': '0',
                'Medical Allowance': '0',
                'Lunch Allowance': '0',
                'Other Allowances': '0',
                'Bank Name': 'Stanbic Bank',
                'Bank Account Number': 'Account Number',
                'Bank Branch': 'Main',
                'Mobile Money Number': '',

                // Statutory & Tax IDs
                'National ID*': 'ADM-1',
                'Passport Number': '',
                'TIN Number': '1234567890',
                'NSSF Number': 'Member ID',

                // Location & Contact
                'Address': 'Kampala',
                'City': 'Kampala',
                'District': 'Kampala',
                'Emergency Contact Name': 'Management',
                'Emergency Contact Phone': '',
                'Emergency Contact Relationship': 'Other',
                'Notes': 'System Administrator Account'
            }
        ];

        const ws = XLSX.utils.json_to_sheet(templateData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Employee Data');

        if (departments.length > 0) {
            const deptData = departments.map(dept => ({
                'Department Name': dept.name,
                'Code': dept.code || ''
            }));
            const deptWs = XLSX.utils.json_to_sheet(deptData);
            XLSX.utils.book_append_sheet(wb, deptWs, 'Available Departments');
        }

        // Set column widths
        ws['!cols'] = [
            // Identity
            { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 10 }, { wch: 15 },
            // Role to Dates
            { wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            // System Access
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            // Salary
            { wch: 15 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 },
            // Bank
            { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
            // Statutory
            { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
            // Contact & Notes
            { wch: 30 }, { wch: 15 }, { wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 30 }
        ];

        XLSX.writeFile(wb, 'lifeline_comprehensive_onboarding.xlsx');
        toast.success('Comprehensive template downloaded! 🚀');
    };

    const parseExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    // Configure XLSX to parse dates and keep raw values for date conversion
                    const workbook = XLSX.read(data, {
                        type: 'array',
                        cellDates: false, // Keep as serial numbers so we can convert them
                        cellNF: false,
                        cellText: false
                    });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, {
                        raw: false, // Get formatted values where possible
                        defval: null // Use null for empty cells
                    });
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    };

    // Helper function to convert Excel date serial number to YYYY-MM-DD format
    const excelDateToISOString = (excelDate) => {
        if (excelDate === null || excelDate === undefined || excelDate === '') return null;

        // If it's already a string in date format, return it
        if (typeof excelDate === 'string') {
            // Check if it's already in YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(excelDate)) {
                return excelDate;
            }
            // Check if it's a string that looks like a number (Excel serial date as string)
            if (/^\d+\.?\d*$/.test(excelDate.trim())) {
                const numValue = parseFloat(excelDate);
                if (!isNaN(numValue) && numValue > 0) {
                    excelDate = numValue; // Convert to number and process below
                } else {
                    return null;
                }
            } else {
                // Try to parse as date string
                const parsed = new Date(excelDate);
                if (!isNaN(parsed.getTime())) {
                    return parsed.toISOString().split('T')[0];
                }
                return null;
            }
        }

        // If it's a number (Excel serial date), convert it
        if (typeof excelDate === 'number' && !isNaN(excelDate) && excelDate > 0) {
            // Excel date serial number conversion
            // Excel epoch: January 1, 1900 (serial number 1)
            // Excel incorrectly treats 1900 as a leap year
            // Serial number 60 = February 29, 1900 (doesn't exist, so we adjust)

            // Convert Excel serial date to JavaScript Date
            // Excel serial 1 = Jan 1, 1900
            // JavaScript Date(1900, 0, 1) = Jan 1, 1900

            const excelEpoch = new Date(1900, 0, 1); // January 1, 1900
            let days = excelDate - 1; // Subtract 1 because Excel serial 1 = Jan 1, 1900

            // Excel's leap year bug: it treats 1900 as a leap year
            // Serial numbers 1-59 are correct (Jan 1 - Feb 28, 1900)
            // Serial number 60 = Feb 29, 1900 (doesn't exist)
            // Serial number 61 = Mar 1, 1900
            // So for dates >= 60, we need to subtract 1 more day
            if (excelDate >= 60) {
                days = excelDate - 2; // Subtract 2 to account for the non-existent Feb 29, 1900
            }

            const jsDate = new Date(excelEpoch.getTime() + days * 24 * 60 * 60 * 1000);

            // Format as YYYY-MM-DD
            const year = jsDate.getFullYear();
            const month = String(jsDate.getMonth() + 1).padStart(2, '0');
            const day = String(jsDate.getDate()).padStart(2, '0');

            return `${year}-${month}-${day}`;
        }

        return null;
    };

    // Helper function to handle Excel scientific notation for phone numbers
    const cleanPhoneNumber = (val) => {
        if (!val) return '';
        const str = String(val).trim();
        // Check if it's in scientific notation (e.g., 2.56782E+11)
        if (str.includes('E+') || str.includes('e+')) {
            const num = Number(str);
            if (!isNaN(num)) {
                return String(BigInt(Math.round(num)));
            }
        }
        return str;
    };

    const mapEmployeeData = (row) => {
        // Clean and trim all string values from the row
        const clean = (val) => (val === null || val === undefined) ? '' : String(val).trim();

        // Flexible key lookup to handle variations (First Name, First Name*, first_name)
        const get = (keys) => {
            for (const key of keys) {
                if (row[key] !== undefined && row[key] !== null) return clean(row[key]);
            }
            return '';
        };

        // Use selected department from UI if provided, otherwise resolve from Excel
        let departmentValue = selectedDepartment
            ? clean(departments.find(d => d.id === parseInt(selectedDepartment))?.name)
            : get(['Department', 'department', 'Dept']);

        const dateOfBirth = excelDateToISOString(get(['Date of Birth', 'date_of_birth', 'DOB', 'Birth Date']));
        const joinDate = excelDateToISOString(get(['Join Date', 'Hire Date', 'join_date', 'hire_date', 'Start Date']));
        const probationEndDate = excelDateToISOString(get(['Probation End Date', 'probation_end_date']));

        // Normalize gender
        let genderValue = get(['Gender', 'gender']) || 'other';
        const genderLower = genderValue.toLowerCase();
        if (genderLower === 'male' || genderLower === 'm') genderValue = 'male';
        else if (genderLower === 'female' || genderLower === 'f') genderValue = 'female';
        else genderValue = 'other';

        // Normalize Employment Type
        let employmentType = get(['Employment Type', 'employment_type']) || 'full_time';
        const etLower = employmentType.toLowerCase().replace(/ /g, '_');
        if (etLower.includes('full')) employmentType = 'full_time';
        else if (etLower.includes('part')) employmentType = 'part_time';
        else if (etLower.includes('contract')) employmentType = 'contract';
        else if (etLower.includes('intern')) employmentType = 'intern';
        else if (etLower.includes('casual')) employmentType = 'casual';
        else employmentType = 'full_time';

        // Normalize Employment Status
        let employmentStatus = get(['Employment Status', 'employment_status']) || 'active';
        const esLower = employmentStatus.toLowerCase();
        if (esLower.includes('active')) employmentStatus = 'active';
        else if (esLower.includes('leave')) employmentStatus = 'on_leave';
        else if (esLower.includes('suspend')) employmentStatus = 'suspended';
        else if (esLower.includes('terminate')) employmentStatus = 'terminated';
        else if (esLower.includes('resign')) employmentStatus = 'resigned';
        else employmentStatus = 'active';

        // Normalize Marital Status
        let maritalStatus = get(['Marital Status', 'marital_status']) || 'single';
        const msLower = maritalStatus.toLowerCase();
        if (msLower.includes('single')) maritalStatus = 'single';
        else if (msLower.includes('marri')) maritalStatus = 'married';
        else if (msLower.includes('divorc')) maritalStatus = 'divorced';
        else if (msLower.includes('widow')) maritalStatus = 'widowed';
        else maritalStatus = 'single';

        // System Access
        const createAccount = get(['Create User Account? (Yes/No)', 'Create User', 'create_user']).toLowerCase().includes('y');
        let accessRole = 'employee';
        const roleInput = get(['Access Role', 'role', 'Position Role']).toLowerCase();
        if (roleInput.includes('hr') || roleInput.includes('admin')) accessRole = 'hr_manager';
        else if (roleInput.includes('manage')) accessRole = 'manager';

        const employeeData = {
            // Identity
            first_name: get(['First Name*', 'First name *', 'First Name', 'first_name']),
            middle_name: get(['Middle Name', 'Middle name', 'middle_name']),
            last_name: get(['Last Name*', 'Last name *', 'Last Name', 'last_name']),
            email: get(['Email*', 'Email address *', 'Email', 'email', 'Email Address']).toLowerCase(), // Always lowercase email
            phone: cleanPhoneNumber(get(['Phone', 'Phone number *', 'phone', 'Telephone', 'Contact'])),
            date_of_birth: dateOfBirth,
            gender: genderValue,
            marital_status: maritalStatus,

            // Employment
            job_title: get(['Job Title', "What's their job title? *", 'job_title', 'Designation', 'Position']) || 'Employee',
            department: departmentValue,
            manager_email: get(['Manager Email', 'Who do they report to?', 'manager_email']),
            employment_type: employmentType,
            employment_status: employmentStatus,
            join_date: joinDate || new Date().toISOString().split('T')[0],
            probation_end_date: probationEndDate,

            // System Access
            create_user: createAccount,

            // Statutory
            national_id: get(['National ID*', 'National ID Number (NIN) *', 'National ID', 'national_id', 'NIN']),
            passport_number: get(['Passport Number', 'passport_number']),
            tin_number: get(['TIN Number', 'tin_number', 'TIN']),
            nssf_number: get(['NSSF Number', 'nssf_number', 'NSSF']),

            // Finance
            bank_name: get(['Bank Name', 'bank_name', 'Bank']),
            bank_account_number: get(['Bank Account Number', 'Account Number', 'bank_account_number']),
            bank_branch: get(['Bank Branch', 'bank_branch']),
            mobile_money_number: cleanPhoneNumber(get(['Mobile Money Number', 'mobile_money_number', 'Momo'])),

            // Contact
            address: get(['Address', 'Street address', 'address']),
            city: get(['City', 'city']),
            district: get(['District', 'district']),
            emergency_contact_name: get(['Emergency Contact Name', 'Contact Name', 'emergency_contact_name']),
            emergency_contact_phone: cleanPhoneNumber(get(['Emergency Contact Phone', 'Phone Number', 'emergency_contact_phone'])),
            emergency_contact_relationship: get(['Emergency Contact Relationship', 'Relationship', 'emergency_contact_relationship']),
            notes: get(['Notes', 'Additional Notes', 'notes', 'Internal use only']),

            // Salary
            basic_salary: parseFloat(get(['Basic Salary', 'basic_salary', 'Salary', 'What is their basic monthly salary? *'])) || 0,
            housing_allowance: parseFloat(get(['Housing Allowance', 'housing_allowance', 'Housing'])) || 0,
            transport_allowance: parseFloat(get(['Transport Allowance', 'transport_allowance', 'Transport'])) || 0,
            medical_allowance: parseFloat(get(['Medical Allowance', 'medical_allowance', 'Medical'])) || 0,
            lunch_allowance: parseFloat(get(['Lunch Allowance', 'lunch_allowance', 'Lunch'])) || 0,
            other_allowances: parseFloat(get(['Other Allowances', 'other_allowances', 'Other'])) || 0
        };

        // Only include user fields if create_user is true
        if (createAccount) {
            employeeData.username = get(['Username', 'username', 'Username (for login) *']);
            employeeData.password = get(['Password', 'password', 'Custom Password *']);
            employeeData.role = accessRole;
        }

        return employeeData;
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

            // Duplicate detection logic: only flag subsequent occurrences
            const seenInBatch = new Set();

            for (let i = 0; i < data.length; i++) {
                const row = data[i];
                const employeeData = mapEmployeeData(row);
                const validationErrors = validateEmployee(employeeData);

                // Check for batch duplicates correctly
                if (employeeData.email) {
                    if (seenInBatch.has(employeeData.email)) {
                        validationErrors.push('Duplicate email later in same file');
                    }
                    seenInBatch.add(employeeData.email);
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
                    // Handle Manager Email Lookup
                    if (employeeData.manager_email) {
                        const manager = allEmployees.find(e => e.email?.toLowerCase() === employeeData.manager_email.toLowerCase());
                        if (manager) {
                            employeeData.manager = manager.id;
                        }
                    }

                    const res = await createEmployee(employeeData).unwrap();

                    // Create Salary Structure if basic_salary is provided
                    if (employeeData.basic_salary > 0) {
                        await createSalaryStructure({
                            employee: res.id,
                            basic_salary: employeeData.basic_salary,
                            housing_allowance: employeeData.housing_allowance || 0,
                            transport_allowance: employeeData.transport_allowance || 0,
                            medical_allowance: employeeData.medical_allowance || 0,
                            lunch_allowance: employeeData.lunch_allowance || 0,
                            other_allowances: employeeData.other_allowances || 0,
                            effective_date: employeeData.join_date || new Date().toISOString().split('T')[0]
                        }).unwrap();
                    }

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
                                    Import Team
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
