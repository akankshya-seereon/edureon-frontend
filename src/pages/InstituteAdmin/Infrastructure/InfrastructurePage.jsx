import React, { useState, useEffect } from 'react';
import { 
  Building2, Warehouse, Trash2, Plus, CheckCircle2, ChevronRight, ChevronDown,
  Edit2, Loader2, Package, X, AlertCircle, Users, Info
} from 'lucide-react';
import { infrastructureService } from '../../../services/infrastructureService';

// ─── CONSTANTS ───────────────────────────────────────────────────────────────
const ROOM_TYPES = [
  'Classroom', 'Laboratory', 'Library', 'Office', 
  'Staff Room', 'Auditorium', 'Seminar Hall', 'Meeting Room', 'Other'
];

const FLOOR_OPTIONS = [
  'Basement', 'Ground Floor', '1st Floor', '2nd Floor', '3rd Floor', 
  '4th Floor', '5th Floor', '6th Floor', '7th Floor', '8th Floor', 
  '9th Floor', '10th Floor', 'Other'
];

const EQUIPMENT_OPTIONS = [
  'Projector', 'Whiteboard', 'Smart Board', 'Desktop PC', 'Laptop',
  'Air Conditioner', 'Microphone', 'Sound System', 'Other'
];

// ─── HELPER: resolve the final type value ────────────────────────────────────
const resolveFinalType = (type, customType) => {
  if (type === 'Other') {
    return customType?.trim() || 'Other';
  }
  return type;
};

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

const ToggleSwitch = ({ active, onToggle }) => (
  <div onClick={onToggle} className={`w-10 h-[22px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors outline-none shadow-inner ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
    <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${active ? 'translate-x-[18px]' : 'translate-x-0'}`} />
  </div>
);

const InputField = ({ label, placeholder, required, type = "text", min, max, value, onChange }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-xs font-bold text-slate-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type} min={min} max={max} placeholder={placeholder}
      value={value} onChange={onChange}
      className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm transition-all shadow-sm"
    />
  </div>
);

const SelectField = ({ label, options, required, value, onChange }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-xs font-bold text-slate-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <select
      value={value} onChange={onChange}
      className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm transition-all shadow-sm"
    >
      <option value="" disabled>Select {label}...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

const DynamicTypeField = ({ label, options, value, customValue, onTypeChange, onCustomChange, required, placeholder }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-xs font-bold text-slate-600">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <select
      value={value} onChange={onTypeChange}
      className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm transition-all shadow-sm"
    >
      <option value="" disabled>Select {label}...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    {value === 'Other' && (
      <input
        type="text"
        placeholder={placeholder}
        value={customValue}
        onChange={onCustomChange}
        autoFocus
        className="mt-1 px-3 py-2.5 rounded-lg border border-blue-300 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-400 bg-blue-50 text-sm transition-all shadow-sm placeholder-blue-300"
      />
    )}
  </div>
);

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const EMPTY_ROOM = {
  roomNo: '', startNumber: '', count: '',
  type: '', customType: '',
  capacity: '', floor: '', customFloor: '', block: '', building_id: ''
};

const InfrastructurePage = () => {
  // --- DATA STATES ---
  const [loading, setLoading]   = useState(true);
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms]       = useState([]);

  // --- UI TOGGLE STATES ---
  const [showCampusForm, setShowCampusForm] = useState(false);
  const [showRoomForm, setShowRoomForm]     = useState(false);
  const [isBulkMode, setIsBulkMode]         = useState(false);
  const [savingBulk, setSavingBulk]         = useState(false);
  const [formError, setFormError]           = useState("");
  const [equipmentWizardStage, setEquipmentWizardStage] = useState(0); 

  // --- EDITING STATES ---
  const [editingCampusId, setEditingCampusId]     = useState(null);
  const [editingRoomId, setEditingRoomId]         = useState(null);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [editBuildingData, setEditBuildingData]   = useState({ name: '', floors: '', block: '', rooms: '' });

  // --- FORM STATES ---
  const [newCampus, setNewCampus]           = useState({ name: '', address: '', property: 'Owned' });
  const [buildingInputs, setBuildingInputs] = useState({});
  const [newRoom, setNewRoom]               = useState(EMPTY_ROOM);
  const [equipmentList, setEquipmentList]   = useState([]);

  // --- DATA FETCHING ---
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await infrastructureService.getInfrastructure();
      if (res.success) {
        setCampuses(res.campuses || []);
        setRooms(res.rooms || []);
      }
    } catch (error) {
      console.error("Failed to load infrastructure", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // --- CAMPUS & BUILDING HANDLERS ---
  const cancelCampusForm = () => {
    setShowCampusForm(false);
    setEditingCampusId(null);
    setFormError("");
    setNewCampus({ name: '', address: '', property: 'Owned' });
  };

  const handleSaveCampus = async () => {
    setFormError("");
    if (!newCampus.name.trim()) return setFormError("Campus Name is required.");
    const isDuplicate = campuses.some(c => c.id !== editingCampusId && c.name.toLowerCase() === newCampus.name.trim().toLowerCase());
    if (isDuplicate) return setFormError(`A campus named "${newCampus.name.trim()}" already exists.`);
    try {
      if (editingCampusId) await infrastructureService.updateCampus(editingCampusId, newCampus);
      else await infrastructureService.createCampus(newCampus);
      cancelCampusForm();
      loadData();
    } catch (error) { setFormError(error.response?.data?.message || "Error saving campus"); }
  };

  const handleEditCampus = (campus) => {
    setFormError("");
    setEditingCampusId(campus.id);
    setNewCampus({ name: campus.name, address: campus.address || '', property: campus.property });
    setShowCampusForm(true);
  };

  const handleDeleteCampus = async (id) => {
    if (!window.confirm("Delete this campus? All buildings and rooms inside will also be deleted.")) return;
    try { await infrastructureService.deleteCampus(id); loadData(); } catch (error) {}
  };

  const handleBuildingInputChange = (campusId, field, value) => {
    setBuildingInputs(prev => ({ ...prev, [campusId]: { ...prev[campusId], [field]: value } }));
  };

  const handleCreateBuilding = async (campusId) => {
    const bData = buildingInputs[campusId];
    if (!bData?.name?.trim()) return alert("Building name is required.");
    try {
      await infrastructureService.createBuilding({
        campus_id: campusId, name: bData.name.trim(), floors: Number(bData.floors) || 1, block: bData.block || '', rooms: Number(bData.rooms) || 0
      });
      setBuildingInputs(prev => ({ ...prev, [campusId]: { name: '', floors: '', block: '', rooms: '' } }));
      loadData();
    } catch (error) { alert(error.response?.data?.message || "Error creating building"); }
  };

  const handleEditBuilding = (building) => {
    setEditingBuildingId(building.id);
    setEditBuildingData({ name: building.name, floors: building.floors || '', block: building.block || '', rooms: building.rooms || '' });
  };

  const handleSaveBuildingEdit = async (campusId) => {
    if (!editBuildingData.name.trim()) return alert("Building name is required.");
    try {
      await infrastructureService.updateBuilding(editingBuildingId, {
        campus_id: campusId, ...editBuildingData, name: editBuildingData.name.trim(), floors: Number(editBuildingData.floors) || 1, rooms: Number(editBuildingData.rooms) || 0
      });
      setEditingBuildingId(null);
      loadData();
    } catch (error) { alert(error.response?.data?.message || "Error updating building"); }
  };

  const handleDeleteBuilding = async (id) => {
    if (!window.confirm("Delete this building?")) return;
    try { await infrastructureService.deleteBuilding(id); loadData(); } catch (error) {}
  };

  // --- SMART ALPHANUMERIC GENERATOR ---
  const getGeneratedPreview = () => {
    if (!isBulkMode || !newRoom.startNumber || !newRoom.count) return [];
    const count = Math.min(Number(newRoom.count), 100); 
    const startStr = String(newRoom.startNumber).trim();
    
    if (count < 1 || startStr === '') return [];
    
    // Regex finds the LAST contiguous group of numbers in the string (e.g. "A-101" -> prefix:"A-", num:"101", suffix:"")
    const match = startStr.match(/^(.*?)(\d+)(\D*)$/);
    
    // If user types pure text like "Lab", fallback to appending numbers (Lab-1, Lab-2)
    if (!match) {
      return Array.from({ length: count }).map((_, i) => `${startStr}-${i + 1}`);
    }

    const [_, prefix, numStr, suffix] = match;
    const padLength = numStr.length;
    const startNum = parseInt(numStr, 10);
    
    return Array.from({ length: count }).map((_, i) => {
      const nextNumStr = String(startNum + i).padStart(padLength, '0');
      return `${prefix}${nextNumStr}${suffix}`;
    });
  };

  const roomPreview = getGeneratedPreview();

  // --- ROOM HANDLERS ---
  const cancelRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoomId(null);
    setIsBulkMode(false);
    setFormError("");
    setNewRoom(EMPTY_ROOM);
    setEquipmentList([]);
    setEquipmentWizardStage(0);
  };

  const handleRoomTypeChange = (e) => {
    const val = e.target.value;
    setNewRoom(prev => ({ ...prev, type: val, customType: val !== 'Other' ? '' : prev.customType }));
  };

  const handleFloorChange = (e) => {
    const val = e.target.value;
    setNewRoom(prev => ({ ...prev, floor: val, customFloor: val !== 'Other' ? '' : prev.customFloor }));
  };

  // 🚀 STEP 1: VALIDATE AND SHOW WIZARD
  const handlePreSaveValidation = () => {
    setFormError("");
    if (newRoom.type === 'Other' && !newRoom.customType?.trim()) return setFormError("Please specify the custom room type.");
    if (newRoom.floor === 'Other' && !newRoom.customFloor?.trim()) return setFormError("Please specify the custom floor.");

    let selectedBuildingName = "";
    campuses.forEach(c => {
      const b = c.buildings.find(bld => bld.id === Number(newRoom.building_id));
      if (b) selectedBuildingName = b.name;
    });

    if (isBulkMode) {
      if (!newRoom.building_id) return setFormError("Please select a Building.");
      if (!newRoom.startNumber.trim()) return setFormError("Starting Number is required.");
      
      const count = Number(newRoom.count);
      if (!count || count < 1) return setFormError("Total Rooms must be at least 1.");
      if (count > 100) return setFormError("You can only bulk create up to 100 rooms at a time.");
      if (!newRoom.type) return setFormError("Please select a Room Type.");
      if (!newRoom.floor) return setFormError("Please select a Floor.");

      const conflictingRoom = rooms.find(r => r.building === selectedBuildingName && roomPreview.includes(r.roomNo));
      if (conflictingRoom) {
        return setFormError(`Conflict: Room "${conflictingRoom.roomNo}" already exists in this building.`);
      }
    } else {
      if (!newRoom.building_id) return setFormError("Please select a Building.");
      if (!newRoom.roomNo.trim()) return setFormError("Room Number is required.");
      if (!newRoom.type) return setFormError("Please select a Room Type.");
      if (!newRoom.floor) return setFormError("Please select a Floor.");

      const isDuplicate = rooms.some(r => r.id !== editingRoomId && r.building === selectedBuildingName && r.roomNo.toLowerCase() === newRoom.roomNo.trim().toLowerCase());
      if (isDuplicate) return setFormError(`Room "${newRoom.roomNo}" already exists in this building.`);
    }

    setEquipmentWizardStage(1);
  };

  // 🚀 STEP 2: FINALIZE API CALL (With Smart Targeted Equipment)
  const executeFinalSave = async (includeEquipment) => {
    const finalType = resolveFinalType(newRoom.type, newRoom.customType || '');
    const finalFloor = resolveFinalType(newRoom.floor, newRoom.customFloor || '');

    const baseEquipmentList = includeEquipment 
      ? equipmentList.filter(eq => eq.name.trim())
      : [];

    setSavingBulk(true);
    try {
      if (isBulkMode) {
        const promises = roomPreview.map(roomNo => {
          
          // Filter equipment specifically for THIS room, or items assigned to 'All'
          const roomSpecificEquipment = baseEquipmentList
            .filter(eq => !eq.targetRoom || eq.targetRoom === 'All' || eq.targetRoom === roomNo)
            .map(eq => ({ name: eq.name, quantity: eq.quantity, asset_id: eq.asset_id }));

          return infrastructureService.createRoom({
            roomNo,
            type: finalType,
            capacity: Number(newRoom.capacity) || 0,
            floor: finalFloor,
            block: newRoom.block,
            building_id: newRoom.building_id,
            equipment: roomSpecificEquipment
          });
        });
        await Promise.all(promises);
      } else {
        // Single Save Mode
        const singleEq = baseEquipmentList.map(eq => ({ name: eq.name, quantity: eq.quantity, asset_id: eq.asset_id }));
        const payload = {
          ...newRoom,
          roomNo: newRoom.roomNo.trim(),
          type: finalType,
          capacity: Number(newRoom.capacity) || 0,
          floor: finalFloor,
          equipment: singleEq
        };
        if (editingRoomId) {
          await infrastructureService.updateRoom(editingRoomId, payload);
        } else {
          await infrastructureService.createRoom(payload);
        }
      }
      cancelRoomForm();
      loadData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save room(s).");
      setEquipmentWizardStage(0);
    } finally {
      setSavingBulk(false);
    }
  };

  const handleEditRoom = (room) => {
    setFormError("");
    setEditingRoomId(room.id);
    setIsBulkMode(false);

    let b_id = '';
    campuses.forEach(c => {
      const found = c.buildings.find(bld => bld.name === room.building);
      if (found) b_id = found.id;
    });

    const isKnownType = ROOM_TYPES.includes(room.type);
    const isKnownFloor = FLOOR_OPTIONS.includes(room.floor);
    
    setNewRoom({
      roomNo: room.roomNo, startNumber: '', count: '',
      type: isKnownType ? (room.type || '') : 'Other',
      customType: isKnownType ? '' : (room.type || ''),
      capacity: room.cap || '',
      floor: isKnownFloor ? (room.floor || '') : 'Other',
      customFloor: isKnownFloor ? '' : (room.floor || ''),
      block: room.block || '',
      building_id: b_id
    });

    let loadedEq = [];
    try {
      if (typeof room.equipment === 'string') loadedEq = JSON.parse(room.equipment);
      else if (Array.isArray(room.equipment)) loadedEq = room.equipment;
    } catch (e) {}
    
    loadedEq = loadedEq.map(eq => ({
      ...eq,
      showCustom: !EQUIPMENT_OPTIONS.includes(eq.name) && eq.name !== '',
      targetRoom: 'All' // Default for UI purposes in edit mode
    }));

    setEquipmentList(loadedEq);
    setShowRoomForm(true);
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Delete this room?")) return;
    try { await infrastructureService.deleteRoom(id); loadData(); } catch (error) {}
  };

  const handleToggleStatus = async (type, id, currentStatus) => {
    try { await infrastructureService.toggleStatus(type, id, !currentStatus); loadData(); } catch (error) {}
  };

  // --- EQUIPMENT ---
  const addEquipmentRow = () => setEquipmentList([...equipmentList, { name: '', quantity: 1, asset_id: '', showCustom: false, targetRoom: 'All' }]);
  const updateEquipmentRow = (index, field, value) => {
    const updated = [...equipmentList];
    updated[index][field] = value;
    setEquipmentList(updated);
  };

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex justify-center items-center h-full min-h-screen">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-left relative">
      <div className="flex-1 p-8 overflow-y-auto max-w-10xl mx-auto">

        {/* ═══════════════════ CAMPUSES SECTION ═══════════════════ */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="p-5 flex justify-between items-center border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-lg">Campuses ({campuses.length})</h3>
            <button
              onClick={() => { cancelCampusForm(); setShowCampusForm(true); }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none"
            >
              <Plus size={16}/> Add Campus
            </button>
          </div>

          <div className="p-5 space-y-4">
            {showCampusForm && (
              <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-5 mb-6">
                <h4 className="text-sm font-bold text-emerald-700 mb-4">{editingCampusId ? 'Edit Campus' : 'New Campus'}</h4>
                {formError && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2"><AlertCircle size={16} /> {formError}</div>}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <InputField label="Name" required placeholder="South Campus" value={newCampus.name} onChange={(e) => setNewCampus({...newCampus, name: e.target.value})} />
                  <InputField label="Address" placeholder="123 Main St" value={newCampus.address} onChange={(e) => setNewCampus({...newCampus, address: e.target.value})} />
                  <SelectField label="Property" options={['Owned', 'Leased', 'Rented']} value={newCampus.property} onChange={(e) => setNewCampus({...newCampus, property: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={cancelCampusForm} className="px-5 py-2 rounded-lg text-slate-600 font-semibold text-sm bg-white border border-slate-200 hover:bg-slate-50 outline-none">Cancel</button>
                  <button onClick={handleSaveCampus} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 outline-none">
                    <CheckCircle2 size={16}/> {editingCampusId ? 'Update Campus' : 'Create Campus'}
                  </button>
                </div>
              </div>
            )}

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              {campuses.length === 0 && !showCampusForm && <p className="p-5 text-sm text-slate-500 text-center">No campuses added yet.</p>}
              {campuses.map(campus => (
                <div key={campus.id} className="bg-white">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <ToggleSwitch active={campus.active} onToggle={() => handleToggleStatus('campuses', campus.id, campus.active)} />
                      <h4 className="font-bold text-slate-800 text-[15px]">{campus.name}</h4>
                      <span className="text-xs text-slate-400 font-medium">{campus.property} • {campus.buildings.length} Buildings</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEditCampus(campus)} className="text-blue-500 hover:text-blue-700 outline-none"><Edit2 size={15}/></button>
                      <button onClick={() => handleDeleteCampus(campus.id)} className="text-red-400 hover:text-red-600 outline-none"><Trash2 size={15}/></button>
                      <ChevronDown size={16} className="text-slate-400 ml-1"/>
                    </div>
                  </div>

                  <div className="p-4 space-y-3 bg-white">
                    {campus.buildings.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100">
                        {editingBuildingId === b.id ? (
                          <div className="flex gap-2 w-full items-center">
                            <input type="text" value={editBuildingData.name} onChange={(e) => setEditBuildingData({...editBuildingData, name: e.target.value})} className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-sm" />
                            <input type="number" min="1" placeholder="Floors" value={editBuildingData.floors} onChange={(e) => setEditBuildingData({...editBuildingData, floors: e.target.value})} className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                            <input type="text" placeholder="Block" value={editBuildingData.block} onChange={(e) => setEditBuildingData({...editBuildingData, block: e.target.value})} className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                            <input type="number" min="0" placeholder="Rooms" value={editBuildingData.rooms} onChange={(e) => setEditBuildingData({...editBuildingData, rooms: e.target.value})} className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                            <button onClick={() => handleSaveBuildingEdit(campus.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition outline-none"><CheckCircle2 size={16}/></button>
                            <button onClick={() => setEditingBuildingId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-lg transition outline-none"><X size={16}/></button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <ToggleSwitch active={b.active} onToggle={() => handleToggleStatus('buildings', b.id, b.active)} />
                              <h5 className="font-semibold text-slate-800 text-sm">{b.name}</h5>
                              <span className="text-xs text-slate-400 font-medium">{b.floors} Floors {b.block ? `• Block ${b.block}` : ''} • {b.rooms} Rooms</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button onClick={() => handleEditBuilding(b)} className="text-blue-500 hover:text-blue-700 outline-none"><Edit2 size={15}/></button>
                              <button onClick={() => handleDeleteBuilding(b.id)} className="text-red-400 hover:text-red-600 outline-none"><Trash2 size={15}/></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {!editingBuildingId && (
                      <div className="flex gap-2 pt-2">
                        <input type="text" placeholder="Building name" value={buildingInputs[campus.id]?.name || ''} onChange={(e) => handleBuildingInputChange(campus.id, 'name', e.target.value)} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-sm" />
                        <input type="number" min="1" placeholder="Floors" value={buildingInputs[campus.id]?.floors || ''} onChange={(e) => handleBuildingInputChange(campus.id, 'floors', e.target.value)} className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                        <input type="text" placeholder="Block" value={buildingInputs[campus.id]?.block || ''} onChange={(e) => handleBuildingInputChange(campus.id, 'block', e.target.value)} className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                        <input type="number" min="0" placeholder="Rooms" value={buildingInputs[campus.id]?.rooms || ''} onChange={(e) => handleBuildingInputChange(campus.id, 'rooms', e.target.value)} className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" />
                        <button onClick={() => handleCreateBuilding(campus.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-1.5 font-semibold text-sm transition outline-none">
                          <Plus size={16}/> Add Building
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════ ROOMS SECTION ═══════════════════ */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8">
          <div className="p-5 flex justify-between items-center border-b border-slate-100">
            <h3 className="font-semibold text-slate-800 text-lg">Rooms ({rooms.length})</h3>
            <div className="flex gap-2">
              <button onClick={() => { cancelRoomForm(); setIsBulkMode(true); setShowRoomForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none shadow-sm shadow-emerald-200">
                <Warehouse size={16}/> Bulk Add
              </button>
              <button onClick={() => { cancelRoomForm(); setIsBulkMode(false); setShowRoomForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none shadow-sm shadow-blue-200">
                <Plus size={16}/> Add Single
              </button>
            </div>
          </div>

          <div className="p-5">
            {showRoomForm && (
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-6 mb-6 relative transition-all">
                
                {/* Form Header */}
                <div className="flex justify-between items-center mb-5 border-b border-blue-100/50 pb-4">
                  <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                    {editingRoomId ? <Edit2 size={18}/> : isBulkMode ? <Warehouse size={18}/> : <Plus size={18}/>}
                    {editingRoomId ? 'Edit Room Details' : isBulkMode ? 'Bulk Create Rooms' : 'Add Single Room'}
                  </h4>
                  {!editingRoomId && (
                    <div className="flex bg-blue-100/50 p-1 rounded-lg">
                      <button type="button" onClick={() => { setIsBulkMode(false); setFormError(""); }} className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all outline-none ${!isBulkMode ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-500 hover:text-blue-700'}`}>Single</button>
                      <button type="button" onClick={() => { setIsBulkMode(true); setFormError(""); }} className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all outline-none ${isBulkMode ? 'bg-white text-emerald-600 shadow-sm' : 'text-blue-500 hover:text-emerald-600'}`}>Bulk</button>
                    </div>
                  )}
                </div>

                {formError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16}/> {formError}
                  </div>
                )}

                {/* ── MAIN ROOM INPUTS ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
                  {isBulkMode ? (
                    <>
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Building <span className="text-red-500">*</span></label>
                        <select className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm transition-all shadow-sm" value={newRoom.building_id} onChange={(e) => setNewRoom({...newRoom, building_id: e.target.value})}>
                          <option value="">Select building...</option>
                          {campuses.map(c => (
                            <optgroup key={c.id} label={`Campus: ${c.name}`}>
                              {c.buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <InputField label="Start Number" type="text" placeholder="e.g. 101, A-101" value={newRoom.startNumber} onChange={(e) => setNewRoom({...newRoom, startNumber: e.target.value})} required />
                      </div>
                      <div className="md:col-span-2">
                        <InputField label="Total Rooms" type="number" min="1" max="100" placeholder="e.g. 10" value={newRoom.count} onChange={(e) => setNewRoom({...newRoom, count: e.target.value})} required />
                      </div>
                      <div className="md:col-span-4">
                        <DynamicTypeField
                          label="Type" options={ROOM_TYPES} value={newRoom.type} customValue={newRoom.customType || ''}
                          onTypeChange={handleRoomTypeChange} onCustomChange={(e) => setNewRoom({...newRoom, customType: e.target.value})}
                          placeholder="Specify custom type..." required
                        />
                      </div>

                      {/* REAL-TIME BULK PREVIEW BOX */}
                      {roomPreview.length > 0 && (
                        <div className="md:col-span-12 mt-1 p-4 bg-emerald-50 border border-emerald-200 rounded-lg shadow-sm">
                          <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
                            <Info size={14}/> Previewing {roomPreview.length} Rooms:
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {roomPreview.slice(0, 25).map(num => (
                              <span key={num} className="px-2 py-1 bg-white border border-emerald-200 text-emerald-700 text-[11px] font-black rounded-md shadow-sm">{num}</span>
                            ))}
                            {roomPreview.length > 25 && <span className="px-2 py-1 bg-transparent text-emerald-600 text-[11px] font-black rounded-md">...and {roomPreview.length - 25} more</span>}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="md:col-span-4 flex flex-col gap-1.5">
                        <label className="text-xs font-bold text-slate-600">Building <span className="text-red-500">*</span></label>
                        <select className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm transition-all shadow-sm" value={newRoom.building_id} onChange={(e) => setNewRoom({...newRoom, building_id: e.target.value})}>
                          <option value="">Select building...</option>
                          {campuses.map(c => (
                            <optgroup key={c.id} label={`Campus: ${c.name}`}>
                              {c.buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <InputField label="Room Number" value={newRoom.roomNo} onChange={(e) => setNewRoom({...newRoom, roomNo: e.target.value})} required />
                      </div>
                      <div className="md:col-span-4">
                        <DynamicTypeField
                          label="Type" options={ROOM_TYPES} value={newRoom.type} customValue={newRoom.customType || ''}
                          onTypeChange={handleRoomTypeChange} onCustomChange={(e) => setNewRoom({...newRoom, customType: e.target.value})}
                          placeholder="Specify custom type..." required
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-2">
                  <InputField label="Capacity" type="number" min="0" placeholder="e.g. 60" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})} />
                  
                  <DynamicTypeField
                    label="Floor" options={FLOOR_OPTIONS} value={newRoom.floor} customValue={newRoom.customFloor || ''}
                    onTypeChange={handleFloorChange} onCustomChange={(e) => setNewRoom({...newRoom, customFloor: e.target.value})}
                    placeholder="Specify custom floor..." required
                  />

                  <InputField label="Block" placeholder="e.g. Main" value={newRoom.block} onChange={(e) => setNewRoom({...newRoom, block: e.target.value})} />
                </div>

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 pt-6 border-t border-blue-100/50 mt-4">
                  <button onClick={cancelRoomForm} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 outline-none transition-colors">Cancel</button>
                  <button
                    onClick={handlePreSaveValidation}
                    className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 flex items-center gap-2 outline-none transition-all shadow-md shadow-blue-200"
                  >
                    Next <ChevronRight size={16} className="-ml-1"/>
                  </button>
                </div>
              </div>
            )}

            {/* ── Room List ── */}
            <div className="border border-slate-100 bg-slate-50 rounded-xl p-1">
              {rooms.length === 0 && !showRoomForm && (
                <p className="p-8 text-sm text-slate-500 font-bold text-center">No rooms added yet. Click "Add Room" or "Bulk Add" to get started.</p>
              )}
              {rooms.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all group mb-2">
                  <div className="flex items-center gap-4">
                    <ToggleSwitch active={r.active} onToggle={() => handleToggleStatus('rooms', r.id, r.active)} />
                    <span className="font-black text-slate-800 text-[15px] w-16">{r.roomNo}</span>
                    <span className="px-3 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-black uppercase tracking-wider">{r.type || 'Standard'}</span>
                    <span className="text-sm text-slate-500 font-bold ml-2 flex items-center gap-2">
                      <Users size={14} className="text-slate-400"/> {r.cap || 0}
                      <span className="text-slate-300">|</span>
                      Floor: {r.floor || '-'} {r.block ? `(${r.block})` : ''}
                      <span className="text-slate-300">|</span>
                      <Building2 size={14} className="text-slate-400"/> <span className="text-slate-700">{r.building}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold flex items-center gap-1.5">
                      <Package size={12}/> {r.eq || 0}
                    </span>
                    <button onClick={() => handleEditRoom(r)} className="text-slate-400 hover:text-blue-600 outline-none p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteRoom(r.id)} className="text-slate-400 hover:text-red-600 outline-none p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>

      {/* 🚀 WIZARD MODALS (Success Prompt & Targeted Equipment Form) */}
      {equipmentWizardStage > 0 && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* STAGE 1: Success Prompt */}
            {equipmentWizardStage === 1 && (
              <div className="p-8 text-center max-w-lg mx-auto">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">
                  {isBulkMode ? `${newRoom.count} Rooms Successfully Generated!` : `Room Generated!`}
                </h2>
                <p className="text-slate-500 mb-8">
                  The room details are ready to be saved. Would you like to assign specific equipment (like Laptops or Projectors) to {isBulkMode ? 'these rooms' : 'this room'} before finalizing?
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={() => executeFinalSave(false)} disabled={savingBulk} className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                    No, Just Save Rooms
                  </button>
                  <button onClick={() => setEquipmentWizardStage(2)} disabled={savingBulk} className="px-6 py-2.5 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">
                    Yes, Assign Equipment
                  </button>
                </div>
              </div>
            )}

            {/* STAGE 2: Targeted Equipment Dropdown Form */}
            {equipmentWizardStage === 2 && (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                      <Package size={20} className="text-blue-600"/> Assign Equipment
                    </h3>
                    {isBulkMode && (
                      <p className="text-xs text-slate-500 mt-1">You can assign items to all generated rooms, or pick a specific room.</p>
                    )}
                  </div>
                  <button onClick={() => setEquipmentWizardStage(0)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>

                <div className="max-h-[50vh] overflow-y-auto pr-2 space-y-3 mb-4">
                    {equipmentList.length === 0 && <p className="text-sm text-slate-500 italic mb-2 text-center py-4 border border-dashed border-slate-200 rounded-lg">Click below to add equipment items.</p>}
                    
                    {equipmentList.map((eq, idx) => {
                      const isKnown = EQUIPMENT_OPTIONS.includes(eq.name);
                      const showCustom = (!isKnown && eq.name !== '') || eq.showCustom;

                      return (
                        <div key={idx} className="flex flex-col gap-2 p-4 border border-slate-200 rounded-xl bg-slate-50 relative group">
                          
                          {/* Top Row: Item & Target selection */}
                          <div className="flex gap-3 items-start">
                            {/* Equipment Selection */}
                            <div className="flex-1 flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Item</label>
                              <select
                                value={showCustom ? 'Other' : (eq.name || '')}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (val === 'Other') {
                                    updateEquipmentRow(idx, 'name', '');
                                    updateEquipmentRow(idx, 'showCustom', true);
                                  } else {
                                    updateEquipmentRow(idx, 'name', val);
                                    updateEquipmentRow(idx, 'showCustom', false);
                                  }
                                }}
                                className="px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 shadow-sm bg-white"
                              >
                                <option value="" disabled>Select Item...</option>
                                {EQUIPMENT_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              {showCustom && (
                                <input type="text" placeholder="Custom equipment..." value={eq.name} onChange={(e) => updateEquipmentRow(idx, 'name', e.target.value)} className="px-3 py-2 mt-1 border border-blue-300 bg-blue-50 rounded-lg text-sm outline-none focus:border-blue-500 shadow-sm" autoFocus />
                              )}
                            </div>

                            {/* 🚀 TARGET ROOM DROPDOWN (Only visible in Bulk Mode) */}
                            {isBulkMode && (
                              <div className="flex-1 flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Assign To</label>
                                <select
                                  value={eq.targetRoom || 'All'}
                                  onChange={(e) => updateEquipmentRow(idx, 'targetRoom', e.target.value)}
                                  className={`px-3 py-2 border rounded-lg text-sm outline-none shadow-sm ${eq.targetRoom !== 'All' ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold' : 'bg-white border-slate-200 focus:border-blue-400'}`}
                                >
                                  <option value="All">Every Generated Room</option>
                                  <optgroup label="Specific Rooms Only:">
                                    {roomPreview.map(r => <option key={r} value={r}>Room {r}</option>)}
                                  </optgroup>
                                </select>
                              </div>
                            )}
                          </div>

                          {/* Bottom Row: Specs */}
                          <div className="flex gap-3 items-center">
                            <div className="w-24">
                              <input type="number" min="1" placeholder="Qty" value={eq.quantity} onChange={(e) => updateEquipmentRow(idx, 'quantity', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-blue-400 shadow-sm bg-white" />
                            </div>
                            <div className="flex-1">
                              <input type="text" placeholder="Asset ID (Optional)" value={eq.asset_id} onChange={(e) => updateEquipmentRow(idx, 'asset_id', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 shadow-sm bg-white" />
                            </div>
                            <button onClick={() => setEquipmentList(equipmentList.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 p-2 outline-none rounded-lg transition-colors"><Trash2 size={18}/></button>
                          </div>

                        </div>
                      );
                    })}
                    
                    <button onClick={addEquipmentRow} className="w-full bg-blue-50 text-blue-600 border border-blue-100 py-3 rounded-xl font-bold hover:bg-blue-100 flex items-center justify-center gap-2 text-sm outline-none transition-colors mt-2">
                      <Plus size={16}/> Add Another Equipment Item
                    </button>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  <button onClick={() => setEquipmentWizardStage(0)} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50">Cancel</button>
                  <button onClick={() => executeFinalSave(true)} disabled={savingBulk} className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 flex items-center gap-2 shadow-md shadow-emerald-200">
                    {savingBulk ? <Loader2 size={16} className="animate-spin"/> : <CheckCircle2 size={16}/>}
                    Finalize & Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfrastructurePage;