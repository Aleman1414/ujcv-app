import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    Home,
    Building,
    Users,
    Calendar,
    BookOpen,
    LogOut
} from 'lucide-react';

export const Sidebar: React.FC = () => {
    const { currentUser, logout } = useAuth();

    const getRoleLabel = (role?: string) => {
        switch (role) {
            case 'admin': return 'Coordinador';
            case 'docente': return 'Docente';
            case 'alumno': return 'Alumno';
            default: return '';
        }
    };

    return (
        <aside className="w-64 bg-primary-900 text-white min-h-screen flex flex-col shadow-lg">
            <div className="p-6 flex items-center space-x-3 border-b border-primary-800">
                <img src="/logo.png" alt="Logo UJCV" className="w-10 h-10 object-contain bg-white rounded-md p-1" />
                <h1 className="text-xl font-bold tracking-wider">UJCV<br /><span className="text-xs font-normal text-primary-200">Control Académico</span></h1>
            </div>

            {currentUser && (
                <div className="px-6 py-4 border-b border-primary-800 bg-primary-800/50">
                    <p className="font-medium truncate" title={currentUser.name}>{currentUser.name}</p>
                    <p className="text-xs text-primary-200 uppercase tracking-widest mt-1">
                        {getRoleLabel(currentUser.role)}
                    </p>
                </div>
            )}

            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink
                    to="/"
                    end
                    className={({ isActive }) =>
                        `flex items - center space - x - 3 px - 4 py - 3 rounded - lg transition - colors ${isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                        } `
                    }
                >
                    <Home size={20} />
                    <span>Dashboard</span>
                </NavLink>

                {currentUser?.role === 'admin' && (
                    <>
                        <NavLink
                            to="/admin/classrooms"
                            className={({ isActive }) =>
                                `flex items - center space - x - 3 px - 4 py - 3 rounded - lg transition - colors ${isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                                } `
                            }
                        >
                            <Building size={20} />
                            <span>Aulas y Labs</span>
                        </NavLink>
                        <NavLink
                            to="/admin/teachers"
                            className={({ isActive }) =>
                                `flex items - center space - x - 3 px - 4 py - 3 rounded - lg transition - colors ${isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                                } `
                            }
                        >
                            <Users size={20} />
                            <span>Docentes</span>
                        </NavLink>
                        <NavLink
                            to="/admin/schedules"
                            className={({ isActive }) =>
                                `flex items - center space - x - 3 px - 4 py - 3 rounded - lg transition - colors ${isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                                } `
                            }
                        >
                            <Calendar size={20} />
                            <span>Horarios</span>
                        </NavLink>
                    </>
                )}

                {currentUser?.role === 'docente' && (
                    <NavLink
                        to="/teacher/schedule"
                        className={({ isActive }) =>
                            `flex items - center space - x - 3 px - 4 py - 3 rounded - lg transition - colors ${isActive ? 'bg-primary-700 text-white' : 'text-primary-100 hover:bg-primary-800'
                            } `
                        }
                    >
                        <BookOpen size={20} />
                        <span>Mi Horario</span>
                    </NavLink>
                )}
            </nav>

            <div className="p-4 border-t border-primary-800">
                <button
                    onClick={logout}
                    className="flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left text-red-300 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} />
                    <span>Cerrar Sesión</span>
                </button>
            </div>
        </aside>
    );
};
