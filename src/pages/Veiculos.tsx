import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Search,
  Pencil,
  Trash2,
  Loader2,
  Car,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Customer {
  id: string;
  name: string;
}

interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string;
  ano: number | null;
  cor: string | null;
  tipo: string;
  km_atual: number | null;
  observacoes: string | null;
  client_id: string;
  created_at: string;
  customers?: {
    id: string;
    name: string;
  };
}

const VEHICLE_TYPES = [
  { value: 'moto', label: 'Moto' },
  { value: 'carro', label: 'Carro' },
  { value: 'caminhao', label: 'Caminhão' },
  { value: 'outro', label: 'Outro' },
];

const ITEMS_PER_PAGE = 10;

export default function Veiculos() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientIdParam = searchParams.get('cliente');
  
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    placa: '',
    marca: '',
    modelo: '',
    ano: '',
    cor: '',
    tipo: 'moto',
    km_atual: '',
    observacoes: '',
    client_id: clientIdParam || '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchUserRole();
      fetchCustomers();
      fetchVehicles();
    }
  }, [user, currentPage, searchTerm]);

  const fetchUserRole = async () => {
    try {
      const { data } = await supabase.rpc('get_user_role');
      setUserRole(data);
    } catch (error) {
      // Default to operator if no role found
      setUserRole('operator');
    }
  };

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar clientes',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('vehicles')
        .select('*, customers(id, name)', { count: 'exact' })
        .is('deleted_at', null)
        .order('created_at', { ascending: false });

      if (clientIdParam) {
        query = query.eq('client_id', clientIdParam);
      }

      if (searchTerm) {
        query = query.or(
          `placa.ilike.%${searchTerm}%,marca.ilike.%${searchTerm}%,modelo.ilike.%${searchTerm}%`
        );
      }

      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) throw error;

      setVehicles(data || []);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast({
        title: 'Erro ao carregar veículos',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, clientIdParam, toast]);

  const handleOpenModal = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        ano: vehicle.ano?.toString() || '',
        cor: vehicle.cor || '',
        tipo: vehicle.tipo,
        km_atual: vehicle.km_atual?.toString() || '',
        observacoes: vehicle.observacoes || '',
        client_id: vehicle.client_id,
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        placa: '',
        marca: '',
        modelo: '',
        ano: '',
        cor: '',
        tipo: 'moto',
        km_atual: '',
        observacoes: '',
        client_id: clientIdParam || '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingVehicle(null);
    setFormData({
      placa: '',
      marca: '',
      modelo: '',
      ano: '',
      cor: '',
      tipo: 'moto',
      km_atual: '',
      observacoes: '',
      client_id: clientIdParam || '',
    });
  };

  const formatPlaca = (value: string) => {
    const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.placa.trim()) {
      toast({
        title: 'Erro',
        description: 'Placa é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.marca.trim()) {
      toast({
        title: 'Erro',
        description: 'Marca é obrigatória',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.modelo.trim()) {
      toast({
        title: 'Erro',
        description: 'Modelo é obrigatório',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.client_id) {
      toast({
        title: 'Erro',
        description: 'Selecione um cliente',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('user_id', user!.id)
        .single();

      if (!profile) throw new Error('Perfil não encontrado');

      const vehicleData = {
        placa: formData.placa.trim().toUpperCase(),
        marca: formData.marca.trim(),
        modelo: formData.modelo.trim(),
        ano: formData.ano ? parseInt(formData.ano) : null,
        cor: formData.cor.trim() || null,
        tipo: formData.tipo,
        km_atual: formData.km_atual ? parseInt(formData.km_atual) : null,
        observacoes: formData.observacoes.trim() || null,
        client_id: formData.client_id,
      };

      if (editingVehicle) {
        const { error } = await supabase
          .from('vehicles')
          .update(vehicleData)
          .eq('id', editingVehicle.id);

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um veículo com esta placa');
          }
          throw error;
        }

        toast({
          title: 'Veículo atualizado',
          description: 'Os dados do veículo foram atualizados com sucesso.',
        });
      } else {
        const { error } = await supabase.from('vehicles').insert({
          ...vehicleData,
          company_id: profile.company_id,
        });

        if (error) {
          if (error.code === '23505') {
            throw new Error('Já existe um veículo com esta placa');
          }
          throw error;
        }

        toast({
          title: 'Veículo cadastrado',
          description: 'O veículo foi cadastrado com sucesso.',
        });
      }

      handleCloseModal();
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Erro ao salvar',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingVehicle) return;

    setIsSubmitting(true);

    try {
      // Soft delete
      const { error } = await supabase
        .from('vehicles')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', deletingVehicle.id);

      if (error) throw error;

      toast({
        title: 'Veículo excluído',
        description: 'O veículo foi removido com sucesso.',
      });

      setIsDeleteDialogOpen(false);
      setDeletingVehicle(null);
      fetchVehicles();
    } catch (error: any) {
      toast({
        title: 'Erro ao excluir',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const canDelete = userRole === 'admin' || userRole === 'owner';
  const canEdit = userRole === 'admin' || userRole === 'owner';
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
              <Car className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Veículos</h1>
              <p className="text-xs text-muted-foreground">
                Gerenciamento de veículos
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, marca ou modelo..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Veículo
          </Button>
        </div>

        {/* Filter by client indicator */}
        {clientIdParam && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              <User className="h-3 w-3 mr-1" />
              Filtrando por cliente
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/veiculos')}
            >
              Limpar filtro
            </Button>
          </div>
        )}

        {/* Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">
                {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
              </h3>
              <p className="text-muted-foreground mt-1">
                {searchTerm
                  ? 'Tente buscar por outra placa'
                  : 'Clique em "Novo Veículo" para começar'}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Placa</TableHead>
                    <TableHead>Marca/Modelo</TableHead>
                    <TableHead className="hidden sm:table-cell">Tipo</TableHead>
                    <TableHead className="hidden md:table-cell">Cliente</TableHead>
                    <TableHead className="hidden lg:table-cell">KM</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vehicles.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell>
                        <span className="font-mono font-bold text-primary">
                          {vehicle.placa}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <span className="font-medium">{vehicle.marca}</span>
                          <span className="text-muted-foreground"> {vehicle.modelo}</span>
                          {vehicle.ano && (
                            <span className="text-muted-foreground text-sm"> ({vehicle.ano})</span>
                          )}
                        </div>
                        {vehicle.cor && (
                          <span className="text-xs text-muted-foreground">{vehicle.cor}</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant="outline">
                          {VEHICLE_TYPES.find((t) => t.value === vehicle.tipo)?.label || vehicle.tipo}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {vehicle.customers?.name || '-'}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {vehicle.km_atual?.toLocaleString('pt-BR') || '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              toast({
                                title: 'Em breve',
                                description: 'Funcionalidade de OS será implementada em breve.',
                              });
                            }}
                            title="Criar Ordem de Serviço"
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenModal(vehicle)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setDeletingVehicle(vehicle);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} a{' '}
                    {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
            </DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? 'Altere os dados do veículo abaixo.'
                : 'Preencha os dados do novo veículo.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select
                value={formData.client_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, client_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="placa">Placa *</Label>
                <Input
                  id="placa"
                  placeholder="ABC-1234"
                  className="font-mono uppercase"
                  value={formData.placa}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      placa: formatPlaca(e.target.value),
                    }))
                  }
                  maxLength={8}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo *</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, tipo: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca">Marca *</Label>
                <Input
                  id="marca"
                  placeholder="Honda, Yamaha, etc."
                  value={formData.marca}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, marca: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="modelo">Modelo *</Label>
                <Input
                  id="modelo"
                  placeholder="CG 160, Fazer 250, etc."
                  value={formData.modelo}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, modelo: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  placeholder="2024"
                  value={formData.ano}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, ano: e.target.value }))
                  }
                  min={1900}
                  max={new Date().getFullYear() + 1}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cor">Cor</Label>
                <Input
                  id="cor"
                  placeholder="Preto, Vermelho..."
                  value={formData.cor}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, cor: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="km_atual">KM Atual</Label>
                <Input
                  id="km_atual"
                  type="number"
                  placeholder="0"
                  value={formData.km_atual}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, km_atual: e.target.value }))
                  }
                  min={0}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea
                id="observacoes"
                placeholder="Informações adicionais sobre o veículo..."
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, observacoes: e.target.value }))
                }
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingVehicle ? 'Salvar' : 'Cadastrar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o veículo{' '}
              <strong>{deletingVehicle?.placa}</strong>? Esta ação não pode ser
              desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
