import React from 'react';
import { useGetDocumentsQuery } from '../../store/api';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Download, Upload } from 'lucide-react';

const DocumentsPage = () => {
    const { data: documents, isLoading } = useGetDocumentsQuery();

    return (
        <div className="space-y-6 pb-10">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Document Center</h1>
                    <p className="text-slate-500 mt-1">Access company policies and personal files.</p>
                </div>
                <Button className="gap-2 bg-primary-600 hover:bg-primary-700 shadow-sm">
                    <Upload className="h-4 w-4" /> Upload Document
                </Button>
            </div>

            {isLoading ? (
                <div>Loading documents...</div>
            ) : !documents?.length ? (
                <Card className="border-dashed">
                    <CardContent className="py-10 text-center text-gray-500">
                        No documents available.
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-3">
                    {documents.map(doc => (
                        <Card key={doc.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-6 flex flex-col items-center text-center">
                                <div className="p-4 bg-gray-100 rounded-full mb-4 text-gray-500">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{doc.title}</h3>
                                <span className="text-xs uppercase font-bold tracking-wide text-gray-500 bg-gray-100 px-2 py-0.5 rounded mb-4">
                                    {doc.category}
                                </span>
                                <Button variant="outline" size="sm" className="w-full gap-2 mt-auto">
                                    <Download className="h-4 w-4" /> Download
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DocumentsPage;
