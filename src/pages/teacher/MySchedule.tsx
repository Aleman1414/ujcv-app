import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import type { ClassSession, Classroom } from '../../types';
import { getClasses, getClassrooms } from '../../services/db';

export const MySchedule: React.FC = () => {
    const { currentUser } = useAuth();
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    // Use the user's email or a linked teacher ID. 
    // For simplicity, we assume the Teacher collection has an email field that matches the user's email.
    // Wait, let's just fetch all classes and filter by the teacher's ID.
    // We need the teacher's ID, which we can get by fetching the teacher with this email.

    const daysOfWeek = [
        { id: 1, name: 'Lunes' },
        { id: 2, name: 'Martes' },
        { id: 3, name: 'Miércoles' },
        { id: 4, name: 'Jueves' },
        { id: 5, name: 'Viernes' },
        { id: 6, name: 'Sábado' },
        { id: 0, name: 'Domingo' }
    ];

    useEffect(() => {
        fetchMySchedule();
    }, [currentUser]);

    const fetchMySchedule = async () => {
        if (!currentUser) return;
        setLoading(true);
        try {
            // Get all classes and classrooms
            const [allClasses, allClassrooms] = await Promise.all([
                getClasses(),
                getClassrooms()
            ]);

            // Ideally we should lookup the Teacher ID by the current user's email.
            // Since currentUser might not have the teacherId mapped directly,
            // we could do a query on 'teachers' where email == currentUser.email
            // For this demo, let's fetch teachers and find the one.
            const { collection, getDocs } = await import('firebase/firestore');
            const { db } = await import('../../services/firebase');

            const teachersSnap = await getDocs(collection(db, 'teachers'));
            const teachers = teachersSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            const myTeacherRecord = teachers.find((t: any) => t.email === currentUser.email);

            if (myTeacherRecord) {
                const myClasses = allClasses.filter(c => c.teacherId === myTeacherRecord.id);
                setClasses(myClasses);
            } else {
                // If not explicitly mapped, try matching by name or just show empty (means they haven't been added to teachers yet)
                setClasses([]);
            }

            setClassrooms(allClassrooms);
        } catch (error) {
            console.error("Error fetching schedule:", error);
        } finally {
            setLoading(false);
        }
    };

    const getClassroomName = (id: string) => classrooms.find(c => c.id === id)?.name || 'Desconocida';
    const getDaysString = (dayIds: number[]) => {
        if (!dayIds) return '';
        return dayIds.map(id => daysOfWeek.find(d => d.id === id)?.name.substring(0, 3)).join(', ');
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Mi Horario</h2>
                <p className="text-gray-600">Revisa tus clases asignadas y las aulas correspondientes.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {classes.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No tienes clases asignadas o tu correo no está registrado en el directorio de docentes.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classes.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getClassroomName(c.classroomId)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getDaysString(c.days)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                                            <span className="bg-primary-100 text-primary-800 py-1 px-3 rounded-full text-xs font-bold">
                                                {c.startTime} - {c.endTime}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
