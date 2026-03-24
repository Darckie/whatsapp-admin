import { on } from 'events';
import { url } from 'inspector';
import React, { useState, useEffect } from 'react';
import {
  BsTypeBold, BsTypeItalic, BsTypeStrikethrough, BsPlus, BsArrowLeft,
  BsImage, BsFileText, BsCameraVideo, BsTrash, BsUpload
} from 'react-icons/bs';
import api from "../../../lib/api";
import { useNavigate } from "react-router-dom";

export interface TemplateData {
  name: string;
  language: string;
  category: string;
  body_text: string;
  header?: { format: string; text?: string; example?: string };
  footer?: string | { text: string };
  buttons: Array<{ type: string; text: string; url?: string; phoneNumber?: string; id?: number; example?: string }>;
  placeholders?: string[];
  is_enabled?: boolean;
  raw?: any;
  is_system_template?: boolean;
}

interface CreateTemplateProps {
  templateDetails?: TemplateData;
  onClose?: () => void;
}

export default function CreateTemplate({
  templateDetails,
  onClose
}: CreateTemplateProps) {
  const [mode, setMode] = useState<'system' | 'whatsapp'>('whatsapp');
  const [templateName, setTemplateName] = useState('');
  const [category, setCategory] = useState('MARKETING');
  const [language, setLanguage] = useState('en_IN');
  const [headerType, setHeaderType] = useState('None');
  const [headerText, setHeaderText] = useState('');
  const [headerMediaFile, setHeaderMediaFile] = useState<File | null>(null);
  const [headerMediaPreview, setHeaderMediaPreview] = useState<string>('');
  const [bodyText, setBodyText] = useState('');
  const [bodyExamples, setBodyExamples] = useState<string[]>([]);
  const [footerText, setFooterText] = useState('');
  const [buttons, setButtons] = useState<Array<any>>([]);
  const [showButtonMenu, setShowButtonMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Populate form when templateDetails provided (Edit mode)

  const navigate = useNavigate();
  const baseUrl = process.env.REACT_APP_API_URL || '';
  useEffect(() => {

    if (templateDetails) {
      setMode(templateDetails.is_system_template ? 'system' : 'whatsapp');
      setTemplateName(templateDetails.name || '');
      setLanguage(templateDetails.language || 'en');
      setCategory(templateDetails.category || 'MARKETING');
      setBodyText(templateDetails.body_text || '');

      // Handle footer - it may come as string or object - ensure it's always a string
      let footerValue = '';
      if (templateDetails.footer) {
        if (typeof templateDetails.footer === 'string') {
          footerValue = templateDetails.footer;
        } else if (typeof templateDetails.footer === 'object' && templateDetails.footer.text) {
          footerValue = templateDetails.footer.text;
        }
      }
      setFooterText(footerValue);

      // Handle header
      if (templateDetails.header && templateDetails.header.format) {
        // Normalize format name (API might send uppercase like "IMAGE", "TEXT")
        const formatMap: Record<string, string> = {
          "TEXT": "Text",
          "IMAGE": "Image",
          "VIDEO": "Video",
          "DOCUMENT": "Document"
        };
        const format = formatMap[templateDetails.header.format] || templateDetails.header.format;
        setHeaderType(format);
        setHeaderText(templateDetails.header.text || '');
      } else {
        setHeaderType('None');
        setHeaderText('');
      }

      // Handle buttons - ensure each button has an id
      const processedButtons = Array.isArray(templateDetails.buttons)
        ? templateDetails.buttons.map((btn: any, idx: number) => ({
          type: btn.type || 'QUICK_REPLY',
          text: btn.text || '',
          url: btn.url || '',
          phoneNumber: btn.phoneNumber || '',
          example: btn.example || '',
          id: btn.id || (Date.now() + idx)
        }))
        : [];
      setButtons(processedButtons);
      console.log(templateDetails)
    } else {
      resetForm();
    }
  }, [templateDetails]);

  const resetForm = () => {
    setTemplateName('');
    setCategory('MARKETING');
    setLanguage('en_IN');
    setHeaderType('None');
    setHeaderText('');
    setHeaderMediaFile(null);
    setHeaderMediaPreview('');
    setBodyText('');
    setBodyExamples([]);
    setFooterText('');
    setButtons([]);
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type based on header type
    const validTypes: Record<string, string[]> = {
      'Image': ['image/jpeg', 'image/png', 'image/jpg'],
      'Video': ['video/mp4', 'video/3gpp'],
      'Document': ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    };

    if (headerType !== 'None' && headerType !== 'Text') {
      const allowedTypes = validTypes[headerType] || [];
      if (!allowedTypes.includes(file.type)) {
        setError(`Invalid file type. Please upload a valid ${headerType.toLowerCase()} file.`);
        return;
      }
    }

    // Check file size (max 5MB for images, 16MB for videos, 100MB for documents)
    const maxSizes: Record<string, number> = {
      'Image': 5 * 1024 * 1024,
      'Video': 16 * 1024 * 1024,
      'Document': 100 * 1024 * 1024
    };

    const maxSize = maxSizes[headerType] || 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`);
      return;
    }

    setHeaderMediaFile(file);
    setError('');

    // Create preview for images
    if (headerType === 'Image') {
      const reader = new FileReader();
      reader.onloadend = () => {
        setHeaderMediaPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setHeaderMediaPreview(file.name);
    }
  };

  const handleAddButton = (type: string) => {
    if (buttons.length >= 3) {
      alert('Maximum 3 buttons allowed');
      return;
    }
    setButtons([...buttons, {
      id: Date.now(),
      type,
      text: '',
      url: '',
      phoneNumber: '',
      example: ''
    }]);
    setShowButtonMenu(false);
  };

  const updateButton = (id: number, field: string, value: string) => {
    setButtons(buttons.map(btn =>
      btn.id === id ? { ...btn, [field]: value } : btn
    ));
  };

  const handleRemoveButton = (id: number) => {
    setButtons(buttons.filter(btn => btn.id !== id));
  };

  const addVariable = () => {
    const varCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length + 1;
    setBodyText(bodyText + ` {{${varCount}}}`);
  };

  const formatText = (format: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = bodyText.substring(start, end);

    if (!selectedText) return;

    let formatted = '';
    switch (format) {
      case 'bold':
        formatted = `*${selectedText}*`;
        break;
      case 'italic':
        formatted = `_${selectedText}_`;
        break;
      case 'strikethrough':
        formatted = `~${selectedText}~`;
        break;
    }

    const newText = bodyText.substring(0, start) + formatted + bodyText.substring(end);
    setBodyText(newText);
  };

  const buildInfobipPayload = () => {
    const structure: any = {
      body: {
        text: bodyText,
      }
    };

    // Extract examples for placeholders
    const placeholderCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;
    if (placeholderCount > 0 && bodyExamples.length > 0) {
      structure.body.examples = bodyExamples.slice(0, placeholderCount);
    }

    // Header
    if (headerType === 'Text' && headerText) {
      structure.header = {
        format: 'TEXT',
        text: headerText
      };
    } else if (headerType !== 'None' && headerType !== 'Text' && headerMediaFile) {
      structure.header = {
        format: headerType.toUpperCase(),
        example: headerMediaFile.name // Will be replaced with actual URL after upload
      };
    }

    // Footer
    if (footerText) {
      structure.footer = {
        text: footerText
      };
    }

    // Buttons
    if (buttons.length > 0) {
      structure.buttons = buttons.map(btn => {
        const btnData: any = {
          type: btn.type,
          text: btn.text
        };

        if (btn.type === 'PHONE_NUMBER') {
          btnData.phoneNumber = btn.phoneNumber;
        }
        if (btn.type === 'URL') {
          btnData.url = btn.url;
          if (btn.example) {
            btnData.example = btn.example;
          }
        }

        return btnData;
      });
    }

    return {
      name: templateName,
      language,
      category,
      structure
    };
  };

  const handleSaveSystemTemplate = async () => {
    try {
      const formData = new FormData();
      // Append basic fields
      formData.append('name', templateName);
      formData.append('language', language);
      formData.append('category', category);
      formData.append('body_text', bodyText);
      formData.append('footer_text', footerText || '');
      formData.append('is_enabled', 'Y');
      formData.append('is_system_template', 'Y');
      formData.append('provider', 'custom');

      // Append header data
      if (headerType === 'Text' && headerText) {
        formData.append('header_text', headerText);
      } else if (headerType !== 'None' && headerType !== 'Text' && headerMediaFile) {
        formData.append('header_media_type', headerType.toUpperCase());
        formData.append('header_media', headerMediaFile);
      }

      // Append buttons and variables as JSON strings
      formData.append('buttons_json', JSON.stringify(buttons));
      formData.append('variables_json', JSON.stringify(
        (bodyText.match(/\{\{\d+\}\}/g) || []).map((_, i) => `variable_${i + 1}`)
      ));

      const response = await api.post('chat/admin/create-template', formData);


      const result = response.data;

      if (result.success) {
        alert('System template saved successfully!');
        onclose ? onClose() : navigate('/admin/managetemplate');

      } else {
        setError(result.error || 'Failed to save template');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    }
  };

  const handleSubmitWhatsAppTemplate = async () => {
    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      const payload = buildInfobipPayload();

      // Append the JSON payload as a string
      formData.append('payload', JSON.stringify(payload));

      // Append media file if present
      if (headerMediaFile && headerType !== 'None' && headerType !== 'Text') {
        formData.append('media', headerMediaFile);
      }


      const response = await api.post('chat/admin/create-template', formData);
      const result = response.data;
      if (result.success) {

        alert('System template saved successfully!');
        onclose ? onClose() : navigate('/admin/managetemplate');
      } else {
        setError(result.error || 'Failed to submit template');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (mode === 'system') {
      await handleSaveSystemTemplate();
    } else {
      // Save to DB as draft without submitting to WhatsApp
      await handleSaveSystemTemplate();
    }
  };

  const handleSubmit = async () => {
    if (!templateName || !bodyText) {
      setError('Template name and body text are required');
      return;
    }

    if (mode === 'system') {
      await handleSaveSystemTemplate();
    } else {
      await handleSubmitWhatsAppTemplate();
    }
  };

  const placeholderCount = (bodyText.match(/\{\{\d+\}\}/g) || []).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {

        templateDetails && (
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-sm font-medium text-red-900 hover:text-teal-600 mb-4"
          >
            <BsArrowLeft />
            Back
          </button>
        )
      }

      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Section - Form */}
          <div className="lg:col-span-2">
            <div className="rounded-md bg-white p-6 shadow-sm">
              {/* Error Message */}
              {error && (
                <div className="mb-4 rounded bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Mode Selector */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Template Type
                </label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="whatsapp"
                      checked={mode === 'whatsapp'}
                      onChange={() => setMode('whatsapp')}
                      className="text-teal-600 focus:ring-teal-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      WhatsApp Template (Infobip Approval)
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="mode"
                      value="system"
                      checked={mode === 'system'}
                      onChange={() => setMode('system')}
                      className="text-teal-600 focus:ring-teal-400"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      System Template (Internal Use)
                    </span>
                  </label>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {mode === 'whatsapp'
                    ? 'Requires WhatsApp approval. Will be submitted to Infobip for review.'
                    : 'For internal use only. Can be used immediately without approval.'}
                </p>
              </div>

              {/* Template Name, Category, Language */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                    placeholder="my_template_name"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  >
                    <option value="MARKETING">Marketing</option>
                    <option value="UTILITY">Utility</option>
                    {/* <option value="AUTHENTICATION">Authentication</option> */}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  >
                    <option value="en">English</option>
                    <option value="en_IN">English (India)</option>
                    {/* <option value="hi">Hindi</option>
                    <option value="es">Spanish</option> */}
                  </select>
                </div>
              </div>

              {/* Header Section */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Header (Optional)
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Add a title or choose which type of media you'll use for this header.
                </p>
                <select
                  value={headerType}
                  onChange={(e) => {
                    setHeaderType(e.target.value);
                    setHeaderMediaFile(null);
                    setHeaderMediaPreview('');
                  }}
                  className="w-full max-w-xs rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                >
                  <option value="None">None</option>
                  <option value="Text">Text</option>
                  <option value="Image">Image</option>
                  <option value="Video">Video</option>
                  <option value="Document">Document</option>
                </select>

                {headerType === 'Text' && (
                  <input
                    type="text"
                    value={headerText}
                    onChange={(e) => setHeaderText(e.target.value)}
                    placeholder="Enter header text"
                    className="mt-3 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                  />
                )}

                {(headerType === 'Image' || headerType === 'Video' || headerType === 'Document') && (
                  <div className="mt-3">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-8 hover:border-teal-400 hover:bg-teal-50">
                      <input
                        type="file"
                        accept={
                          headerType === 'Image' ? 'image/jpeg,image/png,image/jpg' :
                            headerType === 'Video' ? 'video/mp4,video/3gpp' :
                              'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                        }
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <BsUpload className="text-gray-400" size={24} />
                      <span className="text-sm font-medium text-gray-600">
                        {headerMediaFile ? 'Change File' : `Upload ${headerType}`}
                      </span>
                    </label>

                    {headerMediaPreview && (
                      <div className="mt-3">
                        {headerType === 'Image' ? (
                          <img
                            src={headerMediaPreview}
                            alt="Preview"
                            className="h-32 rounded border object-cover"
                          />
                        ) : (
                          <div className="rounded border border-gray-300 bg-gray-50 p-3 text-sm text-gray-700">
                            <BsFileText className="inline mr-2" />
                            {headerMediaPreview}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Body Section */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Body *
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Enter the text for your message. Use {`{{1}}, {{2}}`} for dynamic variables.
                </p>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  rows={6}
                  placeholder="Type your message here... Use {{1}} for variables."
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <div className="mt-2 flex items-center gap-3 border-t border-gray-200 pt-2">
                  <button
                    onClick={() => formatText('bold')}
                    className="rounded p-2 text-gray-600 hover:bg-gray-100"
                    title="Bold"
                  >
                    <BsTypeBold size={16} />
                  </button>
                  <button
                    onClick={() => formatText('italic')}
                    className="rounded p-2 text-gray-600 hover:bg-gray-100"
                    title="Italic"
                  >
                    <BsTypeItalic size={16} />
                  </button>
                  <button
                    onClick={() => formatText('strikethrough')}
                    className="rounded p-2 text-gray-600 hover:bg-gray-100"
                    title="Strikethrough"
                  >
                    <BsTypeStrikethrough size={16} />
                  </button>
                  <div className="ml-auto">
                    <button
                      onClick={addVariable}
                      className="flex items-center gap-2 rounded bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      <BsPlus size={18} />
                      Add Variable
                    </button>
                  </div>
                </div>
                {placeholderCount > 0 && (
                  <div className="mt-3">
                    <p className="mb-2 text-xs font-medium text-gray-700">
                      Variable Examples (for testing):
                    </p>
                    {[...Array(placeholderCount)].map((_, i) => (
                      <input
                        key={i}
                        type="text"
                        placeholder={`Example for {{${i + 1}}}`}
                        value={bodyExamples[i] || ''}
                        onChange={(e) => {
                          const newExamples = [...bodyExamples];
                          newExamples[i] = e.target.value;
                          setBodyExamples(newExamples);
                        }}
                        className="mb-2 w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Section */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Footer (Optional)
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Add a short line of text to the bottom of your message template.
                </p>
                <input
                  type="text"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="e.g., Thank you for choosing us"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-teal-400 focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
              </div>

              {/* Buttons Section */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-gray-800">
                  Buttons (Optional, Max 3)
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Create buttons that let customers respond to your message or take action.
                </p>

                {/* Existing Buttons */}
                {buttons.length > 0 && (
                  <div className="mb-4 space-y-3">
                    {buttons.map((button, index) => (
                      <div
                        key={button.id}
                        className="flex items-start gap-3 rounded border border-gray-200 p-3"
                      >
                        <div className="flex-1">
                          <div className="mb-2 text-xs font-medium text-gray-600">
                            Button {index + 1} - {button.type}
                          </div>
                          <input
                            type="text"
                            placeholder="Button text"
                            value={button.text}
                            onChange={(e) => updateButton(button.id, 'text', e.target.value)}
                            className="mb-2 w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                          />
                          {button.type === 'URL' && (
                            <>
                              <input
                                type="text"
                                placeholder="https://example.com/{{1}}"
                                value={button.url}
                                onChange={(e) => updateButton(button.id, 'url', e.target.value)}
                                className="mb-2 w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                              />
                              <input
                                type="text"
                                placeholder="Example: https://example.com/demo"
                                value={button.example}
                                onChange={(e) => updateButton(button.id, 'example', e.target.value)}
                                className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                              />
                            </>
                          )}
                          {button.type === 'PHONE_NUMBER' && (
                            <input
                              type="text"
                              placeholder="+1234567890"
                              value={button.phoneNumber}
                              onChange={(e) => updateButton(button.id, 'phoneNumber', e.target.value)}
                              className="w-full rounded border border-gray-300 px-3 py-1.5 text-sm"
                            />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveButton(button.id)}
                          className="rounded p-2 text-red-600 hover:bg-red-50"
                        >
                          <BsTrash />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Button Dropdown */}
                {buttons.length < 3 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowButtonMenu(!showButtonMenu)}
                      className="flex items-center gap-2 rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      <BsPlus size={18} />
                      Add New Button
                    </button>

                    {showButtonMenu && (
                      <div className="absolute left-0 top-full z-10 mt-2 w-48 rounded-md border border-gray-200 bg-white shadow-lg">
                        <button
                          onClick={() => handleAddButton('QUICK_REPLY')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Quick Reply
                        </button>
                        <button
                          onClick={() => handleAddButton('URL')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Visit Website (URL)
                        </button>
                        <button
                          onClick={() => handleAddButton('PHONE_NUMBER')}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Call Phone Number
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-6">

                <div className="flex gap-3">
                  {/* <button
                    onClick={handleSaveDraft}
                    disabled={isLoading}
                    className="rounded border border-teal-200 bg-transparent px-4 py-2 text-sm font-medium text-teal-500 hover:text-white hover:border-teal-300 hover:bg-teal-400 disabled:opacity-50"
                  >
                    Save as Draft
                  </button> */}
                  {!templateDetails &&

                    (<button
                      onClick={handleSubmit}
                      disabled={isLoading}
                      className="rounded bg-teal-400 px-6 py-2 text-sm font-medium text-white hover:bg-teal-500 disabled:opacity-50"
                    >
                      {isLoading ? 'Submitting...' : mode === 'whatsapp' ? 'Submit for Approval' : 'Save Template'}
                    </button>)


                  }

                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Mobile Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 rounded-md bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-center text-sm font-semibold text-gray-800">
                Message preview
              </h3>

              {/* Phone Mockup */}
              <div className="mx-auto w-full max-w-[280px]">
                <div className="rounded-[2.5rem] border-8 border-black bg-black p-2 shadow-xl">
                  {/* Phone Screen */}
                  <div className="overflow-hidden rounded-[1.5rem] bg-white">
                    {/* Status Bar */}
                    <div className="bg-gray-100 px-4 py-2">
                      <div className="mx-auto h-1 w-20 rounded-full bg-gray-400"></div>
                    </div>

                    {/* Chat Header */}
                    <div className="border-b border-gray-200 bg-teal-600 px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white"></div>
                        <div>
                          <div className="text-sm font-semibold text-white">Business Name</div>
                          <div className="text-xs text-teal-100">Online</div>
                        </div>
                      </div>
                    </div>

                    {/* Message Content */}
                    <div className="min-h-[400px] bg-[#e5ddd5] p-4">
                      {/* Message Bubble */}
                      <div className="ml-auto max-w-[85%]">
                        <div className="rounded-lg bg-[#dcf8c6] p-3 shadow-sm">
                          {/* Header Preview */}
                          {headerType === 'Text' && headerText && (
                            <div className="mb-2 font-semibold text-gray-800">
                              {headerText}
                            </div>
                          )}
                          {headerType === 'Image' && (
                            <div className="mb-2 h-32 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
                              {headerMediaPreview ? (
                                <img src={headerMediaPreview} alt="Preview" className="h-full w-full object-cover" />
                              ) : (
                                <BsImage className="text-gray-400" size={32} />
                              )}
                            </div>
                          )}
                          {headerType === 'Video' && (
                            <div className="mb-2 h-32 rounded bg-gray-200 flex items-center justify-center">
                              <BsCameraVideo className="text-gray-400" size={32} />
                            </div>
                          )}
                          {headerType === 'Document' && (
                            <div className="mb-2 h-20 rounded bg-gray-200 flex items-center justify-center">
                              <BsFileText className="text-gray-400" size={24} />
                            </div>
                          )}

                          {/* Body Preview */}
                          <div className="mb-2 text-sm text-gray-800 whitespace-pre-wrap">
                            {bodyText || 'Your message will appear here...'}
                          </div>

                          {/* Footer Preview */}
                          {footerText && typeof footerText === 'string' && (
                            <div className="mt-2 border-t border-gray-300 pt-2 text-xs text-gray-500">
                              {footerText}
                            </div>
                          )}

                          {/* Timestamp */}
                          <div className="mt-1 text-right text-xs text-gray-500">
                            {new Date().toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        {/* Buttons Preview */}
                        {buttons.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {buttons.map((button) => (
                              <div
                                key={button.id}
                                className="rounded bg-white p-2 text-center text-sm font-medium text-teal-600 shadow-sm"
                              >
                                {button.type === 'QUICK_REPLY' && '💬 '}
                                {button.type === 'URL' && '🔗 '}
                                {button.type === 'PHONE_NUMBER' && '📞 '}
                                {button.text || `${button.type} Button`}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Bar */}
                    <div className="border-t border-gray-200 bg-gray-50 px-4 py-2">
                      <div className="mx-auto h-8 w-24 rounded-full bg-gray-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
