import React, { useState } from 'react';
import { dbService } from '../db/dbService';
import { Store, InventoryItem, InventoryTransaction, StockTransfer } from '../types';
import { Package, Truck, ArrowLeftRight, Clipboard, Plus, ShieldAlert, Check, RefreshCw, Layers, CheckCircle2, Search, ShoppingBag } from 'lucide-react';

interface InventoryManagementProps {
  lang: 'en' | 'bn';
  addAuditLog: (action: string, table: string, descEn: string, descBn: string) => void;
}

export default function InventoryManagement({
  lang,
  addAuditLog
}: InventoryManagementProps) {
  const [stores, setStores] = useState<Store[]>(() => dbService.stores.getAll());
  const [items, setItems] = useState<InventoryItem[]>(() => dbService.inventoryItems.getAll());
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => dbService.inventoryTransactions.getAll());
  const [transfers, setTransfers] = useState<StockTransfer[]>(() => dbService.stockTransfers.getAll());

  // Navigation states
  const [activeTab, setActiveTab] = useState<'register' | 'receive' | 'issue' | 'transfer' | 'adjust'>('register');
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Processing Form States
  const [formData, setFormData] = useState({
    storeId: stores[0]?.id || '',
    itemId: items[0]?.id || '',
    category: 'Cement' as InventoryItem['category'],
    nameEn: '',
    nameBn: '',
    quantity: 1,
    referenceNo: '',
    remarks: '',
    fromStoreId: stores[0]?.id || '',
    toStoreId: stores[1]?.id || '',
    adjustType: 'Discrepancy' as 'Discrepancy' | 'Damage' | 'Correction',
    adjustDirection: 'Subtract' as 'Add' | 'Subtract'
  });

  const categories = ['Rod', 'Cement', 'Brick', 'Sand', 'Stone', 'Paint', 'Tiles', 'Electrical', 'Plumbing'];

  // Filter items based on store and category and search
  const filteredItems = items.filter(item => {
    const storeMatch = selectedStoreId === 'all' || item.storeId === selectedStoreId;
    const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
    const textMatch = searchQuery === '' || 
      item.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.nameBn.includes(searchQuery);
    return storeMatch && catMatch && textMatch;
  });

  // Action handlers
  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameEn || !formData.nameBn) return;

    const newItem: InventoryItem = {
      id: `item-${Date.now()}`,
      storeId: formData.storeId,
      nameEn: formData.nameEn,
      nameBn: formData.nameBn,
      category: formData.category,
      openingStock: formData.quantity,
      received: formData.quantity,
      issued: 0,
      returned: 0,
      balance: formData.quantity,
      unit: getUnitForCategory(formData.category)
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    dbService.inventoryItems.saveAll(updatedItems);

    // Save transaction
    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      itemId: newItem.id,
      itemName: newItem.nameEn,
      storeId: newItem.storeId,
      storeName: stores.find(s => s.id === newItem.storeId)?.nameEn || 'N/A',
      type: 'Receive',
      quantity: formData.quantity,
      date: new Date().toISOString().split('T')[0],
      referenceNo: formData.referenceNo || `GRN-${Date.now()}`,
      recordedBy: 'Mizanur Rahman (PRM)',
      remarks: formData.remarks || 'Initial / New material receipt registration.'
    };
    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dbService.inventoryTransactions.saveAll(updatedTxns);

    addAuditLog(
      'INSERT',
      'inventory_items',
      `Registered and received ${formData.quantity} ${newItem.unit} of new item [${newItem.nameEn}] at ${newTxn.storeName}`,
      `কেন্দ্রীয় গুদামে নতুন উপকরণ [${newItem.nameEn}] এর ${formData.quantity} ${newItem.unit} তালিকাভুক্ত ও গ্রহণ করা হয়েছে।`
    );

    // Reset fields
    setFormData(prev => ({ ...prev, nameEn: '', nameBn: '', quantity: 1, referenceNo: '', remarks: '' }));
    setActiveTab('register');
  };

  const handleIssueOrReturn = (type: 'Issue' | 'Return') => {
    const selectedItem = items.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    if (type === 'Issue' && selectedItem.balance < formData.quantity) {
      alert('Insufficient stock in Selected Store!');
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === formData.itemId) {
        const nextIssued = type === 'Issue' ? item.issued + formData.quantity : item.issued;
        const nextReturned = type === 'Return' ? item.returned + formData.quantity : item.returned;
        const nextBalance = type === 'Issue' ? item.balance - formData.quantity : item.balance + formData.quantity;
        return {
          ...item,
          issued: nextIssued,
          returned: nextReturned,
          balance: nextBalance
        };
      }
      return item;
    });

    setItems(updatedItems);
    dbService.inventoryItems.saveAll(updatedItems);

    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.nameEn,
      storeId: selectedItem.storeId,
      storeName: stores.find(s => s.id === selectedItem.storeId)?.nameEn || 'N/A',
      type: type,
      quantity: formData.quantity,
      date: new Date().toISOString().split('T')[0],
      referenceNo: formData.referenceNo || `TXN-${Date.now()}`,
      recordedBy: 'Mizanur Rahman (PRM)',
      remarks: formData.remarks
    };

    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dbService.inventoryTransactions.saveAll(updatedTxns);

    addAuditLog(
      'UPDATE',
      'inventory_items',
      `Successfully processed Material ${type}: ${formData.quantity} ${selectedItem.unit} of [${selectedItem.nameEn}]`,
      `উপকরণ ${type === 'Issue' ? 'প্রদান' : 'ফেরত'} সফলভাবে সম্পন্ন হয়েছে: [${selectedItem.nameEn}] এর ${formData.quantity} ${selectedItem.unit}`
    );

    alert(`Material ${type} Processed Successfully!`);
    setFormData(prev => ({ ...prev, quantity: 1, referenceNo: '', remarks: '' }));
    setActiveTab('register');
  };

  const handleCreateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.fromStoreId === formData.toStoreId) {
      alert('Source and destination stores cannot be the same.');
      return;
    }

    const selectedItem = items.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    if (selectedItem.balance < formData.quantity) {
      alert('Insufficient balance in source store to process transfer.');
      return;
    }

    const newTransfer: StockTransfer = {
      id: `transfer-${Date.now()}`,
      fromStoreId: formData.fromStoreId,
      fromStoreName: stores.find(s => s.id === formData.fromStoreId)?.nameEn || 'N/A',
      toStoreId: formData.toStoreId,
      toStoreName: stores.find(s => s.id === formData.toStoreId)?.nameEn || 'N/A',
      itemId: selectedItem.id,
      itemName: selectedItem.nameEn,
      quantity: formData.quantity,
      transferDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      recordedBy: 'Mizanur Rahman (PRM)',
      remarks: formData.remarks
    };

    const updatedTransfers = [newTransfer, ...transfers];
    setTransfers(updatedTransfers);
    dbService.stockTransfers.saveAll(updatedTransfers);

    addAuditLog(
      'INSERT',
      'stock_transfers',
      `Initiated stock transfer request: ${formData.quantity} of [${selectedItem.nameEn}] from ${newTransfer.fromStoreName} to ${newTransfer.toStoreName}`,
      `স্টক স্থানান্তর অনুরোধ তৈরি করা হয়েছে: [${selectedItem.nameEn}] এর ${formData.quantity} ${selectedItem.unit} স্থানান্তর করা হবে।`
    );

    alert('Stock Transfer Proposal Registered as PENDING for Executive Approval.');
    setActiveTab('register');
  };

  const handleApproveTransfer = (transferId: string) => {
    const transfer = transfers.find(t => t.id === transferId);
    if (!transfer) return;

    // 1. Reduce from source item
    const sourceItem = items.find(i => i.id === transfer.itemId && i.storeId === transfer.fromStoreId);
    if (!sourceItem || sourceItem.balance < transfer.quantity) {
      alert('Source stock insufficient to complete approval.');
      return;
    }

    // 2. Add or create target item in destination store
    const destinationItem = items.find(i => i.nameEn === transfer.itemName && i.storeId === transfer.toStoreId);

    const nextItems = items.map(item => {
      if (item.id === sourceItem.id) {
        return {
          ...item,
          issued: item.issued + transfer.quantity,
          balance: item.balance - transfer.quantity
        };
      }
      if (destinationItem && item.id === destinationItem.id) {
        return {
          ...item,
          received: item.received + transfer.quantity,
          balance: item.balance + transfer.quantity
        };
      }
      return item;
    });

    let finalItems = [...nextItems];

    if (!destinationItem) {
      // Create a brand new item entry in the destination store
      const newDestItem: InventoryItem = {
        id: `item-${Date.now()}-dest`,
        storeId: transfer.toStoreId,
        nameEn: sourceItem.nameEn,
        nameBn: sourceItem.nameBn,
        category: sourceItem.category,
        openingStock: 0,
        received: transfer.quantity,
        issued: 0,
        returned: 0,
        balance: transfer.quantity,
        unit: sourceItem.unit
      };
      finalItems.push(newDestItem);
    }

    setItems(finalItems);
    dbService.inventoryItems.saveAll(finalItems);

    // 3. Mark transfer as COMPLETED
    const updatedTransfers = transfers.map(t => 
      t.id === transferId ? { ...t, status: 'Completed' as const } : t
    );
    setTransfers(updatedTransfers);
    dbService.stockTransfers.saveAll(updatedTransfers);

    // 4. Create twin transactions (Transfer Out from source, Transfer In to destination)
    const txnOut: InventoryTransaction = {
      id: `txn-out-${Date.now()}`,
      itemId: sourceItem.id,
      itemName: sourceItem.nameEn,
      storeId: transfer.fromStoreId,
      storeName: transfer.fromStoreName,
      type: 'Transfer',
      quantity: transfer.quantity,
      date: new Date().toISOString().split('T')[0],
      referenceNo: transfer.id,
      recordedBy: 'Executive Authority',
      remarks: `Transfer OUT to ${transfer.toStoreName}.`
    };

    const txnIn: InventoryTransaction = {
      id: `txn-in-${Date.now()}`,
      itemId: destinationItem?.id || `item-dest-id`,
      itemName: sourceItem.nameEn,
      storeId: transfer.toStoreId,
      storeName: transfer.toStoreName,
      type: 'Receive',
      quantity: transfer.quantity,
      date: new Date().toISOString().split('T')[0],
      referenceNo: transfer.id,
      recordedBy: 'Executive Authority',
      remarks: `Transfer IN from ${transfer.fromStoreName}.`
    };

    const updatedTxns = [txnOut, txnIn, ...transactions];
    setTransactions(updatedTxns);
    dbService.inventoryTransactions.saveAll(updatedTxns);

    addAuditLog(
      'UPDATE',
      'stock_transfers',
      `Approved and finalized stock transfer of ${transfer.quantity} of [${transfer.itemName}] to ${transfer.toStoreName}`,
      `স্টক স্থানান্তরের অনুরোধ অনুমোদন করা হয়েছে এবং উপকরণ পাঠিয়ে দেওয়া হয়েছে।`
    );

    alert('Stock Transfer Approved and Balances Synchronized between both stores.');
  };

  const handleAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedItem = items.find(i => i.id === formData.itemId);
    if (!selectedItem) return;

    if (formData.adjustDirection === 'Subtract' && selectedItem.balance < formData.quantity) {
      alert('Insufficient stock to subtract this adjustment.');
      return;
    }

    const updatedItems = items.map(item => {
      if (item.id === formData.itemId) {
        const nextBalance = formData.adjustDirection === 'Add' 
          ? item.balance + formData.quantity 
          : item.balance - formData.quantity;
        return {
          ...item,
          balance: nextBalance
        };
      }
      return item;
    });

    setItems(updatedItems);
    dbService.inventoryItems.saveAll(updatedItems);

    const newTxn: InventoryTransaction = {
      id: `txn-${Date.now()}`,
      itemId: selectedItem.id,
      itemName: selectedItem.nameEn,
      storeId: selectedItem.storeId,
      storeName: stores.find(s => s.id === selectedItem.storeId)?.nameEn || 'N/A',
      type: 'Adjustment',
      quantity: formData.quantity,
      date: new Date().toISOString().split('T')[0],
      referenceNo: formData.referenceNo || `ADJ-${Date.now()}`,
      recordedBy: 'Mizanur Rahman (PRM)',
      remarks: `[Adjustment - ${formData.adjustType} ${formData.adjustDirection}] ${formData.remarks}`
    };

    const updatedTxns = [newTxn, ...transactions];
    setTransactions(updatedTxns);
    dbService.inventoryTransactions.saveAll(updatedTxns);

    addAuditLog(
      'UPDATE',
      'inventory_items',
      `Manual Stock Adjustment processed for [${selectedItem.nameEn}]: ${formData.adjustDirection === 'Add' ? '+' : '-'}${formData.quantity}`,
      `মেনুয়াল স্টক সমন্বয় সম্পন্ন হয়েছে [${selectedItem.nameEn}]: ${formData.adjustDirection === 'Add' ? '+' : '-'}${formData.quantity} ${selectedItem.unit}`
    );

    alert('Stock Adjustment Logged and Item Balance Updated.');
    setFormData(prev => ({ ...prev, quantity: 1, referenceNo: '', remarks: '' }));
    setActiveTab('register');
  };

  const getUnitForCategory = (cat: InventoryItem['category']): string => {
    switch (cat) {
      case 'Rod': return 'Tons';
      case 'Cement': return 'Bags';
      case 'Brick': return 'Pcs';
      case 'Sand': return 'Cft';
      case 'Stone': return 'Cft';
      case 'Paint': return 'Drums';
      case 'Tiles': return 'Boxes';
      default: return 'Units';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-mono font-bold tracking-widest uppercase px-2.5 py-1 rounded-full border border-indigo-200">
            {lang === 'en' ? 'Central & Project Store Engine' : 'সেন্ট্রাল ও প্রকল্প ইনভেন্টরি'}
          </span>
          <h1 className="text-2xl font-black text-slate-800 mt-2 tracking-tight">
            {lang === 'en' ? 'Inventory Control Desk' : 'ইনভেন্টরি কন্ট্রোল ডেস্ক'}
          </h1>
          <p className="text-xs text-slate-400">
            {lang === 'en' 
              ? 'Real-time stock register, goods received notes (GRN), materials issue workflows, and inter-store stock transfers.' 
              : 'রিয়েল-টাইম স্টক রেজিস্টার, উপকরণ প্রদান ও গ্রহণ ভাউচার এবং এক গুদাম থেকে অন্য গুদামে স্থানান্তর।'}
          </p>
        </div>

        {/* Directory Counter Grid */}
        <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl text-center border border-slate-200 shrink-0">
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Total Stores</p>
            <p className="text-sm font-black text-slate-800">{stores.length}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Item SKUs</p>
            <p className="text-sm font-black text-slate-800">{items.length}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-bold">Pending Trsf</p>
            <p className="text-sm font-black text-indigo-600 font-mono animate-pulse">
              {transfers.filter(t => t.status === 'Pending').length}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-fit border border-slate-200 flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('register')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'register' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package size={14} />
          {lang === 'en' ? 'Stock Register' : 'স্টক রেজিস্টার'}
        </button>
        <button
          onClick={() => setActiveTab('receive')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'receive' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Plus size={14} />
          {lang === 'en' ? 'Receive Materials (GRN)' : 'নতুন উপকরণ গ্রহণ (GRN)'}
        </button>
        <button
          onClick={() => setActiveTab('issue')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'issue' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck size={14} />
          {lang === 'en' ? 'Material Issue / Return' : 'উপকরণ প্রদান ও ফেরত'}
        </button>
        <button
          onClick={() => setActiveTab('transfer')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'transfer' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <ArrowLeftRight size={14} />
          {lang === 'en' ? 'Inter-Store Transfers' : 'আন্তঃগুদাম স্টক স্থানান্তর'}
        </button>
        <button
          onClick={() => setActiveTab('adjust')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'adjust' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Clipboard size={14} />
          {lang === 'en' ? 'Stock Adjustment' : 'স্টক সমন্বয়'}
        </button>
      </div>

      {/* Main UI layout splits */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Dynamic Forms or filters (Main 8 Columns) */}
        <div className="lg:col-span-8 space-y-6">

          {activeTab === 'register' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              
              {/* Filter controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Filter by Store</label>
                  <select
                    value={selectedStoreId}
                    onChange={(e) => setSelectedStoreId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    <option value="all">All Stores</option>
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Material Category</label>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    <option value="all">All Categories</option>
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Search SKU</label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search material..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 pl-9 pr-3 text-slate-700"
                    />
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                  </div>
                </div>
              </div>

              {/* Items Register list */}
              <div className="space-y-3">
                {filteredItems.length > 0 ? (
                  filteredItems.map(item => {
                    const storeObj = stores.find(s => s.id === item.storeId);
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex-wrap gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold px-2 py-0.5 rounded">
                              {item.category}
                            </span>
                            <h4 className="text-xs font-black text-slate-800">
                              {lang === 'en' ? item.nameEn : item.nameBn}
                            </h4>
                          </div>
                          <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
                            <Layers size={11} />
                            Store: {storeObj?.nameEn || 'N/A'}
                          </p>
                        </div>

                        {/* Stock breakdown */}
                        <div className="flex items-center gap-4 text-xxs font-mono text-slate-500">
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Received</p>
                            <p className="font-bold text-slate-700">{item.received}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Issued</p>
                            <p className="font-bold text-slate-700">{item.issued}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-[8px] text-slate-400 uppercase">Balance</p>
                            <p className="font-black text-indigo-600 text-xs">{item.balance} {item.unit}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10">
                    <p className="text-xs text-slate-400">No material records match the selected filters.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'receive' && (
            <form onSubmit={handleAddNewItem} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                {lang === 'en' ? 'Materials Ingestion (GRN Form)' : 'নতুন নির্মাণ সামগ্রী প্রবেশ করান (GRN)'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Target Warehouse / Store</label>
                  <select
                    value={formData.storeId}
                    onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    {stores.map(s => (
                      <option key={s.id} value={s.id}>{s.nameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Category Classification</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    {categories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Material Name (English)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AKS Steel Rod 60G"
                    value={formData.nameEn}
                    onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Material Name (Bengali)</label>
                  <input
                    type="text"
                    required
                    placeholder="যেমনঃ একেএস রড ৬০জি"
                    value={formData.nameBn}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Received Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Reference No (Invoice/GRN)</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-AKS-9988"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Remarks & Details</label>
                <textarea
                  rows={2}
                  placeholder="Enter concrete pouring site coordinates or inspection observations..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
              >
                {lang === 'en' ? 'REGISTER GOODS RECEIVED NOTE' : 'নতুন জিআরএন ও সামগ্রী মজুদ নিবন্ধন করুন'}
              </button>
            </form>
          )}

          {activeTab === 'issue' && (
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                {lang === 'en' ? 'Materials Issue or Returns Voucher' : 'সামগ্রী প্রদান অথবা প্রকল্পের উদ্ধৃত্ত ফেরত ফরম'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Material SKU</label>
                  <select
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    {items.map(i => {
                      const st = stores.find(s => s.id === i.storeId);
                      return (
                        <option key={i.id} value={i.id}>
                          {i.nameEn} ({st?.nameEn || 'N/A'}) - Bal: {i.balance}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Process Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Reference Voucher No</label>
                  <input
                    type="text"
                    placeholder="e.g. REQ-TOWER-009"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Remarks</label>
                  <input
                    type="text"
                    placeholder="Casting of 3rd floor column / excess return..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleIssueOrReturn('Issue')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md shadow-emerald-500/10 transition-colors text-center"
                >
                  {lang === 'en' ? 'ISSUE FOR CONSTRUCTION' : 'সাইটের জন্য উপকরণ ইস্যু করুন'}
                </button>
                <button
                  type="button"
                  onClick={() => handleIssueOrReturn('Return')}
                  className="bg-amber-500 hover:bg-amber-400 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-md shadow-amber-500/10 transition-colors text-center"
                >
                  {lang === 'en' ? 'RETURN TO WAREHOUSE' : 'উদ্ধৃত্ত মালামাল গুদামে ফেরত নিন'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'transfer' && (
            <div className="space-y-6">
              {/* Proposal creation form */}
              <form onSubmit={handleCreateTransfer} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
                <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                  {lang === 'en' ? 'Stock Transfer Proposal' : 'আন্তঃগুদাম মালামাল স্থানান্তর প্রস্তাব'}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">From Source Warehouse</label>
                    <select
                      value={formData.fromStoreId}
                      onChange={(e) => setFormData({ ...formData, fromStoreId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                    >
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.nameEn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">To Destination Project Warehouse</label>
                    <select
                      value={formData.toStoreId}
                      onChange={(e) => setFormData({ ...formData, toStoreId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                    >
                      {stores.map(s => (
                        <option key={s.id} value={s.id}>{s.nameEn}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Material SKU</label>
                    <select
                      value={formData.itemId}
                      onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                    >
                      {items.filter(i => i.storeId === formData.fromStoreId).map(i => (
                        <option key={i.id} value={i.id}>
                          {i.nameEn} - Stock: {i.balance}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Transfer Quantity</label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Transfer Remarks</label>
                  <textarea
                    rows={2}
                    placeholder="Urgent shortage of cement in Dhanmondi site..."
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
                >
                  {lang === 'en' ? 'INITIATE STOCK TRANSFER REQUEST' : 'স্টক স্থানান্তর অনুরোধ দাখিল করুন'}
                </button>
              </form>

              {/* Pending transfers grid for MD/Founder approval */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">
                    {lang === 'en' ? 'Pending Store Transfer Approvals' : 'স্থানান্তর অনুমোদন ও ট্র্যাকিং বোর্ড'}
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {lang === 'en' ? 'Requires physical stock checks and Executive approvals to sync both ledgers.' : 'স্থানান্তর সম্পন্ন করতে ব্যবস্থাপনা পরিচালকের অনুমোদন প্রয়োজন।'}
                  </p>
                </div>

                <div className="space-y-3">
                  {transfers.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                            t.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700 animate-pulse'
                          }`}>
                            {t.status}
                          </span>
                          <span className="text-xs font-black text-slate-800">{t.itemName}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          {t.fromStoreName} ➜ {t.toStoreName}
                        </p>
                        <p className="text-[9px] text-slate-400 font-mono">Date: {t.transferDate} • Vol: {t.quantity} • By: {t.recordedBy}</p>
                      </div>

                      {t.status === 'Pending' && (
                        <button
                          onClick={() => handleApproveTransfer(t.id)}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl py-2 px-4 text-xxs font-black transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                        >
                          <Check size={12} />
                          {lang === 'en' ? 'APPROVE TRANSFER' : 'অনুমোদন করুন'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'adjust' && (
            <form onSubmit={handleAdjustment} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b pb-3">
                {lang === 'en' ? 'Store Discrepancy & Stock Adjustment' : 'স্টক অসঙ্গতি ও অবচয় সমন্বয় ডেস্ক'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Select Material SKU</label>
                  <select
                    value={formData.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    {items.map(i => {
                      const st = stores.find(s => s.id === i.storeId);
                      return (
                        <option key={i.id} value={i.id}>
                          {i.nameEn} ({st?.nameEn || 'N/A'}) - Bal: {i.balance}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Discrepancy Category</label>
                  <select
                    value={formData.adjustType}
                    onChange={(e) => setFormData({ ...formData, adjustType: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    <option value="Discrepancy">Discrepancy (Physical Count vs DB)</option>
                    <option value="Damage">Material Damage / Wastage</option>
                    <option value="Correction">Data Entry Typo Correction</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Action</label>
                  <select
                    value={formData.adjustDirection}
                    onChange={(e) => setFormData({ ...formData, adjustDirection: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 font-bold text-slate-700"
                  >
                    <option value="Subtract">Subtract Stock (Wastage / Loss)</option>
                    <option value="Add">Add Stock (Excess found in physical count)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 font-bold uppercase mb-1">Adjustment Reason & Voucher No</label>
                <textarea
                  rows={2}
                  required
                  placeholder="e.g. 5 bags of cement hardened during rain or physical stock-take verified..."
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-xl py-2 px-3 text-slate-700"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-3 text-xs font-black cursor-pointer shadow-lg shadow-indigo-600/10 transition-colors"
              >
                {lang === 'en' ? 'COMMIT ADJUSTMENT LEDGER VOUCHER' : 'স্টক সমন্বয় ভাউচার জমা দিন'}
              </button>
            </form>
          )}

        </div>

        {/* Right Side: Stores Directory & Recent transactions ledger (4 Columns) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Warehouses list */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">
                {lang === 'en' ? 'Warehouse Locations' : 'গুদাম ও সাইট স্টোর তালিকা'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'Registered central hubs and active construction plot stores.' : 'নিবন্ধিত কেন্দ্রীয় ও প্রকল্প সামগ্রী সরবরাহ কেন্দ্র।'}
              </p>
            </div>

            <div className="space-y-2">
              {stores.map(st => (
                <div key={st.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] font-black text-slate-800">{lang === 'en' ? st.nameEn : st.nameBn}</h4>
                    <span className="text-[8px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono">
                      {st.type}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-400 font-semibold">{lang === 'en' ? st.locationEn : st.locationBn}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Ledger Trail */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-xs">
                {lang === 'en' ? 'Recent Inventory Logs' : 'সামগ্রী প্রবেশ ও নির্গমন ট্রেইল'}
              </h3>
              <p className="text-[10px] text-slate-400">
                {lang === 'en' ? 'Live transactions trail across central and local site stores.' : 'লাইভ মালামাল ভাউচার অডিট ট্রেইল।'}
              </p>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {transactions.map(txn => (
                <div key={txn.id} className="text-xxs border-b border-slate-100 pb-2 space-y-0.5">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800">{txn.itemName}</span>
                    <span className={`px-1.5 py-0.5 rounded font-mono text-[8px] ${
                      txn.type === 'Receive' ? 'bg-emerald-50 text-emerald-700' :
                      txn.type === 'Issue' ? 'bg-indigo-50 text-indigo-700' :
                      txn.type === 'Return' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {txn.type}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 font-semibold">
                    <span>{txn.storeName}</span>
                    <span className="text-slate-700 font-bold">{txn.quantity} Units</span>
                  </div>
                  <p className="text-slate-400 text-[8px] truncate">{txn.remarks}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
