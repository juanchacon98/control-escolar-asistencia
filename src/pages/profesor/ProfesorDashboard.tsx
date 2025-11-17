import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, ClipboardList, CheckCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProfesorDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [assignedSections, setAssignedSections] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalSections: 0,
    todayRecords: 0,
    pendingJustifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAssignedSections();
    }
  }, [user]);

  const fetchAssignedSections = async () => {
    if (!user) return;

    try {
      const { data: assignments, error } = await supabase
        .from('teacher_assignments')
        .select(`
          id,
          section_id,
          sections (
            id,
            letter,
            years (
              name,
              order_number
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      setAssignedSections(assignments || []);
      setStats(prev => ({ ...prev, totalSections: assignments?.length || 0 }));

      // Fetch today's records count
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .eq('created_by', user.id);

      setStats(prev => ({ ...prev, todayRecords: count || 0 }));

      // Fetch pending justifications for teacher's students
      const sectionIds = assignments?.map(a => a.section_id) || [];
      if (sectionIds.length > 0) {
        const { data: students } = await supabase
          .from('students')
          .select('id')
          .in('section_id', sectionIds);

        const studentIds = students?.map(s => s.id) || [];
        
        if (studentIds.length > 0) {
          const { count: pendingCount } = await supabase
            .from('attendance_records')
            .select('*', { count: 'exact', head: true })
            .in('student_id', studentIds)
            .eq('justification_status', 'pendiente')
            .in('status', ['falta', 'salida_temprana']);

          setStats(prev => ({ ...prev, pendingJustifications: pendingCount || 0 }));
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel del Profesor</h1>
          <p className="text-muted-foreground">
            Gestiona la asistencia de tus secciones asignadas
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Secciones Asignadas
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.totalSections}</div>
              <p className="text-xs text-muted-foreground">
                Secciones bajo tu responsabilidad
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Registros Hoy
              </CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.todayRecords}</div>
              <p className="text-xs text-muted-foreground">
                Asistencias tomadas hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Justificaciones Pendientes
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-status-pendiente" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{loading ? '...' : stats.pendingJustifications}</div>
              <p className="text-xs text-muted-foreground">
                Requieren tu atención
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona la asistencia fácilmente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/profesor/asistencia')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Tomar Asistencia Hoy
              </Button>
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => navigate('/profesor/historial')}
              >
                <ClipboardList className="mr-2 h-4 w-4" />
                Ver Historial de Asistencia
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mis Secciones</CardTitle>
              <CardDescription>
                Secciones asignadas para este período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Cargando...</p>
              ) : assignedSections.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No tienes secciones asignadas. Contacta al administrador.
                </p>
              ) : (
                <div className="space-y-2">
                  {assignedSections.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div>
                        <p className="font-medium">
                          {assignment.sections.years.name} - Sección {assignment.sections.letter}
                        </p>
                      </div>
                      <CheckCircle className="h-4 w-4 text-status-presente" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfesorDashboard;
