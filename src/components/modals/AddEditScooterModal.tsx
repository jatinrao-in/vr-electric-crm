import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  Check, 
  Plus, 
  Trash2, 
  Loader2, 
  Image as ImageIcon,
  BatteryCharging,
  Gauge,
  Tag
} from 'lucide-react';
import { Scooter, RTOType, BatteryChemistry, BatteryType } from '../../types';
import { cropTo16By9, uploadToImgBB } from '../../lib/imgbb';
import { useCRM } from '../../context/CRMContext';

interface AddEditScooterModalProps {
  isOpen: boolean;
  onClose: () => void;
  scooterToEdit?: Scooter | null;
}

const PRESET_COLORS = [
  'Jet Black', 'Electric Blue', 'Lime Green', 'Pearl White', 
  'Matte Grey', 'Candy Red', 'Ocean Blue', 'Industrial Silver'
];

const PRESET_FEATURES = [
  'Digital Meter', 'Reverse Gear', 'Front Disc Brake', 'Keyless Start',
  'Anti-Theft Alarm', 'USB Charging', 'Tubeless Tyres', 'IP67 Waterproof Motor',
  'Regenerative Braking', 'Dual LED Headlamps', 'Central Locking'
];

const PRESET_BEST_FOR = [
  'Daily Commute', 'Family Use', 'Delivery / Commercial', 'Students / Ladies'
];

export const AddEditScooterModal: React.FC<AddEditScooterModalProps> = ({
  isOpen,
  onClose,
  scooterToEdit
}) => {
  const { addScooter, updateScooter } = useCRM();

  // Form State
  const [modelName, setModelName] = useState('');
  const [rtoType, setRtoType] = useState<RTOType>('RTO (Registration Required)');
  const [availableColors, setAvailableColors] = useState<string[]>(['Jet Black', 'Electric Blue', 'Pearl White']);
  const [newColorInput, setNewColorInput] = useState('');
  
  const [imageUrl, setImageUrl] = useState('');
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [rangeKm, setRangeKm] = useState<number | ''>(85);
  const [topSpeedKmph, setTopSpeedKmph] = useState<number | ''>(60);
  const [batteryChemistry, setBatteryChemistry] = useState<BatteryChemistry>('Lithium-ion (LFP)');
  const [batterySpecs, setBatterySpecs] = useState('60V 30Ah');
  const [batteryType, setBatteryType] = useState<BatteryType>('Detachable (Portable)');
  const [chargingTimeHours, setChargingTimeHours] = useState('3.5 - 4 Hours');

  const [bestFor, setBestFor] = useState<string[]>(['Daily Commute']);
  const [keyFeatures, setKeyFeatures] = useState<string[]>([
    'Digital Meter', 'Reverse Gear', 'Front Disc Brake', 'Tubeless Tyres'
  ]);
  const [customFeatureInput, setCustomFeatureInput] = useState('');

  const [onRoadPrice, setOnRoadPrice] = useState<number | ''>(85000);
  const [minDownPayment, setMinDownPayment] = useState<number | ''>(15000);
  const [startingEmi, setStartingEmi] = useState<number | ''>(2450);
  const [warrantyDetails, setWarrantyDetails] = useState('3 Years Battery & Motor Warranty');
  const [inStock, setInStock] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Populate when editing
  useEffect(() => {
    if (scooterToEdit) {
      setModelName(scooterToEdit.modelName);
      setRtoType(scooterToEdit.rtoType);
      setAvailableColors(scooterToEdit.availableColors || []);
      setImageUrl(scooterToEdit.imageUrl || '');
      setRangeKm(scooterToEdit.rangeKm);
      setTopSpeedKmph(scooterToEdit.topSpeedKmph);
      setBatteryChemistry(scooterToEdit.batteryChemistry);
      setBatterySpecs(scooterToEdit.batterySpecs);
      setBatteryType(scooterToEdit.batteryType);
      setChargingTimeHours(scooterToEdit.chargingTimeHours);
      setBestFor(scooterToEdit.bestFor || []);
      setKeyFeatures(scooterToEdit.keyFeatures || []);
      setOnRoadPrice(scooterToEdit.onRoadPrice);
      setMinDownPayment(scooterToEdit.minDownPayment);
      setStartingEmi(scooterToEdit.startingEmi);
      setWarrantyDetails(scooterToEdit.warrantyDetails);
      setInStock(scooterToEdit.inStock ?? true);
    } else {
      // Reset to defaults
      setModelName('');
      setRtoType('RTO (Registration Required)');
      setAvailableColors(['Jet Black', 'Electric Blue', 'Pearl White']);
      setImageUrl('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1280&auto=format&fit=crop&q=80');
      setRangeKm(85);
      setTopSpeedKmph(60);
      setBatteryChemistry('Lithium-ion (LFP)');
      setBatterySpecs('60V 30Ah');
      setBatteryType('Detachable (Portable)');
      setChargingTimeHours('3.5 - 4 Hours');
      setBestFor(['Daily Commute']);
      setKeyFeatures(['Digital Meter', 'Reverse Gear', 'Front Disc Brake', 'Tubeless Tyres']);
      setOnRoadPrice(85000);
      setMinDownPayment(15000);
      setStartingEmi(2450);
      setWarrantyDetails('3 Years Battery & Motor Warranty');
      setInStock(true);
    }
  }, [scooterToEdit, isOpen]);

  // Handle Image Upload with 16:9 Canvas Crop
  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setImageUploading(true);
      setImageError(null);

      // 1. Process and Crop to exact 16:9 ratio
      const processed = await cropTo16By9(file, 1280);

      // 2. Upload to ImgBB via API
      const uploadRes = await uploadToImgBB(processed.blob, `${file.name.replace(/\.[^/.]+$/, "")}-16x9.jpg`);

      if (uploadRes.success && uploadRes.url) {
        setImageUrl(uploadRes.url);
      } else {
        // Fallback to local canvas preview if ImgBB fails
        setImageUrl(processed.previewUrl);
        setImageError(uploadRes.error || 'ImgBB upload failed, previewing locally.');
      }
    } catch (err: any) {
      console.error('Image processing error:', err);
      setImageError(err.message || 'Failed to process image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleToggleColor = (color: string) => {
    if (availableColors.includes(color)) {
      setAvailableColors(availableColors.filter(c => c !== color));
    } else {
      setAvailableColors([...availableColors, color]);
    }
  };

  const handleAddCustomColor = () => {
    if (newColorInput.trim() && !availableColors.includes(newColorInput.trim())) {
      setAvailableColors([...availableColors, newColorInput.trim()]);
      setNewColorInput('');
    }
  };

  const handleToggleBestFor = (tag: string) => {
    if (bestFor.includes(tag)) {
      setBestFor(bestFor.filter(t => t !== tag));
    } else {
      setBestFor([...bestFor, tag]);
    }
  };

  const handleToggleFeature = (feat: string) => {
    if (keyFeatures.includes(feat)) {
      setKeyFeatures(keyFeatures.filter(f => f !== feat));
    } else {
      setKeyFeatures([...keyFeatures, feat]);
    }
  };

  const handleAddCustomFeature = () => {
    if (customFeatureInput.trim() && !keyFeatures.includes(customFeatureInput.trim())) {
      setKeyFeatures([...keyFeatures, customFeatureInput.trim()]);
      setCustomFeatureInput('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!modelName.trim()) {
      setSubmitError('Model Name is required.');
      return;
    }

    if (!onRoadPrice || onRoadPrice <= 0) {
      setSubmitError('Please enter a valid On-Road Price.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      modelName: modelName.trim(),
      rtoType,
      availableColors,
      imageUrl: imageUrl.trim() || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1280&auto=format&fit=crop&q=80',
      rangeKm: Number(rangeKm) || 75,
      topSpeedKmph: Number(topSpeedKmph) || 55,
      batteryChemistry,
      batterySpecs: batterySpecs.trim() || '60V 30Ah',
      batteryType,
      chargingTimeHours: chargingTimeHours.trim() || '4 Hours',
      bestFor: bestFor.length > 0 ? bestFor : ['Daily Commute'],
      keyFeatures: keyFeatures.length > 0 ? keyFeatures : ['Digital Meter'],
      onRoadPrice: Number(onRoadPrice) || 0,
      minDownPayment: Number(minDownPayment) || 0,
      startingEmi: Number(startingEmi) || 0,
      warrantyDetails: warrantyDetails.trim() || '3 Years Warranty',
      inStock,
    };

    if (scooterToEdit) {
      await updateScooter(scooterToEdit.id, payload);
    } else {
      await addScooter(payload);
    }

    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto">
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-sheet sm:shadow-large border border-[#E2E8F0] overflow-hidden z-10 animate-slide-up sm:animate-in max-h-[92vh] flex flex-col">
        {/* Mobile drag handle */}
        <div className="sm:hidden pt-2.5 pb-1 flex justify-center">
          <div className="w-12 h-1 rounded-full bg-slate-300" />
        </div>

        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 font-display">
              {scooterToEdit ? 'Edit Scooter Model' : 'Add New Scooter Model'}
            </h3>
            <p className="text-[11px] text-slate-400">
              VR Electric Digital Showroom Catalogue
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 min-h-[44px] flex items-center">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1 text-xs">
          {submitError && (
            <div className="p-2.5 rounded-lg bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
              {submitError}
            </div>
          )}

          {/* 1. 16:9 Scooter Image Uploader (ImgBB API) */}
          <div className="space-y-2">
            <label className="block font-bold text-slate-800">
              Scooter Photo (16:9 Widescreen Ratio)
            </label>
            
            <div className="aspect-video w-full rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 overflow-hidden relative group flex items-center justify-center">
              {imageUrl ? (
                <>
                  <img 
                    src={imageUrl} 
                    alt="Scooter Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <label className="px-3 py-1.5 bg-white text-slate-900 font-bold text-xs rounded-lg cursor-pointer hover:bg-slate-100 shadow">
                      Change Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleImageFileChange} 
                        disabled={imageUploading}
                      />
                    </label>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-700 text-xs">Upload 16:9 Scooter Image</p>
                  <p className="text-[10px] text-slate-400">Auto-cropped & uploaded to ImgBB CDN</p>
                  <label className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0A3D91] text-white font-bold rounded-lg cursor-pointer hover:bg-[#062463]">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleImageFileChange} 
                      disabled={imageUploading}
                    />
                  </label>
                </div>
              )}

              {imageUploading && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0A3D91]" />
                  <span className="text-[11px] font-bold text-[#0A3D91]">Processing 16:9 & Uploading to ImgBB...</span>
                </div>
              )}
            </div>

            {imageError && (
              <p className="text-[11px] text-amber-600 font-medium">{imageError}</p>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Or Image URL:</span>
              <input 
                type="url"
                placeholder="https://..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-2.5 py-1 text-xs border rounded-lg focus:border-[#0A3D91] outline-none"
              />
            </div>
          </div>

          {/* 2. Basic Info (Model Name, RTO Type, Stock) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Model Name <span className="text-red-500">*</span>
              </label>
              <input 
                type="text"
                required
                placeholder="e.g. VR Thunder Pro (120km)"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-lg font-bold text-slate-900 focus:border-[#0A3D91] outline-none min-h-[44px]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">RTO Category</label>
              <select
                value={rtoType}
                onChange={(e) => setRtoType(e.target.value as RTOType)}
                className="w-full px-2.5 py-2 text-xs border rounded-lg focus:border-[#0A3D91] outline-none min-h-[44px]"
              >
                <option value="RTO (Registration Required)">RTO (Registration)</option>
                <option value="Non-RTO (No License/Registration)">Non-RTO (No License)</option>
              </select>
            </div>
          </div>

          {/* 3. Performance & Battery Specs (4-Col Grid) */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <h4 className="text-[11px] font-bold text-[#0A3D91] uppercase tracking-wider flex items-center gap-1.5">
              <BatteryCharging className="w-3.5 h-3.5" /> Performance & Battery Architecture
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Certified Range (km)</label>
                <input 
                  type="number"
                  required
                  value={rangeKm}
                  onChange={(e) => setRangeKm(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="120"
                  className="w-full px-2.5 py-2 text-xs border rounded-lg font-bold tabular-nums min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Top Speed (km/h)</label>
                <input 
                  type="number"
                  required
                  value={topSpeedKmph}
                  onChange={(e) => setTopSpeedKmph(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="75"
                  className="w-full px-2.5 py-2 text-xs border rounded-lg font-bold tabular-nums min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Battery Specs</label>
                <input 
                  type="text"
                  required
                  value={batterySpecs}
                  onChange={(e) => setBatterySpecs(e.target.value)}
                  placeholder="72V 36Ah"
                  className="w-full px-2.5 py-2 text-xs border rounded-lg tabular-nums min-h-[40px]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Charging Time</label>
                <input 
                  type="text"
                  value={chargingTimeHours}
                  onChange={(e) => setChargingTimeHours(e.target.value)}
                  placeholder="4 Hours"
                  className="w-full px-2.5 py-2 text-xs border rounded-lg min-h-[40px]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Battery Chemistry</label>
                <select
                  value={batteryChemistry}
                  onChange={(e) => setBatteryChemistry(e.target.value as BatteryChemistry)}
                  className="w-full px-2.5 py-2 text-xs border rounded-lg min-h-[40px]"
                >
                  <option value="Lithium-ion (LFP)">Lithium-ion (LFP - Ultra Safe)</option>
                  <option value="Lithium-ion (NMC)">Lithium-ion (NMC - High Density)</option>
                  <option value="Lead-Acid / Graphene">Lead-Acid / Graphene</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Battery Portability</label>
                <select
                  value={batteryType}
                  onChange={(e) => setBatteryType(e.target.value as BatteryType)}
                  className="w-full px-2.5 py-2 text-xs border rounded-lg min-h-[40px]"
                >
                  <option value="Detachable (Portable)">Detachable (Portable - Home/Office Charge)</option>
                  <option value="Fixed">Fixed In-Chassis</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. Pricing & Finance Pillows */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">On-Road Price (₹) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                <input 
                  type="number"
                  required
                  value={onRoadPrice}
                  onChange={(e) => setOnRoadPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="85000"
                  className="w-full pl-7 pr-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-slate-900 focus:border-[#0A3D91] outline-none min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Min. Down Payment (₹)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                <input 
                  type="number"
                  value={minDownPayment}
                  onChange={(e) => setMinDownPayment(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="15000"
                  className="w-full pl-7 pr-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-[#0A3D91] min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Starting EMI (₹/mo)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-medium">₹</span>
                <input 
                  type="number"
                  value={startingEmi}
                  onChange={(e) => setStartingEmi(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="2450"
                  className="w-full pl-7 pr-3 py-2 text-sm border rounded-lg font-bold tabular-nums text-[#1B662C] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* 5. Colors Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Available Color Variants</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_COLORS.map(color => {
                const isSelected = availableColors.includes(color);
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => handleToggleColor(color)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                      isSelected 
                        ? 'bg-[#0A3D91] text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{color}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add custom color..."
                value={newColorInput}
                onChange={(e) => setNewColorInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomColor}
                className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Add Color
              </button>
            </div>
          </div>

          {/* 6. Best For Tags */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Recommended Best Purpose</label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_BEST_FOR.map(tag => {
                const isSelected = bestFor.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleBestFor(tag)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      isSelected 
                        ? 'bg-[#65B32E] text-white shadow-sm' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 7. Key Features Chips */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Key Selling Features</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {PRESET_FEATURES.map(feat => {
                const isSelected = keyFeatures.includes(feat);
                return (
                  <button
                    key={feat}
                    type="button"
                    onClick={() => handleToggleFeature(feat)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                      isSelected 
                        ? 'bg-blue-100 text-[#0A3D91] border border-blue-300 font-bold' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {feat}
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Add custom feature (e.g. Side Stand Sensor)..."
                value={customFeatureInput}
                onChange={(e) => setCustomFeatureInput(e.target.value)}
                className="flex-1 px-3 py-1.5 border rounded-lg text-xs"
              />
              <button
                type="button"
                onClick={handleAddCustomFeature}
                className="px-3 py-1.5 bg-slate-800 text-white font-bold rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>

          {/* 8. Warranty & Stock Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Warranty Term</label>
              <input 
                type="text"
                value={warrantyDetails}
                onChange={(e) => setWarrantyDetails(e.target.value)}
                placeholder="3 Years Battery & Motor Warranty"
                className="w-full px-3 py-2 border rounded-lg text-xs min-h-[40px]"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="font-bold text-slate-800 block text-xs">Inventory Status</span>
                <span className="text-[10px] text-slate-400">Mark if unit is available for delivery</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={inStock} 
                  onChange={(e) => setInStock(e.target.checked)} 
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#65B32E]" />
              </label>
            </div>
          </div>

          {/* Sticky Modal Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg min-h-[44px]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || imageUploading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#0A3D91] hover:bg-[#062463] rounded-lg shadow-subtle min-h-[44px] transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving Scooter...' : scooterToEdit ? 'Update Scooter' : 'Add to Catalogue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEditScooterModal;
