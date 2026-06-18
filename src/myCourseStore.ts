import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type Product } from './productStore';

interface EnrolledCourse {
  product: Product;
  enrolledAt: string;
}

interface MyCourseState {
  enrolledCourses: EnrolledCourse[];
  enroll: (product: Product) => boolean;
  hasEnrolled: (productId: string) => boolean;
}

export const useMyCourseStore = create<MyCourseState>()(
  persist(
    (set, get) => ({
      enrolledCourses: [],
      enroll: (product) => {
        const { enrolledCourses } = get();
        if (enrolledCourses.find((c) => c.product.id === product.id)) {
          return false; // 이미 수강 중
        }
        set({
          enrolledCourses: [...enrolledCourses, { product, enrolledAt: new Date().toISOString() }],
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
