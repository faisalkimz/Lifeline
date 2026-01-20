import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Check, X, Shield } from 'lucide-react';

const SignaturePad = ({ onSave, onCancel }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isEmpty, setIsEmpty] = useState(true);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.strokeStyle = '#2563eb'; // primary-600
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Handle transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, []);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
        setIsEmpty(false);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
        const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

        const ctx = canvas.getContext('2d');
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clear = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setIsEmpty(true);
    };

    const handleSave = () => {
        if (isEmpty) return;
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary-600" />
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Legal <span className="text-primary-600">e-Signature</span></h3>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <X className="h-5 w-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-8 space-y-6">
                    <p className="text-sm text-slate-500 font-medium italic">Please use your mouse or touch screen to sign inside the box below:</p>

                    <div className="relative group">
                        <canvas
                            ref={canvasRef}
                            width={500}
                            height={250}
                            onMouseDown={startDrawing}
                            onMouseMove={draw}
                            onMouseUp={stopDrawing}
                            onMouseOut={stopDrawing}
                            onTouchStart={startDrawing}
                            onTouchMove={draw}
                            onTouchEnd={stopDrawing}
                            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl cursor-crosshair shadow-inner"
                        />
                        <button
                            onClick={clear}
                            className="absolute top-4 right-4 p-3 bg-white dark:bg-slate-700 shadow-lg rounded-xl text-slate-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            title="Clear"
                        >
                            <Eraser className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-2xl text-[11px] text-primary-700 dark:text-primary-300 font-medium">
                        <Shield className="h-4 w-4 shrink-0" />
                        <p>I understand that this digital signature is as legally binding as a handwritten signature under the Electronic Transactions Act.</p>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={onCancel} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-2xl hover:bg-slate-200 transition-all">
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isEmpty}
                            className="flex-1 py-4 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 shadow-lg shadow-primary-600/20 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                        >
                            Confirm Signature
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignaturePad;
