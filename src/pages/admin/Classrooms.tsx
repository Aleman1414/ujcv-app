import React, { useState, useEffect } from 'react';
import { Classroom, ClassroomType, ClassroomStatus } from '../../types';
import { getClassrooms, addClassroom, updateClassroom, deleteClassroom } from '../../services/db';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export const Classrooms: React.FC = () => {
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<ClassroomType>('aula');
    const [module, setModule] = useState('A');

    const modules = ['A', 'B', 'C', 'D', 'E', 'Labs'];

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        setLoading(true);
        try {
            const data = await getClassrooms();
            setClassrooms(data);
        } catch (error) {
            console.error("Error fetching classrooms:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (classroom?: Classroom) => {
        if (classroom) {
            setEditingId(classroom.id);
            setName(classroom.name);
            setType(classroom.type);
            setModule(classroom.module);
        } else {
            setEditingId(null);
            setName('');
            setType('aula');
            setModule('A');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingId) {
                await updateClassroom(editingId, { name, type, module });
            } else {
                await addClassroom({
                    name,
                    type,
                    module,
                    status: 'disponible',
                    currentTeacher: null,
                    currentSchedule: null
                });
            }
            handleCloseModal();
            fetchClassrooms();
        } catch (error) {
            console.error("Error saving classroom:", error);
            alert("Hubo un error al guardar.");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar el aula ${name}?`)) {
            try {
                await deleteClassroom(id);
                fetchClassrooms();
            } catch (error) {
                console.error("Error deleting classroom:", error);
            }
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Gestión de Aulas y Laboratorios</h2>
                    <p className="text-gray-600">Administra los espacios físicos de la universidad.</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                    <Plus size={20} />
                    <span>Nueva Aula</span>
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
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Módulo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Actual</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {classrooms.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                            No hay aulas registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    classrooms.map((c) => (
                                        <tr key={c.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{c.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-600">Módulo {c.module}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.type === 'aula' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                                                    {c.type.charAt(0).toUpperCase() + c.type.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${c.status === 'disponible' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                                                </span>
                                            </td>
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
                                            {editingId ? 'Editar Aula' : 'Nueva Aula'}
                                        </h3>
                                        <button type="button" onClick={handleCloseModal} className="text-gray-400 hover:text-gray-500">
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Nombre (ej. A1, Lab Química)</label>
                                            <input
                                                type="text"
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Módulo</label>
                                            <select
                                                value={module}
                                                onChange={(e) => setModule(e.target.value)}
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                            >
                                                {modules.map(m => (
                                                    <option key={m} value={m}>{m === 'Labs' ? 'Laboratorios' : `Módulo ${m}`}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tipo</label>
                                            <div className="mt-2 space-x-4">
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio text-primary-600"
                                                        name="type"
                                                        value="aula"
                                                        checked={type === 'aula'}
                                                        onChange={() => setType('aula')}
                                                    />
                                                    <span className="ml-2">Aula Regular</span>
                                                </label>
                                                <label className="inline-flex items-center">
                                                    <input
                                                        type="radio"
                                                        className="form-radio text-primary-600"
                                                        name="type"
                                                        value="laboratorio"
                                                        checked={type === 'laboratorio'}
                                                        onChange={() => setType('laboratorio')}
                                                    />
                                                    <span className="ml-2">Laboratorio</span>
                                                </label>
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
