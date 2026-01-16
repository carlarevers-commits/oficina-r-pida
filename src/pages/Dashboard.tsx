import { useNavigate } from 'react-router-dom';
import { useOS } from '@/contexts/OSContext';
import {
  PlusCircle,
  Search,
  ClipboardList,
  Package,
  BarChart3,
  Wrench,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  variant?: 'default' | 'primary';
  badge?: number;
}

function DashboardCard({
  icon,
  title,
  description,
  onClick,
  variant = 'default',
  badge,
}: DashboardCardProps) {
  const isPrimary = variant === 'primary';

  return (
    <button
      onClick={onClick}
      className={`relative w-full p-6 rounded-xl border text-left transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
        isPrimary
          ? 'bg-primary/10 border-primary/30 hover:bg-primary/20'
          : 'bg-card border-border hover:bg-accent'
      }`}
    >
      {badge !== undefined && badge > 0 && (
        <span className="absolute top-4 right-4 inline-flex items-center justify-center h-6 min-w-6 px-2 rounded-full bg-warning text-warning-foreground text-xs font-bold">
          {badge}
        </span>
      )}
      <div
        className={`inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4 ${
          isPrimary ? 'bg-primary/20' : 'bg-accent'
        }`}
      >
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { ordens } = useOS();

  const ordensAbertas = ordens.filter((o) => o.status !== 'finalizada').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">MotoService</h1>
              <p className="text-xs text-muted-foreground">Ordem de Serviço</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DashboardCard
            icon={<PlusCircle className="h-6 w-6 text-primary" />}
            title="Nova Ordem de Serviço"
            description="Criar uma nova OS para atendimento"
            onClick={() => navigate('/os/nova')}
            variant="primary"
          />

          <DashboardCard
            icon={<Search className="h-6 w-6 text-info" />}
            title="Buscar por Placa"
            description="Localizar ordens de serviço"
            onClick={() => navigate('/busca')}
          />

          <DashboardCard
            icon={<ClipboardList className="h-6 w-6 text-warning" />}
            title="Ordens em Aberto"
            description="Visualizar OS pendentes"
            onClick={() => navigate('/busca')}
            badge={ordensAbertas}
          />

          <DashboardCard
            icon={<Package className="h-6 w-6 text-success" />}
            title="Estoque"
            description="Gerenciar produtos e peças"
            onClick={() => {}}
          />

          <DashboardCard
            icon={<BarChart3 className="h-6 w-6 text-muted-foreground" />}
            title="Relatórios"
            description="Visualizar métricas e dados"
            onClick={() => {}}
          />
        </div>

        {ordensAbertas > 0 && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <p className="text-warning font-medium">
              ⚠️ Você tem {ordensAbertas} ordem(ns) de serviço em aberto
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
