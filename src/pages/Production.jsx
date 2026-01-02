import { Construction } from 'lucide-react';
import { Card } from '../components/ui/Card';

const Production = () => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
            <div className="p-6 bg-orange-50 rounded-full animate-bounce">
                <Construction size={64} className="text-orange-500" />
            </div>
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-gray-900">Module Production</h1>
                <p className="text-gray-500 max-w-md mx-auto">
                    Ce module est en cours de développement. Il permettra bientôt de suivre la production en temps réel.
                   
                </p>
            </div>
            <Card className="max-w-md w-full p-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
                <h3 className="font-semibold text-orange-800 mb-2">Fonctionnalités à venir :</h3>
                <ul className="text-left text-sm text-orange-700 space-y-2 list-disc list-inside">
                    <li>Suivi des cycles de production</li>
                    <li>Gestion des stocks MP</li>
                    <li>Rapports de rendement</li>

                </ul>
            </Card>
        </div>
    );
};

export default Production;
