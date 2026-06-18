import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from './productStore';

interface EnrolledCourse {
  product: Product;
  enrolledAt: string;
  selectedOption?: {
    name: string;
    price: number;
  };
}

interface MyCourseState {
  enrolledCourses: EnrolledCourse[];
  enroll: (product: Product, selectedOption?: { name: string; price: number }) => boolean;
  hasEnrolled: (productId: string) => boolean;
}

export const useMyCourseStore = create<MyCourseState>()(
  persist(
    (set, get) => ({
      enrolledCourses: [],
      enroll: (product, selectedOption) => {
        const { enrolledCourses } = get();
        if (enrolledCourses.find((c) => c.product.id === product.id)) {
          return false; // 이미 수강 중
        }
        set({
          enrolledCourses: [...enrolledCourses, { product, enrolledAt: new Date().toISOString(), selectedOption }],
        });
        return true;
      },
      hasEnrolled: (productId) => {
        return get().enrolledCourses.some((c) => c.product.id === productId);
      },
    }),
    {
      name: 'dinoclass-mycourses-storage',
    }
  )
);
