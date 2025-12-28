import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(username, password);
            navigate('/');
        } catch (err) {
            setError('Nom d\'utilisateur ou mot de passe incorrect (utilisez "admin" / "admin")');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary-600">
                <CardHeader className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-primary-600">couvoir-Jaber</h1>
                    <CardTitle>Connexion</CardTitle>
                    <p className="text-sm text-gray-500">Entrez vos identifiants pour accéder au dashboard</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Nom d'utilisateur"
                            type="text"
                            placeholder="Ex: admin"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Input
                            label="Mot de passe"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <div className="text-sm text-red-500 bg-red-50 p-2 rounded">{error}</div>}
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Connexion...' : 'Se connecter'}
                        </Button>
                        <div className="text-xs text-center text-gray-400">
                            Demo: admin / admin
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
