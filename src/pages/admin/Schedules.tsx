import React, { useState, useEffect } from 'react';
import { ClassSession, Teacher, Classroom } from '../../types';
import { getClasses, addClass, updateClass, deleteClass, getTeachers, getClassrooms } from '../../services/db';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const Schedules: React.FC = () => {
    const [classes, setClasses] = useState<ClassSession[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [classroomId, setClassroomId] = useState('');
    const [startTime, setStartTime] = useState('07:00');
    const [endTime, setEndTime] = useState('08:30');
    const [days, setDays] = useState<number[]>([]);

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
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [clsData, tchData, crData] = await Promise.all([
                getClasses(),
                getTeachers(),
                getClassrooms()
            ]);
            setClasses(clsData);
            setTeachers(tchData);
            setClassrooms(crData);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (c?: ClassSession) => {
        if (c) {
            setEditingId(c.id);
            setName(c.name);
            setTeacherId(c.teacherId);
            setClassroomId(c.classroomId);
            setStartTime(c.startTime);
            setEndTime(c.endTime);
            setDays(c.days || []);
        } else {
            setEditingId(null);
            setName('');
            setTeacherId(teachers.length > 0 ? teachers[0].id : '');
            setClassroomId(classrooms.length > 0 ? classrooms[0].id : '');
            setStartTime('07:00');
            setEndTime('08:30');
            setDays([]);
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleDayToggle = (dayId: number) => {
        setDays(prev =>
            prev.includes(dayId) ? prev.filter(d => d !== dayId) : [...prev, dayId]
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (days.length === 0) {
            alert("Debes seleccionar al menos un día.");
            return;
        }

        try {
            if (editingId) {
                await updateClass(editingId, { name, teacherId, classroomId, startTime, endTime, days });
            } else {
                await addClass({ name, teacherId, classroomId, startTime, endTime, days });
            }
            handleCloseModal();
            fetchData();
        } catch (error) {
            console.error("Error saving class:", error);
            alert("Hubo un error al guardar.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar la clase ${name}?`)) {
            try {
                await deleteClass(id);
                fetchData();
            } catch (error) {
                console.error("Error deleting class:", error);
            }
        }
    };

    const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name || 'Desconocido';
    const getClassroomName = (id: string) => classrooms.find(c => c.id === id)?.name || 'Desconocida';
    const getDaysString = (dayIds: number[]) => {
        if (!dayIds) return '';
        return dayIds.map(id => daysOfWeek.find(d => d.id === id)?.name.substring(0, 3)).join(', ');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Horarios</h2>
                    <p className="text-gray-600">Asigna clases, docentes y aulas en horarios específicos.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nueva Clase</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Clase</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docente</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aula</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Horario</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No hay clases registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    classes.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getTeacherName(c.teacherId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getClassroomName(c.classroomId)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{getDaysString(c.days)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">{c.startTime} - {c.endTime}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                                                <button onClick={() => handleOpenModal(c)} className="text-primary-600 hover:text-primary-900">
                                                    <Edit2 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(c.id, c.name)} className="text-red-600 hover:text-red-900">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={handleCloseModal}>
                            <div className="absolute inset-0 bg-gray-900 opacity-75"></div>
                        </div>
                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <form onSubmit={handleSubmit}>
                                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                    <div className="flex justify-between items-center mb-5">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            {editingId ? 'Editar Clase/Horario' : 'Nueva Clase/Horario'}
                                        </h3>
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre de la Clase</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                placeholder="Ej. Matemáticas I"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Docente</label>
                                            <select
                                                required
                                                value={teacherId}
                                                onChange={(e) => setTeacherId(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="" disabled>Seleccionar Docente</option>
                                                {teachers.map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Aula/Laboratorio</label>
                                            <select
                                                required
                                                value={classroomId}
                                                onChange={(e) => setClassroomId(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                <option value="" disabled>Seleccionar Aula</option>
                                                {classrooms.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name} (Mod. {c.module})</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Hora Inicio</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={startTime}
                                                    onChange={(e) => setStartTime(e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Hora Fin</label>
                                                <input
                                                    type="time"
                                                    required
                                                    value={endTime}
                                                    onChange={(e) => setEndTime(e.target.value)}
                                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Días</label>
                                            <div className="flex gap-2 flex-wrap">
                                                {daysOfWeek.map(day => (
                                                    <button
                                                        key={day.id}
                                                        type="button"
                                                        onClick={() => handleDayToggle(day.id)}
                                                        className={`px-3 py-1 text-sm rounded-full border ${days.includes(day.id)
                                                                ? 'bg-primary-600 text-white border-primary-600'
                                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {day.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                    <button
                                        type="submit"
                                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Guardar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
