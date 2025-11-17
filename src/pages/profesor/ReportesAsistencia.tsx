import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Search } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

const ReportesAsistencia = () => {
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchName, setSearchName] = useState('');
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();

  // Fetch assigned sections for profesor
  const { data: assignedSections } = useQuery({
    queryKey: ['assigned-sections', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('teacher_assignments')
        .select(`
          section_id,
          sections(
            id,
            letter,
            years(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch attendance records
  const { data: records, isLoading } = useQuery({
    queryKey: ['attendance-records', selectedSection, searchName, dateFrom, dateTo],
    queryFn: async () => {
      if (!selectedSection || !dateFrom || !dateTo) return [];

      let query = supabase
        .from('attendance_records')
        .select(`
          *,
          students!inner(
            nombres,
            apellidos,
            student_code,
            section_id
          )
        `)
        .eq('students.section_id', selectedSection)
        .in('status', ['falta', 'salida_temprana'])
        .gte('date', format(dateFrom, 'yyyy-MM-dd'))
        .lte('date', format(dateTo, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;

      // Filter by name if search term provided
      if (searchName) {
        const searchLower = searchName.toLowerCase();
        return data?.filter((record: any) => {
          const fullName = `${record.students.nombres} ${record.students.apellidos}`.toLowerCase();
          return fullName.includes(searchLower);
        });
      }

      return data;
    },
    enabled: !!selectedSection && !!dateFrom && !!dateTo,
  });

  const handleSearch = () => {
    // This will trigger the query with the current filter values
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'falta':
        return <Badge className="bg-status-falta">Falta</Badge>;
      case 'salida_temprana':
        return <Badge className="bg-status-pendiente">Salida Temprana</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getJustificationBadge = (status: string) => {
    switch (status) {
      case 'justificada':
        return <Badge className="bg-status-justificada">Justificada</Badge>;
      case 'no_justificada':
        return <Badge className="bg-status-falta">No Justificada</Badge>;
      case 'pendiente':
        return <Badge className="bg-status-pendiente">Pendiente</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reportes de Inasistencias</h1>
          <p className="text-muted-foreground mt-2">
            Consulta las inasistencias por sección, estudiante y rango de fechas
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros de Búsqueda</CardTitle>
            <CardDescription>Selecciona los criterios para consultar las inasistencias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Sección */}
              <div className="space-y-2">
                <Label>Sección Asignada</Label>
                <Select value={selectedSection} onValueChange={setSelectedSection}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sección" />
                  </SelectTrigger>
                  <SelectContent>
                    {assignedSections?.map((assignment: any) => (
                      <SelectItem key={assignment.section_id} value={assignment.section_id}>
                        {assignment.sections.years.name} - Sección {assignment.sections.letter}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Nombre de estudiante */}
              <div className="space-y-2">
                <Label>Nombre del Estudiante</Label>
                <Input
                  placeholder="Buscar por nombre..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                />
              </div>

              {/* Fecha inicio */}
              <div className="space-y-2">
                <Label>Fecha Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateFrom && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(dateFrom, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom}
                      onSelect={setDateFrom}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Fecha fin */}
              <div className="space-y-2">
                <Label>Fecha Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dateTo && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(dateTo, 'PPP', { locale: es }) : 'Seleccionar fecha'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo}
                      onSelect={setDateTo}
                      initialFocus
                      disabled={(date) => dateFrom ? date < dateFrom : false}
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Button */}
              <div className="space-y-2 flex items-end">
                <Button 
                  onClick={handleSearch} 
                  className="w-full"
                  disabled={!selectedSection || !dateFrom || !dateTo}
                >
                  <Search className="mr-2 h-4 w-4" />
                  Buscar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados</CardTitle>
            <CardDescription>
              {records && records.length > 0 
                ? `${records.length} registro(s) encontrado(s)` 
                : 'No hay registros para mostrar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-muted-foreground py-8">Cargando...</p>
            ) : records && records.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Código</TableHead>
                      <TableHead>Estudiante</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado Justificación</TableHead>
                      <TableHead>Justificación</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records.map((record: any) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          {format(new Date(record.date), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>{record.students.student_code}</TableCell>
                        <TableCell>
                          {record.students.apellidos}, {record.students.nombres}
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>{getJustificationBadge(record.justification_status)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.justification_text || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                Selecciona los filtros y presiona "Buscar" para ver los resultados
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default ReportesAsistencia;
