import React, { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import type { Classroom, ClassSession, Teacher } from '../types';
import { Clock, User } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(true);

    // To force re-render every minute for accurate live status
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const unsubClassrooms = onSnapshot(collection(db, 'classrooms'), (snapshot) => {
            setClassrooms(snapshot.docs.map(d => d.data() as Classroom));
        });

        const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
            setClasses(snapshot.docs.map(d => d.data() as ClassSession));
        });

        const unsubTeachers = onSnapshot(collection(db, 'teachers'), (snapshot) => {
            setTeachers(snapshot.docs.map(d => d.data() as Teacher));
            setLoading(false); // Assume if teachers loaded, we are good enough to show
        });

        return () => {
            unsubClassrooms();
            unsubClasses();
            unsubTeachers();
        };
    }, []);

    const getComputedStatus = (classroom: Classroom) => {
        const now = currentTime;
        const currentDay = now.getDay(); // 0=Sun, 1=Mon, etc.
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;

        // Get all classes for this classroom today
        const classesToday = classes.filter(c => c.classroomId === classroom.id && c.days?.includes(currentDay));

        // Sort classes by start time
        classesToday.sort((a, b) => a.startTime.localeCompare(b.startTime));

        // Determine if occupied right now
        const activeClass = classesToday.find(c => currentTimeStr >= c.startTime && currentTimeStr <= c.endTime);

        // Find next class (if not occupied)
        const nextClass = classesToday.find(c => c.startTime > currentTimeStr);

        let status: 'disponible' | 'ocupada' = activeClass ? 'ocupada' : 'disponible';
        let teacherId = activeClass ? activeClass.teacherId : null;
        let currentClassName = activeClass ? activeClass.name : null;
        let nextClassName = nextClass ? nextClass.name : null;
        let nextClassTime = nextClass ? nextClass.startTime : null;

        // Check if Teacher manually checked in (stretch goal - status override). Here we trust schedule.
        // If classroom status was manually set to ocupada, we could honor it, but let's stick to schedule for true automation.

        return {
            status,
            teacherName: teacherId ? teachers.find(t => t.id === teacherId)?.name : null,
            currentClassName,
            nextClassText: nextClass ? `${nextClassName} a las ${nextClassTime}` : 'Sin clases programadas'
        };
    };

    const modules = ['A', 'B', 'C', 'D', 'E', 'Labs'];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Dashboard Principal</h2>
                <p className="text-gray-500 mt-1">Monitoreo en tiempo real de aulas y laboratorios.</p>
            </div>

            <div className="space-y-10">
                {modules.map(modName => {
                    const modClassrooms = classrooms.filter(c => c.module === modName);
                    if (modClassrooms.length === 0) return null;

                    return (
                        <div key={modName} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-xl font-bold text-primary-900 mb-6 border-b border-gray-100 pb-3">
                                {modName === 'Labs' ? 'Laboratorios' : `Módulo ${modName}`}
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {modClassrooms.map(c => {
                                    const data = getComputedStatus(c);
                                    const isAvailable = data.status === 'disponible';

                                    return (
                                        <div
                                            key={c.id}
                                            className={`relative rounded-xl border p-5 transition-all duration-300 hover:shadow-md ${isAvailable
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-red-50 border-red-200'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <h4 className="text-lg font-bold text-gray-800">{c.name}</h4>
                                                <span className={`px-2.5 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                                                    }`}>
                                                    {isAvailable ? 'Disponible' : 'Ocupada'}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                {isAvailable ? (
                                                    <div className="text-green-700/80 text-sm font-medium h-[44px] flex items-center">
                                                        Aula libre actualmente.
                                                    </div>
                                                ) : (
                                                    <div className="space-y-1 h-[44px]">
                                                        <div className="flex items-center text-sm font-medium text-gray-900">
                                                            <User className="w-4 h-4 mr-2 text-red-600" />
                                                            <span className="truncate" title={data.teacherName || ''}>{data.teacherName || 'Docente desconocido'}</span>
                                                        </div>
                                                        <div className="text-xs text-gray-600 ml-6 truncate" title={data.currentClassName || ''}>
                                                            {data.currentClassName}
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-3 border-t border-gray-200/50">
                                                    <div className="flex items-center text-xs text-gray-500">
                                                        <Clock className="w-3.5 h-3.5 mr-1.5" />
                                                        <span className="truncate">Próxima: {data.nextClassText}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
