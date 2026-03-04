import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Classroom, Teacher, ClassSession } from '../types';

// --- CLASSROOMS ---
export const getClassrooms = async (): Promise<Classroom[]> => {
    const snapshot = await getDocs(collection(db, 'classrooms'));
    return snapshot.docs.map(d => d.data() as Classroom);
};

export const addClassroom = async (classroom: Omit<Classroom, 'id'>): Promise<Classroom> => {
    const newDocRef = doc(collection(db, 'classrooms'));
    const newClassroom: Classroom = { ...classroom, id: newDocRef.id };
    await setDoc(newDocRef, newClassroom);
    return newClassroom;
};

export const updateClassroom = async (id: string, data: Partial<Classroom>): Promise<void> => {
    const docRef = doc(db, 'classrooms', id);
    await updateDoc(docRef, data);
};

export const deleteClassroom = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'classrooms', id));
};

// --- TEACHERS ---
export const getTeachers = async (): Promise<Teacher[]> => {
    const snapshot = await getDocs(collection(db, 'teachers'));
    return snapshot.docs.map(d => d.data() as Teacher);
};

export const addTeacher = async (teacher: Omit<Teacher, 'id'>): Promise<Teacher> => {
    const newDocRef = doc(collection(db, 'teachers'));
    const newTeacher: Teacher = { ...teacher, id: newDocRef.id };
    await setDoc(newDocRef, newTeacher);
    return newTeacher;
};

export const updateTeacher = async (id: string, data: Partial<Teacher>): Promise<void> => {
    const docRef = doc(db, 'teachers', id);
    await updateDoc(docRef, data);
};

export const deleteTeacher = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'teachers', id));
};

// --- CLASSES (SCHEDULES) ---
export const getClasses = async (): Promise<ClassSession[]> => {
    const snapshot = await getDocs(collection(db, 'classes'));
    return snapshot.docs.map(d => d.data() as ClassSession);
};

export const addClass = async (classSession: Omit<ClassSession, 'id'>): Promise<ClassSession> => {
    const newDocRef = doc(collection(db, 'classes'));
    const newClass: ClassSession = { ...classSession, id: newDocRef.id };
    await setDoc(newDocRef, newClass);
    return newClass;
};

export const updateClass = async (id: string, data: Partial<ClassSession>): Promise<void> => {
    const docRef = doc(db, 'classes', id);
    await updateDoc(docRef, data);
};

export const deleteClass = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'classes', id));
};
