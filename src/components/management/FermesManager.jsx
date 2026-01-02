import { useEffect, useState } from 'react';
import { elevageService } from '../../services/elevageService';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

const FermesManager = ({ isOpen, onClose }) => {
    const [fermes, setFermes] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', structure: [] });
    const [selectedFerme, setSelectedFerme] = useState(null);
    const [fermeRecords, setFermeRecords] = useState([]);

    useEffect(() => {
        if (isOpen) load();
    }, [isOpen]);

    const load = async () => {
        const f = await elevageService.getFermes();
        setFermes(f || []);
    };

    useEffect(() => {
        if (selectedFerme) loadRecords();
    }, [selectedFerme]);

    const loadRecords = async () => {
        const all = await elevageService.getElevages();
        const filtered = (all || []).filter(r => r.ferme === selectedFerme.name);
        setFermeRecords(filtered.sort((a,b)=> new Date(a.date) - new Date(b.date)));
    };

    const exportFiltered = async () => {
        const XLSX = await import('xlsx');
        const data = fermeRecords.map(r => ({
            date: r.date,
            lot: r.lot,
            aliment: r.aliment,
            quantite: r.quantite,
            poids: r.poids,
            mortalite: r.mortalite,
            observation: r.observation
        }));
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, selectedFerme.name || 'ferme');
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([wbout], { type: 'application/octet-stream' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedFerme.name || 'ferme'}_records_${new Date().toISOString().slice(0,10)}.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    const defaultStructure = () => Array.from({ length: 9 }).map((_, bIdx) => ({
        name: `Bâtiment ${bIdx + 1}`,
        parks: Array.from({ length: 5 }).map((__, pIdx) => ({ name: `Parc ${pIdx + 1}`, count: 0 }))
    }));

    const openNew = () => {
        setEditing(null);
        setForm({ name: '', structure: defaultStructure() });
    };

    const openEdit = (f) => {
        setEditing(f.id);
        setForm({ ...f });
    };

    const save = async () => {
        if (!form.name) return;
        if (editing) {
            await elevageService.updateFerme(editing, form);
        } else {
            await elevageService.addFerme(form);
        }
        await load();
        setEditing(null);
        setForm({ name: '', structure: [] });
    };

    const remove = async (id) => {
        if (!confirm('Supprimer cette ferme ?')) return;
        await elevageService.deleteFerme(id);
        await load();
    };

    const updateParkCount = (bIdx, pIdx, value) => {
        setForm(f => {
            const ns = JSON.parse(JSON.stringify(f.structure || defaultStructure()));
            ns[bIdx].parks[pIdx].count = Number(value || 0);
            return { ...f, structure: ns };
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gestion des fermes">
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="font-medium">Fermes</h4>
                    <div>
                        <Button variant="secondary" onClick={openNew}>Ajouter</Button>
                    </div>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto">
                    {fermes.map(f => (
                        <div key={f.id} className="flex items-center justify-between p-2 border rounded hover:shadow-sm">
                            <div className="cursor-pointer" onClick={() => setSelectedFerme(f)}>
                                <div className="font-medium">{f.name}</div>
                                <div className="text-xs text-gray-500">{(f.structure || []).length} bâtiments</div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="sm" variant="ghost" onClick={() => openEdit(f)}>Modifier</Button>
                                <Button size="sm" variant="danger" onClick={() => remove(f.id)}>Supprimer</Button>
                            </div>
                        </div>
                    ))}
                </div>

                {selectedFerme && (
                    <Modal isOpen={!!selectedFerme} onClose={() => { setSelectedFerme(null); setFermeRecords([]); }} title={`Détails — ${selectedFerme.name}`}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <div className="font-medium">{selectedFerme.name}</div>
                                <div className="flex gap-2">
                                    <Button variant="secondary" onClick={loadRecords}>Rafraîchir</Button>
                                    <Button onClick={exportFiltered}>Exporter</Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50">
                                            <th className="p-2 border">Date</th>
                                            <th className="p-2 border">Jrs</th>
                                            <th className="p-2 border">Lot</th>
                                            <th className="p-2 border">Aliment</th>
                                            <th className="p-2 border">Quantité</th>
                                            <th className="p-2 border">Poids</th>
                                            <th className="p-2 border">Mortalité</th>
                                            <th className="p-2 border">Observation</th>
                                            <th className="p-2 border">Effectif COQ</th>
                                            <th className="p-2 border">Effectif POULE</th>
                                            <th className="p-2 border">%C/P</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {fermeRecords.length === 0 && (
                                            <tr><td colSpan={11} className="p-4 text-center text-gray-500">Aucun enregistrement trouvé</td></tr>
                                        )}
                                        {fermeRecords.map((r, idx) => {
                                            const firstDate = fermeRecords[0] ? new Date(fermeRecords[0].date) : new Date(r.date);
                                            const days = Math.round((new Date(r.date) - firstDate) / (1000 * 60 * 60 * 24));
                                            // Placeholder splits: we don't have coq/poule in records, leave blank or attempt best-effort mapping
                                            const coq = r.coq || '';
                                            const poule = r.poule || '';
                                            const pct = (coq && poule) ? ((coq / (poule || 1)) * 100).toFixed(2) : '';
                                            return (
                                                <tr key={r.id || idx} className="border-t">
                                                    <td className="p-2 border">{r.date}</td>
                                                    <td className="p-2 border">{`j${days + 1}`}</td>
                                                    <td className="p-2 border">{r.lot}</td>
                                                    <td className="p-2 border">{r.aliment}</td>
                                                    <td className="p-2 border">{r.quantite}</td>
                                                    <td className="p-2 border">{r.poids}</td>
                                                    <td className="p-2 border">{r.mortalite}</td>
                                                    <td className="p-2 border">{r.observation}</td>
                                                    <td className="p-2 border">{coq}</td>
                                                    <td className="p-2 border">{poule}</td>
                                                    <td className="p-2 border">{pct}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            <div className="pt-2 border-t">
                                <h5 className="font-medium">Bâtiments et parcs</h5>
                                <div className="grid grid-cols-1 gap-2 mt-2">
                                    {(selectedFerme.structure || []).map((b, bIdx) => (
                                        <div key={bIdx} className="border rounded p-2">
                                            <div className="font-medium">{b.name}</div>
                                            <div className="grid grid-cols-5 gap-2 mt-2">
                                                {b.parks.map((p, pIdx) => (
                                                    <div key={pIdx} className="flex flex-col">
                                                        <div className="text-sm font-medium">{p.name}</div>
                                                        <div className="text-xs text-gray-600">{p.count || 0} animaux</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end">
                                <Button variant="secondary" onClick={() => { setSelectedFerme(null); setFermeRecords([]); }}>Fermer</Button>
                            </div>
                        </div>
                    </Modal>
                )}

                <div className="pt-2 border-t">
                    <h5 className="font-medium">{editing ? 'Modifier ferme' : 'Nouvelle ferme'}</h5>
                    <div className="mt-2 space-y-2">
                        <input className="w-full rounded-md border px-3 py-2 text-sm" placeholder="Nom de la ferme" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />

                        <div className="grid grid-cols-1 gap-2">
                            {(form.structure || defaultStructure()).map((b, bIdx) => (
                                <div key={bIdx} className="border rounded p-2">
                                    <div className="font-medium">{b.name}</div>
                                    <div className="grid grid-cols-5 gap-2 mt-2">
                                        {b.parks.map((p, pIdx) => (
                                            <div key={pIdx} className="flex flex-col">
                                                <label className="text-xs text-gray-500">{p.name}</label>
                                                <input type="number" min="0" className="rounded-md border px-2 py-1 text-sm" value={p.count} onChange={(e) => updateParkCount(bIdx, pIdx, e.target.value)} />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => { setEditing(null); setForm({ name: '', structure: [] }); }}>Annuler</Button>
                            <Button onClick={save}>{editing ? 'Enregistrer' : 'Ajouter'}</Button>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default FermesManager;
