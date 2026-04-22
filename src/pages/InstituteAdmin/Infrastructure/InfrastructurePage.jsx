import React, { useState, useEffect } from 'react';
import { 
  Building2, Warehouse, Trash2, Plus, CheckCircle2, ChevronRight, ChevronDown,
  LayoutDashboard, GraduationCap, Users, Palette, Edit2, Loader2, Package, X
} from 'lucide-react';
import { infrastructureService } from '../../../services/infrastructureService';
import apiBaseUrl from "../../../config/baseurl";

const InfrastructurePage = () => {
  // --- DATA STATES ---
  const [loading, setLoading] = useState(true);
  const [campuses, setCampuses] = useState([]);
  const [rooms, setRooms] = useState([]);

  // --- UI TOGGLE STATES ---
  const [showCampusForm, setShowCampusForm] = useState(false);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [isBulkMode, setIsBulkMode] = useState(false); 
  const [savingBulk, setSavingBulk] = useState(false);

  // --- EDITING STATES ---
  const [editingCampusId, setEditingCampusId] = useState(null);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [editingBuildingId, setEditingBuildingId] = useState(null);
  const [editBuildingData, setEditBuildingData] = useState({ name: '', floors: '', block: '', rooms: '' });

  // --- FORM STATES ---
  const [newCampus, setNewCampus] = useState({ name: '', address: '', property: 'Owned' });
  const [buildingInputs, setBuildingInputs] = useState({}); 
  
  // 🚀 FIXED: Removed prefix from state
  const [newRoom, setNewRoom] = useState({ 
    roomNo: '', startNumber: '', count: '', 
    type: '', capacity: '', floor: '', block: '', building_id: '' 
  });
  const [equipmentList, setEquipmentList] = useState([]);

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

  // --- SAVE HANDLERS (Handles both Create & Update) ---
  const handleSaveCampus = async () => {
    if (!newCampus.name) return alert("Campus Name is required");
    try {
      if (editingCampusId) {
        await infrastructureService.updateCampus(editingCampusId, newCampus);
      } else {
        await infrastructureService.createCampus(newCampus);
      }
      setShowCampusForm(false);
      setEditingCampusId(null);
      setNewCampus({ name: '', address: '', property: 'Owned' });
      loadData();
    } catch (error) { console.error("Error saving campus", error); }
  };

  // 🚀 FIXED: Removed prefix generation logic
  const handleSaveRoom = async () => {
    if (isBulkMode) {
      if (!newRoom.startNumber || !newRoom.count || !newRoom.building_id) {
        return alert("Starting Number, Number of Rooms, and Building are required for Bulk Add.");
      }
      setSavingBulk(true);
      try {
        const count = Number(newRoom.count);
        const startStr = String(newRoom.startNumber);
        const padLength = startStr.length; // Intelligent Zero-Padding
        const startNum = Number(startStr);

        const promises = [];
        
        for(let i = 0; i < count; i++) {
          const currentNum = startNum + i;
          const paddedNum = String(currentNum).padStart(padLength, '0');
          const generatedRoomNo = paddedNum; // Prefix removed completely

          const payload = {
            roomNo: generatedRoomNo,
            type: newRoom.type,
            capacity: Number(newRoom.capacity) || 0,
            floor: newRoom.floor,
            block: newRoom.block,
            building_id: newRoom.building_id,
            equipment: equipmentList.filter(eq => eq.name)
          };
          promises.push(infrastructureService.createRoom(payload));
        }

        await Promise.all(promises);
        
        setShowRoomForm(false);
        setIsBulkMode(false);
        setNewRoom({ roomNo: '', startNumber: '', count: '', type: '', capacity: '', floor: '', block: '', building_id: '' });
        setEquipmentList([]);
        loadData();
      } catch (err) {
        console.error("Error bulk saving rooms", err);
        alert("Failed to create some or all rooms. Please check your backend constraints.");
      } finally {
        setSavingBulk(false);
      }
    } else {
      if (!newRoom.roomNo || !newRoom.building_id) return alert("Room Number and Building are required");
      try {
        const payload = {
          ...newRoom,
          capacity: Number(newRoom.capacity) || 0,
          equipment: equipmentList.filter(eq => eq.name) 
        };

        if (editingRoomId) {
          await infrastructureService.updateRoom(editingRoomId, payload);
        } else {
          await infrastructureService.createRoom(payload);
        }
        
        setShowRoomForm(false);
        setEditingRoomId(null);
        setNewRoom({ roomNo: '', startNumber: '', count: '', type: '', capacity: '', floor: '', block: '', building_id: '' });
        setEquipmentList([]);
        loadData();
      } catch (error) { console.error("Error saving room", error); }
    }
  };

  const handleCreateBuilding = async (campusId) => {
    const bData = buildingInputs[campusId];
    if (!bData?.name) return alert("Building name required");
    try {
      await infrastructureService.createBuilding({
        campus_id: campusId,
        name: bData.name,
        floors: bData.floors || 1,
        block: bData.block || '',
        rooms: bData.rooms || 0
      });
      setBuildingInputs(prev => ({ ...prev, [campusId]: { name: '', floors: '', block: '', rooms: '' } }));
      loadData();
    } catch (error) { console.error("Error creating building", error); }
  };

  const handleSaveBuildingEdit = async (campusId) => {
    if (!editBuildingData.name) return alert("Building name required");
    try {
      await infrastructureService.updateBuilding(editingBuildingId, {
        campus_id: campusId,
        ...editBuildingData
      });
      setEditingBuildingId(null);
      loadData();
    } catch (error) { console.error("Error updating building", error); }
  };

  const handleBuildingInputChange = (campusId, field, value) => {
    setBuildingInputs(prev => ({
      ...prev,
      [campusId]: { ...prev[campusId], [field]: value }
    }));
  };

  const handleToggleStatus = async (type, id, currentStatus) => {
    try {
      await infrastructureService.toggleStatus(type, id, !currentStatus);
      loadData(); 
    } catch (error) { console.error("Error toggling status", error); }
  };

  // --- DELETE HANDLERS ---
  const handleDeleteCampus = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campus? All buildings and rooms inside will be deleted.")) return;
    try {
      await infrastructureService.deleteCampus(id);
      loadData();
    } catch (error) { console.error("Error deleting campus", error); }
  };

  const handleDeleteBuilding = async (id) => {
    if (!window.confirm("Are you sure you want to delete this building?")) return;
    try {
      await infrastructureService.deleteBuilding(id);
      loadData();
    } catch (error) { console.error("Error deleting building", error); }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm("Are you sure you want to delete this room?")) return;
    try {
      await infrastructureService.deleteRoom(id);
      loadData();
    } catch (error) { console.error("Error deleting room", error); }
  };

  // --- EDIT TRIGGER HANDLERS ---
  const handleEditCampus = (campus) => {
    setEditingCampusId(campus.id);
    setNewCampus({ name: campus.name, address: campus.address || '', property: campus.property });
    setShowCampusForm(true);
  };

  const handleEditBuilding = (building) => {
    setEditingBuildingId(building.id);
    setEditBuildingData({
      name: building.name,
      floors: building.floors || '',
      block: building.block || '',
      rooms: building.rooms || ''
    });
  };

  const handleEditRoom = (room) => {
    setEditingRoomId(room.id);
    setIsBulkMode(false); 
    
    let b_id = '';
    campuses.forEach(c => {
      const found = c.buildings.find(bld => bld.name === room.building);
      if (found) b_id = found.id;
    });

    setNewRoom({ 
      roomNo: room.roomNo, startNumber: '', count: '',
      type: room.type, 
      capacity: room.cap || '', 
      floor: room.floor || '', 
      block: room.block || '', 
      building_id: b_id 
    });
    setEquipmentList([]); 
    setShowRoomForm(true);
  };

  // --- EQUIPMENT LIST MANAGERS ---
  const addEquipmentRow = () => {
    setEquipmentList([...equipmentList, { name: '', quantity: 1, asset_id: '' }]);
  };
  
  const updateEquipmentRow = (index, field, value) => {
    const updated = [...equipmentList];
    updated[index][field] = value;
    setEquipmentList(updated);
  };

  const cancelCampusForm = () => {
    setShowCampusForm(false);
    setEditingCampusId(null);
    setNewCampus({ name: '', address: '', property: 'Owned' });
  };

  const cancelRoomForm = () => {
    setShowRoomForm(false);
    setEditingRoomId(null);
    setIsBulkMode(false);
    setNewRoom({ roomNo: '', startNumber: '', count: '', type: '', capacity: '', floor: '', block: '', building_id: '' });
    setEquipmentList([]);
  };

  if (loading) return <div className="flex justify-center items-center h-full min-h-screen"><Loader2 className="animate-spin text-blue-500" size={40} /></div>;

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-left">
      <div className="flex-1 p-8 overflow-y-auto max-w-10xl mx-auto text-left">
        
        {/* --- CAMPUSES SECTION --- */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 text-left">
          <div className="p-5 flex justify-between items-center border-b border-slate-100 text-left">
            <h3 className="font-semibold text-slate-800 text-lg">Campuses ({campuses.length})</h3>
            <button onClick={() => { cancelCampusForm(); setShowCampusForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none">
              <Plus size={16}/> Add Campus
            </button>
          </div>

          <div className="p-5 space-y-4 text-left">
            {/* ADD/EDIT CAMPUS FORM */}
            {showCampusForm && (
              <div className="bg-emerald-50/30 border border-emerald-200 rounded-xl p-5 mb-6 text-left">
                <h4 className="text-sm font-bold text-emerald-700 mb-4 text-left">
                  {editingCampusId ? 'Edit Campus' : 'New Campus'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-left">
                  <InputField label="Name" required placeholder="South Campus" value={newCampus.name} onChange={(e) => setNewCampus({...newCampus, name: e.target.value})} />
                  <InputField label="Address" placeholder="123 Main St" value={newCampus.address} onChange={(e) => setNewCampus({...newCampus, address: e.target.value})} />
                  <SelectField label="Property" options={['Owned', 'Leased', 'Rented']} value={newCampus.property} onChange={(e) => setNewCampus({...newCampus, property: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3 mt-2 text-left">
                  <button onClick={cancelCampusForm} className="px-5 py-2 rounded-lg text-slate-600 font-semibold text-sm bg-white border border-slate-200 hover:bg-slate-50 outline-none">Cancel</button>
                  <button onClick={handleSaveCampus} className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 outline-none">
                    <CheckCircle2 size={16}/> {editingCampusId ? 'Update Campus' : 'Create Campus'}
                  </button>
                </div>
              </div>
            )}

            {/* CAMPUS LIST */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-left">
              {campuses.length === 0 && !showCampusForm && <p className="p-5 text-sm text-slate-500 text-center">No campuses added yet.</p>}
              
              {campuses.map(campus => (
                <div key={campus.id} className="bg-white text-left">
                  <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100 text-left">
                    <div className="flex items-center gap-3 text-left">
                      <ToggleSwitch active={campus.active} onToggle={() => handleToggleStatus('campuses', campus.id, campus.active)} />
                      <h4 className="font-bold text-slate-800 text-[15px]">{campus.name}</h4>
                      <span className="text-xs text-slate-400 font-medium">{campus.property} • {campus.buildings.length} Buildings</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <button onClick={() => handleEditCampus(campus)} className="text-blue-500 hover:text-blue-700 outline-none"><Edit2 size={15}/></button>
                      <button onClick={() => handleDeleteCampus(campus.id)} className="text-red-400 hover:text-red-600 outline-none"><Trash2 size={15}/></button>
                      <ChevronDown size={16} className="text-slate-400 ml-1"/>
                    </div>
                  </div>

                  {/* Buildings under Campus */}
                  <div className="p-4 space-y-3 bg-white text-left">
                    {campus.buildings.map(b => (
                      <div key={b.id} className="flex items-center justify-between p-3.5 rounded-lg border border-slate-100 text-left">
                        {editingBuildingId === b.id ? (
                          <div className="flex gap-2 w-full items-center text-left">
                            <input 
                              type="text" value={editBuildingData.name} onChange={(e) => setEditBuildingData({...editBuildingData, name: e.target.value})} 
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-sm" 
                            />
                            <input 
                              type="number" placeholder="Floors" value={editBuildingData.floors} onChange={(e) => setEditBuildingData({...editBuildingData, floors: e.target.value})} 
                              className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                            />
                            <input 
                              type="text" placeholder="Block" value={editBuildingData.block} onChange={(e) => setEditBuildingData({...editBuildingData, block: e.target.value})} 
                              className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                            />
                            <input 
                              type="number" placeholder="Rooms" value={editBuildingData.rooms} onChange={(e) => setEditBuildingData({...editBuildingData, rooms: e.target.value})} 
                              className="w-20 px-3 py-2 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                            />
                            <button onClick={() => handleSaveBuildingEdit(campus.id)} className="bg-emerald-500 hover:bg-emerald-600 text-white p-2 rounded-lg transition outline-none">
                              <CheckCircle2 size={16} />
                            </button>
                            <button onClick={() => setEditingBuildingId(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-600 p-2 rounded-lg transition outline-none">
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-3 text-left">
                              <ToggleSwitch active={b.active} onToggle={() => handleToggleStatus('buildings', b.id, b.active)} />
                              <h5 className="font-semibold text-slate-800 text-sm">{b.name}</h5>
                              <span className="text-xs text-slate-400 font-medium">
                                {b.floors} Floors {b.block ? `• Block ${b.block}` : ''} • {b.rooms} Rooms
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-right">
                              <button onClick={() => handleEditBuilding(b)} className="text-blue-500 hover:text-blue-700 outline-none"><Edit2 size={15}/></button>
                              <button onClick={() => handleDeleteBuilding(b.id)} className="text-red-400 hover:text-red-600 outline-none"><Trash2 size={15}/></button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}

                    {/* Inline Add Building Row */}
                    {!editingBuildingId && (
                      <div className="flex gap-2 pt-2 text-left">
                        <input 
                          type="text" placeholder="Building name" 
                          value={buildingInputs[campus.id]?.name || ''} 
                          onChange={(e) => handleBuildingInputChange(campus.id, 'name', e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 text-sm text-left" 
                        />
                        <input 
                          type="number" placeholder="Floors" 
                          value={buildingInputs[campus.id]?.floors || ''} 
                          onChange={(e) => handleBuildingInputChange(campus.id, 'floors', e.target.value)}
                          className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                        />
                        <input 
                          type="text" placeholder="Block" 
                          value={buildingInputs[campus.id]?.block || ''} 
                          onChange={(e) => handleBuildingInputChange(campus.id, 'block', e.target.value)}
                          className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                        />
                        <input 
                          type="number" placeholder="Rooms" 
                          value={buildingInputs[campus.id]?.rooms || ''} 
                          onChange={(e) => handleBuildingInputChange(campus.id, 'rooms', e.target.value)}
                          className="w-20 px-3 py-2.5 rounded-lg border border-slate-200 outline-none text-sm text-center" 
                        />
                        <button onClick={() => handleCreateBuilding(campus.id)} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-1.5 font-semibold text-sm transition outline-none">
                          <Plus size={16} /> Add Building
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- ROOMS SECTION --- */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm mb-8 text-left">
          <div className="p-5 flex justify-between items-center border-b border-slate-100 text-left">
            <h3 className="font-semibold text-slate-800 text-lg">Rooms ({rooms.length})</h3>
            <div className="flex gap-2 text-right">
              <button onClick={() => { cancelRoomForm(); setIsBulkMode(true); setShowRoomForm(true); }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none shadow-sm shadow-emerald-200">
                <Warehouse size={16}/> Bulk Add
              </button>
              <button onClick={() => { cancelRoomForm(); setIsBulkMode(false); setShowRoomForm(true); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 transition outline-none shadow-sm shadow-blue-200">
                <Plus size={16}/> Add Single
              </button>
            </div>
          </div>

          <div className="p-5 text-left">
            {/* ADD/EDIT ROOM FORM */}
            {showRoomForm && (
              <div className="bg-blue-50/40 border border-blue-100 rounded-xl p-6 mb-6 text-left relative transition-all">
                
                <div className="flex justify-between items-center mb-5 border-b border-blue-100/50 pb-4">
                  <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                    {editingRoomId ? <Edit2 size={18}/> : isBulkMode ? <Warehouse size={18}/> : <Plus size={18}/>}
                    {editingRoomId ? 'Edit Room Details' : isBulkMode ? 'Bulk Create Rooms' : 'Add Single Room'}
                  </h4>
                  
                  {!editingRoomId && (
                    <div className="flex bg-blue-100/50 p-1 rounded-lg">
                      <button onClick={() => setIsBulkMode(false)} type="button" className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all outline-none ${!isBulkMode ? 'bg-white text-blue-700 shadow-sm' : 'text-blue-500 hover:text-blue-700'}`}>Single</button>
                      <button onClick={() => setIsBulkMode(true)} type="button" className={`px-4 py-1.5 text-[11px] uppercase tracking-wider font-bold rounded-md transition-all outline-none ${isBulkMode ? 'bg-white text-emerald-600 shadow-sm' : 'text-blue-500 hover:text-emerald-600'}`}>Bulk</button>
                    </div>
                  )}
                </div>

                {/* 🚀 FIXED: Dynamic Top Grid for Building, Room Numbers, and Type */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5 text-left">
                  {isBulkMode ? (
                    <>
                      {/* Building Dropdown directly replaced prefix */}
                      <div className="md:col-span-3 flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-bold text-slate-600 text-left">Building <span className="text-red-500">*</span></label>
                        <select 
                          className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm text-left transition-all shadow-sm w-full"
                          value={newRoom.building_id} onChange={(e) => setNewRoom({...newRoom, building_id: e.target.value})}
                        >
                          <option value="">Select building...</option>
                          {campuses.map(c => (
                            <optgroup key={c.id} label={`Campus: ${c.name}`}>
                              {c.buildings.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-3">
                        <InputField label="Start Number" placeholder="e.g. 101 or 01" value={newRoom.startNumber} onChange={(e) => setNewRoom({...newRoom, startNumber: e.target.value})} required />
                      </div>
                      <div className="md:col-span-3">
                        <InputField label="Total Rooms" type="number" placeholder="e.g. 32" value={newRoom.count} onChange={(e) => setNewRoom({...newRoom, count: e.target.value})} required />
                      </div>
                      <div className="md:col-span-3">
                        <InputField label="Type" placeholder="e.g. Classroom" value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} />
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Building Dropdown for single form */}
                      <div className="md:col-span-4 flex flex-col gap-1.5 text-left">
                        <label className="text-xs font-bold text-slate-600 text-left">Building <span className="text-red-500">*</span></label>
                        <select 
                          className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm text-left transition-all shadow-sm w-full"
                          value={newRoom.building_id} onChange={(e) => setNewRoom({...newRoom, building_id: e.target.value})}
                        >
                          <option value="">Select building...</option>
                          {campuses.map(c => (
                            <optgroup key={c.id} label={`Campus: ${c.name}`}>
                              {c.buildings.map(b => (
                                <option key={b.id} value={b.id}>{b.name}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </div>
                      <div className="md:col-span-4">
                        <InputField label="Room Number" value={newRoom.roomNo} onChange={(e) => setNewRoom({...newRoom, roomNo: e.target.value})} required />
                      </div>
                      <div className="md:col-span-4">
                        <InputField label="Type" placeholder="e.g. Classroom, Lab..." value={newRoom.type} onChange={(e) => setNewRoom({...newRoom, type: e.target.value})} />
                      </div>
                    </>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5 text-left">
                  <InputField label="Capacity" type="number" placeholder="e.g. 60" value={newRoom.capacity} onChange={(e) => setNewRoom({...newRoom, capacity: e.target.value})} />
                  <InputField label="Floor" placeholder="e.g. Ground, 1st..." value={newRoom.floor} onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})} />
                  <InputField label="Block" placeholder="e.g. Main" value={newRoom.block} onChange={(e) => setNewRoom({...newRoom, block: e.target.value})} />
                </div>

                <div className="border border-slate-200 bg-white rounded-lg p-5 mb-5 shadow-sm text-left mt-3">
                  <p className="text-xs font-bold text-slate-600 mb-3 text-left">Default Equipment ({equipmentList.length}) {isBulkMode && <span className="text-emerald-500 ml-2 italic font-medium">— Will be duplicated across all {newRoom.count || '0'} rooms</span>}</p>
                  {equipmentList.map((eq, idx) => (
                    <div key={idx} className="flex gap-3 items-center mb-3 text-left">
                      <input type="text" placeholder="Equipment Name (e.g. Projector)" value={eq.name} onChange={(e) => updateEquipmentRow(idx, 'name', e.target.value)} className="flex-1 px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 text-left shadow-sm" />
                      <input type="number" placeholder="Qty" value={eq.quantity} onChange={(e) => updateEquipmentRow(idx, 'quantity', e.target.value)} className="w-24 px-3 py-2.5 border border-slate-200 rounded-lg text-sm text-center outline-none focus:border-blue-400 shadow-sm" />
                      <input type="text" placeholder="Asset ID (Optional)" value={eq.asset_id} onChange={(e) => updateEquipmentRow(idx, 'asset_id', e.target.value)} className="w-40 px-3 py-2.5 border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 text-left shadow-sm" />
                      <button onClick={() => setEquipmentList(equipmentList.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 p-2 outline-none hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={18}/></button>
                    </div>
                  ))}
                  <button onClick={addEquipmentRow} className="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg font-bold hover:bg-slate-200 flex items-center justify-center text-xs outline-none transition-colors mt-1">
                    + Add Equipment Item
                  </button>
                </div>

                <div className="flex justify-end gap-3 text-right pt-2 border-t border-blue-100/50">
                  <button onClick={cancelRoomForm} className="px-5 py-2.5 rounded-lg text-slate-600 font-bold text-sm bg-white border border-slate-200 hover:bg-slate-50 outline-none transition-colors">Cancel</button>
                  <button onClick={handleSaveRoom} disabled={savingBulk} className={`px-6 py-2.5 rounded-lg text-white font-bold text-sm flex items-center gap-2 outline-none transition-all disabled:opacity-70 shadow-md ${isBulkMode ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
                    {savingBulk ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18}/>} 
                    {editingRoomId ? 'Update Room' : isBulkMode ? `Create ${newRoom.count || '0'} Rooms` : 'Save Room'}
                  </button>
                </div>
              </div>
            )}

            {/* ROOM LIST */}
            <div className="border border-slate-100 bg-slate-50 rounded-xl text-left p-1">
              {rooms.length === 0 && !showRoomForm && <p className="p-8 text-sm text-slate-500 font-bold text-center">No rooms added yet. Click "Add Room" or "Bulk Add" to get started.</p>}
              
              {rooms.map(r => (
                <div key={r.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow transition-all group mb-2 text-left">
                  <div className="flex items-center gap-4 text-left">
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
                  <div className="flex items-center gap-4 text-right">
                    <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 border border-amber-100 rounded font-bold flex items-center gap-1.5">
                      <Package size={12}/> {r.eq || 0}
                    </span>
                    <button onClick={() => handleEditRoom(r)} className="text-slate-400 hover:text-blue-600 outline-none p-1.5 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => handleDeleteRoom(r.id)} className="text-slate-400 hover:text-red-600 outline-none p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16}/></button>
                    <button className="text-slate-400 group-hover:text-slate-600 outline-none"><ChevronRight size={18}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const ToggleSwitch = ({ active, onToggle }) => (
  <div onClick={onToggle} className={`w-10 h-[22px] rounded-full flex items-center px-0.5 cursor-pointer transition-colors outline-none shadow-inner ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
    <div className={`w-[18px] h-[18px] bg-white rounded-full shadow-sm transform transition-transform duration-200 ${active ? 'translate-x-[18px]' : 'translate-x-0'}`}></div>
  </div>
);

const InputField = ({ label, placeholder, required, type="text", value, onChange }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-xs font-bold text-slate-600 text-left">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <input type={type} placeholder={placeholder} value={value} onChange={onChange} className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm text-left transition-all shadow-sm" />
  </div>
);

const SelectField = ({ label, options, required, value, onChange }) => (
  <div className="flex flex-col gap-1.5 w-full text-left">
    <label className="text-xs font-bold text-slate-600 text-left">{label}{required && <span className="text-red-500 ml-0.5">*</span>}</label>
    <select value={value} onChange={onChange} className="px-3 py-2.5 rounded-lg border border-slate-200 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-white text-sm text-left transition-all shadow-sm">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default InfrastructurePage;