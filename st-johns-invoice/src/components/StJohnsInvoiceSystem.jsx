import React, { useState, useRef } from 'react';
import { Download, Printer, Plus, Trash2, User, Phone, IndianRupee, Calendar, FileText, CheckCircle, Building, Menu, X } from 'lucide-react';
import Logo from '../Images/logo.png';
const StJohnsInvoiceSystem = () => {
  const [invoiceData, setInvoiceData] = useState({
    studentName: '',
    roomNo: '',
    address: '',
    phoneNo: '',
    invoiceNo: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    items: [
      { description: 'Caution Deposit', amount: 0 },
      { description: 'Hostel Fee', amount: 0 }
    ],
    paymentMethod: 'Cash',
    notes: '' 
  });

  const [activeTab, setActiveTab] = useState('form');
  const printRef = useRef();

  const handleInputChange = (field, value) => {
    setInvoiceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...invoiceData.items];
    newItems[index][field] = field === 'amount' ? parseFloat(value) || 0 : value;
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setInvoiceData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', amount: 0 }]
    }));
  };

  const removeItem = (index) => {
    const newItems = invoiceData.items.filter((_, i) => i !== index);
    setInvoiceData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const calculateTotal = () => {
    return invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
  };

  const downloadPDF = async () => {
    const element = printRef.current;
    
    const opt = {
      margin: 0.5,
      filename: `Invoice_${invoiceData.invoiceNo}_${invoiceData.studentName.replace(/\s+/g, '_') || 'Student'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        ignoreElements: function(element) {
          return element.getAttribute('data-html2canvas-ignore') === 'true';
        }
      },
      jsPDF: { 
        unit: 'in', 
        format: 'letter', 
        orientation: 'portrait' 
      }
    };

    try {
      const html2pdf = await import('html2pdf.js');
      await html2pdf.default().set(opt).from(element).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF generation failed. Please try the print option instead.');
    }
  };

  const printInvoice = () => {
  try {
    if (!printRef.current) {
      console.error('Print reference not found');
      return;
    }

    const invoiceHTML = printRef.current.innerHTML;
    const baseHref = document.baseURI || window.location.origin + '/';
    
    // Create and open print window
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      alert('Popup blocked. Please allow popups for this site.');
      return;
    }

    // Ensure the window has focus
    printWindow.focus();

    // Get all styles
    let allStyles = '';
    
    // Get inline styles
    const styleTags = document.querySelectorAll('style');
    styleTags.forEach(tag => {
      allStyles += tag.innerHTML + '\n';
    });

    // Get external stylesheets
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        if (sheet.cssRules) {
          Array.from(sheet.cssRules).forEach(rule => {
            allStyles += rule.cssText + '\n';
          });
        }
      } catch (e) {
        console.warn('Stylesheet load error:', e);
      }
    });

    // Write the HTML content
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <base href="${baseHref}">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Print Invoice</title>
        <style>
          ${allStyles}
          @media print {
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
              background: white !important;
              font-family: sans-serif;
              margin: 0;
              padding: 20px;
            }
            img {
              max-width: 100%;
              height: auto;
              display: block;
            }
            .no-print {
              display: none !important;
            }
          }
          @media screen {
            body {
              font-family: sans-serif;
              padding: 20px;
              background: white;
            }
          }
        </style>
      </head>
      <body>
        ${invoiceHTML}
        <script>
          let printAttempted = false;
          
          function triggerPrint() {
            if (printAttempted) return;
            printAttempted = true;
            
            // Focus the window again before printing
            window.focus();
            
            // Trigger print
            setTimeout(() => {
              window.print();
              
              // Handle after print events
              const handleAfterPrint = () => {
                setTimeout(() => {
                  window.close();
                }, 100);
              };
              
              // Multiple event handlers for better compatibility
              window.onafterprint = handleAfterPrint;
              window.addEventListener('afterprint', handleAfterPrint);
              
              // Fallback: close after delay if print dialog was cancelled
              setTimeout(() => {
                if (!window.closed) {
                  const shouldClose = confirm('Close this print preview window?');
                  if (shouldClose) {
                    window.close();
                  }
                }
              }, 10000); // 10 second fallback
            }, 500); // Increased delay for better reliability
          }
          
          function waitForImagesAndPrint() {
            const images = document.querySelectorAll('img');
            let loadedImages = 0;
            const totalImages = images.length;
            
            if (totalImages === 0) {
              triggerPrint();
              return;
            }
            
            const checkAllLoaded = () => {
              loadedImages++;
              if (loadedImages >= totalImages) {
                triggerPrint();
              }
            };
            
            // Set up image load listeners
            images.forEach(img => {
              if (img.complete) {
                checkAllLoaded();
              } else {
                img.addEventListener('load', checkAllLoaded, { once: true });
                img.addEventListener('error', checkAllLoaded, { once: true });
              }
            });
            
            // Fallback timeout in case images take too long
            setTimeout(triggerPrint, 3000);
          }
          
          // Start the process when DOM is ready
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', waitForImagesAndPrint);
          } else {
            waitForImagesAndPrint();
          }
          
          // Additional fallback
          window.addEventListener('load', () => {
            setTimeout(() => {
              if (!printAttempted) {
                triggerPrint();
              }
            }, 1000);
          });
        </script>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    
  } catch (error) {
    console.error('Print failed:', error);
    alert('Error while printing invoice: ' + error.message);
  }
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2 sm:mb-4">
            <img
              src={Logo}
              alt="Hostel Logo"
              className="w-20 h-20 sm:w-10 sm:h-10 lg:w-20 lg:h-20 object-contain"
            />
            <h1 className="text-xl text-green-800 sm:text-2xl lg:text-4xl font-bold">
              St. Johns Boys Hostel
            </h1>
          </div>
          <p className="text-center text-black text-sm sm:text-base lg:text-lg">
            Professional Invoice Management System
          </p>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="lg:hidden bg-white border-b border-gray-200" data-html2canvas-ignore="true">
          <div className="flex">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'form' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FileText className="w-4 h-4 mx-auto mb-1" />
              Invoice Form
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-3 px-4 text-sm font-medium text-center transition-colors ${
                activeTab === 'preview' 
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle className="w-4 h-4 mx-auto mb-1" />
              Preview
            </button>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Form Section */}
          <div className={`${activeTab === 'form' ? 'block' : 'hidden'} lg:block p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6`} data-html2canvas-ignore="true">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <FileText className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-600" />
              Invoice Details
            </h2>
            
            {/* Student Information */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 sm:p-6 rounded-xl border border-blue-200">
              <h3 className="text-base sm:text-lg font-semibold text-blue-800 mb-3 sm:mb-4 flex items-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Student Information
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Name</label>
                  <input
                    type="text"
                    value={invoiceData.studentName}
                    onChange={(e) => handleInputChange('studentName', e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    placeholder="Enter student name"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
                    <input
                      type="text"
                      value={invoiceData.roomNo}
                      onChange={(e) => handleInputChange('roomNo', e.target.value)}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                      placeholder="e.g., 101, A-12"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={invoiceData.phoneNo}
                      onChange={(e) => handleInputChange('phoneNo', e.target.value)}
                      className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Student Address</label>
                  <textarea
                    value={invoiceData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                    rows="3"
                    placeholder="Enter complete address"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Information */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 sm:p-6 rounded-xl border border-green-200">
              <h3 className="text-base sm:text-lg font-semibold text-green-800 mb-3 sm:mb-4 flex items-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Invoice Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceData.invoiceNo}
                    onChange={(e) => handleInputChange('invoiceNo', e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Invoice Date</label>
                  <input
                    type="date"
                    value={invoiceData.date}
                    onChange={(e) => handleInputChange('date', e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                  <select
                    value={invoiceData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-base"
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Payment Items */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 sm:p-6 rounded-xl border border-yellow-200">
              <h3 className="text-base sm:text-lg font-semibold text-yellow-800 mb-3 sm:mb-4 flex items-center">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Payment Details
              </h3>
              <div className="space-y-3">
                {invoiceData.items.map((item, index) => (
                  <div key={index} className="bg-white p-3 sm:p-4 rounded-lg space-y-3 sm:space-y-0 sm:flex sm:gap-3 sm:items-center">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      className="w-full sm:flex-1 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                      placeholder="Payment description"
                    />
                    <div className="flex gap-2 sm:gap-3">
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', e.target.value)}
                        className="flex-1 sm:w-32 p-2 sm:p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-base"
                        placeholder="Amount"
                      />
                      <button
                        onClick={() => removeItem(index)}
                        className="p-2 sm:p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={addItem}
                className="mt-4 flex items-center text-yellow-700 hover:text-yellow-800 font-medium transition-colors p-2 hover:bg-yellow-50 rounded-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Item
              </button>
              <div className="mt-4 p-3 sm:p-4 bg-white rounded-lg border-2 border-yellow-300">
                <div className="text-right text-xl sm:text-2xl font-bold text-gray-800">
                  Total: ₹{calculateTotal().toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
              <textarea
                value={invoiceData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full p-3 sm:p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-base"
                rows="3"
                placeholder="Any additional notes or comments..."
              />
            </div>

            {/* Mobile Action Buttons */}
            <div className="lg:hidden space-y-3" data-html2canvas-ignore="true">
              <button
                onClick={() => setActiveTab('preview')}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg flex items-center justify-center text-base"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                View Preview
              </button>
            </div>
          </div>

          {/* Preview Section */}
          <div className={`${activeTab === 'preview' ? 'block' : 'hidden'} lg:block p-4 sm:p-6 lg:p-8`}>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center" data-html2canvas-ignore="true">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-green-600" />
              Invoice Preview
            </h2>
            
            {/* Preview Card */}
            <div ref={printRef} className="bg-white p-4 sm:p-6 lg:p-8 rounded-xl shadow-lg mb-4 sm:mb-6">
              <div className="text-center mb-4 sm:mb-6">
                <div className="bg-white pt-[5px] px-4 pb-4 sm:px-6 rounded-lg mb-4">
                  <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-2">
                    <img
                      src={Logo}
                      alt="Hostel Logo"
                      className="w-10 h-10 sm:w-10 sm:h-10 lg:w-20 lg:h-20 object-contain"
                    />
                    <h1 className="text-lg text-green-800 sm:text-xl lg:text-2xl font-bold">
                      St. Johns Boys Hostel
                    </h1>
                  </div>
                  <p className="text-black-100 text-sm ">Bangalore, Karnataka</p>
                  <p className="text-black-100 text-xs sm:text-sm">Email: stjohnshostel25@gmail.com</p>
                  <p className="text-black-100 text-xs sm:text-sm">Phone: +91 90743 70798 | +91 70901 83651</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6 text-sm">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border-l-1 border-blue-500">
                  <h4 className="font-semibold text-blue-800 mb-2 sm:mb-3">Bill To:</h4>
                  <p className="mb-1"><strong>Student:</strong> {invoiceData.studentName || 'Not specified'}</p>
                  <p className="mb-1"><strong>Room:</strong> {invoiceData.roomNo || 'Not specified'}</p>
                  <p className="mb-1"><strong>Phone:</strong> {invoiceData.phoneNo || 'Not specified'}</p>
                  <p className="text-xs sm:text-sm break-words"><strong>Address:</strong> {invoiceData.address || 'Not specified'}</p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border-l-1 border-green-500">
                  <h4 className="font-semibold text-green-800 mb-2 sm:mb-3">Invoice Details:</h4>
                  <p className="mb-1"><strong>Invoice No:</strong> {invoiceData.invoiceNo}</p>
                  <p className="mb-1"><strong>Date:</strong> {new Date(invoiceData.date).toLocaleDateString('en-IN')}</p>
                  <p className="mb-1"><strong>Payment:</strong> {invoiceData.paymentMethod}</p>
                  <p className="text-xs sm:text-sm"><strong>Generated:</strong> {new Date().toLocaleDateString('en-IN')}</p>
                </div>
              </div>

              <div className="mb-4 sm:mb-6 overflow-x-auto">
                <table className="w-full text-sm border-collapse min-w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left py-2 sm:py-3 px-2 sm:px-4 border-b-2 border-gray-200 font-bold text-gray-700">Description</th>
                      <th className="text-right py-2 sm:py-3 px-2 sm:px-4 border-b-2 border-gray-200 font-bold text-gray-700">Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="py-2 sm:py-3 px-2 sm:px-4 break-words">{item.description || 'Not specified'}</td>
                        <td className="text-right py-2 sm:py-3 px-2 sm:px-4 font-medium">₹{item.amount.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-right mb-4 sm:mb-6 bg-gray-50 p-3 sm:p-4 rounded-lg">
                <div className="text-lg sm:text-xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Total Amount: ₹{calculateTotal().toLocaleString('en-IN')}
                </div>
                <div className="text-base sm:text-lg font-semibold text-green-600">
                  Amount Paid: ₹{calculateTotal().toLocaleString('en-IN')}
                </div>
              </div>

              {invoiceData.notes && (
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg sm:mb-6">
                  <h4 className="font-semibold text-yellow-800">Notes:</h4>
                  <p className="text-sm text-gray-700 break-words">{invoiceData.notes}</p>
                </div>
              )}

              {/* Verified Seal */}
              <div className="flex justify-center mt-6 sm:mt-8">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-lg sm:text-2xl text-green-600 mb-1"></div>
                    <div className="text-xs font-bold text-green-600">VERIFIED ✓</div>
                    <div className="text-xs font-semibold text-green-800">ST. JOHNS</div>
                    <div className="text-xs font-semibold text-green-800">BOYS HOSTEL</div>
                  </div>
                </div>
              </div>

              <div className="text-center mt-6 sm:mt-8 text-gray-600 text-xs sm:text-sm">
                <p>This is a computer-generated invoice.</p>
                <p className="mt-1">Thank you for choosing St. Johns Boys Hostel!</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 sm:space-y-0 sm:flex sm:gap-4" data-html2canvas-ignore="true">
              <button
                onClick={downloadPDF}
                className="w-full sm:flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg flex items-center justify-center text-base"
              >
                <Download className="w-5 h-5 mr-2" />
                Download PDF
              </button>
              <button
                onClick={printInvoice}
                className="w-full sm:flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white py-4 px-6 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition-all shadow-lg flex items-center justify-center text-base"
              >
                <Printer className="w-5 h-5 mr-2" />
                Print Invoice
              </button>
            </div>

            {/* Mobile Navigation Back Button */}
            <div className="lg:hidden mt-4" data-html2canvas-ignore="true">
              <button
                onClick={() => setActiveTab('form')}
                className="w-full bg-gray-500 text-white py-3 px-6 rounded-lg font-medium transition-all flex items-center justify-center text-base"
              >
                Back to Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StJohnsInvoiceSystem;