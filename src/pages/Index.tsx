import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { GraduationCap, Loader2 } from 'lucide-react';

const Index = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user && userRole) {
      // Redirect authenticated users to their respective dashboards
      const redirectPath = userRole === 'admin' ? '/admin' : '/profesor';
      navigate(redirectPath, { replace: true });
    }
  }, [user, userRole, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="flex justify-center">
          <div className="bg-primary rounded-full p-6">
            <GraduationCap className="h-16 w-16 text-primary-foreground" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">
            Control de Asistencia
          </h1>
          <p className="text-xl text-muted-foreground">
            Sistema de gestión de asistencia para bachillerato
          </p>
          <p className="text-muted-foreground">
            Gestiona eficientemente la asistencia de estudiantes de 1er a 5to año,
            con seguimiento de justificaciones y reportes detallados.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" onClick={() => navigate('/auth')}>
            Iniciar Sesión
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
            Registrarse
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-semibold mb-2">Gestión Completa</h3>
            <p className="text-sm text-muted-foreground">
              Administra profesores, estudiantes y secciones desde un solo lugar
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">✓</div>
            <h3 className="font-semibold mb-2">Asistencia Rápida</h3>
            <p className="text-sm text-muted-foreground">
              Registro diario de asistencia con estados y justificaciones
            </p>
          </div>
          
          <div className="p-6 rounded-lg border bg-card">
            <div className="text-3xl mb-2">📈</div>
            <h3 className="font-semibold mb-2">Reportes Detallados</h3>
            <p className="text-sm text-muted-foreground">
              Genera informes y estadísticas exportables a Excel
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
