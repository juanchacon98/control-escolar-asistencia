import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, Calendar, AlertCircle } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAbsences: 0,
    pendingJustifications: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Total students
      const { count: studentsCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('active', true);

      // Total teachers (users with profesor role)
      const { count: teachersCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'profesor');

      // Today's absences
      const today = new Date().toISOString().split('T')[0];
      const { count: absencesCount } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)
        .in('status', ['falta', 'salida_temprana']);

      // Pending justifications
      const { count: pendingCount } = await supabase
        .from('attendance_records')
        .select('*', { count: 'exact', head: true })
        .eq('justification_status', 'pendiente')
        .in('status', ['falta', 'salida_temprana']);

      setStats({
        totalStudents: studentsCount || 0,
        totalTeachers: teachersCount || 0,
        todayAbsences: absencesCount || 0,
        pendingJustifications: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Estudiantes',
      value: stats.totalStudents,
      icon: GraduationCap,
      description: 'Estudiantes activos',
      color: 'text-primary',
    },
    {
      title: 'Total Profesores',
      value: stats.totalTeachers,
      icon: Users,
      description: 'Profesores registrados',
      color: 'text-primary',
    },
    {
      title: 'Faltas Hoy',
      value: stats.todayAbsences,
      icon: Calendar,
      description: 'Ausencias registradas hoy',
      color: 'text-destructive',
    },
    {
      title: 'Justificaciones Pendientes',
      value: stats.pendingJustifications,
      icon: AlertCircle,
      description: 'Requieren atención',
      color: 'text-status-pendiente',
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Panel de Administración</h1>
          <p className="text-muted-foreground">
            Resumen general del sistema de asistencia
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
              <CardDescription>Gestiona el sistema fácilmente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/admin/profesores"
                className="block p-4 rounded-lg border hover:bg-secondary transition-colors"
              >
                <h3 className="font-semibold">Gestionar Profesores</h3>
                <p className="text-sm text-muted-foreground">
                  Crear, editar y asignar secciones a profesores
                </p>
              </a>
              <a
                href="/admin/estudiantes"
                className="block p-4 rounded-lg border hover:bg-secondary transition-colors"
              >
                <h3 className="font-semibold">Gestionar Estudiantes</h3>
                <p className="text-sm text-muted-foreground">
                  Importar y administrar estudiantes por secciones
                </p>
              </a>
              <a
                href="/admin/reportes"
                className="block p-4 rounded-lg border hover:bg-secondary transition-colors"
              >
                <h3 className="font-semibold">Ver Reportes</h3>
                <p className="text-sm text-muted-foreground">
                  Generar informes de asistencia y estadísticas
                </p>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Información del Sistema</CardTitle>
              <CardDescription>Estado actual de la plataforma</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Años y Secciones</h4>
                <p className="text-sm text-muted-foreground">
                  5 años configurados (1er a 5to Año)
                </p>
                <p className="text-sm text-muted-foreground">
                  3 secciones por año (A, B, C)
                </p>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Base de Datos</h4>
                <p className="text-sm text-status-presente">
                  Sistema operativo ✓
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
