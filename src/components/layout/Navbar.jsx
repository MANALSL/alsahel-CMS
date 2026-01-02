import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../ui/Modal';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ onMenuClick }) => {
    const { user, logout, changePassword } = useAuth();
    const [open, setOpen] = useState(false);
    const [showChange, setShowChange] = useState(false);
    const [currentPwd, setCurrentPwd] = useState('');
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [saving, setSaving] = useState(false);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        setOpen(false);
        navigate('/login');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (newPwd !== confirmPwd) {
            alert('Le nouveau mot de passe et la confirmation ne correspondent pas');
            return;
        }
        setSaving(true);
        try {
            await changePassword(currentPwd, newPwd);
            setCurrentPwd(''); setNewPwd(''); setConfirmPwd(''); setShowChange(false);
            alert('Mot de passe mis à jour avec succès');
        } catch (err) {
            alert(err.message || 'Impossible de changer le mot de passe');
        } finally {
            setSaving(false);
        }
    };

    return (
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-30 h-16 px-6 flex items-center justify-between md:justify-end">
            <button
                onClick={onMenuClick}
                className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
                <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
                <button onClick={() => setOpen(true)} className="flex items-center space-x-3 focus:outline-none">
                    <div className="flex flex-col items-end">
                        <span className="text-sm font-semibold text-gray-900">{user?.name || 'Admin'}</span>
                        <span className="text-xs text-gray-500 capitalize">{user?.role || 'Administrator'}</span>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold shadow-md ring-2 ring-white">
                        {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                </button>
            </div>

            <Modal isOpen={open} onClose={() => setOpen(false)} title="Profil Administrateur">
                <div className="space-y-4">
                    <div>
                        <div className="text-sm text-gray-600">Nom</div>
                        <div className="font-medium">{user?.name || 'Admin'}</div>
                    </div>
                    <div>
                        <div className="text-sm text-gray-600">Rôle</div>
                        <div className="font-medium capitalize">{user?.role || 'Administrator'}</div>
                    </div>

                    {!showChange && (
                        <div className="space-y-2">
                            <button onClick={() => setShowChange(true)} className="w-full bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200">Modifier le mot de passe</button>
                            <div className="pt-2">
                                <button onClick={handleLogout} className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700">Se déconnecter</button>
                            </div>
                        </div>
                    )}

                    {showChange && (
                        <form onSubmit={handleChangePassword} className="space-y-3">
                            <div>
                                <label className="text-sm text-gray-600">Mot de passe actuel</label>
                                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Nouveau mot de passe</label>
                                <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                            </div>
                            <div>
                                <label className="text-sm text-gray-600">Confirmer le nouveau mot de passe</label>
                                <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} className="mt-1 w-full border rounded-md px-3 py-2" />
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" disabled={saving} className="flex-1 bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700">{saving ? 'Enregistrement...' : 'Enregistrer'}</button>
                                <button type="button" onClick={() => setShowChange(false)} className="flex-1 bg-gray-100 text-gray-800 py-2 rounded-md hover:bg-gray-200">Annuler</button>
                            </div>
                        </form>
                    )}
                </div>
            </Modal>
        </header>
    );
};

export default Navbar;
