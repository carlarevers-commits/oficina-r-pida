import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SERVICOS_DISPONIVEIS } from '@/types/os';

interface ServicoChecklistProps {
  servicosSelecionados: string[];
  onChange: (servicos: string[]) => void;
}

export function ServicoChecklist({ servicosSelecionados, onChange }: ServicoChecklistProps) {
  const toggleServico = (servico: string) => {
    if (servicosSelecionados.includes(servico)) {
      onChange(servicosSelecionados.filter((s) => s !== servico));
    } else {
      onChange([...servicosSelecionados, servico]);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground">Serviços</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICOS_DISPONIVEIS.map((servico) => (
          <div
            key={servico}
            className="flex items-center space-x-3 p-3 rounded-lg bg-accent/50 border border-border hover:bg-accent transition-colors cursor-pointer"
            onClick={() => toggleServico(servico)}
          >
            <Checkbox
              id={servico}
              checked={servicosSelecionados.includes(servico)}
              onCheckedChange={() => toggleServico(servico)}
              className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={servico}
              className="text-sm font-medium text-foreground cursor-pointer flex-1"
            >
              {servico}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
