import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Building2,
  Check,
  Plus,
  AlertCircle,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  Loader2,
  Maximize2,
  CheckCircle2,
} from 'lucide-react';
import { Property, TransactionType, PropertyStatus, DecorationType } from '../types';
import { COMMON_TAGS, DISTRICT_OPTIONS } from '../utils/mockData';

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (property: Property) => void;
  initialProperty?: Property | null;
}

export const PropertyFormModal: React.FC<PropertyFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProperty,
}) => {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: '',
    community: '',
    district: '香洲区',
    type: 'sale',
    price: 300,
    rooms: 3,
    livingRooms: 2,
    bathrooms: 2,
    area: 89,
    floor: 'middle',
    totalFloors: 30,
    hasElevator: true,
    orientation: '南北通透',
    decoration: 'refined',
    tags: ['带电梯', '纯南向'],
    highlights: '',
    address: '',
    subwayDistance: '',
    ownerName: '',
    ownerPhone: '',
    minPrice: undefined,
    status: 'active',
    notes: '',
    images: [],
  });

  const [customTag, setCustomTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // AI Recognition State
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [recognitionError, setRecognitionError] = useState<string | null>(null);
  const [recognitionSuccess, setRecognitionSuccess] = useState<string | null>(null);

  // Image Preview Modal
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const aiFileInputRef = useRef<HTMLInputElement>(null);
  const photoUploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialProperty) {
      setFormData(initialProperty);
    } else {
      setFormData({
        title: '',
        community: '',
        district: '香洲区',
        type: 'sale',
        price: 280,
        rooms: 3,
        livingRooms: 2,
        bathrooms: 1,
        area: 88,
        floor: 'middle',
        totalFloors: 28,
        hasElevator: true,
        orientation: '南北通透',
        decoration: 'refined',
        tags: ['带电梯', '纯南向', '成熟大盘'],
        highlights: '',
        address: '',
        subwayDistance: '',
        ownerName: '',
        ownerPhone: '',
        minPrice: undefined,
        status: 'active',
        notes: '',
        images: [],
      });
    }
    setErrors({});
    setRecognitionError(null);
    setRecognitionSuccess(null);
  }, [initialProperty, isOpen]);

  if (!isOpen) return null;

  // AI Image Recognition Handler
  const handleAIImageFile = async (file: File) => {
    if (!file) return;
    setIsRecognizing(true);
    setRecognitionError(null);
    setRecognitionSuccess(null);

    try {
      const reader = new FileReader();
      reader.onerror = () => {
        setIsRecognizing(false);
        setRecognitionError('读取图片文件失败，请重试');
      };

      reader.onload = async () => {
        const base64Data = reader.result as string;

        try {
          const res = await fetch('/api/recognize-property', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageBase64: base64Data,
              mimeType: file.type || 'image/png',
            }),
          });

          const json = await res.json();
          if (!res.ok || !json.success) {
            throw new Error(json.error || '房源截图识别失败，请检查网络或更换清晰截图');
          }

          const d = json.data;

          // Merge recognized fields into formData
          setFormData((prev) => {
            const currentTags = prev.tags || [];
            const newTags = Array.isArray(d.tags) ? d.tags : [];
            const mergedTags = Array.from(new Set([...currentTags, ...newTags]));

            return {
              ...prev,
              community: d.community || prev.community,
              title: d.title || prev.title,
              district: d.district || prev.district,
              type: d.type === 'rent' ? 'rent' : 'sale',
              price: typeof d.price === 'number' ? d.price : prev.price,
              unitPrice: typeof d.unitPrice === 'number' ? d.unitPrice : prev.unitPrice,
              rooms: typeof d.rooms === 'number' ? d.rooms : prev.rooms,
              livingRooms: typeof d.livingRooms === 'number' ? d.livingRooms : prev.livingRooms,
              bathrooms: typeof d.bathrooms === 'number' ? d.bathrooms : prev.bathrooms,
              area: typeof d.area === 'number' ? d.area : prev.area,
              floor: d.floor || prev.floor,
              totalFloors: typeof d.totalFloors === 'number' ? d.totalFloors : prev.totalFloors,
              hasElevator: typeof d.hasElevator === 'boolean' ? d.hasElevator : prev.hasElevator,
              orientation: d.orientation || prev.orientation,
              decoration: d.decoration || prev.decoration,
              tags: mergedTags.length > 0 ? mergedTags : prev.tags,
              highlights: d.highlights || prev.highlights,
              ownerName: d.ownerName || prev.ownerName,
              ownerPhone: d.ownerPhone || prev.ownerPhone,
              minPrice: typeof d.minPrice === 'number' ? d.minPrice : prev.minPrice,
              // Also store the screenshot in the property's photo collection
              images: prev.images ? [...prev.images, base64Data] : [base64Data],
            };
          });

          setRecognitionSuccess(
            `识别成功！已自动解析【${d.community || '房源'}】（${d.rooms || 3}室${d.livingRooms || 2}厅 · ${d.area || ''}㎡ · ${d.price || ''}万），该图片已同步存入房源相册。`
          );
        } catch (fetchErr: any) {
          let message = fetchErr.message || '识别服务响应异常，请重试';
          try {
            const parsed = JSON.parse(message);
            if (parsed.error && parsed.error.message) {
              if (parsed.error.code === 503 || parsed.error.status === 'UNAVAILABLE') {
                message = 'AI 识别通道瞬时繁忙，已为您切换备用高速通道，请再次点击识别重试即可';
              } else {
                message = parsed.error.message;
              }
            }
          } catch {
            if (message.includes('503') || message.includes('high demand') || message.includes('UNAVAILABLE')) {
              message = 'AI 识别通道瞬时繁忙，已为您切换备用高速通道，请再次点击识别重试即可';
            }
          }
          setRecognitionError(message);
        } finally {
          setIsRecognizing(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (e: any) {
      setIsRecognizing(false);
      setRecognitionError(e.message || '处理图片时出错');
    }
  };

  // Multiple photo upload handler
  const handleUploadPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          setFormData((prev) => ({
            ...prev,
            images: [...(prev.images || []), base64],
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  // Delete a photo by index
  const handleDeletePhoto = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags || [];
    if (currentTags.includes(tag)) {
      setFormData({ ...formData, tags: currentTags.filter((t) => t !== tag) });
    } else {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
  };

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return;
    const tag = customTag.trim();
    const currentTags = formData.tags || [];
    if (!currentTags.includes(tag)) {
      setFormData({ ...formData, tags: [...currentTags, tag] });
    }
    setCustomTag('');
  };

  const calculateAutoTitle = () => {
    const comm = formData.community || '优质小区';
    const r = `${formData.rooms || 3}室${formData.livingRooms || 1}厅`;
    const ori = formData.orientation || '南北通透';
    const tagStr = (formData.tags || []).slice(0, 2).join(' ');
    const title = `${comm} ${r} ${ori} ${tagStr}`;
    setFormData((prev) => ({ ...prev, title }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title?.trim()) newErrors.title = '请输入房源标题';
    if (!formData.community?.trim()) newErrors.community = '请输入小区名称';
    if (!formData.district?.trim()) newErrors.district = '请选择或填写片区';
    if (!formData.price || formData.price <= 0) newErrors.price = '请输入有效价格';
    if (!formData.area || formData.area <= 0) newErrors.area = '请输入有效建筑面积';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const now = new Date();
    const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
      now.getMinutes()
    ).padStart(2, '0')}`;

    const calculatedUnitPrice =
      formData.type === 'sale' && formData.price && formData.area
        ? Math.round((Number(formData.price) * 10000) / Number(formData.area))
        : formData.unitPrice;

    const property: Property = {
      id: initialProperty?.id || `prop-${Date.now()}`,
      title: formData.title!.trim(),
      community: formData.community!.trim(),
      district: formData.district!.trim(),
      type: formData.type || 'sale',
      price: Number(formData.price),
      unitPrice: calculatedUnitPrice,
      rooms: Number(formData.rooms) || 3,
      livingRooms: Number(formData.livingRooms) || 1,
      bathrooms: Number(formData.bathrooms) || 1,
      area: Number(formData.area),
      floor: formData.floor || 'middle',
      totalFloors: Number(formData.totalFloors) || 28,
      hasElevator: Boolean(formData.hasElevator),
      orientation: formData.orientation || '南北通透',
      decoration: (formData.decoration || 'refined') as DecorationType,
      tags: formData.tags || [],
      highlights: formData.highlights?.trim() || `${formData.community}核心户型，采光通透，看房方便。`,
      address: formData.address?.trim() || '',
      subwayDistance: formData.subwayDistance?.trim() || '',
      ownerName: formData.ownerName?.trim() || '业主',
      ownerPhone: formData.ownerPhone?.trim() || '138-0000-0000',
      minPrice: formData.minPrice ? Number(formData.minPrice) : undefined,
      status: (formData.status || 'active') as PropertyStatus,
      notes: formData.notes?.trim() || '',
      images: formData.images || [],
      createdAt: initialProperty?.createdAt || nowStr,
      updatedAt: nowStr,
    };

    onSave(property);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[92vh] flex flex-col border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-xl">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialProperty ? '编辑房源信息' : '录入新房源'}
              </h2>
              <p className="text-xs text-slate-500">
                支持 AI 上传截图自动识图填单，以及房源实勘图片多图上传与删除管理
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
          {/* AI Screenshot Recognition Feature Banner */}
          <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-200/80 rounded-xl p-4 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>AI 识图一键智能录入（截图极速识别）</span>
                  <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.2 rounded font-normal">
                    省时提效
                  </span>
                </div>
                <p className="text-[11px] text-indigo-700/80">
                  支持贝壳找房/链家/安居客截图、微信推文图或户型单页，AI 自动提取小区、价格、面积、户型并自动填入下方表单。
                </p>
              </div>

              <div>
                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleAIImageFile(file);
                    e.target.value = '';
                  }}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isRecognizing}
                  onClick={() => aiFileInputRef.current?.click()}
                  className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                >
                  {isRecognizing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>正在智能识别截图中...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>上传截图/照片并识别</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Recognition Status Feedback */}
            {isRecognizing && (
              <div className="mt-3 p-2.5 bg-white/80 border border-indigo-200 rounded-lg flex items-center gap-2 text-xs text-indigo-700 font-medium animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600 shrink-0" />
                <span>AI 正在解析图片中的小区名称、价格、面积、朝向、楼层及特色卖点，请稍候约 2~3 秒...</span>
              </div>
            )}

            {recognitionSuccess && (
              <div className="mt-3 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{recognitionSuccess}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRecognitionSuccess(null)}
                  className="text-emerald-500 hover:text-emerald-700 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {recognitionError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between text-xs text-rose-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{recognitionError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setRecognitionError(null)}
                  className="text-rose-500 hover:text-rose-700 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Feature 1: Photo & Image Management (Upload & Delete) */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-indigo-600" />
                  <span>房源实勘照片 / 户型图相册</span>
                  <span className="text-xs font-normal text-slate-400 font-mono">
                    (已上传 {(formData.images || []).length} 张)
                  </span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  支持上传多张客厅、卧室、厨卫现场实拍或户型分布图，随时可删除更换。
                </p>
              </div>

              <div>
                <input
                  ref={photoUploadInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadPhotos}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoUploadInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ 上传照片</span>
                </button>
              </div>
            </div>

            {/* Photos Grid */}
            {(formData.images || []).length === 0 ? (
              <div
                onClick={() => photoUploadInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-lg p-6 text-center cursor-pointer transition-colors bg-white/50"
              >
                <ImageIcon className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                <p className="text-xs text-slate-600 font-medium">点击此处上传房源实勘图片或户型图</p>
                <p className="text-[11px] text-slate-400 mt-0.5">支持 JPG、PNG、WebP，可同时选择多张照片</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                {(formData.images || []).map((imgUrl, index) => (
                  <div
                    key={index}
                    className="group relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
                  >
                    <img
                      src={imgUrl}
                      alt={`房源图片 ${index + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {/* Image overlay with delete and zoom button */}
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPreviewImageUrl(imgUrl)}
                        className="p-1.5 bg-white/20 hover:bg-white/40 text-white rounded-md transition-colors"
                        title="查看大图"
                      >
                        <Maximize2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeletePhoto(index)}
                        className="p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md transition-colors shadow-sm"
                        title="删除该照片"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-slate-900/70 text-white text-[9px] px-1 py-0.2 rounded">
                        封面
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 1: Type and Price */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                租售类型 <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'sale' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.type === 'sale'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  二手买卖 (售)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'rent' })}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.type === 'rent'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  房屋租赁 (租)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {formData.type === 'sale' ? '挂牌售价 (万元)' : '月租金 (元/月)'}{' '}
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                step={formData.type === 'sale' ? '0.1' : '10'}
                value={formData.price || ''}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                placeholder={formData.type === 'sale' ? '例如 280' : '例如 3000'}
              />
              {errors.price && <p className="text-xs text-rose-500 mt-1">{errors.price}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                业主心理底价 ({formData.type === 'sale' ? '万元' : '元/月'})
                <span className="text-slate-400 font-normal ml-1">私密仅中介见</span>
              </label>
              <input
                type="number"
                min="1"
                value={formData.minPrice || ''}
                onChange={(e) =>
                  setFormData({ ...formData, minPrice: parseFloat(e.target.value) || undefined })
                }
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                placeholder="谈判保密底价"
              />
            </div>
          </div>

          {/* Section 2: Community & District */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                小区名称 <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.community || ''}
                onChange={(e) => setFormData({ ...formData, community: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如 中海左岸岚庭"
              />
              {errors.community && <p className="text-xs text-rose-500 mt-1">{errors.community}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                所在区域/商圈 <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={DISTRICT_OPTIONS.find((d) => formData.district?.startsWith(d)) || '香洲区'}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-1/2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DISTRICT_OPTIONS.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formData.district || ''}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-1/2 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="可精细化商圈"
                />
              </div>
              {errors.district && <p className="text-xs text-rose-500 mt-1">{errors.district}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">详细门牌地址</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如 12栋2单元802室"
              />
            </div>
          </div>

          {/* Section 3: Title */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                房源对外标题 <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={calculateAutoTitle}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                根据参数智能生成标题
              </button>
            </div>
            <input
              type="text"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="例如 中海左岸岚庭 3室2厅 正南向 满五年带电梯 诚意急售"
            />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </div>

          {/* Section 4: Specifications */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">居室 (室)</label>
              <select
                value={formData.rooms || 3}
                onChange={(e) => setFormData({ ...formData, rooms: parseInt(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num} 室
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">厅 / 卫</label>
              <div className="flex gap-2">
                <select
                  value={formData.livingRooms || 2}
                  onChange={(e) => setFormData({ ...formData, livingRooms: parseInt(e.target.value) })}
                  className="w-1/2 px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                >
                  {[0, 1, 2, 3].map((num) => (
                    <option key={num} value={num}>
                      {num} 厅
                    </option>
                  ))}
                </select>
                <select
                  value={formData.bathrooms || 2}
                  onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) })}
                  className="w-1/2 px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} 卫
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                建筑面积 (㎡) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min="5"
                step="0.01"
                value={formData.area || ''}
                onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono tabular-nums"
                placeholder="例如 97.63"
              />
              {errors.area && <p className="text-xs text-rose-500 mt-1">{errors.area}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">朝向</label>
              <select
                value={formData.orientation || '南北通透'}
                onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="纯南向">纯南向</option>
                <option value="南北通透">南北通透</option>
                <option value="东南">东南</option>
                <option value="西南">西南</option>
                <option value="朝东">朝东</option>
                <option value="朝北">朝北</option>
                <option value="朝西">朝西</option>
              </select>
            </div>
          </div>

          {/* Section 5: Floors, Elevator, Decoration */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">楼层及总高</label>
              <div className="flex gap-2">
                <select
                  value={formData.floor || 'middle'}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value as any })}
                  className="w-1/2 px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="low">低楼层</option>
                  <option value="middle">中楼层</option>
                  <option value="high">高楼层</option>
                </select>
                <div className="w-1/2 flex items-center gap-1">
                  <input
                    type="number"
                    min="1"
                    value={formData.totalFloors || 28}
                    onChange={(e) =>
                      setFormData({ ...formData, totalFloors: parseInt(e.target.value) || 1 })
                    }
                    className="w-full px-2 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-center"
                    placeholder="总层数"
                  />
                  <span className="text-xs text-slate-400 shrink-0">层</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">电梯配备</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasElevator: true })}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.hasElevator
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  有电梯
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, hasElevator: false })}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition-colors ${
                    !formData.hasElevator
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600'
                  }`}
                >
                  步梯 (无电梯)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">装修档次</label>
              <select
                value={formData.decoration || 'refined'}
                onChange={(e) => setFormData({ ...formData, decoration: e.target.value as DecorationType })}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="refined">精装修 (拎包入住)</option>
                <option value="luxury">豪华装修 (高端定制)</option>
                <option value="simple">普通简装</option>
                <option value="rough">毛坯房</option>
              </select>
            </div>
          </div>

          {/* Section 6: Feature Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              特色标签 (智能多维加分项)
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_TAGS.map((tag) => {
                const isSelected = (formData.tags || []).includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-medium'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                placeholder="自定义特色标签 (按回车添加)"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                添加
              </button>
            </div>
          </div>

          {/* Section 7: Highlights and Transportation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                核心卖点描述 (用于生成推房方案)
              </label>
              <textarea
                rows={3}
                value={formData.highlights || ''}
                onChange={(e) => setFormData({ ...formData, highlights: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：高楼层视野极佳，无遮挡看海景，全屋品牌家私家电赠送，业主诚意出售，满五唯一税费少..."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                地铁与交通配套说明
              </label>
              <textarea
                rows={3}
                value={formData.subwayDistance || ''}
                onChange={(e) => setFormData({ ...formData, subwayDistance: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="例如：距深中通道连接线8分钟，距城轨珠海北站驾车3分钟..."
              />
            </div>
          </div>

          {/* Section 8: Owner & Privacy Info */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
            <h4 className="text-xs font-bold text-slate-800">业主与经纪人内部保密信息 (对外客户不可见)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">房东/联系人</label>
                <input
                  type="text"
                  value={formData.ownerName || ''}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="例如 陈总 / 张先生"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">联系电话</label>
                <input
                  type="text"
                  value={formData.ownerPhone || ''}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white"
                  placeholder="例如 138-0000-0000"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">看房方式 / 备忘</label>
                <input
                  type="text"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  placeholder="例如 钥匙在店 / 密码锁需提前联系"
                />
              </div>
            </div>
          </div>

          {/* Section 9: Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">房源状态</label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'active', label: '在售/在租 (正常流通)' },
                { key: 'reserved', label: '已交定金 (锁定)' },
                { key: 'deal', label: '已签约成交' },
                { key: 'offline', label: '已下架/暂缓' },
              ].map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setFormData({ ...formData, status: s.key as PropertyStatus })}
                  className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-colors ${
                    formData.status === s.key
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-semibold'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3 sticky bottom-0 bg-white py-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{initialProperty ? '保存修改' : '确认录入房源'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Full Size Image Preview Modal */}
      {previewImageUrl && (
        <div
          className="fixed inset-0 z-60 bg-slate-950/80 flex items-center justify-center p-4"
          onClick={() => setPreviewImageUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] bg-transparent flex flex-col items-center">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={previewImageUrl}
              alt="放大查看"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};
