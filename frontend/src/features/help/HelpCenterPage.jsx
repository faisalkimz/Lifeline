import React, { useState } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
    Search, HelpCircle, BookOpen, MessageCircle, FileText,
    ChevronDown, ChevronRight, Mail, Phone, ExternalLink, Rocket
} from 'lucide-react';
import { cn } from '../../utils/cn';

const FAQItem = ({ question, answer }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-100 last:border-0">
            <button
                className="w-full py-4 flex items-center justify-between text-left group"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={cn("font-medium transition-colors", isOpen ? "text-primary-600" : "text-gray-900 group-hover:text-primary-600")}>
                    {question}
                </span>
                {isOpen ? (
                    <ChevronDown className="h-5 w-5 text-primary-500" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-primary-400" />
                )}
            </button>
            <div
                className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "max-h-96 opacity-100 pb-4" : "max-h-0 opacity-0"
                )}
            >
                <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
            </div>
        </div>
    );
};

const HelpCategory = ({ icon: Icon, title, description, articles }) => (
    <Card className="hover:shadow-md transition-shadow group cursor-pointer border-gray-200">
        <CardContent className="p-6">
            <div className="h-10 w-10 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:scale-110 transition-transform">
                <Icon className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4 h-10">{description}</p>
            <ul className="space-y-2">
                {articles.map((article, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors">
                        <FileText className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        {article}
                    </li>
                ))}
            </ul>
        </CardContent>
    </Card>
);

const HelpCenterPage = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const categories = [
        {
            icon: Rocket,
            title: "Getting Started",
            description: "New to Lifeline? Learn the basics of setting up your account and workspace.",
            articles: ["Quick Start Guide", "Setting up your profile", "Inviting team members"]
        },
        {
            icon: BookOpen,
            title: "Payroll & Finance",
            description: "Understand how to manage payroll runs, payslips, and tax configurations.",
            articles: ["Running your first payroll", "Understanding tax deductions", "Generating reports"]
        },
        {
            icon: MessageCircle,
            title: "Recruitment",
            description: "Learn how to post jobs, manage candidates, and schedule interviews.",
            articles: ["Posting a job", "Managing the pipeline", "Scheduling interviews"]
        }
    ];

    const faqs = [
        {
            question: "How do I reset my password?",
            answer: "To reset your password, go to the login page and click on 'Forgot Password'. Follow the instructions sent to your email to create a new password."
        },
        {
            question: "Can I edit an employee's contract after creation?",
            answer: "Yes, navigate to the Employee's profile, go to the 'Documents' or 'Contract' tab, and click 'Edit'. Ensure you have the necessary Admin permissions."
        },
        {
            question: "How is overtime calculated?",
            answer: "Overtime is calculated based on the rules defined in 'Company Settings > Payroll Configuration'. Common methods include 1.5x hourly rate for hours worked beyond 40 hours/week."
        },
        {
            question: "Is my data secure?",
            answer: "Yes, Lifeline uses enterprise-grade encryption for all data at rest and in transit. We perform regular security audits to ensure your information is safe."
        }
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-fade-in">
            {/* Hero Section */}
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
                <div className="inline-flex items-center justify-center p-2 bg-primary-50 rounded-full mb-6">
                    <span className="bg-white px-3 py-1 rounded-full text-xs font-bold text-primary-700 shadow-sm">Support</span>
                    <span className="px-3 text-xs font-medium text-primary-700">How can we help you?</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Help Center</h1>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                    Browse our guides, find answers to common questions, or contact our support team.
                </p>

                <div className="max-w-xl mx-auto relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        className="h-12 pl-12 text-lg shadow-lg shadow-gray-100 border-gray-200 focus:ring-4 focus:ring-primary-500/20 rounded-xl"
                        placeholder="Search for answers..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Categories Grid */}
            <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Browse by Topic</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {categories.map((cat, i) => (
                        <HelpCategory key={i} {...cat} />
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <Card className="border-gray-200">
                        <CardContent className="p-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
                            <div className="space-y-1">
                                {faqs.map((faq, i) => (
                                    <FAQItem key={i} {...faq} />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Contact Card */}
                <div>
                    <Card className="bg-primary-600 text-white border-primary-600 h-full">
                        <CardContent className="p-8 flex flex-col items-center text-center h-full">
                            <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                <HelpCircle className="h-7 w-7 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">Still need help?</h3>
                            <p className="text-primary-100 mb-8 leading-relaxed">
                                Our support team is available 24/7 to assist you with any issues.
                            </p>

                            <div className="space-y-3 w-full">
                                <Button variant="secondary" className="w-full bg-white text-primary-700 hover:bg-gray-50 border-0 shadow-lg shadow-primary-900/10 font-bold">
                                    <MessageCircle className="h-4 w-4 mr-2" /> Start Live Chat
                                </Button>
                                <Button variant="ghost" className="w-full text-white hover:bg-white/10 hover:text-white border border-white/20">
                                    <Mail className="h-4 w-4 mr-2" /> Email Support
                                </Button>
                            </div>

                            <div className="mt-auto pt-8 flex items-center gap-2 text-sm text-primary-200">
                                <Phone className="h-4 w-4" />
                                <span>+1 (555) 123-4567</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default HelpCenterPage;
